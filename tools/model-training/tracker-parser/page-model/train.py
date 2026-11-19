"""Train the complete page-field MLP matrix; raw HTML never enters this input."""

import argparse, json, random, time, os
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor, as_completed
import numpy as np
import torch

FIELDS = ("name", "description", "loginUrl", "nextPageUrl")
MODELS = {
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


def evaluate(model, vocabulary, samples):
    stats = {
        field: {"correct": 0, "total": 0, "falseFilled": 0, "missed": 0}
        for field in FIELDS
    }
    errors = []
    with torch.no_grad():
        absence = model(torch.zeros(1, len(vocabulary)))[0]
        for sample in samples:
            for field, candidates in sample["features"].items():
                values = torch.zeros(len(candidates), len(vocabulary))
                for i, candidate in enumerate(candidates):
                    for feature in candidate["features"]:
                        if feature in vocabulary:
                            values[i, vocabulary[feature]] += 1
                scores = (
                    model(values)[:, FIELDS.index(field)] - absence[FIELDS.index(field)]
                )
                chosen = (
                    int(scores.argmax())
                    if len(scores) and float(scores.max()) > 0
                    else None
                )
                if (
                    field == "nextPageUrl"
                    and chosen is not None
                    and not candidates[chosen]["observable"]
                ):
                    chosen = None
                expected = sample["columns"].get(field)
                covered = sample.get("coverage", {}).get(field, True)
                correct = (
                    chosen in sample.get("positives", {}).get(field, [expected])
                    if expected is not None
                    else chosen is None
                ) and covered
                stats[field]["total"] += 1
                stats[field]["correct"] += int(correct)
                stats[field]["falseFilled"] += int(
                    chosen is not None and expected is None
                )
                stats[field]["missed"] += int(chosen is None and expected is not None)
                if not correct:
                    errors.append(
                        {
                            "site": sample["site"],
                            "field": field,
                            "expected": expected,
                            "actual": chosen,
                            "covered": covered,
                        }
                    )
    return {
        "fields": stats,
        "correct": sum(v["correct"] for v in stats.values()),
        "total": sum(v["total"] for v in stats.values()),
        "errors": errors,
    }


def train_one(dataset, output, name, epochs):
    torch.set_num_threads(2)
    torch.manual_seed(47)
    random.seed(47)
    data = json.loads(Path(dataset).read_text())
    samples = data["train"]
    vocabulary = {
        feature: i
        for i, feature in enumerate(
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
    dimensions = [len(vocabulary), *MODELS[name], len(FIELDS)]
    layers = []
    for i, (inputs, outputs) in enumerate(zip(dimensions, dimensions[1:])):
        layers.append(torch.nn.Linear(inputs, outputs))
        if i < len(dimensions) - 2:
            layers.append(torch.nn.ReLU())
    model = torch.nn.Sequential(*layers)
    optimizer = torch.optim.AdamW(model.parameters(), lr=0.003, weight_decay=0.01)
    groups = []
    for sample in samples:
        for field, candidates in sample["features"].items():
            values = torch.zeros(len(candidates) + 1, len(vocabulary))
            for i, candidate in enumerate(candidates):
                for feature in candidate["features"]:
                    values[i + 1, vocabulary[feature]] += 1
            groups.append(
                (values, FIELDS.index(field), sample["columns"].get(field, -1) + 1)
            )
    started = time.monotonic()
    for epoch in range(epochs):
        random.shuffle(groups)
        for start in range(0, len(groups), 48):
            batch = groups[start : start + 48]
            scores = model(torch.cat([v[0] for v in batch]))
            loss = scores.new_zeros(())
            offset = 0
            for values, field, target in batch:
                group = scores[offset : offset + len(values), field]
                loss += torch.logsumexp(group, 0) - group[target]
                offset += len(values)
            loss /= len(batch)
            optimizer.zero_grad(set_to_none=True)
            loss.backward()
            optimizer.step()
    model.eval()
    directory = Path(output) / name
    directory.mkdir(parents=True, exist_ok=True)
    arrays = []
    export_layers = []
    offset = 0
    modules = [layer for layer in model if isinstance(layer, torch.nn.Linear)]
    for i, layer in enumerate(modules):
        w = layer.weight.detach().numpy().astype("<f4").reshape(-1)
        b = layer.bias.detach().numpy().astype("<f4")
        export_layers.append(
            {
                "inputs": layer.in_features,
                "outputs": layer.out_features,
                "weightOffset": offset,
                "biasOffset": offset + len(w),
                "activation": "relu" if i < len(modules) - 1 else "linear",
            }
        )
        arrays.extend([w, b])
        offset += len(w) + len(b)
    metadata = {
        "version": 1,
        "fields": FIELDS,
        "features": list(vocabulary),
        "layers": export_layers,
        "parameters": offset,
        "weights": "weights.bin",
    }
    (directory / "model.json").write_text(
        json.dumps(metadata, ensure_ascii=False, separators=(",", ":")) + "\n"
    )
    np.concatenate(arrays).tofile(directory / "weights.bin")
    report = {
        "architecture": MODELS[name],
        "seconds": time.monotonic() - started,
        "parameters": offset,
        "weightsBytes": (directory / "weights.bin").stat().st_size,
        "metadataBytes": (directory / "model.json").stat().st_size,
        "synthetic": evaluate(model, vocabulary, data["validation"]),
        "real": evaluate(model, vocabulary, data["realValidation"]),
    }
    (directory / "report.json").write_text(json.dumps(report, indent=2) + "\n")
    print(
        name,
        report["seconds"],
        report["synthetic"]["correct"],
        report["real"]["correct"],
        flush=True,
    )
    return name, report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("dataset")
    parser.add_argument("output")
    parser.add_argument("--models", default=",".join(MODELS))
    parser.add_argument("--epochs", type=int, default=160)
    args = parser.parse_args()
    names = args.models.split(",")
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)
    report = {
        "epochs": args.epochs,
        "seed": 47,
        "workers": 3,
        "architectures": {name: MODELS[name] for name in names},
        "models": {},
    }
    with ProcessPoolExecutor(max_workers=3) as pool:
        futures = [
            pool.submit(train_one, args.dataset, args.output, name, args.epochs)
            for name in names
        ]
        for future in as_completed(futures):
            name, result = future.result()
            report["models"][name] = result
            (output / "report.json").write_text(json.dumps(report, indent=2) + "\n")


if __name__ == "__main__":
    main()
