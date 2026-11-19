import {useEffect, useId, useRef, useState} from 'react';

import {filesize} from 'filesize';

import {isNumber, isString} from '../tools/assertType';
import {compilePipeline} from '../tools/trackerPipeline';

import MethodDialog from './MethodDialog';
import PipelineChain from './PipelineChain';
import BuilderHelp from './TrackerFieldHelp';
import type {
  PipelineStep,
  Selector,
  SelectorId,
  SelectorLocation,
  SelectorPreview,
} from './selectorTypes';
import Button from './ui/Button';
import IconButton from './ui/IconButton';

interface SelectorFieldProps {
  id: SelectorId;
  title: string;
  optional?: boolean;
  pipeline?: boolean;
  previewType?: 'size' | 'date';
  value: Selector | undefined;
  defaultValue?: Selector;
  onChange: (value: Selector | undefined) => void;
  location: SelectorLocation;
  preview: SelectorPreview;
}

const noSteps: PipelineStep[] = [];
const examples: Record<SelectorId, string> = {
  row: 'tbody > tr',
  title: 'a.title',
  url: 'a[href]',
  size: 'td.size',
  downloadUrl: 'a.download',
  seeds: 'td.seeds',
  peers: 'td.peers',
  date: 'time',
  nextPageUrl: 'a[rel=next]',
  categoryTitle: '.category',
  categoryUrl: 'a.category',
  loginForm: 'form#login',
};
const message = (key: string) => chrome.i18n.getMessage(key);

export default function SelectorField({
  id,
  title,
  optional,
  pipeline,
  previewType,
  value,
  defaultValue,
  onChange,
  location,
  preview,
}: SelectorFieldProps) {
  const saved = useRef<Selector>(undefined);
  const input = useRef<HTMLInputElement>(null);
  const uid = useId();
  const [dialog, setDialog] = useState(false);
  const [formatted, setFormatted] = useState(false);
  const [inputError, setInputError] = useState<string>();
  const [outputError, setOutputError] = useState<string>();
  const [output, setOutput] = useState('');
  const enabled = value !== undefined;
  const steps = value?.pipeline ?? noSteps;
  const path = value?.selector ?? '';
  const selected = preview.selection?.id === id;
  const active = preview.active === id;
  const {containerSelector, skipFromStart, skipFromEnd} = location;
  const {resolve} = preview;

  useEffect(() => {
    if (!active || !enabled || selected) return;
    const location = {containerSelector, skipFromStart, skipFromEnd};
    const clear = (error?: string) => {
      setInputError(error);
      setOutput('');
      setOutputError(undefined);
    };
    if (!path) {
      clear();
      return;
    }
    let node: Element | null;
    try {
      node = resolve(path, location);
    } catch {
      clear(message('maker_selector_error'));
      return;
    }
    if (!node) {
      clear(message('maker_selector_empty'));
      return;
    }
    clear();
    if (!pipeline) return;
    let current = true;
    void (async () => {
      try {
        const run = await compilePipeline(steps);
        let result = run(node);
        if (['size', 'seeds', 'peers', 'date'].includes(id)) isNumber(result);
        else isString(result);
        if (formatted && previewType === 'date')
          result = new Date(Number(result) * 1000).toString();
        if (formatted && previewType === 'size') result = filesize(Number(result));
        if (current) setOutput(String(result));
      } catch (error) {
        if (current)
          setOutputError(error instanceof Error ? error.message : message('maker_argument_error'));
      }
    })();
    return () => {
      current = false;
    };
  }, [
    active,
    enabled,
    path,
    steps,
    pipeline,
    id,
    selected,
    formatted,
    previewType,
    resolve,
    containerSelector,
    skipFromStart,
    skipFromEnd,
  ]);

  return (
    <div className="field maker-selector">
      <div className="maker-selector-title ts-field-heading">
        {optional ? (
          <label>
            <input
              checked={enabled}
              type="checkbox"
              data-id={`${id}-optional`}
              onChange={(event) => {
                if (event.currentTarget.checked)
                  onChange(saved.current ?? defaultValue ?? {selector: ''});
                else {
                  saved.current = value;
                  onChange(undefined);
                  if (selected) preview.select(null);
                }
              }}
            />
            {title}
          </label>
        ) : (
          <label htmlFor={uid}>{title}</label>
        )}
        <BuilderHelp
          label={title}
          literal
          help={'maker_help_selector_' + id}
          example={examples[id]}
        />
      </div>
      <div className="maker-selector-controls">
        <input
          ref={input}
          disabled={!enabled}
          readOnly={selected}
          type="text"
          value={path}
          id={uid}
          aria-label={optional ? title : undefined}
          placeholder={examples[id]}
          data-id={id}
          aria-invalid={(enabled && Boolean(inputError)) || undefined}
          aria-describedby={enabled && inputError ? `${uid}-error` : undefined}
          className="ts-control selector-input"
          onKeyUp={() => preview.activate(id)}
          onChange={(event) => {
            preview.activate(id);
            onChange({...value, selector: event.currentTarget.value});
          }}
        />
        <Button
          disabled={!enabled || !preview.available}
          data-id={`${id}-btn`}
          aria-pressed={selected}
          onClick={() => {
            preview.activate(id);
            if (selected) {
              preview.select(null);
              input.current?.focus();
              return;
            }
            preview.select({id, location, finish: () => input.current?.focus()});
          }}
        >
          {message('kitSelect')}
        </Button>
        <IconButton
          icon="target"
          variant="quiet"
          aria-pressed={preview.highlighted === id}
          label={chrome.i18n.getMessage('maker_highlight_field', [title])}
          disabled={!enabled || !path || !preview.available}
          onClick={() => preview.toggleHighlight(id, path, location)}
        />
        {pipeline && (
          <IconButton
            icon="transform"
            className="maker-transform"
            disabled={!enabled}
            aria-haspopup="dialog"
            label={chrome.i18n.getMessage('maker_transformations_field', [title])}
            onClick={() => setDialog(true)}
          />
        )}
      </div>
      {enabled && inputError && (
        <small id={`${uid}-error`} className="maker-error">
          {inputError}
        </small>
      )}
      {pipeline && (
        <>
          {enabled && <PipelineChain steps={steps} />}
          <div className="maker-selector-controls">
            <input
              disabled={!enabled}
              type="text"
              aria-label={message('settings_preview')}
              data-id={`${id}-result`}
              value={enabled ? output : ''}
              className="ts-control selector-output"
              readOnly
            />
            {previewType && (
              <Button
                variant="quiet"
                disabled={!enabled}
                aria-pressed={formatted}
                onClick={() => {
                  preview.activate(id);
                  setFormatted(!formatted);
                }}
              >
                {message('kitPreview')}
              </Button>
            )}
          </div>
          {enabled && outputError && (
            <small className="maker-error" role="status">
              {outputError}
            </small>
          )}
        </>
      )}
      {dialog && (
        <MethodDialog
          fieldTitle={title}
          steps={steps}
          onClose={() => setDialog(false)}
          onSubmit={(pipeline) => {
            if (!value) return;
            preview.activate(id);
            onChange({...value, pipeline});
          }}
        />
      )}
    </div>
  );
}
