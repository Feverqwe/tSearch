import {useCallback, useEffect, useId, useRef, useState, type ReactNode, type Ref} from 'react';

import {RouteLink as Link} from '../../ui/navigation';
import highlight from '../../tools/highlight';
import type {TitlePresentation} from '../../tools/titlePresentation';
import type {QuickResult} from '../../data/quickSearch';
import AnchoredPanel from '../ui/AnchoredPanel';
import Button from '../ui/Button';
import IconButton from '../ui/IconButton';
import QualityMeter from '../QualityMeter';
import ResultTitle from '../ResultTitle';
import '../../assets/css/explore.less';

interface ExplorerCardProps {
  title: string;
  url: string;
  poster?: string;
  zoom: number;
  itemRef?: Ref<HTMLLIElement>;
  dropTarget?: boolean;
  quickSearchDisabled?: boolean;
  savedResults?: readonly QuickResult[];
  quickRun?: {id: number; pending?: boolean; results?: readonly QuickResult[]};
  actions?: ReactNode;
  dialog?: ReactNode;
  presentation?: TitlePresentation;
  onQuickSearch: () => void;
  onOpenResult: (result: QuickResult) => void;
}

export default function ExplorerCard({
  title,
  url,
  poster,
  zoom,
  itemRef,
  dropTarget,
  quickSearchDisabled,
  savedResults,
  quickRun,
  actions,
  dialog,
  presentation,
  onQuickSearch,
  onOpenResult,
}: ExplorerCardProps) {
  const [dismissedRun, setDismissedRun] = useState<number>();
  const [openedSavedTitle, setOpenedSavedTitle] = useState<string>();
  const [hoveredTitle, setHoveredTitle] = useState<string>();
  const [failedPoster, setFailedPoster] = useState<string>();
  const quickSearch = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const searchUrl = `/search?${new URLSearchParams({query: title})}`;
  const name = chrome.i18n.getMessage('quickSearch');
  const details = chrome.i18n.getMessage('readMore');
  const words = highlight.getMap(title);
  const runId = quickRun?.id;
  const hovered = hoveredTitle === title;
  const showSaved =
    quickRun?.results === undefined &&
    !quickRun?.pending &&
    savedResults !== undefined &&
    (hovered || openedSavedTitle === title);
  const results = showSaved ? savedResults : quickRun?.results;
  const open = results !== undefined && (hovered || showSaved || dismissedRun !== runId);

  const dismiss = useCallback(() => {
    setHoveredTitle(undefined);
    setOpenedSavedTitle(undefined);
    setDismissedRun(runId);
  }, [runId]);

  useEffect(() => {
    if (!open) return;
    function dismissOutside(event: Event) {
      if (!quickSearch.current?.contains(event.target as Node)) dismiss();
    }
    function dismissWithEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      event.preventDefault();
      dismiss();
      button.current?.focus();
    }
    document.addEventListener('pointerdown', dismissOutside);
    document.addEventListener('focusin', dismissOutside);
    document.addEventListener('keydown', dismissWithEscape);
    return () => {
      document.removeEventListener('pointerdown', dismissOutside);
      document.removeEventListener('focusin', dismissOutside);
      document.removeEventListener('keydown', dismissWithEscape);
    };
  }, [open, dismiss]);

  return (
    <li
      ref={itemRef}
      data-url={url}
      data-sort-target={dropTarget || undefined}
      style={{width: `min(100%, ${Math.max(48, zoom * 1.2)}px)`}}
      className="section__poster poster"
    >
      <div className="poster__image">
        <Link to={searchUrl} title={title} aria-label={title} className="image__search_link">
          {poster && failedPoster !== poster ? (
            <img
              className="image__image"
              src={poster}
              onError={() => setFailedPoster(poster)}
              alt=""
            />
          ) : (
            <span className="image__placeholder" aria-hidden="true">
              <span className="image__placeholder-icon" />
            </span>
          )}
        </Link>
        <div
          className="poster__quick-search"
          ref={quickSearch}
          onPointerEnter={(event) => {
            if (event.pointerType === 'mouse') setHoveredTitle(title);
          }}
          onPointerLeave={(event) => {
            if (event.pointerType !== 'mouse' || !hovered) return;
            const focused = document.activeElement;
            if (focused !== button.current && event.currentTarget.contains(focused)) return;
            dismiss();
          }}
        >
          <AnchoredPanel
            className="ts-floating quick-search-panel"
            open={open}
            showArrow
            anchor={(attach) => (
              <IconButton
                ref={(node) => {
                  button.current = node;
                  attach(node);
                }}
                label={name}
                icon="search"
                aria-controls={open ? panelId : undefined}
                aria-expanded={open}
                busy={quickRun?.pending && results === undefined}
                disabled={quickSearchDisabled}
                onClick={(event) => {
                  const click = event.nativeEvent;
                  if (click instanceof PointerEvent && click.pointerType === 'mouse') {
                    setOpenedSavedTitle(undefined);
                    onQuickSearch();
                  } else if (open) dismiss();
                  else if (results !== undefined) setDismissedRun(undefined);
                  else if (savedResults) setOpenedSavedTitle(title);
                  else onQuickSearch();
                }}
              />
            )}
          >
            <div id={panelId} className="quick-search-content">
              {results?.length === 0 && (
                <p role="status">{chrome.i18n.getMessage('quick_search_empty')}</p>
              )}
              {results && results.length > 0 && (
                <ul>
                  {results.map((result) => (
                    <li key={result.url}>
                      <QualityMeter value={result.quality} />
                      <div>
                        <a
                          href={result.url}
                          target="_blank"
                          onClick={() => onOpenResult(result)}
                          onAuxClick={(event) => {
                            if (event.button === 1) onOpenResult(result);
                          }}
                        >
                          <ResultTitle
                            title={result.title}
                            matches={highlight.getMatches(result.title, words)}
                            presentation={presentation}
                          />
                        </a>
                        <small>{result.sizeText === 'n/a' ? '—' : result.sizeText}</small>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="quick-search-footer">
                {results && results.length > 0 && (
                  <Link to={searchUrl}>{chrome.i18n.getMessage('explorer_full_search')}</Link>
                )}
                {!quickRun?.pending && (
                  <Button
                    variant="quiet"
                    onClick={() => {
                      button.current?.focus();
                      setOpenedSavedTitle(undefined);
                      onQuickSearch();
                    }}
                  >
                    {chrome.i18n.getMessage('refresh')}
                  </Button>
                )}
              </div>
            </div>
          </AnchoredPanel>
        </div>
        <div className="poster__actions">
          <a
            href={url}
            target="_blank"
            aria-label={details}
            title={details}
            className="image__more_link ts-button ts-icon-button ts-icon-link"
          />
          {actions}
        </div>
      </div>
      <div className="poster__title">
        <Link to={searchUrl} title={title} className="poster__search_link">
          {title}
        </Link>
      </div>
      {dialog}
    </li>
  );
}
