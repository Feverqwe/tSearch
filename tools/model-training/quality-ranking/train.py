#!/usr/bin/env python3
"""Fit and validate additive tSearch weights using only the Python standard library."""

import argparse
import collections
import datetime as dt
import hashlib
import itertools
import json
import math
import pathlib
import random
import re
from concurrent.futures import ProcessPoolExecutor

from features import DATE_FEATURES, SIZE_FEATURES, TITLE_FEATURES, VIDEO, Feature, word

CATEGORIES = tuple(range(12))
META_SIZE = "size"
META_DATE = "date"
QUALITY = {"resolution", "video", "audio", "game"}
TECHNICAL_PRIOR = {
    "2160p": 95,
    "1080p": 70,
    "1080i": 57,
    "720p": 40,
    "SD": 5,
    "Blu-ray / Remux": 35,
    "BDRip": 22,
    "WEB-DL": 22,
    "WEBRip": 12,
    "HDTV": 10,
    "HDRip": 8,
    "DVD": 4,
    "CAM / TS": -55,
    "HDR / Dolby Vision": 10,
    "50/60 fps": 10,
    "10 bit": 4,
    "IPTV / DVB": 4,
    "FLAC / ALAC / APE": 50,
    "DSD / Hi-Res": 58,
    "MP3 / AAC": 12,
    "320 kbps": 12,
    "≤ 192 kbps": -8,
    "Atmos / TrueHD / DTS-HD": 12,
}
FORMAT_LEVEL = {"3001": 74, "3002": 45, "7": 101, "2": 17, "51": 58, "52": 24}
NO_FORMAT = re.compile(
    r"(?i)\b(?:WEB[ ._-]?(?:DL|Rip)|BD[ ._-]?(?:Remux|Rip)|720p|1080[pi]|2160p|x26[45]|flac|mp3)\b"
)
ADULT = 10


def load(paths):
    records = {}
    for path in paths:
        for line in path.read_text().splitlines():
            row = json.loads(line)
            if row["categoryId"] not in CATEGORIES or not row.get("title"):
                continue
            capture = dt.datetime.fromisoformat(
                row["capturedAt"].replace("Z", "+00:00")
            ).timestamp()
            posted = row.get("postedAt")
            row["age"] = max(0, (capture - posted) / 86400) if posted else None
            row["work"] = work_key(row["title"], row["categoryId"])
            records[row["source"], row["topicId"]] = row
    return list(records.values())


def work_key(title, category):
    prefix = re.split(r"[\[(]", title, maxsplit=1)[0]
    if category == 1:
        parts = re.split(r"\s+[–—-]\s+", prefix)
        if len(parts) > 1:
            prefix = " ".join(parts[:2])
    else:
        prefix = prefix.split(" / ", 1)[0]
    return (
        " ".join(re.findall(r"[^\W_]+", prefix.lower().replace("ё", "е")))
        or title.lower()
    )


def group_bucket(row):
    key = f"{row['categoryId']}:{row['work']}".encode()
    return hashlib.sha256(key).digest()[0] % 10


def markers(train):
    token_rows = collections.defaultdict(collections.Counter)
    token_sources = collections.defaultdict(set)
    for row in train:
        category = row["categoryId"]
        if category == ADULT:
            continue
        for token in set(re.findall(r"\b[^\W\d_]{3,18}\b", row["title"].lower())):
            token_rows[token][category] += 1
            token_sources[token].add(row["source"])
    ranked = []
    for token, counts in token_rows.items():
        strongest = counts.most_common(1)[0][1]
        total = sum(counts.values())
        shares = strongest / total
        if strongest >= 15 and shares >= 0.72 and len(token_sources[token]) >= 2:
            ranked.append((strongest * (shares - 0.5), token))
    return [word(token, "category") for _, token in sorted(ranked, reverse=True)[:60]]


def active(row, features, *, size=True, date=True, sparse_title=False):
    title = row["title"]
    if sparse_title:
        title = NO_FORMAT.sub("", title)
    return [
        index
        for index, feature in enumerate(features)
        if feature.matches(row, title, size, date)
    ]


