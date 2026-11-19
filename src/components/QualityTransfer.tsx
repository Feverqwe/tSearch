import {useRef, useState} from 'react';

import {
  planQualityImport,
  qualityJsonLimit,
  QualityValidationError,
  type QualityConfig,
} from '../tools/qualityConfig';
import schema from '../tools/quality-weights.schema.json';
import downloadBlob from '../tools/downloadBlob';
import Dialog from './Dialog';
import Button from './ui/Button';
import Field from './ui/Field';
import {message} from './qualityLabels';

export default function QualityTransfer({
  config,
  close,
  apply,
}: {
  config: QualityConfig;
  close: () => void;
  apply: (config: QualityConfig) => void;
}) {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const [plan, setPlan] = useState<ReturnType<typeof planQualityImport>>();
  const [error, setError] = useState<string>();
  const [hint, setHint] = useState<string>();
  const [loading, setLoading] = useState(false);
  const revision = useRef(0);
  const exported = JSON.stringify(config, null, 2);
  const title = message('quality_transfer');

  function clear() {
    revision.current++;
    setError(undefined);
    setPlan(undefined);
    setLoading(false);
  }

  function check() {
    try {
      setPlan(planQualityImport(config, text, mode));
      setError(undefined);
    } catch (error) {
      setPlan(undefined);
      setError(
        error instanceof QualityValidationError
          ? `${error.path}: ${message(`quality_error_${error.reason}`)}`
          : message('quality_error_syntax'),
      );
    }
  }

  function download(text: string, name: string) {
    downloadBlob(new Blob([text], {type: 'application/json'}), name);
  }

  return (
    <Dialog className="quality-dialog quality-transfer" aria-label={title} onClose={close}>
      <h2>{title}</h2>
      <p>{message('quality_transfer_help')}</p>
      <Field label={message('quality_import_json')} error={error}>
        {(props) => (
          <textarea
            {...props}
            className="ts-control"
            rows={9}
            placeholder={'{ "version": 1, "rules": […] }'}
            spellCheck={false}
            autoFocus
            value={text}
            onChange={(event) => {
              clear();
              setText(event.currentTarget.value);
            }}
          />
        )}
      </Field>
      <Field label={message('quality_upload')}>
        {(props) => (
          <input
            {...props}
            type="file"
            accept=".json,application/json"
            onChange={async (event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = '';
              if (!file) return;
              clear();
              const current = revision.current;
              if (file.size > qualityJsonLimit) {
                setError(message('quality_error_length'));
                return;
              }
              setLoading(true);
              try {
                const next = await file.text();
                if (revision.current === current) setText(next);
              } catch {
                if (revision.current === current) setError(message('quality_error_syntax'));
              } finally {
                if (revision.current === current) setLoading(false);
              }
            }}
          />
        )}
      </Field>
      <Field label={message('quality_mode')}>
        {(props) => (
          <select
            {...props}
            className="ts-control"
            value={mode}
            onChange={(event) => {
              clear();
              setMode(event.currentTarget.value === 'replace' ? 'replace' : 'merge');
            }}
          >
            <option value="merge">{message('quality_merge')}</option>
            <option value="replace">{message('quality_replace')}</option>
          </select>
        )}
      </Field>
      <div className="quality-actions">
        <Button onClick={check} busy={loading} disabled={!text.trim()}>
          {message('quality_check')}
        </Button>
        <Button
          variant="quiet"
          onClick={() => download(JSON.stringify(schema, null, 2), 'quality-weights.schema.json')}
        >
          {message('quality_schema')}
        </Button>
      </div>
      {plan && (
        <p role="status">
          {chrome.i18n.getMessage('quality_import_impact', [
            String(plan.added),
            String(plan.updated),
            String(plan.replaced),
          ])}
        </p>
      )}
      <details>
        <summary>{message('quality_export_draft')}</summary>
        <Field label={message('quality_export_json')}>
          {(props) => (
            <textarea {...props} className="ts-control" rows={5} value={exported} readOnly />
          )}
        </Field>
        <div className="quality-actions">
          <Button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(exported);
                setHint(message('quality_copied'));
              } catch {
                setHint(message('quality_copy_error'));
              }
            }}
          >
            {message('quality_copy')}
          </Button>
          <Button onClick={() => download(exported, 'quality-weights.json')}>
            {message('quality_download')}
          </Button>
        </div>
        {hint && <p role="status">{hint}</p>}
      </details>
      <div className="dialog__button_box">
        <Button variant="quiet" onClick={close}>
          {message('close')}
        </Button>
        <Button
          variant="primary"
          disabled={!plan}
          onClick={() => {
            if (plan) {
              apply(plan.config);
              close();
            }
          }}
        >
          {message('quality_apply_draft')}
        </Button>
      </div>
    </Dialog>
  );
}
