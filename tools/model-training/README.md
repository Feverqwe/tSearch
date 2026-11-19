# Инструменты обучения моделей

Расширение собирается с готовыми весами из `src/tools/`. Скрипты в этом каталоге позволяют
обучать и проверять новые модели на своих данных. У каждого инструмента есть локальный каталог
`assets/` для датасетов, снимков страниц и экспериментальных весов. Git игнорирует эти каталоги.
Команды ниже записывают результаты в `assets/output/` соответствующего инструмента.

Выполняйте команды из корня репозитория после `npm ci`. Для обучения понадобится Python 3.

## Оценка качества раздач

Подайте JSONL, где каждая строка содержит `source`, `topicId`, `title`, `categoryId`
и `capturedAt` в ISO 8601. Укажите `sizeBytes` и `postedAt` (Unix-время в секундах),
если они известны. Для проверки также можно передать название рубрики в `forumTitle`.

```sh
mkdir -p tools/model-training/quality-ranking/assets/output
python3 tools/model-training/quality-ranking/train.py /path/to/releases.jsonl \
  --output tools/model-training/quality-ranking/assets/output/weights.json --report tools/model-training/quality-ranking/assets/output/training.json
node tools/model-training/quality-ranking/verify-retraining.mjs /path/to/releases.jsonl \
  tools/model-training/quality-ranking/assets/output/weights.json tools/model-training/quality-ranking/assets/output/comparison.json
```

Проверка сравнивает кандидата со штатными весами на отложенной выборке. Чтобы сравнить с
другими весами, передайте путь к ним четвёртым аргументом.

## Сопоставление названий

Скрипту подготовки нужен JSONL с полями `title` и `categoryId`. Подходит и входной файл
для оценки качества.

```sh
mkdir -p tools/model-training/title-matching/assets/output
node tools/model-training/title-matching/prepare.mjs /path/to/releases.jsonl \
  tools/model-training/title-matching/assets/output/features.json
python3 tools/model-training/title-matching/train.py tools/model-training/title-matching/assets/output/features.json \
  tools/model-training/title-matching/assets/output/weights.json tools/model-training/title-matching/assets/output/training.json
```

## Распознавание полей трекера

Откройте интерактивный стенд с готовыми весами расширения. В нём есть два синтетических
примера. Для разбора своей страницы укажите её URL и вставьте HTML или выберите локальный файл.

```sh
npx vite tools/model-training/tracker-parser --host 127.0.0.1
```

### Обучение на сохранённых страницах

Для подготовки данных нужен Chromium из `npx playwright install chromium`. Можно передать
путь к своему Chromium через `TSEARCH_CHROME`. Относительные пути к HTML задаются от
файла манифеста.

Для строк выдачи подготовьте манифест с массивом `samples`. Для каждого примера укажите
`site`, `url`, `html` и объект `columns` с номерами колонок, начиная с единицы.
Например, `"columns": {"title": 1, "size": 2}`. Для обучения и проверки используйте
снимки как минимум двух сайтов.

```sh
mkdir -p tools/model-training/tracker-parser/assets/output
node tools/model-training/tracker-parser/browser-run.mjs prepare /path/to/rows.json \
  tools/model-training/tracker-parser/assets/output/rows.json
python3 tools/model-training/tracker-parser/train_linear.py tools/model-training/tracker-parser/assets/output/rows.json \
  tools/model-training/tracker-parser/assets/output/linear.json --report tools/model-training/tracker-parser/assets/output/linear-report.json \
  --holdout-models tools/model-training/tracker-parser/assets/output/holdouts.json
```

Для проверки линейной модели на размеченных примерах используйте `browser-run.mjs verify`.
Укажите путь к модели в поле `model` манифеста. Аргументы команды — манифест, путь для отчёта
и, при необходимости, файл моделей для отложенных сайтов. В примерах можно задать
`expected`, `expectedRowCount` или `expectedFirstRow`.

Нейросетевой вариант для строк запускается через `train_rows.py DATASET OUTPUT_DIRECTORY`.
Передайте JSON с массивами `train` и `validation` из подготовленных примеров и списком
`unseenSites` для проверки на других сайтах. Сайты из этого списка исключаются из
соответствующей обучающей выборки.

Модель полей страницы умеет обучаться на синтетических примерах. При желании передайте
`page-model/prepare.mjs` вторым аргументом манифест с массивом `samples`. Для каждой страницы
задайте `site`, `url`, `html`, `split` (`train` или `validation`) и объект `expected`
с ожидаемыми `name`, `description`, `loginUrl` и `nextPageUrl`. Для отсутствующих значений
используйте `null`. URL полей задавайте полностью.

```sh
python3 -m venv tools/model-training/tracker-parser/assets/venv
tools/model-training/tracker-parser/assets/venv/bin/python -m pip install -r tools/model-training/tracker-parser/requirements.txt
node tools/model-training/tracker-parser/page-model/prepare.mjs tools/model-training/tracker-parser/assets/output/pages
tools/model-training/tracker-parser/assets/venv/bin/python tools/model-training/tracker-parser/page-model/train.py \
  tools/model-training/tracker-parser/assets/output/pages/dataset.json tools/model-training/tracker-parser/assets/output/page-models
```

Для `train_rows.py` используйте тот же Python из виртуального окружения. Перед заменой штатных
весов сравните модели на независимой контрольной выборке.
