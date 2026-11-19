import {type Ref, useState} from 'react';

import {filesize} from 'filesize';

import BuilderHelp from '../components/TrackerFieldHelp';
import type {SelectorId} from '../components/selectorTypes';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import IconButton from '../components/ui/IconButton';
import type {CodeDraft} from '../data/codeDraft';
import type {TrackerDetectionReport} from '../data/trackerBuilder';
import type {ExtractionIssue} from '../sandbox/exKitTracker';

import {type CheckResult, blocksExport, isRequired} from './trackerBuilderCheck';
import {message, selectorLabels} from './trackerBuilderLabels';

type DetectedField = Exclude<SelectorId, 'loginForm'>;
type SettingsSection = 'search' | 'auth' | 'desc';
type CheckAction = 'check' | 'next';
type Result = CheckResult['results'][number];
const primary = ['title', 'url', 'size', 'seeds'] as const;
const extra = ['categoryTitle', 'categoryUrl', 'downloadUrl', 'peers', 'date'] as const;

export default function TrackerBuilderResult({
  headingRef,
  code,
  report,
  check,
  stale,
  canExport,
  otherPageFailed,
  phrase,
  setPhrase,
  busy,
  status,
  onCheck,
  onBack,
  onCode,
  onFix,
  onConfigure,
  onHighlight,
  highlighted,
  pageNumber,
}: {
  headingRef?: Ref<HTMLHeadingElement>;
  code: CodeDraft;
  report?: TrackerDetectionReport;
  check?: CheckResult;
  stale: boolean;
  canExport: boolean;
  otherPageFailed?: boolean;
  phrase: string;
  setPhrase: (phrase: string) => void;
  busy?: CheckAction;
  status?: React.ReactNode;
  onCheck: (action: CheckAction) => void;
  onBack: () => void;
  onCode: () => void;
  onFix: (id: SelectorId) => void;
  onConfigure?: (section: SettingsSection) => void;
  onHighlight?: (field: DetectedField) => void;
  highlighted?: SelectorId;
  pageNumber: number;
}) {
  const [all, setAll] = useState(false);
  const columns = all ? [...primary, ...extra] : primary;
  const optionalIssues = check?.issues.filter((issue) => !blocksExport(issue)) ?? [];
  return (
    <div className="maker-result">
      <div className="maker-result-overview">
        <h2 ref={headingRef} tabIndex={-1}>
          {message('maker_result')}
        </h2>
        <form
          className="maker-check-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!busy) onCheck('check');
          }}
        >
          <Field
            label={message('maker_check_phrase')}
            help={
              <BuilderHelp
                label="maker_check_phrase"
                help="maker_help_check_phrase"
                example="Linux → FreeBSD"
              />
            }
          >
            {(props) => (
              <input
                {...props}
                className="ts-control"
                value={phrase}
                placeholder="Linux"
                onChange={(event) => setPhrase(event.currentTarget.value)}
              />
            )}
          </Field>
          <Button
            type="submit"
            variant="primary"
            busy={busy === 'check'}
            disabled={busy === 'next'}
          >
            {message('maker_check_run')}
          </Button>
        </form>
        {status}
        {stale && <p role="status">{message('maker_check_stale')}</p>}
        {check && !stale && !check.requestVerified && (
          <p role="status" className="maker-check-notice">
            {message('maker_check_request_unverified')}
          </p>
        )}
        {otherPageFailed && !stale && check?.passed && (
          <p role="status" className="maker-check-notice">
            {message('maker_check_other_page')}
          </p>
        )}
        {check && (
          <>
            <div className="maker-result-summary">
              <strong>{message('maker_result_count', [String(check.results.length)])}</strong>
              {check.results.length > 0 && (
                <Button variant="quiet" aria-expanded={all} onClick={() => setAll(!all)}>
                  {message(all ? 'maker_main_fields' : 'maker_all_fields')}
                </Button>
              )}
            </div>
            <IssueGroup issues={check.issues.filter(blocksExport)} onFix={onFix} />
          </>
        )}
      </div>
      {(report || optionalIssues.length > 0) && (
        <div className="maker-result-aside">
          {report && (
            <ModelReport
              report={report}
              code={code}
              onFix={onFix}
              onConfigure={onConfigure}
              onHighlight={onHighlight}
              highlighted={highlighted}
            />
          )}
          <IssueGroup issues={optionalIssues} onFix={onFix} optional />
        </div>
      )}
      <div className="maker-result-data">
        {check && (
          <>
            {check.results.length > 0 && (
              <div className="maker-table">
                <table>
                  <thead>
                    <tr>
                      {columns.map((id) => (
                        <th scope="col" key={id}>
                          {message(selectorLabels[id])}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {check.results.map((row, index) => (
                      <tr key={index}>
                        {columns.map((id) => (
                          <td key={id}>{resultValue(id, row[id])}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {check.requestVerified && (check.nextPageUrl || pageNumber > 1) && (
              <div className="maker-actions maker-pagination">
                {pageNumber > 1 && (
                  <Button disabled={stale || Boolean(busy)} onClick={onBack}>
                    {message('maker_previous')}
                  </Button>
                )}
                <span>{message('maker_current_page', [String(pageNumber)])}</span>
                {check.nextPageUrl && (
                  <Button
                    busy={busy === 'next'}
                    disabled={stale || busy === 'check'}
                    onClick={() => onCheck('next')}
                  >
                    {message('maker_next')}
                  </Button>
                )}
              </div>
            )}
            {check.emptySource && <p>{message('maker_empty_source')}</p>}
          </>
        )}
        <Button variant="primary" disabled={!canExport || Boolean(busy)} onClick={onCode}>
          {message('maker_continue')}
        </Button>
      </div>
    </div>
  );
}

function resultValue(field: keyof Result, value: Result[keyof Result]) {
  if (value === undefined || (field === 'date' && value === -1)) return '—';
  if (field === 'size' && typeof value === 'number') return filesize(value);
  if (field === 'date' && typeof value === 'number') return new Date(value * 1000).toLocaleString();
  if (
    typeof value === 'string' &&
    /^https?:\/\//i.test(value) &&
    (field === 'url' || field === 'categoryUrl' || field === 'downloadUrl')
  ) {
    return (
      <a href={value} title={value} target="_blank" rel="noreferrer">
        {message('kitOpen')}
      </a>
    );
  }
  return value;
}

function IssueGroup({
  issues,
  onFix,
  optional = false,
}: {
  issues: ExtractionIssue[];
  onFix: (id: SelectorId) => void;
  optional?: boolean;
}) {
  if (!issues.length) return null;
  const byField = new Map<SelectorId, ExtractionIssue[]>();
  for (const issue of issues) {
    if (!byField.has(issue.field)) byField.set(issue.field, []);
    byField.get(issue.field)!.push(issue);
  }
  const fields = [...byField].map(([field, group]) => (
    <div key={field} className="maker-issue">
      <div>
        <strong>{message(selectorLabels[field])}</strong>
        <p>{issueText(group[0])}</p>
        {group.length > 1 && (
          <details>
            <summary>{message('maker_all_issues', [String(group.length)])}</summary>
            <ul>
              {group.map((issue, index) => (
                <li key={index}>{issueText(issue)}</li>
              ))}
            </ul>
          </details>
        )}
      </div>
      <Button onClick={() => onFix(field)}>{message('maker_fix')}</Button>
    </div>
  ));

  return optional ? (
    <details className="maker-optional-issues">
      <summary>
        {message('maker_optional_issues')} <span className="maker-issue-count">{byField.size}</span>
      </summary>
      <div className="maker-optional-issue-list">{fields}</div>
    </details>
  ) : (
    <section className="maker-issues">
      <h3>
        {message(
          issues.some(({blocking}) => blocking) ? 'maker_blocking_issues' : 'maker_required_issues',
        )}
      </h3>
      {fields}
    </section>
  );
}

function issueText(issue: ExtractionIssue) {
  return [
    issue.row && message('maker_issue_row', [String(issue.row)]),
    message('maker_issue_' + issue.reason),
    issue.detail,
  ]
    .filter(Boolean)
    .join(' · ');
}

function ModelReport({
  report: {applied, prediction},
  code,
  onFix,
  onConfigure,
  onHighlight,
  highlighted,
}: {
  report: TrackerDetectionReport;
  code: CodeDraft;
  onFix: (id: SelectorId) => void;
  onConfigure?: (section: SettingsSection) => void;
  onHighlight?: (field: DetectedField) => void;
  highlighted?: SelectorId;
}) {
  const {definition, formats} = prediction;
  const fields = (Object.keys(selectorLabels) as SelectorId[]).filter(
    (field) => field !== 'loginForm',
  );
  const found = fields.filter((field) => Boolean(definition.selectors[field]));
  const missing = fields.filter((field) => !found.includes(field));
  const status = (field: Exclude<SelectorId, 'loginForm'>) =>
    JSON.stringify(applied.selectors[field]) !== JSON.stringify(code.selectors[field])
      ? 'maker_model_manual'
      : found.includes(field)
        ? 'maker_model_found'
        : code.selectors[field]?.selector
          ? 'maker_model_kept'
          : 'maker_auto_not_found';
  const fieldEntry = (field: DetectedField) => (
    <li key={field}>
      <span>
        {message(selectorLabels[field])} · {message(status(field))}
      </span>
      {code.selectors[field]?.selector && onHighlight ? (
        <IconButton
          icon="target"
          variant="quiet"
          label={message('maker_highlight_field', [message(selectorLabels[field])])}
          aria-pressed={highlighted === field}
          onClick={() => onHighlight(field)}
        />
      ) : (
        <Button variant="quiet" onClick={() => onFix(field)}>
          {message('maker_fix')}
        </Button>
      )}
    </li>
  );
  const configure = (section: SettingsSection, label: string) =>
    onConfigure && (
      <Button
        variant="quiet"
        aria-label={message('maker_configure_field', [message(label)])}
        onClick={() => onConfigure(section)}
      >
        {message('maker_configure')}
      </Button>
    );
  const metadata = (value: string, appliedValue: string, detectedValue?: string) => {
    const status =
      value !== appliedValue
        ? 'maker_model_manual'
        : !value
          ? 'maker_auto_not_found'
          : detectedValue !== value
            ? 'maker_model_kept'
            : '';
    return (
      <>
        {value || '—'} {status && <small>· {message(status)}</small>}
      </>
    );
  };
  return (
    <aside className="maker-report" aria-label={message('maker_model_report')}>
      <h3>{message('maker_model_report')}</h3>
      <p role="status">{message('maker_auto_results', [String(prediction.rowCount)])}</p>
      <p>
        {message(
          prediction.searchSource === 'unknown'
            ? 'maker_auto_search_unknown'
            : 'maker_auto_search_found',
        )}
        {prediction.searchSource === 'unknown' && configure('search', 'maker_request_options')}
      </p>
      <ul>{missing.filter(isRequired).map(fieldEntry)}</ul>
      <dl>
        <dt>{message('kitTrackerTitle')}</dt>
        <dd>
          {metadata(code.description.name, applied.description.name, definition.description.name)}
        </dd>
        <dt>{message('kitTrackerDesc')}</dt>
        <dd>
          {metadata(
            code.description.description,
            applied.description.description,
            definition.description.description,
          )}
          {!code.description.description && configure('desc', 'kitTrackerDesc')}
        </dd>
        <dt>{message('kitLoginUrl')}</dt>
        <dd>
          {metadata(code.auth.url, applied.auth.url, definition.auth?.url)}
          {!code.auth.url && configure('auth', 'kitLoginUrl')}
        </dd>
        <dt>{message('kitNextPageLink')}</dt>
        <dd>
          {prediction.nextPageUrl ||
            (prediction.observedNextPageUrl
              ? message('maker_auto_next_incompatible', [prediction.observedNextPageUrl])
              : '—')}
        </dd>
        {Object.entries(formats)
          .filter(([, format]) => format.status !== 'detected')
          .map(([field, format]) => (
            <div key={field}>
              <dt>{message(field === 'size' ? 'kitTorrentSize' : 'kitAddTime')}</dt>
              <dd>
                {message(
                  'maker_auto_format_' +
                    (format.kind.startsWith('invalid-') ? 'invalid' : format.status),
                )}
              </dd>
            </div>
          ))}
      </dl>
      <ul>{missing.filter((field) => !isRequired(field)).map(fieldEntry)}</ul>
      {found.length > 0 && (
        <details>
          <summary>{message('maker_model_found')}</summary>
          <ul>{found.map(fieldEntry)}</ul>
        </details>
      )}
    </aside>
  );
}
