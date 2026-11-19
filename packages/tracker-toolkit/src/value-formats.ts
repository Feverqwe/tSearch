type Step = {name: string; args?: string[]};

export interface ValueFormat {
  status: 'detected' | 'ambiguous' | 'unsupported';
  kind: string;
  label: string;
  alternatives?: string[];
  unitBase?: number;
  assumption?: string;
  pipeline?: Step[];
}

const step = (name: string, ...args: string[]): Step => (args.length ? {name, args} : {name});
const clean = (value: string) => value.replace(/[\u00a0\u202f]/g, ' ').trim();
const meaningful = (values: string[]) =>
  values.map(clean).filter((value) => value && !/^(?:[-—–]|n\/?a|нет)$/i.test(value));
const invalidDate = (): ValueFormat => ({
  status: 'unsupported',
  kind: 'invalid-date',
  label: 'В колонке есть недопустимые даты',
});
function validDate(year: number, month: number, day: number, value: string) {
  const fullYear = year < 100 ? 2000 + year : year;
  const time = /(?:T|\s)(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(value);
  return (
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= new Date(Date.UTC(fullYear, month, 0)).getUTCDate() &&
    (!time || (Number(time[1]) < 24 && Number(time[2]) < 60 && Number(time[3] ?? 0) < 60))
  );
}
const numericDate = /^(\d{1,2})([./-])(\d{1,2})\2(\d{2}|\d{4})(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?$/;
const sizeValue =
  /^(\d[\d.,\s]*?)\s*(KiB|MiB|GiB|TiB|KB|MB|GB|TB|КиБ|МиБ|ГиБ|ТиБ|КБ|МБ|ГБ|ТБ|bytes?|байт(?:а|ов)?|B)$/i;

export function inferDateFormat(values: string[], language = ''): ValueFormat {
  const samples = meaningful(values);
  if (!samples.length)
    return {status: 'unsupported', kind: 'unknown', label: 'Формат даты не определён'};
  const connector = '\\s+(?:в|at)\\s+(?=\\d{1,2}:)';
  const normalized = samples.map((value) => value.replace(new RegExp(connector, 'i'), ' '));
  if (normalized.some((value, index) => value !== samples[index])) {
    const format = inferDateFormat(normalized, language);
    return format.pipeline
      ? {...format, pipeline: [step('replaceRe', connector, ' '), ...format.pipeline]}
      : format;
  }
  const relativeDay = /^(?:сегодня|вчера|today|yesterday)(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?$/i;
  const calendar = samples.filter((value) => !relativeDay.test(value));
  if (calendar.length < samples.length) {
    if (!samples.every((value) => validDate(2000, 1, 1, ' ' + value))) return invalidDate();
    const format = calendar.length ? inferDateFormat(calendar, language) : undefined;
    if (format && format.status !== 'detected') return format;
    if (format && !['ymd', 'dmy', 'mdy', 'named-day-first'].includes(format.kind))
      return {status: 'unsupported', kind: 'unknown', label: 'Смешанный формат даты не определён'};
    return {
      status: 'detected',
      kind: format ? 'relative-' + format.kind : 'relative-day',
      label: format ? 'Сегодня / вчера и ' + format.label.toLowerCase() : 'Сегодня / вчера',
      assumption: 'Текущая дата и часовой пояс браузера',
      pipeline: [
        ...(format?.kind === 'ymd'
          ? [step('replaceRe', '^(\\d{4})-(\\d{2})-(\\d{2})', '$3-$2-$1')]
          : []),
        ...(format?.kind === 'mdy'
          ? [step('replaceRe', '^(\\d{1,2})([./-])(\\d{1,2})\\2(\\d{2}|\\d{4})', '$3-$1-$4')]
          : []),
        step('legacyReplaceToday'),
        step('legacyReplaceMonth'),
        step('legacyParseDate', '1'),
      ],
    };
  }
  const timeFirst = /^(\d{1,2}:\d{2})\s+(\d{1,2}[./-]\d{1,2}[./-](?:\d{2}|\d{4}))$/;
  if (samples.every((value) => timeFirst.test(value))) {
    const date = inferDateFormat(
      samples.map((value) => value.replace(timeFirst, '$2 $1')),
      language,
    );
    if (date.status !== 'detected') return date;
    return {
      ...date,
      kind: 'time-' + date.kind,
      label: 'Время, затем ' + date.label.toLowerCase(),
      pipeline: [step('replaceRe', timeFirst.source, '$2 $1'), ...(date.pipeline ?? [])],
    };
  }
  if (samples.every((value) => /^\d{10}$/.test(value))) {
    return {
      status: 'detected',
      kind: 'unix-seconds',
      label: 'Unix timestamp, секунды',
      pipeline: [step('toInt')],
    };
  }
  if (samples.every((value) => /^\d{13}$/.test(value))) {
    return {
      status: 'detected',
      kind: 'unix-milliseconds',
      label: 'Unix timestamp, миллисекунды',
      pipeline: [step('replaceRe', '^(\\d{10})\\d{3}$', '$1'), step('toInt')],
    };
  }
  if (samples.every((value) => /^\d{10}(?:\d{3})?$/.test(value))) {
    return {
      status: 'detected',
      kind: 'unix-mixed',
      label: 'Unix timestamp, секунды и миллисекунды',
      pipeline: [step('replaceRe', '^(\\d{10})\\d{3}$', '$1'), step('toInt')],
    };
  }
  if (
    samples.every((value) =>
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})$/i.test(value),
    )
  ) {
    if (
      !samples.every((value) => {
        const [year, month, day] = value.slice(0, 10).split('-').map(Number);
        return validDate(year, month, day, value) && Number.isFinite(Date.parse(value));
      })
    )
      return invalidDate();
    return {
      status: 'detected',
      kind: 'iso8601-zone',
      label: 'ISO 8601 с часовым поясом',
      pipeline: [step('parseIsoDate')],
    };
  }
  if (
    samples.every((value) => /^\d{4}-\d{2}-\d{2}(?:[ T]\d{1,2}:\d{2}(?::\d{2})?)?$/.test(value))
  ) {
    if (
      !samples.every((value) => {
        const [year, month, day] = value.slice(0, 10).split('-').map(Number);
        return validDate(year, month, day, value);
      })
    )
      return invalidDate();
    return {
      status: 'detected',
      kind: 'ymd',
      label: 'Год–месяц–день',
      assumption: 'Часовой пояс браузера',
      pipeline: [step('legacyParseDate', '0')],
    };
  }
  const numeric = samples.map((value) => numericDate.exec(value));
  if (numeric.every(Boolean)) {
    const dayFirst = numeric.some((match) => Number(match![1]) > 12);
    const monthFirst = numeric.some((match) => Number(match![3]) > 12);
    if (dayFirst && monthFirst) {
      return {
        status: 'ambiguous',
        kind: 'mixed-numeric',
        label: 'В колонке смешаны порядки дня и месяца',
        alternatives: ['DD/MM/YYYY', 'MM/DD/YYYY'],
      };
    }
    const locale = language.toLowerCase();
    const regionalDayFirst = /^(?:ru|uk|de|fr|en-gb)(?:-|$)/.test(locale);
    const regionalMonthFirst = /^en-us(?:-|$)/.test(locale);
    if (!dayFirst && !monthFirst && !regionalDayFirst && !regionalMonthFirst) {
      return {
        status: 'ambiguous',
        kind: 'numeric-order',
        label: 'Порядок дня и месяца неоднозначен',
        alternatives: ['DD/MM/YYYY', 'MM/DD/YYYY'],
      };
    }
    const order = dayFirst || (!monthFirst && regionalDayFirst) ? 'dmy' : 'mdy';
    if (
      !numeric.every((match, index) =>
        validDate(
          Number(match![4]),
          Number(match![order === 'dmy' ? 3 : 1]),
          Number(match![order === 'dmy' ? 1 : 3]),
          samples[index],
        ),
      )
    )
      return invalidDate();
    return {
      status: 'detected',
      kind: order,
      label: order === 'dmy' ? 'День–месяц–год' : 'Месяц–день–год',
      assumption: !dayFirst && !monthFirst ? 'Порядок выбран по языку страницы' : undefined,
      pipeline: [step('legacyParseDate', order === 'dmy' ? '1' : '3')],
    };
  }
  if (
    samples.every((value) =>
      /^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s+\d{1,2},?\s+\d{4}$/i.test(
        value,
      ),
    )
  ) {
    return {status: 'detected', kind: 'named-month-first', label: 'Название месяца, день, год'};
  }
  if (
    samples.every((value) =>
      /^\d{1,2}[\s-]+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|янв|фев|мар|апр|май|мая|июн|июл|авг|сен|окт|ноя|дек)/i.test(
        value,
      ),
    )
  ) {
    return {status: 'detected', kind: 'named-day-first', label: 'День, название месяца, год'};
  }
  return {status: 'unsupported', kind: 'unknown', label: 'Формат даты не определён'};
}

