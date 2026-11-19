import {useLayoutEffect, useRef, useState, type FormEvent} from 'react';
import exKitPipelineMethods from '../tools/exKitPipelineMethods';
import {checkPipelineStep} from '../tools/trackerPipeline';
import type {PipelineStep} from './selectorTypes';
import Dialog from './Dialog';
import Button from './ui/Button';
import IconButton from './ui/IconButton';
import Field from './ui/Field';
import PipelineChain from './PipelineChain';
import BuilderHelp from './TrackerFieldHelp';

const names = Object.keys(exKitPipelineMethods);
const argumentExamples: Record<string, string> = {
  Attribute: 'data-size',
  Property: 'href',
  Index: '0',
  PatternText: 'MiB',
  PatternRegex: '^Seeders:\\s*',
  ReplaceTo: 'MB',
  Format: 'DD.MM.YYYY',
  Template: '2d 1h 0m 0s ago',
};
const message = (key: string) => chrome.i18n.getMessage(key);

function newStep(name: string): PipelineStep {
  const args = exKitPipelineMethods[name]?.args?.map((arg) =>
    arg.type === 'select' ? (arg.values?.[0]?.key ?? '') : '',
  );
  return {name, args};
}

export default function MethodDialog({
  fieldTitle,
  steps,
  onSubmit,
  onClose,
}: {
  fieldTitle: string;
  steps: readonly PipelineStep[];
  onSubmit: (steps: PipelineStep[]) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState([...steps]);
  const [error, setError] = useState<{index: number; argument: string}>();
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);
  const form = useRef<HTMLFormElement>(null);
  const title = `${message('maker_transformations')} — ${fieldTitle}`;

  function change(next: PipelineStep[]) {
    setDraft(next);
    setError(undefined);
  }

  function replace(index: number, step: PipelineStep) {
    change(draft.map((previous, i) => (i === index ? step : previous)));
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...draft];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    change(next);
  }

  useLayoutEffect(() => {
    if (!error || pending) return;
    const {index, argument} = error;
    const args = exKitPipelineMethods[draft[index].name]?.args ?? [];
    const position = args.findIndex(({name}) => name === argument);
    form.current
      ?.querySelector<HTMLElement>(
        position < 0 ? `[name="method-${index}"]` : `[name="arg-${index}-${position}"]`,
      )
      ?.focus();
  }, [draft, error, pending]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    try {
      for (const [index, step] of draft.entries()) {
        const argument = await checkPipelineStep(step);
        if (!form.current) return;
        if (argument) {
          setError({index, argument});
          return;
        }
      }
      if (!form.current) return;
      onSubmit(draft);
      onClose();
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <Dialog className="method-dialog" aria-label={title} onClose={onClose}>
      <h2>{title}</h2>
      <div className="maker-inline-heading">
        <PipelineChain steps={draft} />
        <BuilderHelp
          label="maker_method_help"
          help="maker_help_method"
          triggerLabel={message('maker_method_help')}
          example="getText() → trim()"
        />
      </div>
      <form ref={form} onSubmit={(event) => void submit(event)} noValidate>
        {draft.length === 0 && <p>{message('maker_no_transformations')}</p>}
        {draft.map((step, index) => {
          const method = Object.hasOwn(exKitPipelineMethods, step.name)
            ? exKitPipelineMethods[step.name]
            : undefined;
          return (
            <fieldset key={index} className="method-step" disabled={pending}>
              <legend>
                {index + 1}. {step.name}
              </legend>
              <Field
                label={message('maker_method')}
                error={
                  error?.index === index && !method ? message('maker_method_unknown') : undefined
                }
              >
                {(props) => (
                  <select
                    {...props}
                    name={`method-${index}`}
                    className="ts-control"
                    value={step.name}
                    onChange={(event) => replace(index, newStep(event.currentTarget.value))}
                  >
                    {!method && <option value={step.name}>{step.name}</option>}
                    {names.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              {method?.args?.map((arg, position) => {
                const controlName = `arg-${index}-${position}`;
                const label = 'maker_argument_label_' + arg.name;
                const helpKey =
                  arg.name === 'Pattern'
                    ? step.name === 'replaceRe'
                      ? 'PatternRegex'
                      : 'PatternText'
                    : arg.name;
                const removeMatch = arg.name === 'ReplaceTo' && step.name === 'replaceRe';
                const example = removeMatch ? '""' : argumentExamples[helpKey];
                const invalid = error?.index === index && error.argument === arg.name;
                const errorKey =
                  helpKey === 'PatternRegex'
                    ? 'maker_argument_invalid_regex'
                    : 'maker_argument_invalid_' + arg.type;
                const value = step.args?.[position] ?? '';
                const update = (value: string) => {
                  const args = [...(step.args ?? [])];
                  args[position] = value;
                  replace(index, {...step, args});
                };
                return (
                  <Field
                    key={arg.name}
                    label={message(label)}
                    help={
                      <BuilderHelp
                        label={label}
                        help={'maker_help_argument_' + helpKey}
                        example={example}
                      />
                    }
                    error={invalid ? message(errorKey) : undefined}
                  >
                    {(props) =>
                      arg.type === 'select' ? (
                        <select
                          {...props}
                          className="ts-control"
                          name={controlName}
                          value={value}
                          onChange={(event) => update(event.currentTarget.value)}
                        >
                          {arg.values?.map(({key, text}) => (
                            <option key={key} value={key}>
                              {text}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          {...props}
                          className="ts-control"
                          name={controlName}
                          value={value}
                          type={arg.type === 'number' ? 'number' : 'text'}
                          placeholder={removeMatch ? undefined : example}
                          onChange={(event) => update(event.currentTarget.value)}
                        />
                      )
                    }
                  </Field>
                );
              })}
              <div className="method-step-actions">
                <IconButton
                  label={message('explorer_move_earlier')}
                  icon="up"
                  variant="quiet"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                />
                <IconButton
                  label={message('explorer_move_later')}
                  icon="down"
                  variant="quiet"
                  disabled={index === draft.length - 1}
                  onClick={() => move(index, 1)}
                />
                <Button variant="quiet" onClick={() => change(draft.filter((_, i) => i !== index))}>
                  {message('delete')}
                </Button>
              </div>
            </fieldset>
          );
        })}
        <div className="method-step-actions">
          <Button disabled={pending} onClick={() => change([...draft, newStep(names[0])])}>
            {message('add')}
          </Button>
        </div>
        <div className="dialog__button_box">
          <Button variant="quiet" onClick={onClose}>
            {message('cancel')}
          </Button>
          <Button variant="primary" busy={pending} type="submit">
            {message('save')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