def fit_categories(train, features, use_size):
    rng = random.Random(41)
    labels = sorted({row["categoryId"] for row in train})
    frequencies = collections.Counter(row["categoryId"] for row in train)
    matrix = [[0.0] * len(labels) for _ in range(len(features) + 1)]
    bias = len(features)
    examples = [
        (row, active(row, features, size=use_size, date=False)) for row in train
    ]
    for epoch in range(14):
        rng.shuffle(examples)
        learning_rate = 0.11 / (1 + epoch * 0.28)
        for row, identifiers in examples:
            if use_size and rng.random() < 0.2:
                identifiers = [
                    i for i in identifiers if features[i].criterion != META_SIZE
                ]
            if identifiers and rng.random() < 0.3:
                identifiers = [i for i in identifiers if rng.random() > 0.25]
            # With missing evidence the model should defer to the fallback.
            if not identifiers:
                continue
            identifiers = [*identifiers, bias]
            logits = [
                sum(matrix[i][j] for i in identifiers) for j in range(len(labels))
            ]
            largest = max(logits)
            exponents = [math.exp(logit - largest) for logit in logits]
            total = sum(exponents)
            label = row["categoryId"]
            factor = (
                learning_rate
                * (len(train) / (len(labels) * frequencies[label])) ** 0.45
            )
            errors = [
                factor * ((label == candidate) - value / total)
                for candidate, value in zip(labels, exponents)
            ]
            for index in identifiers:
                weights = matrix[index]
                for j, error in enumerate(errors):
                    weights[j] = weights[j] * (1 - learning_rate * 0.006) + error
    return labels, [[round(weight * 30, 2) for weight in scores] for scores in matrix]


def category_scores(row, features, model, *, use_size=True, sparse_title=False):
    labels, matrix = model
    indices = active(
        row, features, size=use_size, date=False, sparse_title=sparse_title
    )
    if not any(features[i].criterion != "size" for i in indices):
        return []
    scores = {
        label: sum(matrix[i][j] for i in [*indices, len(features)])
        for j, label in enumerate(labels)
    }
    # The runtime compares against every category, including those without learned weights.
    candidates = [(scores.get(label, 0), label) for label in CATEGORIES]
    return sorted(candidates, key=lambda candidate: candidate[0], reverse=True)


def classification(rows, features, model, margin, **kwargs):
    eligible_rows = [row for row in rows if row["categoryId"] in model[0]]
    picked = correct = top_correct = 0
    per_source = collections.defaultdict(lambda: [0, 0, 0])
    for row in eligible_rows:
        summary = per_source[row["source"]]
        summary[0] += 1
        scores = category_scores(row, features, model, **kwargs)
        if not scores:
            continue
        right = scores[0][1] == row["categoryId"]
        top_correct += right
        if scores[0][0] - scores[1][0] >= margin:
            picked += 1
            correct += right
            summary[1] += 1
            summary[2] += right
    total = len(eligible_rows)
    return {
        "rows": total,
        "assigned": picked,
        "correct": correct,
        "coverage": round(picked / max(1, total), 4),
        "accuracyWhenAssigned": round(correct / max(1, picked), 4),
        "top1BeforeMargin": round(top_correct / max(1, total), 4),
        "bySource": {
            s: dict(zip(("rows", "assigned", "correct"), counts))
            for s, counts in sorted(per_source.items())
        },
    }


def choose_margin(rows, features, model):
    for margin in (20, 25, 30, 35, 40, 45, 50, 55, 60):
        result = classification(rows, features, model, margin)
        if result["accuracyWhenAssigned"] >= 0.90:
            return margin
    return 65


def technical_level(row):
    if row.get("formatTag") in FORMAT_LEVEL:
        return FORMAT_LEVEL[row["formatTag"]]
    forum = row.get("forumTitle", "").lower()
    if row["categoryId"] in VIDEO:
        if re.search(r"\buhd\b", forum) and not re.search(r"\b(?:hd|fhd)\b", forum):
            return 101
        if re.search(r"\b(?:fullhd|fhd)\b", forum) and not re.search(
            r"\b(?:hd|uhd)\b", forum
        ):
            return 74
        if re.search(r"\bhd video\b|\(hd\)", forum):
            return 57
        if re.search(r"\(sd\)|\(dvd\)|dvd video", forum):
            return 18
    if row["categoryId"] == 1:
        if "lossless" in forum or "hi-res" in forum:
            return 58
        if "lossy" in forum:
            return 24
    return None


def prior(category, feature):
    value = TECHNICAL_PRIOR.get(feature.name, 0)
    if category in VIDEO and (
        feature.criterion in ("resolution", "video")
        or feature.name == "Atmos / TrueHD / DTS-HD"
    ):
        if feature.name == "50/60 fps":
            return value * (2 if category == 9 else 0.5)
        return value
    if (
        category == 1
        and feature.criterion == "audio"
        and feature.name != "Студийная озвучка"
    ):
        return value
    return 0


