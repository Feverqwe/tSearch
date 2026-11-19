import {useRef} from 'react';

import getTrackerIconClassName from '../tools/getTrackerIconClassName';
import TrackerStatusPanel from './TrackerStatusPanel';
import LoadingIndicator from './ui/LoadingIndicator';

interface TrackerRowProps {
  id: string;
  name: string;
  siteUrl?: string;
  iconUrl?: string;
  selected?: boolean;
  status?: 'idle' | 'loading' | 'error' | 'missing';
  login?: {url?: string};
  errorMessage?: string;
  count?: string;
  onSelect?: () => void;
  onRetry?: () => void;
}

export default function TrackerRow({
  id,
  name,
  siteUrl,
  iconUrl,
  selected,
  status = 'idle',
  login,
  errorMessage,
  count,
  onSelect,
  onRetry,
}: TrackerRowProps) {
  const nameButton = useRef<HTMLButtonElement>(null);
  const iconClass = getTrackerIconClassName(id);
  const loginLabel = chrome.i18n.getMessage('login');
  const statusLabel = chrome.i18n.getMessage(
    status === 'missing'
      ? 'tracker_unavailable'
      : status === 'loading'
        ? 'search_loading'
        : 'tracker_error',
  );

  const description = login ? loginLabel : status !== 'idle' ? statusLabel : '';
  const tooltip = description ? `${name} · ${description}` : name;

  return (
    <div className={selected ? 'tracker tracker-selected' : 'tracker'}>
      {siteUrl ? (
        <a
          className={`tracker__icon tracker__link ${iconClass}`}
          target="_blank"
          href={siteUrl}
          aria-label={siteUrl}
        />
      ) : (
        <span className={`tracker__icon ${iconClass}`} aria-hidden="true" />
      )}
      {status === 'missing' ? (
        <span className="tracker__name" title={tooltip}>
          {name}
        </span>
      ) : (
        <button
          ref={nameButton}
          className="tracker__name"
          type="button"
          title={tooltip}
          aria-pressed={Boolean(selected)}
          onClick={onSelect}
        >
          {name}
        </button>
      )}
      <div className="tracker__meta">
        {login || status === 'error' ? (
          <TrackerStatusPanel
            label={login ? loginLabel : statusLabel}
            login={login}
            errorMessage={errorMessage}
            onRetry={
              onRetry &&
              (() => {
                nameButton.current?.focus({preventScroll: true});
                onRetry();
              })
            }
          />
        ) : status === 'loading' ? (
          <span
            className="tracker__icon-loading"
            role="status"
            aria-label={statusLabel}
            title={statusLabel}
          >
            <LoadingIndicator />
          </span>
        ) : status !== 'idle' ? (
          <span
            className="tracker__icon tracker__icon-error"
            role="img"
            aria-label={statusLabel}
            title={statusLabel}
          />
        ) : count !== undefined ? (
          <span className="tracker__counter" title={count}>
            {count}
          </span>
        ) : null}
      </div>
      {iconUrl && <style>{`.${iconClass}{background-image:url(${iconUrl})}`}</style>}
    </div>
  );
}