export function inferSizeFormat(values: string[]): ValueFormat {
  const samples = meaningful(values);
  if (!samples.length)
    return {status: 'unsupported', kind: 'unknown', label: 'Формат размера не определён'};
  if (samples.some((value) => /^-\s*\d/.test(value)))
    return {
      status: 'unsupported',
      kind: 'invalid-size',
      label: 'В колонке есть отрицательные размеры',
    };
  if (samples.every((value) => /^\d+$/.test(value))) {
    return {
      status: 'detected',
      kind: 'bytes',
      label: 'Байты',
      unitBase: 1,
      pipeline: [step('toInt')],
    };
  }
  const parts = samples.map((value) => sizeValue.exec(value));
  if (!parts.every(Boolean))
    return {status: 'unsupported', kind: 'unknown', label: 'Формат размера не определён'};
  const numbers = parts.map((match) => match![1].replace(/\s/g, ''));
  const dotDecimal = numbers.some(
    (value) => /,\d{3}\.\d+$/.test(value) || /\.\d{1,2}$/.test(value),
  );
  const commaDecimal = numbers.some(
    (value) => /\.\d{3},\d+$/.test(value) || /,\d{1,2}$/.test(value),
  );
  const dotGrouping = numbers.some((value) => /^\d{1,3}(?:\.\d{3}){2,}$/.test(value));
  const commaGrouping = numbers.some((value) => /^\d{1,3}(?:,\d{3}){2,}$/.test(value));
  if ((dotDecimal || commaGrouping) && (commaDecimal || dotGrouping)) {
    return {
      status: 'ambiguous',
      kind: 'mixed-separators',
      label: 'В колонке смешаны форматы чисел',
    };
  }
  if (
    !dotDecimal &&
    !commaDecimal &&
    numbers.some((value) => /[.,]\d{3}$/.test(value) && !/^\d{1,3}(?:[.,]\d{3}){2,}$/.test(value))
  ) {
    return {
      status: 'ambiguous',
      kind: 'numeric-separator',
      label: 'Неясно, разделитель дробный или тысячный',
    };
  }
  const explicitBytes = parts.every((match) => /^(?:b|bytes?|байт(?:а|ов)?)$/i.test(match![2]));
  const explicitBinary = parts.every((match) => /i|и/i.test(match![2]));
  const pipeline: Step[] = [];
  if (commaDecimal || dotGrouping)
    pipeline.push(step('replaceRe', '\\.', ''), step('replaceRe', ',', '.'));
  else pipeline.push(step('replaceRe', ',', ''));
  if (explicitBytes) {
    pipeline.push(step('replaceRe', '[^0-9.]', ''), step('toInt'));
  } else {
    pipeline.push(step('replaceRe', 'и', ''), step('legacySizeFormat'));
  }
  return {
    status: 'detected',
    kind: explicitBytes ? 'bytes-with-unit' : explicitBinary ? 'binary-units' : 'legacy-units',
    label: explicitBytes
      ? 'Байты с обозначением единицы'
      : explicitBinary
        ? 'KiB / MiB / GiB, основание 1024'
        : 'КБ / МБ / ГБ, основание 1024',
    unitBase: explicitBytes ? 1 : 1024,
    assumption:
      !explicitBytes && !explicitBinary
        ? 'Для KB/MB/GB используется принятое в прототипе основание 1024'
        : undefined,
    pipeline,
  };
}