def comparison_pairs(rows):
    grouped = collections.defaultdict(list)
    for row in rows:
        if row.get("age") is not None and len(row["work"]) >= 4:
            grouped[row["source"], row["categoryId"], row["work"]].append(row)
    for group in grouped.values():
        if len(group) > 20:
            continue
        for left, right in itertools.combinations(group, 2):
            # Use close posting dates and keep only comparisons with a clear difference.
            if abs(left["age"] - right["age"]) > max(
                3, 0.4 * min(left["age"], right["age"])
            ):
                continue
            metric = (
                "downloads"
                if left.get("downloads") is not None
                and right.get("downloads") is not None
                else "seeds"
            )
            a, b = left.get(metric), right.get(metric)
            if (
                a is None
                or b is None
                or max(a, b) < 6
                or (max(a, b) + 1) / (min(a, b) + 1) < 1.5
            ):
                continue
            if abs(a - b) >= 3:
                yield (left, right) if a > b else (right, left)


def technical_pairs(rows):
    by_category = collections.defaultdict(list)
    for row in rows:
        level = technical_level(row)
        if level is not None:
            by_category[row["categoryId"]].append((row, level))
    rng = random.Random(17)
    for variants in by_category.values():
        for a, level_a in variants:
            for b, level_b in rng.sample(variants, min(5, len(variants))):
                if a["work"] != b["work"] and level_a - level_b >= 15:
                    yield a, b, min(70, level_a - level_b)


def fit_quality(rows, features):
    examples = collections.defaultdict(list)
    cached = {}

    def vector(row, date):
        key = row["source"], row["topicId"], date
        if key not in cached:
            cached[key] = set(active(row, features, date=date))
        return cached[key]

    def add(left, right, target, importance, date):
        a, b = vector(left, date), vector(right, date)
        diff = [(i, 1) for i in a - b] + [(i, -1) for i in b - a]
        if diff:
            examples[left["categoryId"]].append((diff, target, importance))

    for left, right, target in technical_pairs(rows):
        add(left, right, target, 1, False)
    for left, right in comparison_pairs(rows):
        add(left, right, 30, 0.35, True)
    coefficients = {}
    for category in CATEGORIES:
        baseline = [prior(category, feature) for feature in features]
        points = baseline[:]
        data = examples[category]
        if len(data) >= 12:
            for _ in range(26):
                gradients = [0.0] * len(features)
                for diff, target, importance in data:
                    error = max(
                        -70, min(70, sum(points[i] * sign for i, sign in diff) - target)
                    )
                    for index, sign in diff:
                        gradients[index] += error * importance * sign / (len(data) + 40)
                for index, feature in enumerate(features):
                    strength = (
                        0.28 if feature.criterion in (META_SIZE, META_DATE) else 0.16
                    )
                    points[index] -= 0.42 * (
                        gradients[index] + strength * (points[index] - baseline[index])
                    )
            for i, feature in enumerate(features):
                cap = {META_SIZE: 14, META_DATE: 10}.get(feature.criterion, 35)
                points[i] = max(baseline[i] - cap, min(baseline[i] + cap, points[i]))
        coefficients[category] = [
            round(point, 2) if abs(point) >= 0.15 else 0 for point in points
        ]
    return coefficients


def score(row, features, model, *, size=True, date=False):
    return sum(
        model[row["categoryId"]][i] for i in active(row, features, size=size, date=date)
    )


def evaluate_pairs(pairs, scoring):
    values = [scoring(left) - scoring(right) for left, right, *_ in pairs]
    total = len(values)
    wins = sum(value > 0.01 for value in values)
    ties = sum(abs(value) <= 0.01 for value in values)
    return {
        "pairs": total,
        "wins": wins,
        "ties": ties,
        "accuracy": round((wins + ties * 0.5) / max(1, total), 4),
    }


def export_rules(cat_features, category_model, quality_features, quality_model, margin):
    labels, matrix = category_model
    cat_rules = {}
    for i, feature in enumerate(
        [*cat_features, Feature("Базовые баллы категорий", "category")]
    ):
        rule = feature.rule()
        rule["weights"] = [
            {"criterion": "category", "categoryId": category, "points": matrix[i][j]}
            for j, category in enumerate(labels)
            if matrix[i][j]
        ]
        if rule["weights"]:
            cat_rules[rule["title"]] = rule
    for i, feature in enumerate(quality_features):
        rule = cat_rules.setdefault(feature.name, feature.rule())
        rule["weights"].extend(
            {
                "criterion": feature.criterion,
                "categoryId": category,
                "points": values[i],
            }
            for category, values in quality_model.items()
            if values[i]
        )
    return {
        "version": 1,
        "includeDate": False,
        "categoryMargin": margin,
        "rules": [rule for rule in cat_rules.values() if rule["weights"]],
    }


