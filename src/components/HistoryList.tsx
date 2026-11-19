import {useLayoutEffect, useRef, useState, type MouseEvent} from 'react';

import {RouteLink as Link} from '../ui/navigation';
import type {HistoryEntry, HistoryChange} from '../data/history';
import type {TitlePresentation} from '../tools/titlePresentation';
import highlight from '../tools/highlight';
import {unixTimeToString} from '../tools/unixTimeTo';
import ResultTitle from './ResultTitle';

import '../assets/css/history.less';

type Removal = Extract<HistoryChange, {type: 'remove-query' | 'remove-click'}>;

export default function HistoryList({
  entries,
  change,
  presentation,
}: {
  entries: readonly HistoryEntry[];
  change: (change: Removal) => void | Promise<void>;
  presentation?: TitlePresentation;
}) {
  const list = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const focus = useRef<{row: Element; candidates: HTMLAnchorElement[]} | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  useLayoutEffect(() => {
    if (!focus.current || focus.current.row.isConnected) return;
    const {candidates} = focus.current;
    focus.current = null;
    (candidates.find(({isConnected}) => isConnected) ?? heading.current)?.focus();
  }, [entries]);

  async function remove(event: MouseEvent<HTMLButtonElement>, removal: Removal) {
    if (pending) return;
    const row = event.currentTarget.closest('.item');
    const link = row?.querySelector('.item__link');
    if (!row || !link) return;
    const links = Array.from(list.current!.querySelectorAll<HTMLAnchorElement>('.item__link'));
    const index = links.indexOf(link as HTMLAnchorElement);
    focus.current = {
      row,
      candidates: [...links.slice(index + 1), ...links.slice(0, index).reverse()],
    };
    setPending(true);
    setError('');
    try {
      await change(removal);
    } catch {
      focus.current = null;
      setError(chrome.i18n.getMessage('history_remove_error'));
    } finally {
      setPending(false);
    }
  }

  const deleteLabel = chrome.i18n.getMessage('delete');
  const removeButton = (name: string, removal: Removal) => (
    <button
      className="item__remove"
      type="button"
      aria-disabled={pending || undefined}
      aria-label={`${deleteLabel}: ${name}`}
      title={deleteLabel}
      onClick={(event) => void remove(event, removal)}
    />
  );
  return (
    <div className="history" ref={list}>
      <h1 tabIndex={-1} ref={heading}>
        {chrome.i18n.getMessage('history')}
      </h1>
      {error && (
        <p role="alert" className="history-error">
          {error}
        </p>
      )}
      {entries.length === 0 && (
        <p className="history_empty">{chrome.i18n.getMessage('history_empty')}</p>
      )}
      {entries.map(({query, clicks}) => {
        const words = highlight.getMap(query);
        const label = query || '""';
        return (
          <div className="history__item" key={query}>
            <div className="item item-query">
              {removeButton(label, {type: 'remove-query', query})}
              <Link className="item__link" to={`/search?${new URLSearchParams({query})}`}>
                {label}
              </Link>
            </div>
            <div className="click_history">
              {Object.values(clicks ?? {})
                .sort((a, b) => b.time - a.time)
                .map((link) => (
                  <div key={link.url} className="item item-click_history">
                    {removeButton(link.title, {type: 'remove-click', query, url: link.url})}
                    <span className="item__date">{unixTimeToString(link.time)}</span>
                    <a className="item__link" href={link.url} target="_blank">
                      <ResultTitle
                        title={link.title}
                        matches={highlight.getMatches(link.title, words)}
                        presentation={presentation}
                      />
                    </a>
                  </div>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
