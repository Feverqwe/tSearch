import {type FormEvent, useEffect, useRef, useState} from 'react';

import Dialog from '../components/Dialog';
import BuilderHelp from '../components/TrackerFieldHelp';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import IconButton from '../components/ui/IconButton';
import {type CodeDraft, parseCodeDraft, serializeCodeDraft} from '../data/codeDraft';
import {createBuilderOperation} from '../data/trackerBuilder';
import colorToIcon from '../tools/colorToIcon';
import getRandomColor from '../tools/getRandomColor';
import {prepareTrackerDefinition} from '../tools/trackerDefinition';

import {decodeTrackerIcon, fetchTrackerIcon} from './trackerBuilderIcon';
import {message} from './trackerBuilderLabels';

type Description = CodeDraft['description'];

export function BuilderDescription({
  description,
  onChange,
}: {
  description: Description;
  onChange: (description: Description) => void;
}) {
  const [address, setAddress] = useState<string>();
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState<'file' | 'url'>();
  const file = useRef<HTMLInputElement>(null);
  const fileOpener = useRef<HTMLButtonElement>(null);
  const [operation] = useState(createBuilderOperation);
  const reading = useRef(false);
  const latest = useRef(description);
  useEffect(() => {
    latest.current = description;
  }, [description]);
  useEffect(() => operation.cancel, [operation]);

  function replaceIcon(value: string) {
    operation.cancel();
    reading.current = false;
    setBusy(undefined);
    setError(false);
    onChange({...description, icon: value});
  }

  function closeUrl() {
    operation.cancel();
    reading.current = false;
    setBusy(undefined);
    setAddress(undefined);
    setError(false);
  }

  async function load(type: 'file' | 'url', input: string | File) {
    if (reading.current) return;
    reading.current = true;
    const job = operation.start();
    setBusy(type);
    setError(false);
    try {
      const blob = typeof input === 'string' ? await fetchTrackerIcon(input, job.signal) : input;
      const icon = await decodeTrackerIcon(blob, job.signal);
      if (!job.isCurrent()) return;
      onChange({...latest.current, icon});
      setAddress(undefined);
    } catch {
      if (job.isCurrent()) setError(true);
    } finally {
      if (job.isCurrent()) {
        job.finish();
        reading.current = false;
        setBusy(undefined);
      }
    }
  }

  function field(
    id: 'name' | 'url' | 'description' | 'version',
    label: string,
    placeholder: string,
  ) {
    return (
      <Field
        key={id}
        label={message(label)}
        help={<BuilderHelp label={label} help={'maker_help_desc_' + id} example={placeholder} />}
      >
        {(props) =>
          id === 'description' ? (
            <textarea
              {...props}
              className="ts-control"
              data-id={id}
              value={description[id]}
              placeholder={placeholder}
              onChange={(event) => onChange({...description, [id]: event.currentTarget.value})}
            />
          ) : (
            <input
              {...props}
              className="ts-control"
              data-id={id}
              value={description[id]}
              placeholder={placeholder}
              onChange={(event) => onChange({...description, [id]: event.currentTarget.value})}
            />
          )
        }
      </Field>
    );
  }

  const icon =
    description.icon.startsWith('#') || /^data:image\//i.test(description.icon)
      ? colorToIcon(description.icon)
      : '';
  return (
    <section className="page maker-metadata">
      <h2>{message('kitDesc')}</h2>
      <Field
        label={message('kitIcon')}
        help={<BuilderHelp label="kitIcon" help="maker_help_icon" example="#417bbc" />}
      >
        {(props) => (
          <div className="maker-icon-field">
            <span className="maker-icon-picture">{icon && <img alt="" src={icon} />}</span>
            <input
              {...props}
              className="ts-control"
              data-id="desk_tracker_icon"
              value={description.icon}
              placeholder="#417bbc"
              onChange={(event) => replaceIcon(event.currentTarget.value)}
            />
          </div>
        )}
      </Field>
      <input
        type="file"
        hidden
        ref={file}
        accept=".png,.jpg,.jpeg,.svg,.ico"
        onChange={(event) => {
          const picked = event.currentTarget.files?.[0];
          event.currentTarget.value = '';
          if (picked) void load('file', picked);
        }}
      />
      <div className="maker-actions">
        <Button icon="wand" onClick={() => replaceIcon(getRandomColor())}>
          {message('maker_icon_generate')}
        </Button>
        <Button
          icon="folder"
          ref={fileOpener}
          busy={busy === 'file'}
          onClick={() => file.current?.click()}
        >
          {message('maker_icon_file')}
        </Button>
        <Button
          icon="link"
          aria-haspopup="dialog"
          disabled={busy === 'file'}
          onClick={() => {
            setError(false);
            setAddress('');
          }}
        >
          {message('maker_icon_url')}
        </Button>
      </div>
      {error && address === undefined && (
        <p role="alert" className="maker-error">
          {message('maker_icon_error')}
        </p>
      )}
      {field('name', 'kitTrackerTitle', 'Open Media Lab')}
      {field('url', 'kitTrackerUrl', 'https://tracker.example/')}
      {field('description', 'kitTrackerDesc', message('maker_description_example'))}
      {field('version', 'kitTrackerVersion', '1.0')}
      {address !== undefined && (
        <Dialog
          className="maker-file-dialog"
          aria-label={message('maker_icon_url')}
          onClose={closeUrl}
        >
          <h2>{message('maker_icon_url')}</h2>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void load('url', address);
            }}
          >
            <Field
              label={message('maker_icon_address')}
              error={error ? message('maker_icon_error') : undefined}
            >
              {(props) => (
                <input
                  {...props}
                  className="ts-control"
                  required
                  type="url"
                  autoFocus
                  value={address}
                  placeholder="https://tracker.example/icon.png"
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    closeUrl();
                    setAddress(value);
                  }}
                />
              )}
            </Field>
            <div className="dialog__button_box">
              <Button onClick={closeUrl}>{message('cancel')}</Button>
              <Button busy={busy === 'url'} variant="primary" type="submit">
                {message('maker_icon_load')}
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </section>
  );
}