def dump(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def evaluate_source(args):
    source, rows, quality_features, margin = args
    outside = [r for r in rows if r["source"] != source]
    trained_works = {(r["categoryId"], r["work"]) for r in outside}
    inside = [
        r
        for r in rows
        if r["source"] == source and (r["categoryId"], r["work"]) not in trained_works
    ]
    source_features = TITLE_FEATURES + markers(outside) + SIZE_FEATURES
    model = fit_categories(outside, source_features, True)
    source_quality = fit_quality(outside, quality_features)
    return source, {
        "category": classification(inside, source_features, model, margin),
        "technicalRanking": evaluate_pairs(
            technical_pairs(inside),
            lambda r: score(r, quality_features, source_quality),
        ),
        "observedRanking": evaluate_pairs(
            comparison_pairs(inside),
            lambda r: score(r, quality_features, source_quality),
        ),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("data", nargs="+", type=pathlib.Path)
    parser.add_argument("--output", required=True, type=pathlib.Path)
    parser.add_argument("--report", required=True, type=pathlib.Path)
    parser.add_argument("--fold-workers", type=int, default=1)
    args = parser.parse_args()
    rows = load(args.data)
    train = [r for r in rows if group_bucket(r) >= 3]
    calibration = [r for r in rows if group_bucket(r) == 2]
    test = [r for r in rows if group_bucket(r) <= 1]
    quality_features = (
        [f for f in TITLE_FEATURES if f.criterion in QUALITY]
        + SIZE_FEATURES
        + DATE_FEATURES
    )
    cat_features = TITLE_FEATURES + markers(train) + SIZE_FEATURES
    category_model = fit_categories(train, cat_features, True)
    margin = choose_margin(calibration, cat_features, category_model)
    quality_model = fit_quality([*train, *calibration], quality_features)
    titles_only = fit_categories(train, cat_features, False)
    technical = list(technical_pairs(test))
    observed = list(comparison_pairs(test))
    prior_model = {
        category: [prior(category, f) for f in quality_features]
        for category in CATEGORIES
    }

    def variants(pairs):
        return {
            "technicalPrior": evaluate_pairs(
                pairs, lambda r: score(r, quality_features, prior_model)
            ),
            "trainedWithoutSizeOrDate": evaluate_pairs(
                pairs, lambda r: score(r, quality_features, quality_model, size=False)
            ),
            "trainedWithSize": evaluate_pairs(
                pairs, lambda r: score(r, quality_features, quality_model)
            ),
            "trainedWithSizeAndDate": evaluate_pairs(
                pairs, lambda r: score(r, quality_features, quality_model, date=True)
            ),
        }

    config = export_rules(
        cat_features, category_model, quality_features, quality_model, margin
    )
    dump(args.output, config)
    print(
        f"Fitted {len(config['rules'])} rules from {len(train)} training rows",
        flush=True,
    )
    folds = [
        (source, rows, quality_features, margin)
        for source in sorted({r["source"] for r in rows})
    ]
    if args.fold_workers > 1:
        with ProcessPoolExecutor(max_workers=args.fold_workers) as executor:
            tests = dict(executor.map(evaluate_source, folds))
    else:
        tests = dict(map(evaluate_source, folds))
    dump(
        args.report,
        {
            "rows": len(rows),
            "sources": dict(collections.Counter(r["source"] for r in rows)),
            "categories": dict(collections.Counter(r["categoryId"] for r in rows)),
            "groupedHoldout": {
                "train": len(train),
                "calibration": len(calibration),
                "test": len(test),
            },
            "classifierMargin": margin,
            "classifier": classification(test, cat_features, category_model, margin),
            "classifierWithoutSize": classification(
                test, cat_features, titles_only, margin, use_size=False
            ),
            "classifierReducedTitle": classification(
                test, cat_features, category_model, margin, sparse_title=True
            ),
            "technicalRanking": variants(technical),
            "observedRanking": variants(observed),
            "observedPairsByCategory": dict(
                collections.Counter(a["categoryId"] for a, _ in observed)
            ),
            "unseenTracker": tests,
            "rules": len(config["rules"]),
        },
    )


if __name__ == "__main__":
    main()
