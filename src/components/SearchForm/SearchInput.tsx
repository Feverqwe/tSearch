import {type KeyboardEvent, useId, useLayoutEffect, useRef, useState} from 'react';

import AnchoredPanel from '../ui/AnchoredPanel';
import Button from '../ui/Button';

import './searchForm.less';

export interface SearchInputProps {
  query: string;
  pendingQuery?: string;
  suggestions: readonly string[];
  onChange: (query: string) => void;
  onSubmit: (query: string) => void;
  onRequestSuggestions: (query: string) => void;
  onClearSuggestions: () => void;
}

export default function SearchInput({
  query,
  pendingQuery,
  suggestions,
  onChange,
  onSubmit,
  onRequestSuggestions,
  onClearSuggestions,
}: SearchInputProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(-1);
  const visible = open && suggestions.length > 0;
  const activeSuggestion = visible ? suggestions[selected] : undefined;
  const submitQuery = activeSuggestion ?? query;
  const activeOption = useRef<HTMLLIElement>(null);

  useLayoutEffect(() => {
    activeOption.current?.scrollIntoView({block: 'nearest', inline: 'nearest'});
  }, [selected, activeSuggestion]);

  function dismiss() {
    setOpen(false);
    setSelected(-1);
    onClearSuggestions();
  }

  function isPending(value: string) {
    return value.trim() === pendingQuery?.trim();
  }

  function submit(value: string) {
    if (isPending(value)) return;
    dismiss();
    onChange(value);
    onSubmit(value);
  }

  function handleKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      if (open) event.preventDefault();
      dismiss();
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    if (!open) onRequestSuggestions(query);
    setOpen(true);
    const direction = event.key === 'ArrowDown' ? 1 : -1;
    setSelected((index) => {
      if (suggestions.length === 0) return -1;
      if (index === -1) return direction === 1 ? 0 : suggestions.length - 1;
      return (index + direction + suggestions.length) % suggestions.length;
    });
  }

  return (
    <div className="search-from">
      <form
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) dismiss();
        }}
        onSubmit={(event) => {
          event.preventDefault();
          submit(submitQuery);
        }}
      >
        <div>
          <AnchoredPanel
            open={visible}
            matchWidth
            maxHeight={160}
            tabIndex={-1}
            className="ts-floating suggestions-container"
            anchor={(ref) => (
              <input
                ref={ref}
                className="input ts-control"
                type="search"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={visible}
                aria-controls={visible ? listId : undefined}
                aria-activedescendant={
                  activeSuggestion !== undefined ? `${listId}-${selected}` : undefined
                }
                aria-label={chrome.i18n.getMessage('search')}
                placeholder={chrome.i18n.getMessage('searchPlaceholder')}
                value={submitQuery}
                autoFocus
                onClick={() => {
                  if (!open) onRequestSuggestions(query);
                  setOpen(true);
                }}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  onChange(value);
                  onRequestSuggestions(value);
                  setSelected(-1);
                  setOpen(true);
                }}
                onKeyDown={handleKey}
              />
            )}
          >
            <ul id={listId} className="suggestions-list" role="listbox">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  ref={selected === index ? activeOption : undefined}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={selected === index}
                  className={
                    selected === index ? 'suggestion suggestion--highlighted' : 'suggestion'
                  }
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => submit(suggestion)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </AnchoredPanel>
        </div>
        <Button type="submit" variant="primary" className="submit" busy={isPending(submitQuery)}>
          {chrome.i18n.getMessage('search')}
        </Button>
      </form>
    </div>
  );
}
