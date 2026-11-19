import argparse
import collections
import json
import math
import pathlib
import random

p = argparse.ArgumentParser()
p.add_argument("features", type=pathlib.Path)
p.add_argument("output", type=pathlib.Path)
p.add_argument("report", type=pathlib.Path)
a = p.parse_args()
data = json.loads(a.features.read_text())
groups = {
    name: [r for r in data["rows"] if r["group"] == name]
    for name in ("train", "calibration", "test")
}
weights = [0.0] * (len(data["featureNames"]) + 1)
rng = random.Random(148)


def probability(x):
    z = weights[-1] + sum(w * v for w, v in zip(weights, x))
    return 1 / (1 + math.exp(-max(-30, min(30, z))))


for epoch in range(18):
    rng.shuffle(groups["train"])
    rate = 0.045 / (1 + epoch * 0.22)
    for row in groups["train"]:
        error = probability(row["x"]) - row["y"]
        for i, value in enumerate(row["x"]):
            weights[i] -= rate * (error * value + 0.003 * weights[i])
        weights[-1] -= rate * error


def evaluate(rows):
    return {
        "rows": len(rows),
        "meanSquaredError": sum((probability(r["x"]) - r["y"]) ** 2 for r in rows)
        / max(1, len(rows)),
        "accuracyOnHardLabels": sum(
            (probability(r["x"]) >= 0.5) == bool(r["y"])
            for r in rows
            if r["y"] in (0, 1)
        )
        / max(1, sum(r["y"] in (0, 1) for r in rows)),
        "byKind": {
            kind: {
                "rows": len(s),
                "meanScore": sum(probability(r["x"]) for r in s) / len(s),
            }
            for kind in sorted({r["kind"] for r in rows})
            if (s := [r for r in rows if r["kind"] == kind])
        },
    }


model = {
    "version": 1,
    "featureNames": data["featureNames"],
    "weights": [round(w, 7) for w in weights[:-1]],
    "bias": round(weights[-1], 7),
}
a.output.write_text(json.dumps(model, indent=2) + "\n")
a.report.write_text(
    json.dumps(
        {
            "labelSource": "Automatically generated alias, case, punctuation, order and year transformations. No user judgments.",
            "works": data["works"],
            "sourceTitles": data.get("sourceTitles"),
            "splits": {k: evaluate(v) for k, v in groups.items()},
        },
        indent=2,
    )
    + "\n"
)
print(
    json.dumps(
        {
            "pairs": len(data["rows"]),
            "works": data["works"],
            "test": evaluate(groups["test"]),
        },
        indent=2,
    )
)
