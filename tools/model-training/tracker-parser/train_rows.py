"""Train ReLU networks on DOM candidate features and export browser weights."""

import argparse
import json
from pathlib import Path
import random
import time
from collections import Counter

import numpy as np
import torch

from train_linear import available, fit as fit_linear

FIELDS = ("title", "size", "seeds", "peers", "date", "categoryTitle", "downloadUrl")
ARCHITECTURES = {
    "mlp16": [16],
    "mlp32x16": [32, 16],
    "mlp64": [64],
    "mlp128x64": [128, 64],
    "mlp256x128": [256, 128],
    "mlp512x256": [512, 256],
    "mlp512x512x256": [512, 512, 256],
    "mlp1024x512": [1024, 512],
    "mlp1024x768": [1024, 768],
}
REGULARIZATION = {
    "mlp512x512x256": {"dropout": 0.15, "weightDecay": 0.05},
    "mlp1024x512": {"dropout": 0.10, "weightDecay": 0.05},
    "mlp1024x768": {"dropout": 0.15, "weightDecay": 0.05},
}
DEFAULT_MODELS = ("mlp16", "mlp32x16", "mlp64", "mlp128x64", "mlp256x128")


def is_positive(sample, field, candidate):
    rule = sample.get("rules", {}).get(field)
    return (
        candidate.get("ruleKey") == rule
        if rule is not None
        else candidate["column"] == sample["columns"].get(field)
    )


def vector(candidate, vocabulary):
    output = torch.zeros(len(vocabulary))
    if candidate:
        for feature in candidate["features"]:
            if feature in vocabulary:
                output[vocabulary[feature]] += 1
    return output


def make_groups(samples, vocabulary):
    result = []
    for sample in samples:
        for field, candidates in sample["features"].items():
            values = torch.stack(
                [
                    vector(None, vocabulary),
                    *(vector(candidate, vocabulary) for candidate in candidates),
                ]
            )
            target = next(
                (
                    index + 1
                    for index, candidate in enumerate(candidates)
                    if is_positive(sample, field, candidate)
                ),
                0,
            )
            result.append((values, FIELDS.index(field), target))
    return result


def fit(samples, hidden, epochs, dropout=0, weight_decay=0.01):
    torch.manual_seed(47)
    random.seed(47)
    vocabulary = {
        feature: index
        for index, feature in enumerate(
            sorted(
                {
                    feature
                    for sample in samples
                    for candidates in sample["features"].values()
                    for candidate in candidates
                    for feature in candidate["features"]
                }
            )
        )
    }
    dimensions = [len(vocabulary), *hidden, len(FIELDS)]
    layers = []
    for index, (inputs, outputs) in enumerate(zip(dimensions, dimensions[1:])):
        layers.append(torch.nn.Linear(inputs, outputs))
        if index < len(dimensions) - 2:
            layers.append(torch.nn.ReLU())
            if dropout:
                layers.append(torch.nn.Dropout(dropout))
    model = torch.nn.Sequential(*layers)
    optimizer = torch.optim.AdamW(
        model.parameters(), lr=0.003, weight_decay=weight_decay
    )
    groups = make_groups(samples, vocabulary)
    started = time.monotonic()
    history = []
    for epoch in range(epochs):
        random.shuffle(groups)
        losses = []
        for start in range(0, len(groups), 32):
            batch = groups[start : start + 32]
            scores = model(torch.cat([entry[0] for entry in batch]))
            loss = scores.new_zeros(())
            offset = 0
            for values, field, target in batch:
                length = len(values)
                group_scores = scores[offset : offset + length, field]
                loss = loss + torch.logsumexp(group_scores, 0) - group_scores[target]
                offset += length
            loss = loss / len(batch)
            optimizer.zero_grad(set_to_none=True)
            loss.backward()
            optimizer.step()
            losses.append(loss.item())
        history.append(float(np.mean(losses)))
    model.eval()
    return (
        model,
        vocabulary,
        {
            "seconds": time.monotonic() - started,
            "initialLoss": history[0],
            "finalLoss": history[-1],
        },
    )


def model_scores(model, vocabulary, sample, field):
    candidates = sample["features"][field]
    values = torch.stack(
        [
            vector(None, vocabulary),
            *(vector(candidate, vocabulary) for candidate in candidates),
        ]
    )
    with torch.no_grad():
        scores = model(values)[:, FIELDS.index(field)].tolist()
    return [value - scores[0] for value in scores[1:]]


