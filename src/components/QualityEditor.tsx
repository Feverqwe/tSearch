import {useState} from 'react';

import {defaults, type QualityConfig} from '../tools/qualityConfig';
import QualityRuleDialog from './QualityRuleDialog';
import QualityTransfer from './QualityTransfer';
import Button from './ui/Button';
import Field from './ui/Field';
import IconButton from './ui/IconButton';
import {message, criterionLabel} from './qualityLabels';
import '../assets/css/quality.less';

export interface QualityEditorProps {
  saved: QualityConfig;
  revision: string;
  pending?: boolean;
  error?: 'conflict' | 'write';
  onSave: (config: QualityConfig, revision: string) => Promise<void>;
  onResetStatus?: () => void;
}

const pageSize = 12;
const peerFields = [
  ['includeSeeds', 'seedMin', 'seedPoints'],
  ['includeLeeches', 'leechMin', 'leechPoints'],
] as const;

export default function QualityEditor({
  saved,
  revision,
  pending,
  error,
  onSave,
  onResetStatus,
}: QualityEditorProps) {
  const [draft, setDraft] = useState<{base: string; value: QualityConfig}>();
  const [dialog, setDialog] = useState<number | 'add' | 'transfer'>();
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState('');
  const [invalid, setInvalid] = useState<Set<string>>(() => new Set());
  const [fieldVersion, setFieldVersion] = useState(0);
  const config = draft?.value ?? saved;
  const dirty = Boolean(draft && (draft.base !== revision || config !== saved));
  const conflict = Boolean(draft && (draft.base !== revision || error === 'conflict'));
  const token = filter.trim().toLocaleLowerCase();
  const visible = config.rules
    .map((rule, index) => ({rule, index}))
    .filter(
      ({rule}) =>
        !token ||
        [rule.title, ...rule.patterns.map(({text}) => text)].some((label) =>
          label?.toLocaleLowerCase().includes(token),
        ),
    );
  const pages = Math.max(1, Math.ceil(visible.length / pageSize));
  const active = Math.min(page, pages - 1);
  function patch(change: Partial<QualityConfig>) {
    if (pending) return;
    onResetStatus?.();
    setDraft({base: draft?.base ?? revision, value: {...config, ...change}});
  }

  function resetFields() {
    setFieldVersion((value) => value + 1);
    setInvalid(new Set());
  }

  function mark(key: string, invalid: boolean) {
    setInvalid((prior) => {
      if (prior.has(key) === invalid) return prior;
      const next = new Set(prior);
      if (invalid) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  function reset(draft?: QualityConfig) {
    onResetStatus?.();
    setDraft(draft ? {base: revision, value: draft} : undefined);
    resetFields();
  }

  const editNumber = (
    key: string,
    label: string,
    value: number,
    onChange: (value: number) => void,
    min = -999,
    max = 999,
    integer = false,
  ) => (
    <NumberOption
      key={`${fieldVersion}:${key}`}
      label={label}
      value={value}
      min={min}
      max={max}
      disabled={pending}
      integer={integer}
      onChange={(value) => {
        mark(key, value === undefined);
        if (value !== undefined) onChange(value);
      }}
    />
  );

  return (
    <>
      <section className="settings-group quality-editor">
        <h2>{message('quality_settings')}</h2>
        <p className="quality-note">{message('quality_description')}</p>
        <fieldset className="quality-settings-controls" disabled={pending}>
          {peerFields.map(([enabled, min, bonus]) => (
            <div key={enabled} className="quality-peer">
              <label className="option">
                <input
                  type="checkbox"
                  checked={config[enabled]}
                  onChange={(event) => patch({[enabled]: event.currentTarget.checked})}
                />
                {message(`quality_${enabled}`)}
              </label>
              {editNumber(
                min,
                message(`quality_${min}`),
                config[min],
                (value) => patch({[min]: value}),
                1,
                999999,
                true,
              )}
              {editNumber(bonus, message(`quality_${bonus}`), config[bonus], (value) =>
                patch({[bonus]: value}),
              )}
            </div>
          ))}
          <div className="quality-peer">
            <label className="option">
              <input
                type="checkbox"
                checked={config.includeDate}
                onChange={(event) => patch({includeDate: event.currentTarget.checked})}
              />
              {message('rankByReleaseDate')}
            </label>
            {editNumber(
              'margin',
              message('quality_margin'),
              config.categoryMargin,
              (categoryMargin) => patch({categoryMargin}),
              Number.MIN_VALUE,
              Number.MAX_SAFE_INTEGER,
            )}
          </div>
        </fieldset>
        <div className="quality-rule-list">
          <div className="quality-shelf">
            <h2>{message('quality_rules')}</h2>
            <Button onClick={() => setDialog('add')} disabled={pending}>
              {message('quality_new_rule')}
            </Button>
            <Button disabled={pending} onClick={() => setDialog('transfer')}>
              {message('quality_transfer')}
            </Button>
          </div>
          <Field label={message('quality_find')}>
            {(props) => (
              <input
                {...props}
                className="ts-control"
                type="search"
                value={filter}
                onChange={(event) => {
                  setFilter(event.currentTarget.value);
                  setPage(0);
                }}
              />
            )}
          </Field>
          {visible.length > 0 && (
            <div className="quality-rule-columns" aria-hidden="true">
              <span>{message('quality_rule')}</span>
              <span>{message('quality_criterion')}</span>
              <span>{message('quality_points')}</span>
            </div>
          )}
          <ul>
            {visible.slice(active * pageSize, (active + 1) * pageSize).map(({rule, index}) => {
              const indexOfWeight = rule.weights.findIndex(
                ({criterion}) => criterion !== 'category',
              );
              const weightIndex = Math.max(0, indexOfWeight);
              const weight = rule.weights[weightIndex];
              const name = rule.title || rule.patterns[0].text;
              return (
                <li key={index}>
                  <div className="quality-rule-name">
                    <Button
                      variant="quiet"
                      onClick={() => {
                        resetFields();
                        setDialog(index);
                      }}
                      disabled={pending}
                    >
                      {name}
                    </Button>
                    <small>{rule.patterns.map(({text}) => text).join(', ')}</small>
                  </div>
                  <span className="quality-criterion" data-criterion={weight.criterion}>
                    {criterionLabel(weight.criterion)}
                    {rule.weights.length > 1 && ` +${rule.weights.length - 1}`}
                  </span>
                  {editNumber(
                    `rule-${index}`,
                    `${message('quality_points')}: ${name}`,
                    weight.points,
                    (points) =>
                      patch({
                        rules: config.rules.map((rule, i) =>
                          i !== index
                            ? rule
                            : {
                                ...rule,
                                weights: rule.weights.map((weight, j) =>
                                  j === weightIndex ? {...weight, points} : weight,
                                ),
                              },
                        ),
                      }),
                  )}
                  <IconButton
                    label={`${message('delete')}: ${name}`}
                    icon="remove"
                    variant="quiet"
                    disabled={pending}
                    onClick={() => {
                      resetFields();
                      patch({rules: config.rules.filter((_, i) => i !== index)});
                    }}
                  />
                </li>
              );
            })}
          </ul>
          {!visible.length && <p>{message('quality_empty')}</p>}
          {pages > 1 && (
            <div className="quality-actions">
              <Button
                onClick={() => setPage(active - 1)}
                disabled={!active}
                aria-label={message('explorer_move_earlier')}
              >
                ←
              </Button>
              <span>
                {active + 1} / {pages}
              </span>
              <Button
                onClick={() => setPage(active + 1)}
                disabled={active + 1 >= pages}
                aria-label={message('explorer_move_later')}
              >
                →
              </Button>
            </div>
          )}
        </div>
        <div className="quality-actions quality-editor-footer">
          <Button
            variant="primary"
            busy={pending}
            disabled={!dirty || Boolean(invalid.size) || conflict}
            onClick={async () => {
              if (!draft) return;
              try {
                await onSave(config, draft.base);
                reset();
              } catch {
                /* Keep the draft; the parent reports the storage or conflict error. */
              }
            }}
          >
            {message('save')}
          </Button>
          <Button
            variant="quiet"
            disabled={pending || (!dirty && !invalid.size)}
            onClick={() => reset()}
          >
            {message(conflict ? 'refresh' : 'cancel')}
          </Button>
          <Button variant="quiet" disabled={pending} onClick={() => reset(defaults)}>
            {message('quality_defaults')}
          </Button>
          {conflict && <p role="alert">{message('quality_conflict')}</p>}
          {!conflict && error === 'write' && <p role="alert">{message('settings_save_error')}</p>}
        </div>
      </section>
      {dialog === 'transfer' ? (
        <QualityTransfer
          config={config}
          close={() => setDialog(undefined)}
          apply={(value) => {
            resetFields();
            patch(value);
          }}
        />
      ) : (
        dialog !== undefined && (
          <QualityRuleDialog
            initial={typeof dialog === 'number' ? config.rules[dialog] : undefined}
            close={() => setDialog(undefined)}
            save={(rule) =>
              patch({
                rules:
                  dialog === 'add'
                    ? [...config.rules, rule]
                    : config.rules.map((previous, i) => (i === dialog ? rule : previous)),
              })
            }
          />
        )
      )}
    </>
  );
}

function NumberOption({
  label,
  value,
  min,
  max,
  integer,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  integer: boolean;
  disabled?: boolean;
  onChange: (value: number | undefined) => void;
}) {
  const [invalid, setInvalid] = useState<string>();
  const [raw, setRaw] = useState<string>();
  return (
    <Field label={label} error={invalid}>
      {(props) => (
        <input
          {...props}
          className="ts-control"
          type="number"
          value={invalid === undefined ? value : (raw ?? '')}
          min={min}
          max={max}
          step={integer ? 1 : 'any'}
          required
          disabled={disabled}
          onChange={(event) => {
            const input = event.currentTarget;
            setRaw(input.value);
            setInvalid(input.validity.valid ? undefined : message('quality_error_number'));
            onChange(input.validity.valid ? input.valueAsNumber : undefined);
          }}
        />
      )}
    </Field>
  );
}
