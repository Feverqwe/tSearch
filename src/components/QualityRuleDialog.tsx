import {type FormEvent, useRef, useState} from 'react';

import {
  type Condition,
  type Pattern,
  type QualityRule,
  QualityValidationError,
  type Weight,
  criteria,
  qualityCategoryIds,
  validateQualityRule,
} from '../tools/qualityConfig';

import Dialog from './Dialog';
import {criterionLabel, message, qualityCategory} from './qualityLabels';
import Button from './ui/Button';
import Field from './ui/Field';
import IconButton from './ui/IconButton';

const boundFields = ['minBytes', 'maxBytes', 'minAgeDays', 'maxAgeDays'] as const;
const initialPattern: Pattern = {text: ''};
const initialWeight: Weight = {criterion: 'video', points: 0};
const emptyRule: QualityRule = {patterns: [initialPattern], weights: [initialWeight]};
const scopes = ['any', 'before', 'after'] as const;

type ErrorFormat = (path: string) => string | undefined;

export default function QualityRuleDialog({
  initial,
  close,
  save,
}: {
  initial?: QualityRule;
  close: () => void;
  save: (value: QualityRule) => void;
}) {
  const [draft, setDraft] = useState<QualityRule>(initial ?? emptyRule);
  const [error, setError] = useState<QualityValidationError>();
  const form = useRef<HTMLFormElement>(null);
  const title = message(initial ? 'quality_edit_rule' : 'quality_new_rule');

  function patch(change: Partial<QualityRule>) {
    setDraft({...draft, ...change});
    setError(undefined);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    event.stopPropagation();
    try {
      save(validateQualityRule(draft));
      close();
    } catch (error) {
      if (!(error instanceof QualityValidationError)) throw error;
      setError(error);
      requestAnimationFrame(() => {
        const target = [...(form.current?.querySelectorAll<HTMLElement>('[name]') ?? [])].find(
          (item) => item.getAttribute('name') === error.path,
        );
        (target ?? form.current?.querySelector<HTMLElement>('[role=alert]'))?.focus();
      });
    }
  }

  const errorFor: ErrorFormat = (name) =>
    error?.path === name ? message(`quality_error_${error.reason}`) : undefined;
  return (
    <Dialog className="quality-dialog" aria-label={title} onClose={close}>
      <h2>{title}</h2>
      <form ref={form} onSubmit={submit} noValidate>
        <Field label={message('title')} error={errorFor('rule.title')}>
          {(props) => (
            <input
              {...props}
              name="rule.title"
              value={draft.title ?? ''}
              className="ts-control"
              autoFocus
              onChange={(event) => patch({title: event.currentTarget.value})}
            />
          )}
        </Field>
        <fieldset>
          <legend>{message('quality_patterns')}</legend>
          {draft.patterns.map((pattern, i) => (
            <div className="quality-rule-part" key={i}>
              <PatternFields
                name={`rule.patterns[${i}]`}
                pattern={pattern}
                error={errorFor}
                change={(value) => patch({patterns: replace(draft.patterns, i, value)})}
              />
              <div className="quality-actions">
                <IconButton
                  label={message('explorer_move_earlier')}
                  icon="up"
                  variant="quiet"
                  disabled={i === 0}
                  onClick={() => patch({patterns: shift(draft.patterns, i, -1)})}
                />
                <IconButton
                  label={message('explorer_move_later')}
                  icon="down"
                  variant="quiet"
                  disabled={i === draft.patterns.length - 1}
                  onClick={() => patch({patterns: shift(draft.patterns, i, 1)})}
                />
                <Button
                  variant="quiet"
                  disabled={draft.patterns.length === 1}
                  onClick={() => patch({patterns: remove(draft.patterns, i)})}
                >
                  {message('delete')}
                </Button>
              </div>
            </div>
          ))}
          <Button onClick={() => patch({patterns: [...draft.patterns, {...initialPattern}]})}>
            {message('quality_add_pattern')}
          </Button>
          <Button variant="quiet" onClick={() => patch({patterns: [{text: '^', regex: true}]})}>
            {message('quality_unconditional')}
          </Button>
        </fieldset>
        <fieldset>
          <legend>{message('quality_weights')}</legend>
          {draft.weights.map((weight, i) => (
            <div className="quality-rule-part" key={i}>
              <WeightFields
                name={`rule.weights[${i}]`}
                weight={weight}
                error={errorFor}
                change={(value) => patch({weights: replace(draft.weights, i, value)})}
              />
              <Button
                variant="quiet"
                disabled={draft.weights.length === 1}
                onClick={() => patch({weights: remove(draft.weights, i)})}
              >
                {message('delete')}
              </Button>
            </div>
          ))}
          <Button onClick={() => patch({weights: [...draft.weights, {...initialWeight}]})}>
            {message('quality_add_weight')}
          </Button>
        </fieldset>
        <fieldset>
          <legend>{message('quality_bounds')}</legend>
          <div className="quality-form-grid">
            {boundFields.map((key) => (
              <Field key={key} label={message(`quality_${key}`)} error={errorFor(`rule.${key}`)}>
                {(props) => (
                  <input
                    {...props}
                    className="ts-control"
                    type="number"
                    min={0}
                    name={`rule.${key}`}
                    value={Number.isNaN(draft[key]) ? '' : (draft[key] ?? '')}
                    onChange={(event) =>
                      patch({
                        [key]:
                          event.currentTarget.value === ''
                            ? event.currentTarget.validity.badInput
                              ? NaN
                              : undefined
                            : event.currentTarget.valueAsNumber,
                      })
                    }
                  />
                )}
              </Field>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>{message('quality_conditions')}</legend>
          {(draft.conditions ?? []).map((condition, i) => {
            const values = draft.conditions ?? [];
            const name = `rule.conditions[${i}]`;
            const change = (value: Condition) => patch({conditions: replace(values, i, value)});
            return (
              <div className="quality-rule-part" key={i}>
                <Field label={message('quality_scope')}>
                  {(props) => (
                    <select
                      {...props}
                      className="ts-control"
                      value={condition.scope}
                      onChange={(event) =>
                        change({
                          ...condition,
                          scope: event.currentTarget.value as Condition['scope'],
                        })
                      }
                    >
                      {scopes.map((scope) => (
                        <option key={scope} value={scope}>
                          {message(`quality_${scope}`)}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
                <PatternFields
                  name={name}
                  pattern={condition}
                  error={errorFor}
                  change={(value) => change({...condition, ...value})}
                />
                <WeightFields
                  name={name}
                  weight={condition}
                  error={errorFor}
                  change={(value) => change({...condition, ...value})}
                />
                <Button variant="quiet" onClick={() => patch({conditions: remove(values, i)})}>
                  {message('delete')}
                </Button>
              </div>
            );
          })}
          <Button
            onClick={() =>
              patch({
                conditions: [
                  ...(draft.conditions ?? []),
                  {...initialPattern, ...initialWeight, scope: 'any'},
                ],
              })
            }
          >
            {message('quality_add_condition')}
          </Button>
        </fieldset>
        {error && (
          <p role="alert" tabIndex={-1}>
            {message(`quality_error_${error.reason}`)}
          </p>
        )}
        <div className="dialog__button_box">
          <Button variant="quiet" onClick={close}>
            {message('cancel')}
          </Button>
          <Button variant="primary" type="submit">
            {message('quality_apply_draft')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function PatternFields({
  name,
  pattern,
  change,
  error,
}: {
  name: string;
  pattern: Pattern;
  change: (value: Pattern) => void;
  error: ErrorFormat;
}) {
  return (
    <>
      <Field label={message('quality_pattern')} error={error(`${name}.text`)}>
        {(props) => (
          <input
            {...props}
            name={`${name}.text`}
            className="ts-control"
            value={pattern.text}
            onChange={(event) => change({...pattern, text: event.currentTarget.value})}
          />
        )}
      </Field>
      <div className="quality-actions">
        <label>
          <input
            type="checkbox"
            checked={Boolean(pattern.regex)}
            onChange={(event) => change({...pattern, regex: event.currentTarget.checked})}
          />{' '}
          {message('quality_regex')}
        </label>
        <label>
          <input
            type="checkbox"
            checked={Boolean(pattern.sensitive)}
            onChange={(event) => change({...pattern, sensitive: event.currentTarget.checked})}
          />{' '}
          {message('quality_sensitive')}
        </label>
      </div>
    </>
  );
}

function WeightFields({
  name,
  weight,
  change,
  error,
}: {
  name: string;
  weight: Weight;
  change: (value: Weight) => void;
  error: ErrorFormat;
}) {
  return (
    <div className="quality-form-grid">
      <Field label={message('quality_criterion')} error={error(`${name}.criterion`)}>
        {(props) => (
          <select
            {...props}
            name={`${name}.criterion`}
            className="ts-control"
            value={weight.criterion}
            onChange={(event) => {
              const criterion = event.currentTarget.value as Weight['criterion'];
              change({
                ...weight,
                criterion,
                categoryId: criterion === 'category' ? (weight.categoryId ?? 0) : weight.categoryId,
              });
            }}
          >
            {criteria.map((criterion) => (
              <option key={criterion} value={criterion}>
                {criterionLabel(criterion)}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field label={message('quality_category')} error={error(`${name}.categoryId`)}>
        {(props) => (
          <select
            {...props}
            name={`${name}.categoryId`}
            className="ts-control"
            value={weight.categoryId ?? ''}
            onChange={(event) =>
              change({
                ...weight,
                categoryId:
                  event.currentTarget.value === '' ? undefined : Number(event.currentTarget.value),
              })
            }
          >
            {weight.criterion !== 'category' && <option value="">{message('categoryAll')}</option>}
            {qualityCategoryIds.map((id) => (
              <option key={id} value={id}>
                {qualityCategory(id)}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field label={message('quality_points')} error={error(`${name}.points`)}>
        {(props) => (
          <input
            {...props}
            name={`${name}.points`}
            className="ts-control"
            type="number"
            step="any"
            value={Number.isNaN(weight.points) ? '' : weight.points}
            onChange={(event) => change({...weight, points: event.currentTarget.valueAsNumber})}
          />
        )}
      </Field>
    </div>
  );
}
function replace<T>(values: T[], index: number, next: T) {
  return values.map((item, i) => (i === index ? next : item));
}
function remove<T>(values: T[], index: number) {
  return values.filter((_, i) => i !== index);
}
function shift<T>(values: T[], index: number, direction: -1 | 1) {
  const next = [...values];
  [next[index], next[index + direction]] = [next[index + direction], next[index]];
  return next;
}
