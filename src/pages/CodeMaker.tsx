import {useEffect, useLayoutEffect, useRef, useState} from 'react';

import {requestPreview, useCodeMakerFrame} from '../components/CodeMakerFrame';
import SelectorField from '../components/SelectorField';
import type {
  Selection,
  SelectorId,
  SelectorLocation,
  SelectorPreview,
} from '../components/selectorTypes';
import Button from '../components/ui/Button';
import VerticalSplit from '../components/ui/VerticalSplit';
import {type CodeDraft, createCodeDraft, serializeCodeDraft} from '../data/codeDraft';
import {
  type TrackerDetectionReport,
  applyTrackerInference,
  createBuilderOperation,
  extractionKey,
} from '../data/trackerBuilder';
import type {TrackerRequestOptions, TrackerResponse} from '../tools/exKitRequest';
import getTitle from '../tools/getTitle';
import {RouteNavLink as Link, RouteLink, useRouteNavigate} from '../ui/navigation';
import {profileRoute} from '../ui/profileRoutes';

import ResultSelectors, {resultLocation, setTrackerSection} from './TrackerBuilderFields';
import {BuilderCode, BuilderDescription, type BuilderExport} from './TrackerBuilderFiles';
import TrackerBuilderPreview, {
  PreviewPortal,
  type PreviewPosition,
  usePreviewPosition,
  usePreviewWindow,
} from './TrackerBuilderPreview';
import TrackerBuilderResult from './TrackerBuilderResult';
import SearchSettings, {TextField} from './TrackerBuilderSearch';
import {
  type CheckResult,
  checkTracker,
  isSearchRequest,
  searchRequest,
  trackerConnectRule,
} from './trackerBuilderCheck';
import {detectTrackerIcon} from './trackerBuilderIcon';
import {message, selectorLabels} from './trackerBuilderLabels';

import '../assets/css/magic.less';

const checks = {
  check: 'maker_result',
  selectors: 'maker_fields',
  auth: 'kitLogin',
  desc: 'kitDesc',
};
const splitBottom = 'tsearch.code-maker.split';
const splitRight = 'tsearch.code-maker.split-right';
type Action = 'auto' | 'manual' | 'check' | 'next' | 'login';
interface OperationStatus {
  key: string;
  loginUrl?: string;
}
interface Highlight {
  id: SelectorId;
  path: string;
  location: SelectorLocation;
}
const route = (page: string) => '/codeMaker/' + page;