def evaluate(samples, scorer):
    correct, total = Counter(), Counter()
    for sample in samples:
        used, selected = {}, {}
        for field in FIELDS:
            if field not in sample["features"]:
                continue
            candidates = sample["features"][field]
            entries = [
                (candidate, score)
                for candidate, score in zip(candidates, scorer(sample, field))
                if available(
                    candidate, field, used, selected, sample.get("detailSelector")
                )
            ]
            best, score = max(entries, key=lambda entry: entry[1], default=(None, 0))
            chosen = best if best and (field == "title" or score > 0) else None
            expected = any(
                is_positive(sample, field, candidate) for candidate in candidates
            )
            correct[field] += int(
                is_positive(sample, field, chosen) if chosen else not expected
            )
            total[field] += 1
            if chosen and field != "downloadUrl":
                used[chosen["column"]] = field
                selected[field] = chosen
    return {
        field: {"correct": correct[field], "total": total[field]} for field in FIELDS
    }


def export(model, vocabulary, samples, output):
    output.mkdir(parents=True, exist_ok=True)
    arrays = []
    layers = []
    offset = 0
    modules = [layer for layer in model if isinstance(layer, torch.nn.Linear)]
    for index, layer in enumerate(modules):
        weights = layer.weight.detach().numpy().astype("<f4").reshape(-1)
        bias = layer.bias.detach().numpy().astype("<f4")
        layers.append(
            {
                "inputs": layer.in_features,
                "outputs": layer.out_features,
                "weightOffset": offset,
                "biasOffset": offset + len(weights),
                "activation": "relu" if index < len(modules) - 1 else "linear",
            }
        )
        arrays.extend([weights, bias])
        offset += len(weights) + len(bias)
    data = {
        "version": 1,
        "fields": FIELDS,
        "features": list(vocabulary),
        "layers": layers,
        "weights": "weights.bin",
        "parameters": offset,
    }
    (output / "model.json").write_text(
        json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n"
    )
    np.concatenate(arrays).tofile(output / "weights.bin")
    cases = [
        {"field": field, "features": candidate["features"], "score": score}
        for sample in samples[:5]
        for field, candidates in sample["features"].items()
        for candidate, score in zip(
            candidates, model_scores(model, vocabulary, sample, field)
        )
    ]
    # Include an unknown feature and absence as explicit cross-runtime checks.
    cases += [{"field": field, "features": [], "score": 0} for field in FIELDS]
    cases += [
        {"field": field, "features": ["unknown-feature"], "score": 0}
        for field in FIELDS
    ]
    (output / "parity.json").write_text(json.dumps(cases) + "\n")
    return {
        "parameters": offset,
        "metadataBytes": (output / "model.json").stat().st_size,
        "weightsBytes": (output / "weights.bin").stat().st_size,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("dataset", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--epochs", type=int, default=200)
    parser.add_argument("--models", default=",".join(DEFAULT_MODELS))
    args = parser.parse_args()
    torch.set_num_threads(2)
    data = json.loads(args.dataset.read_text())
    names = args.models.split(",")
    if not names or any(name not in ARCHITECTURES for name in names):
        parser.error("Unknown model selection")
    architectures = {name: ARCHITECTURES[name] for name in names}
    report = {
        "epochs": args.epochs,
        "seed": 47,
        "architectures": architectures,
        "regularization": {
            name: REGULARIZATION.get(name, {"dropout": 0, "weightDecay": 0.01})
            for name in names
        },
        "experiments": {},
    }
    for experiment in ("main", "unseen"):
        unseen = set(data["unseenSites"])
        train = (
            data["train"]
            if experiment == "main"
            else [sample for sample in data["train"] if sample["site"] not in unseen]
        )
        test = (
            data["validation"]
            if experiment == "main"
            else [
                sample
                for sample in data["train"] + data["validation"]
                if sample["site"] in unseen
            ]
        )
        directory = args.output / experiment
        directory.mkdir(parents=True, exist_ok=True)
        baseline = fit_linear(train)
        (directory / "linear.json").write_text(json.dumps(baseline))
        baseline_metrics = evaluate(
            test,
            lambda sample, field: [
                sum(
                    baseline["fields"].get(field, {}).get(feature, 0)
                    for feature in candidate["features"]
                )
                for candidate in sample["features"][field]
            ],
        )
        models = {}
        for name, hidden in architectures.items():
            settings = report["regularization"][name]
            model, vocabulary, training = fit(
                train, hidden, args.epochs, settings["dropout"], settings["weightDecay"]
            )
            metrics = evaluate(
                test,
                lambda sample, field: model_scores(model, vocabulary, sample, field),
            )
            artifacts = export(model, vocabulary, test, directory / name)
            models[name] = {
                "metrics": metrics,
                "training": training,
                "artifacts": artifacts,
            }
            print(experiment, name, json.dumps(models[name]), flush=True)
        report["experiments"][experiment] = {
            "trainingPages": len(train),
            "testPages": len(test),
            "trainingSites": sorted({sample["site"] for sample in train}),
            "testSites": sorted({sample["site"] for sample in test}),
            "linear": baseline_metrics,
            "models": models,
        }
        (args.output / "report.json").write_text(json.dumps(report, indent=2) + "\n")


if __name__ == "__main__":
    main()
