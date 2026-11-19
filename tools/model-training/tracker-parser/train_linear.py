#!/usr/bin/env python3
"""Fit a separate linear ranker per field using pairwise logistic loss."""

import argparse
import json
import math
from collections import Counter
from pathlib import Path


def pairs(samples, field):
    for sample in samples:
        candidates = sample["features"].get(field, [])
        column = sample["columns"].get(field)
        rule = sample.get("rules", {}).get(field)
        positive = next(
            (
                entry
                for entry in candidates
                if (
                    entry.get("ruleKey") == rule
                    if rule is not None
                    else entry["column"] == column
                )
            ),
            None,
        )
        for candidate in candidates:
            if candidate is positive:
                continue
            # Compare against a zero-score abstention when no field is labeled.
            difference = Counter(positive["features"] if positive else [])
            difference.subtract(candidate["features"])
            yield difference
        if positive:
            yield Counter(positive["features"])


def fit(samples):
    fields = sorted({field for sample in samples for field in sample["features"]})
    weights = {}
    for field in fields:
        comparisons = list(pairs(samples, field))
        vector = {}
        for _ in range(120):
            gradient = Counter()
            for difference in comparisons:
                score = sum(
                    vector.get(feature, 0) * value
                    for feature, value in difference.items()
                )
                residual = 1 / (1 + math.exp(score))
                for feature, value in difference.items():
                    gradient[feature] += residual * value
            for feature, value in gradient.items():
                old = vector.get(feature, 0)
                vector[feature] = old + 0.7 * (value / len(comparisons) - 0.025 * old)
        weights[field] = {
            feature: round(value, 5)
            for feature, value in vector.items()
            if abs(value) >= 0.005
        }
    return {"version": 1, "fields": weights}


def available(candidate, field, used, selected, detail_selector):
    selector = candidate.get("selector")
    if field == "downloadUrl":
        return selector is None or selector != (
            detail_selector or selected.get("title", {}).get("selector")
        )
    previous = used.get(candidate["column"])
    return previous is None or (
        field == "peers"
        and previous == "seeds"
        and candidate.get("ruleKey", selector)
        != selected["seeds"].get("ruleKey", selected["seeds"].get("selector"))
    )


def evaluate(samples, holdouts):
    reports = []
    for site, model in holdouts.items():
        correct = Counter()
        total = Counter()
        for sample in samples:
            if sample["site"] != site:
                continue
            used = {}
            selected = {}
            for field in (
                "title",
                "size",
                "seeds",
                "peers",
                "date",
                "categoryTitle",
                "downloadUrl",
            ):
                if field not in sample["features"]:
                    continue
                expected = sample["columns"].get(field)
                weights = model["fields"].get(field, {})
                candidates = [
                    candidate
                    for candidate in sample["features"].get(field, [])
                    if available(
                        candidate, field, used, selected, sample.get("detailSelector")
                    )
                ]

                def score(candidate):
                    return sum(
                        weights.get(feature, 0) for feature in candidate["features"]
                    )

                best = max(candidates, key=score, default=None)
                prediction = (
                    best["column"]
                    if best and (field == "title" or score(best) > 0)
                    else None
                )
                total[field] += 1
                expected_rule = sample.get("rules", {}).get(field)
                actual_rule = best.get("ruleKey") if prediction is not None else None
                correct[field] += int(
                    actual_rule == expected_rule
                    if expected_rule is not None
                    else prediction == expected
                )
                if prediction is not None and field != "downloadUrl":
                    used[prediction] = field
                    selected[field] = best
        reports.append({"site": site, "correct": dict(correct), "total": dict(total)})
    return reports


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("features", type=Path)
    parser.add_argument("model", type=Path)
    parser.add_argument("--report", type=Path, required=True)
    parser.add_argument("--holdout-models", type=Path, required=True)
    args = parser.parse_args()
    samples = json.loads(args.features.read_text())
    if len({sample["site"] for sample in samples}) < 2:
        parser.error("at least two different sites are required")
    model = fit(samples)
    holdouts = {
        site: fit([sample for sample in samples if sample["site"] != site])
        for site in sorted({sample["site"] for sample in samples})
    }
    args.model.write_text(
        json.dumps(model, ensure_ascii=False, separators=(",", ":")) + "\n"
    )
    args.report.write_text(json.dumps(evaluate(samples, holdouts), indent=2) + "\n")
    args.holdout_models.write_text(
        json.dumps(holdouts, ensure_ascii=False, separators=(",", ":")) + "\n"
    )
    print(
        f"Trained on {len(samples)} samples. Model size: {args.model.stat().st_size} bytes."
    )


if __name__ == "__main__":
    main()