export default function CodeMaker({page: requestedPage}: {page?: string}) {
  const checking = Boolean(requestedPage && Object.hasOwn(checks, requestedPage));
  const page = checking || requestedPage === 'save' ? requestedPage : 'search';
  const navigate = useRouteNavigate();
  const [code, setCode] = useState(createCodeDraft);
  const initialIcon = useRef(code.description.icon);
  const [source, setSource] = useState('');
  const [evidence, setEvidence] = useState('');
  const [phrase, setPhrase] = useState('');
  const [response, setResponse] = useState<TrackerResponse>();
  const [detection, setDetection] = useState<TrackerDetectionReport>();
  const [history, setHistory] = useState<CheckResult[]>([]);
  const [index, setIndex] = useState(0);
  const [exported, setExported] = useState<BuilderExport>();
  const [active, setActive] = useState<SelectorId | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [highlight, setHighlight] = useState<Highlight>();
  const [highlightStatus, setHighlightStatus] = useState<string>();
  const [path, setPath] = useState('');
  const [busy, setBusy] = useState<Action>();
  const [status, setStatus] = useState<OperationStatus>();
  const root = useRef<HTMLDivElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const focusResult = useRef(false);
  const pendingFocus = useRef<SelectorId>(null);
  const [operation] = useState(createBuilderOperation);
  const inFlight = useRef(false);
  const [opened, setOpened] = useState(false);
  const [position, setPosition] = usePreviewPosition();
  const [narrow, setNarrow] = useState(() => matchMedia('(max-width: 860px)').matches);
  const [windowBlocked, setWindowBlocked] = useState(false);
  const previewButton = useRef<HTMLButtonElement>(null);
  const positionButton = useRef<HTMLButtonElement>(null);
  const popup = usePreviewWindow(collapsePreview);
  const positionShown = position === 'right' && narrow ? 'bottom' : position;
  const host = opened ? positionShown : 'closed';

  const checked = history[index];
  const currentKey = extractionKey(code, phrase);
  const stale = Boolean(checked && checked.key !== currentKey);
  const passed = Boolean(
    checked && !stale && history.every((page) => page.requestVerified && page.passed),
  );
  const otherPageFailed = history.some((page, pageIndex) => pageIndex !== index && !page.passed);
  const splitKey = positionShown === 'right' ? splitRight : splitBottom;

  useEffect(() => {
    document.title = getTitle(message('maker_heading'));
    const media = matchMedia('(max-width: 860px)');
    const update = () => setNarrow(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useLayoutEffect(() => {
    setBusy(undefined);
    setStatus(undefined);
    setSelection(null);
    setHighlight(undefined);
    setActive(null);
    setPath('');
    if (page === 'check' && focusResult.current) {
      focusResult.current = false;
      resultHeading.current?.focus();
    }
    return () => {
      operation.cancel();
      inFlight.current = false;
    };
  }, [requestedPage, page, operation]);

  useLayoutEffect(() => {
    const field = pendingFocus.current;
    const input =
      root.current?.querySelector<HTMLInputElement>(`[data-id="${field}"]:not(:disabled)`) ??
      root.current?.querySelector<HTMLInputElement>(`[data-id="${field}-optional"]`);
    if (field && input) {
      pendingFocus.current = null;
      input.focus();
      setActive(field);
    }
  });

  function cancelOperation() {
    operation.cancel();
    inFlight.current = false;
    setBusy(undefined);
    setStatus(undefined);
  }

  function saveDraft(next: CodeDraft) {
    if (exported && exported.text !== serializeCodeDraft(next)) {
      setExported({...exported, stale: true});
    }
    setCode(next);
  }

  function replaceDraft(next: CodeDraft) {
    if (extractionKey(next, phrase) !== currentKey) {
      cancelOperation();
      setHighlight(undefined);
    }
    saveDraft(next);
  }

  function changeSection<K extends keyof CodeDraft>(key: K, value: CodeDraft[K]) {
    replaceDraft({...code, [key]: value});
  }

  function importDraft(next: CodeDraft) {
    cancelOperation();
    cancelSelection(false);
    collapsePreview();
    setCode(next);
    setSource('');
    setEvidence('');
    setPhrase('');
    setResponse(undefined);
    setHistory([]);
    setIndex(0);
    setDetection(undefined);
    setActive(null);
    pendingFocus.current = null;
    setExported(undefined);
  }

  function setCheckPhrase(value: string) {
    cancelOperation();
    setPhrase(value);
  }

  function cancelSelection(focus = true) {
    if (focus) selection?.finish?.();
    setSelection(null);
    setPath('');
  }

  function collapsePreview() {
    cancelSelection();
    setHighlight(undefined);
    setHighlightStatus(undefined);
    setOpened(false);
    popup.close();
    requestAnimationFrame(() => previewButton.current?.focus());
  }

  function openPreview(desired = position) {
    if (desired === 'window') {
      if (!popup.open()) {
        setWindowBlocked(true);
        setPosition('bottom');
      } else setWindowBlocked(false);
    } else {
      setWindowBlocked(false);
      popup.close();
    }
    setOpened(true);
  }

  function focusField(field: SelectorId) {
    pendingFocus.current = field;
    openPreview();
    navigate(route(field === 'loginForm' ? 'auth' : 'selectors'));
  }

  const frame = useCodeMakerFrame(
    response,
    host,
    selection,
    (value, commit) => {
      if (!selection) return;
      setPath(value);
      if (!commit || !value) return;
      const {id} = selection;
      const selectors = code.selectors;
      if (id === 'loginForm') {
        changeSection('auth', {...code.auth, loginForm: {...code.auth.loginForm, selector: value}});
      } else if (id === 'categoryTitle') {
        changeSection(
          'selectors',
          setTrackerSection(
            selectors,
            {...selectors.categoryTitle, selector: value},
            frame.resolve,
          ),
        );
      } else {
        changeSection('selectors', {...selectors, [id]: {...selectors[id], selector: value}});
      }
      cancelSelection();
    },
    cancelSelection,
  );

  useLayoutEffect(() => {
    if (!highlight || host === 'closed') {
      try {
        frame.highlight('', {}, false);
      } catch {
        /* No document is attached. */
      }
      setHighlightStatus(undefined);
      return;
    }
    try {
      const count = frame.highlight(highlight.path, highlight.location, true) ?? 0;
      setHighlightStatus(
        message('maker_match_count', [message(selectorLabels[highlight.id]), String(count)]) +
          (count ? '' : ' · ' + message('maker_selector_empty')),
      );
    } catch {
      setHighlightStatus(
        message(selectorLabels[highlight.id]) + ' · ' + message('maker_selector_error'),
      );
    }
  }, [frame.highlight, highlight, host]);

  const preview: SelectorPreview = {
    highlighted: highlight?.id,
    available: Boolean(response),
    active,
    selection,
    activate: setActive,
    select: (value) => {
      if (!value) {
        cancelSelection();
        return;
      }
      if (!response) return;
      setHighlight(undefined);
      setSelection(value);
      setPath('');
      openPreview();
    },
    resolve: frame.resolve,
    toggleHighlight: (id, path, location) => {
      if (highlight?.id === id) {
        setHighlight(undefined);
        return;
      }
      cancelSelection(false);
      setActive(id);
      setHighlight({id, path, location});
      openPreview();
    },
  };

  async function run(action: Action) {
    if (inFlight.current) return;
    inFlight.current = true;
    const job = operation.start();
    const snapshot = code;
    const setup = action === 'auto' || action === 'manual';
    const showPreview = action === 'manual' || action === 'login';
    const openWindowNow = showPreview && position === 'window';
    const query = setup ? evidence : phrase;
    setBusy(action);
    if (action === 'check') {
      setHistory([]);
      setIndex(0);
    }
    setStatus({key: 'maker_loading'});
    cancelSelection(false);
    setHighlight(undefined);

    try {
      let options: TrackerRequestOptions;
      const nextUrl = action === 'next' ? checked?.nextPageUrl : undefined;
      if (action === 'next' && (!nextUrl || stale || !checked?.requestVerified)) return;
      const search = setup
        ? {...snapshot.search, url: source.trim() || snapshot.search.url}
        : snapshot.search;
      if (action === 'login') {
        options = {method: 'GET', url: snapshot.auth.url, charset: snapshot.search.charset};
      } else {
        options = searchRequest(search, query, nextUrl ?? undefined);
      }
      if (!isHttpAddress(options.url)) {
        setStatus({key: setup ? 'maker_source_invalid' : 'maker_request_error'});
        return;
      }
      if (openWindowNow) openPreview();
      const connectRe =
        action === 'check' || action === 'next' ? trackerConnectRule(snapshot) : undefined;
      const incoming = await requestPreview(
        options,
        snapshot.description.requestMode,
        job.signal,
        connectRe,
      );
      if (!job.isCurrent()) return;
      if (action !== 'next') setResponse(incoming);

      if (action === 'auto') {
        setStatus({key: 'maker_auto_pending'});
        try {
          const {inferTracker} = await import('../tools/trackerInference');
          if (!job.isCurrent()) return;
          const prediction = await inferTracker(incoming, {
            phrase: query,
            requestUrl: options.url,
            requestBody: options.body ?? undefined,
          });
          if (!job.isCurrent()) return;
          const updated = applyTrackerInference(snapshot, prediction);
          if (prediction.status === 'results') {
            let requestVerified = false;
            try {
              requestVerified = isSearchRequest(updated, query, options);
            } catch {
              // The source response can still be used to inspect extraction.
            }
            const [check, icon] = await Promise.all([
              checkTracker(updated, query, incoming, requestVerified),
              !snapshot.description.icon || snapshot.description.icon === initialIcon.current
                ? detectTrackerIcon(incoming.body, incoming.url, job.signal)
                : undefined,
            ]);
            if (!job.isCurrent()) return;
            if (icon) updated.description = {...updated.description, icon};
            saveDraft(updated);
            setPhrase(query);
            setDetection({prediction, applied: updated});
            setHistory([check]);
            setIndex(0);
            setOpened(false);
            popup.close();
            focusResult.current = true;
            navigate(route('check'));
          } else if (prediction.status === 'login-required') {
            saveDraft(updated);
            setStatus({
              key: 'maker_auto_login_required',
              loginUrl: snapshot.auth.url || prediction.login.url,
            });
          } else {
            setStatus({key: 'maker_auto_' + prediction.status.replaceAll('-', '_')});
          }
        } catch {
          if (job.isCurrent()) setStatus({key: 'maker_auto_error'});
        }
        return;
      }

      if (incoming.statusCode === 401 || (incoming.statusCode === 403 && action === 'login')) {
        setStatus({key: 'maker_auto_login_required', loginUrl: snapshot.auth.url || incoming.url});
        if (action === 'login' && !openWindowNow) openPreview();
        return;
      }
      if (incoming.statusCode >= 400) {
        setStatus({key: 'maker_auto_request_failed'});
        return;
      }
      if (action === 'login') {
        if (!openWindowNow) openPreview();
        setStatus(undefined);
        return;
      }
      if (action === 'manual') {
        if (!snapshot.search.url)
          setCode({...snapshot, search: {...snapshot.search, url: source.trim()}});
        setPhrase(query);
        setStatus(undefined);
        if (!openWindowNow) openPreview();
        navigate(route('selectors'));
        return;
      }
      const check = await checkTracker(snapshot, query, incoming);
      if (!job.isCurrent()) return;
      setHistory(action === 'next' ? [...history.slice(0, index + 1), check] : [check]);
      setIndex(action === 'next' ? index + 1 : 0);
      setResponse(incoming);
      setStatus(undefined);
    } catch (error) {
      if (!job.isCurrent()) return;
      const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
      if (code === 'AUTH_REQUIRED') {
        setStatus({key: 'maker_auto_login_required', loginUrl: snapshot.auth.url});
      } else {
        setStatus({
          key: code === 'ORIGIN_IS_NOT_AVAILABLE' ? 'maker_check_origin' : 'maker_request_error',
        });
      }
    } finally {
      if (job.isCurrent()) {
        job.finish();
        inFlight.current = false;
        setBusy(undefined);
      }
    }
  }

  const statusView = status && (
    <div className="maker-status" role="status">
      <p>{message(status.key)}</p>
      {status.loginUrl && /^https?:\/\//i.test(status.loginUrl) && (
        <a href={status.loginUrl} target="_blank" rel="noreferrer">
          {message('maker_auto_login')}
        </a>
      )}
      {busy && (
        <Button variant="quiet" onClick={cancelOperation}>
          {message('cancel')}
        </Button>
      )}
    </div>
  );

  let content;
  if (page === 'search') {
    content = (
      <SearchSettings
        search={code.search}
        source={source}
        evidence={evidence}
        setSource={(value) => {
          cancelOperation();
          setSource(value);
        }}
        setEvidence={(value) => {
          cancelOperation();
          setEvidence(value);
        }}
        requestMode={code.description.requestMode}
        onRequestModeChange={(requestMode) =>
          changeSection('description', {...code.description, requestMode})
        }
        onChange={(value) => changeSection('search', value)}
        onOpen={(action) => void run(action)}
        busy={busy === 'auto' || busy === 'manual' ? busy : undefined}
        status={status?.key === 'maker_source_invalid' && !busy ? undefined : statusView}
        addressInvalid={status?.key === 'maker_source_invalid'}
        hasDocument={Boolean(response)}
      />
    );
  } else if (page === 'check') {
    content = (
      <TrackerBuilderResult
        headingRef={resultHeading}
        code={code}
        report={detection}
        check={checked}
        stale={stale}
        canExport={passed}
        otherPageFailed={otherPageFailed}
        phrase={phrase}
        setPhrase={setCheckPhrase}
        busy={busy === 'check' || busy === 'next' ? busy : undefined}
        status={statusView}
        pageNumber={index + 1}
        onCheck={(action) => void run(action)}
        onBack={() => {
          if (index < 1 || inFlight.current || stale) return;
          setIndex(index - 1);
          setResponse(history[index - 1].response);
          setStatus(undefined);
        }}
        onCode={() => navigate(route('save'))}
        onFix={focusField}
        onConfigure={(section) => navigate(route(section))}
        highlighted={highlight?.id}
        onHighlight={(field) => {
          const selector = code.selectors[field]?.selector;
          if (selector) {
            preview.toggleHighlight(
              field,
              selector,
              field === 'row' || field === 'nextPageUrl' ? {} : resultLocation(code.selectors),
            );
          }
        }}
      />
    );
  } else if (page === 'selectors') {
    content = (
      <ResultSelectors
        selectors={code.selectors}
        preview={preview}
        document={frame.parsed}
        onChange={(value) => changeSection('selectors', value)}
      />
    );
  } else if (page === 'auth') {
    content = (
      <section className="page auth">
        <h2>{message('kitLogin')}</h2>
        <form
          className="maker-request"
          onSubmit={(event) => {
            event.preventDefault();
            void run('login');
          }}
        >
          <TextField
            id="url"
            label="kitLoginUrl"
            value={code.auth.url}
            placeholder="https://tracker.example/login"
            help="maker_help_login_url"
            onChange={(url) => changeSection('auth', {...code.auth, url})}
          />
          <Button
            type="submit"
            data-id="auth_open"
            busy={busy === 'login'}
            disabled={!code.auth.url}
          >
            {message('kitOpen')}
          </Button>
          {statusView}
        </form>
        <SelectorField
          id="loginForm"
          title={message('kitLoginFormSelector')}
          optional
          preview={preview}
          location={{}}
          value={code.auth.loginForm}
          onChange={(loginForm) => changeSection('auth', {...code.auth, loginForm})}
        />
      </section>
    );
  } else if (page === 'desc') {
    content = (
      <BuilderDescription
        description={code.description}
        onChange={(value) => changeSection('description', value)}
      />
    );
  } else {
    content = (
      <BuilderCode
        code={code}
        onEdit={(value) => changeSection('description', value)}
        onImport={importDraft}
        canExport={passed}
        exported={exported}
        onExport={setExported}
      />
    );
  }

  const panel = (
    <TrackerBuilderPreview
      iframe={frame.iframe}
      loaded={Boolean(response)}
      position={position}
      menuButtonRef={positionButton}
      onPosition={(next: PreviewPosition) => {
        setPosition(next);
        openPreview(next);
        requestAnimationFrame(() => positionButton.current?.focus());
      }}
      onClose={collapsePreview}
      selection={selection ? message(selectorLabels[selection.id]) : undefined}
      onCancel={() => cancelSelection()}
      path={path}
      highlight={highlightStatus}
    />
  );

  return (
    <div
      ref={root}
      className="page-ctr page-ctr--code-maker"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && selection && !event.defaultPrevented) {
          event.preventDefault();
          cancelSelection();
        }
      }}
    >
      <header className="maker-heading">
        <h1>{message('maker_heading')}</h1>
        <nav className="top-menu" aria-label={message('maker_heading')}>
          <Link to={route('search')} aria-current={page === 'search' ? 'step' : undefined}>
            {message('maker_setup')}
          </Link>
          <Link
            to={route('check')}
            className={checking ? 'maker-current' : undefined}
            aria-current={checking ? 'step' : undefined}
          >
            {message('maker_check')}
          </Link>
          <Link to={route('save')}>{message('maker_code')}</Link>
        </nav>
        <RouteLink className="ts-button" to={profileRoute()}>
          {message('maker_tracker_lists')}
        </RouteLink>
      </header>
      <VerticalSplit
        collapsed={!opened || positionShown === 'window'}
        orientation={positionShown === 'right' ? 'horizontal' : 'vertical'}
        initialTopPercent={splitPercent(splitKey)}
        separatorLabel={message('maker_split')}
        onResize={(percent) => localStorage.setItem(splitKey, String(percent))}
        top={
          <div className="tools">
            {checking && (
              <nav className="top-menu maker-subnav" aria-label={message('maker_check')}>
                {Object.entries(checks).map(([id, label]) => (
                  <Link key={id} to={route(id)}>
                    {message(label)}
                  </Link>
                ))}
              </nav>
            )}
            <div className="body">{content}</div>
            {windowBlocked && (
              <p className="maker-notice" role="status">
                {message('maker_preview_blocked')}
              </p>
            )}
          </div>
        }
        bottom={panel}
      />
      {opened && positionShown === 'window' && popup.popup && (
        <PreviewPortal popup={popup.popup}>{panel}</PreviewPortal>
      )}
      {!opened && response && (
        <Button
          className="maker-preview-launcher"
          ref={previewButton}
          onClick={() => openPreview()}
        >
          {message('maker_tracker_page')}
        </Button>
      )}
    </div>
  );
}

function splitPercent(key: string) {
  const stored = Number(localStorage.getItem(key));
  return stored >= 22 && stored <= 78 ? stored : key === splitRight ? 55 : 52;
}

function isHttpAddress(value: string) {
  const url = URL.parse(value);
  return Boolean(
    url &&
    (url.protocol === 'https:' || url.protocol === 'http:') &&
    !url.username &&
    !url.password,
  );
}