const publicationExample =
  'https://raw.githubusercontent.com/<github-user>/trackers/main/open-media.json';

export interface BuilderExport {
  text: string;
  name: string;
  stale?: boolean;
}

export function BuilderCode({
  code,
  onEdit,
  onImport,
  canExport,
  exported,
  onExport,
}: {
  code: CodeDraft;
  onEdit: (description: Description) => void;
  onImport: (code: CodeDraft) => void;
  canExport: boolean;
  exported?: BuilderExport;
  onExport: (code: BuilderExport) => void;
}) {
  const [help, setHelp] = useState(false);
  const [importText, setImportText] = useState<string>();
  const [invalid, setInvalid] = useState(false);
  const [notice, setNotice] = useState<{text: string; key: string}>();
  const serial = serializeCodeDraft(code);
  const ready = canExport && !exported?.stale && exported?.text === serial;

  function generate() {
    try {
      prepareTrackerDefinition(serial);
      const filename = code.description.name
        .trim()
        .replace(/[^\p{L}\p{N}._-]+/gu, '-')
        .replace(/^[.-]+|[.-]+$/g, '')
        .slice(0, 100);
      onExport({text: serial, name: (filename || 'tracker') + '.json'});
      setNotice(undefined);
    } catch {
      setNotice({text: serial, key: 'maker_export_error'});
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (importText === undefined) return;
    try {
      const draft = parseCodeDraft(importText);
      prepareTrackerDefinition(serializeCodeDraft(draft));
      onImport(draft);
      setNotice(undefined);
      setImportText(undefined);
    } catch {
      setInvalid(true);
    }
  }

  async function copy() {
    if (!ready) return;
    try {
      await navigator.clipboard.writeText(exported.text);
      setNotice({text: exported.text, key: 'maker_copied'});
    } catch {
      setNotice({text: exported.text, key: 'maker_copy_error'});
    }
  }

  function download() {
    if (!ready) return;
    const url = URL.createObjectURL(new Blob([exported.text], {type: 'application/json'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = exported.name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section className="page save maker-code">
      <h2>{message('maker_code')}</h2>
      <div className="maker-publication">
        <div className="maker-inline-heading">
          <h3>{message('maker_publication')}</h3>
          <IconButton
            label={message('maker_github_help')}
            icon="info"
            variant="quiet"
            aria-haspopup="dialog"
            onClick={() => setHelp(true)}
          />
        </div>
        <Field
          label={message('maker_code_url')}
          help={
            <BuilderHelp
              label="maker_code_url"
              help="maker_help_code_url"
              example={publicationExample}
            />
          }
        >
          {(props) => (
            <input
              {...props}
              className="ts-control"
              data-id="downloadUrl"
              value={code.description.downloadUrl}
              placeholder="https://raw.githubusercontent.com/…/main/open-media.json"
              onChange={(event) =>
                onEdit({...code.description, downloadUrl: event.currentTarget.value})
              }
            />
          )}
        </Field>
      </div>
      <div className="maker-actions">
        <Button type="button" variant="primary" disabled={!canExport} onClick={generate}>
          {message('kitGetCode')}
        </Button>
        <Button
          aria-haspopup="dialog"
          onClick={() => {
            setInvalid(false);
            setImportText('');
          }}
        >
          {message('maker_import')}
        </Button>
      </div>
      {exported && !ready && <p role="status">{message('maker_export_stale')}</p>}
      {!canExport && <p>{message('maker_export_check')}</p>}
      {ready && (
        <>
          <Field
            label={message('maker_code_json')}
            help={<BuilderHelp label="maker_code_json" help="maker_help_export" />}
          >
            {(props) => (
              <textarea
                {...props}
                className="ts-control"
                readOnly
                data-id="save_code_textarea"
                value={exported.text}
              />
            )}
          </Field>
          <div className="maker-actions">
            <Button onClick={() => void copy()}>{message('maker_copy')}</Button>
            <Button onClick={download}>{message('maker_download')}</Button>
          </div>
        </>
      )}
      {notice?.text === serial && <p role="status">{message(notice.key)}</p>}
      {importText !== undefined && (
        <Dialog
          className="maker-file-dialog"
          aria-label={message('maker_import')}
          onClose={() => setImportText(undefined)}
        >
          <h2>{message('maker_import')}</h2>
          <p>{message('maker_import_replace')}</p>
          <form onSubmit={submit}>
            <Field
              label={message('maker_code_json')}
              help={<BuilderHelp label="maker_code_json" help="maker_help_json" />}
              error={invalid ? message('maker_import_error') : undefined}
            >
              {(props) => (
                <textarea
                  {...props}
                  className="ts-control"
                  rows={9}
                  autoFocus
                  value={importText}
                  onChange={(event) => {
                    setInvalid(false);
                    setImportText(event.currentTarget.value);
                  }}
                />
              )}
            </Field>
            <div className="dialog__button_box">
              <Button onClick={() => setImportText(undefined)}>{message('cancel')}</Button>
              <Button type="submit" variant="primary">
                {message('maker_import')}
              </Button>
            </div>
          </form>
        </Dialog>
      )}
      {help && (
        <Dialog
          className="maker-file-dialog"
          aria-label={message('maker_github_help')}
          onClose={() => setHelp(false)}
        >
          <h2>{message('maker_github_help')}</h2>
          <ol>
            <li>{message('maker_github_repo')}</li>
            <li>{message('maker_github_files')}</li>
            <li>
              {message('maker_github_raw')} <code>{publicationExample}</code>
            </li>
            <li>{message('maker_github_update')}</li>
          </ol>
          <div className="dialog__button_box">
            <Button onClick={() => setHelp(false)}>{message('close')}</Button>
          </div>
        </Dialog>
      )}
    </section>
  );
}
