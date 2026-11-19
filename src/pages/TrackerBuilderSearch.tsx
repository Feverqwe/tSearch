import type {FormEvent, ReactNode} from 'react';

import BuilderHelp from '../components/TrackerFieldHelp';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import type {CodeDraft} from '../data/codeDraft';
import type {TrackerRequestMode} from '../tools/tabProxy';
import {RouteLink} from '../ui/navigation';

import {message} from './trackerBuilderLabels';

export default function SearchSettings({
  search,
  source,
  evidence,
  setSource,
  setEvidence,
  requestMode,
  onRequestModeChange,
  onChange,
  onOpen,
  busy,
  status,
  addressInvalid,
  hasDocument,
}: {
  search: CodeDraft['search'];
  source: string;
  evidence: string;
  setSource: (value: string) => void;
  setEvidence: (value: string) => void;
  requestMode?: TrackerRequestMode;
  onRequestModeChange: (requestMode: TrackerRequestMode) => void;
  onChange: (search: CodeDraft['search']) => void;
  onOpen: (action: 'auto' | 'manual') => void;
  busy: 'auto' | 'manual' | undefined;
  status: ReactNode;
  addressInvalid: boolean;
  hasDocument: boolean;
}) {
  function open(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!busy) onOpen('auto');
  }

  const sourceExample = 'https://tracker.example/search?q=linux';

  function field(id: keyof CodeDraft['search'], label: string, placeholder: string) {
    return (
      <TextField
        id={id === 'url' ? 'template' : id}
        label={label}
        value={search[id]}
        placeholder={placeholder}
        help={'maker_help_search_' + id}
        onChange={(value) => onChange({...search, [id]: value})}
      />
    );
  }

  return (
    <form className="page maker-request" onSubmit={open}>
      <div className="maker-source-fields">
        <Field
          label={message('maker_source_address')}
          error={addressInvalid ? message('maker_source_invalid') : undefined}
          help={
            <BuilderHelp
              label="maker_source_address"
              help="maker_help_address"
              example={sourceExample + ' →\nhttps://tracker.example/search?q=%search%'}
            />
          }
        >
          {(props) => (
            <input
              {...props}
              className="ts-control"
              data-id="url"
              type="text"
              value={source}
              placeholder={sourceExample}
              onChange={(event) => setSource(event.currentTarget.value)}
            />
          )}
        </Field>
        <Field
          label={message('maker_source_phrase')}
          help={
            <BuilderHelp label="maker_source_phrase" help="maker_help_phrase" example="Linux" />
          }
        >
          {(props) => (
            <input
              {...props}
              className="ts-control"
              name="search-query"
              value={evidence}
              placeholder="Linux"
              onChange={(event) => setEvidence(event.currentTarget.value)}
            />
          )}
        </Field>
      </div>
      <details>
        <summary>{message('maker_request_options')}</summary>
        <div className="maker-options">
          {field('url', 'kitSearchUrl', 'https://tracker.example/search?q=%search%')}
          <Field
            label={message('kitSearchMethod')}
            help={
              <BuilderHelp
                label="kitSearchMethod"
                help="maker_help_search_method"
                example="GET /search?q=%search%"
              />
            }
          >
            {(props) => (
              <select
                {...props}
                className="ts-control"
                value={search.method}
                onChange={(event) =>
                  onChange({
                    ...search,
                    method: event.currentTarget.value === 'POST' ? 'POST' : 'GET',
                  })
                }
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            )}
          </Field>
          <Field
            label={message('kitSearchQueryEncoding')}
            help={
              <BuilderHelp
                label="kitSearchQueryEncoding"
                help="maker_help_search_encoding"
                example="UTF-8"
              />
            }
          >
            {(props) => (
              <select
                {...props}
                className="ts-control"
                value={search.encoding}
                onChange={(event) => onChange({...search, encoding: event.currentTarget.value})}
              >
                <option value="">UTF-8</option>
                <option value="cp1251">cp1251</option>
              </select>
            )}
          </Field>
          {field('charset', 'kitPageCharset', 'utf-8')}
          {(search.method === 'POST' || search.body) && field('body', 'kitPostBody', 'q=%search%')}
          {field('query', 'kitQuery', 'q=%search%&sort=recent')}
          {field('baseUrl', 'maker_legacy_base_url', 'https://tracker.example/')}
          {field('originUrl', 'maker_origin', 'https://tracker.example/')}
          {field('headers', 'maker_headers', '{"Accept": "text/html"}')}
          <div className="ts-field-heading">
            <label>
              <input
                type="checkbox"
                checked={requestMode === 'tab'}
                onChange={(event) =>
                  onRequestModeChange(event.currentTarget.checked ? 'tab' : 'direct')
                }
              />{' '}
              {message('maker_request_tab')}
            </label>
            <BuilderHelp label="maker_request_tab" help="maker_help_search_tab" />
          </div>
        </div>
      </details>
      <div className="maker-actions">
        <Button type="submit" variant="primary" busy={busy === 'auto'} disabled={busy === 'manual'}>
          {message('maker_open_detect')}
        </Button>
        <Button
          busy={busy === 'manual'}
          disabled={busy === 'auto'}
          onClick={() => onOpen('manual')}
        >
          {message('maker_open_manual')}
        </Button>
        {hasDocument && (
          <RouteLink className="ts-button ts-button--quiet" to="/codeMaker/selectors">
            {message('maker_fields')}
          </RouteLink>
        )}
      </div>
      {status}
    </form>
  );
}
export function TextField({
  id,
  label,
  value,
  placeholder,
  help,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  help?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field
      label={message(label)}
      help={help && <BuilderHelp label={label} help={help} example={placeholder} />}
    >
      {(props) => (
        <input
          {...props}
          type="text"
          className="ts-control"
          data-id={id}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      )}
    </Field>
  );
}
