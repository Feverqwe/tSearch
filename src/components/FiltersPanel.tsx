import {useId, useState} from 'react';
import {enUS, ru, uk} from 'date-fns/locale';
import DatePicker from 'react-datepicker';

import Button from './ui/Button';
import Field from './ui/Field';

import 'react-datepicker/dist/react-datepicker.min.css';
import './datePickerTheme.less';

interface FilterRange {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}

interface DateFilter {
  min: number;
  max: number;
  preset: number;
  onChange: (min: number, max: number, preset: number) => void;
}

interface FiltersPanelProps {
  text: string;
  onTextChange: (text: string) => void;
  size: FilterRange;
  seed?: FilterRange;
  peer?: FilterRange;
  time: DateFilter;
  onReset?: () => void;
}

export default function FiltersPanel({
  text,
  onTextChange,
  size,
  seed,
  peer,
  time,
  onReset,
}: FiltersPanelProps) {
  return (
    <div className="parameter_box__right">
      <div className="parameter parameter-filter">
        <Field label={chrome.i18n.getMessage('wordFilterLabel')}>
          {(props) => (
            <input
              {...props}
              value={text}
              onChange={(event) => onTextChange(event.currentTarget.value)}
              type="search"
              name="textFilter"
              className="ts-control filter-word"
            />
          )}
        </Field>
      </div>
      <RangeFilter kind="size" min={size.min} max={size.max} onChange={size.onChange} />
      <TimeFilter {...time} />
      {seed && <RangeFilter kind="seed" min={seed.min} max={seed.max} onChange={seed.onChange} />}
      {peer && <RangeFilter kind="peer" min={peer.min} max={peer.max} onChange={peer.onChange} />}
      {onReset && (
        <Button className="filter-reset" variant="quiet" onClick={onReset}>
          {chrome.i18n.getMessage('search_reset_filters')}
        </Button>
      )}
    </div>
  );
}

function RangeFilter({
  kind,
  min,
  max,
  onChange,
}: {
  kind: 'size' | 'seed' | 'peer';
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}) {
  const label = chrome.i18n.getMessage(`${kind}FilterLabel`);
  const from = chrome.i18n.getMessage('rangeFromPlaceholder');
  const to = chrome.i18n.getMessage('rangeToPlaceholder');
  return (
    <fieldset className="parameter parameter-filter filter-range">
      <legend>{label}</legend>
      <div className="filter-range-controls">
        <input
          onChange={(event) => {
            if (event.currentTarget.validity.valid)
              onChange(Number(event.currentTarget.value), max);
          }}
          defaultValue={min || ''}
          name={`${kind}Min`}
          className="ts-control"
          type="number"
          min={0}
          step={kind === 'size' ? 'any' : 1}
          placeholder={from}
          aria-label={`${label}: ${from}`}
        />
        <span aria-hidden="true">—</span>
        <input
          onChange={(event) => {
            if (event.currentTarget.validity.valid)
              onChange(min, Number(event.currentTarget.value));
          }}
          defaultValue={max || ''}
          name={`${kind}Max`}
          className="ts-control"
          type="number"
          min={0}
          step={kind === 'size' ? 'any' : 1}
          placeholder={to}
          aria-label={`${label}: ${to}`}
        />
      </div>
    </fieldset>
  );
}

const timeOptions = [
  [0, 'timeFilterAll'],
  [3600, 'timeFilter1h'],
  [86400, 'timeFilter24h'],
  [259200, 'timeFilter72h'],
  [604800, 'timeFilter1w'],
  [2592000, 'timeFilter1m'],
  [31536000, 'timeFilter1y'],
  [-1, 'timeFilterRange'],
] as const;

const calendarLocales = {en: enUS, ru, uk};

function TimeFilter({min, max, preset, onChange}: DateFilter) {
  const labelId = useId();
  const [minDate, setMinDate] = useState(() =>
    preset === -1 && min ? new Date(min * 1000) : null,
  );
  const [maxDate, setMaxDate] = useState(() =>
    preset === -1 && max ? new Date(max * 1000) : null,
  );
  const message = (key: string) => chrome.i18n.getMessage(key);
  const language = message('ui_language');
  const previousMonth = message('calendar_previous_month');
  const nextMonth = message('calendar_next_month');
  const calendarProps = {
    locale: calendarLocales[language as keyof typeof calendarLocales] ?? enUS,
    dateFormat: 'P',
    previousMonthAriaLabel: previousMonth,
    previousMonthButtonLabel: previousMonth,
    nextMonthAriaLabel: nextMonth,
    nextMonthButtonLabel: nextMonth,
    chooseDayAriaLabelPrefix: message('calendar_choose_day'),
    disabledDayAriaLabelPrefix: message('calendar_unavailable_day'),
    monthAriaLabelPrefix: '',
    className: 'ts-control',
  };

  function applyRange(from: Date | null, to: Date | null) {
    const end = to && new Date(to);
    end?.setHours(23, 59, 59, 999);
    onChange(
      from ? Math.floor(from.getTime() / 1000) : 0,
      end ? Math.floor(end.getTime() / 1000) : 0,
      -1,
    );
  }

  return (
    <div className="parameter parameter-filter">
      <label className="filter__label" htmlFor={labelId}>
        {chrome.i18n.getMessage('timeFilterLabel')}
      </label>
      <div className="select">
        <select
          id={labelId}
          className="ts-control select__select-time-filter"
          value={preset}
          onChange={(event) => {
            const duration = Number(event.currentTarget.value);
            if (duration === -1) {
              applyRange(minDate, maxDate);
            } else {
              onChange(duration === 0 ? 0 : Math.floor(Date.now() / 1000) - duration, 0, duration);
            }
          }}
        >
          {timeOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {chrome.i18n.getMessage(label)}
            </option>
          ))}
        </select>
      </div>
      {preset === -1 && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            applyRange(minDate, maxDate);
          }}
          className="filter-date-range"
        >
          <DatePicker
            {...calendarProps}
            name="timeMin"
            ariaLabel={message('calendar_start')}
            placeholderText={chrome.i18n.getMessage('rangeFromPlaceholder')}
            selected={minDate}
            onChange={(date: Date | null) => {
              setMinDate(date);
              applyRange(date, maxDate);
            }}
          />
          {' — '}
          <DatePicker
            {...calendarProps}
            name="timeMax"
            ariaLabel={message('calendar_end')}
            placeholderText={chrome.i18n.getMessage('rangeToPlaceholder')}
            selected={maxDate}
            onChange={(date: Date | null) => {
              setMaxDate(date);
              applyRange(minDate, date);
            }}
          />
        </form>
      )}
    </div>
  );
}
