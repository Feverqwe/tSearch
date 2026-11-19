import {useQuery} from '@tanstack/react-query';
import {observer} from 'mobx-react-lite';
import {useEffect, useId, useState, type FormEvent} from 'react';

import {useChangeHistory} from '../../data/history';
import {useSaveFavorites} from '../../data/explorer';
import {savedQuickResults} from '../../data/quickSearch';
import type QuickSearchStore from '../../stores/QuickSearchStore';
import type {TitlePresentation} from '../../tools/titlePresentation';
import {isWebAddress, moveByKey, replaceFavorite} from '../../tools/explorerView';
import ExplorerCard from './ExplorerCard';
import Dialog from '../Dialog';
import Button from '../ui/Button';
import Field from '../ui/Field';
import IconButton from '../ui/IconButton';
import {useSortableItem} from '../ui/SortableList';
import AnchoredPanel from '../ui/AnchoredPanel';

interface ExplorerItemProps {
  item: PackagedExplorerItem;
  quickSearch: QuickSearchStore;
  zoom: number;
  favoriteSection: boolean;
  isFavorite: boolean;
  showOriginalTitle: boolean;
  presentation?: TitlePresentation;
  canMoveEarlier?: boolean;
  canMoveLater?: boolean;
  sortIndex?: number;
}

const message = (key: string) => chrome.i18n.getMessage(key);

export default observer(function ExplorerItem({
  item,
  quickSearch,
  zoom,
  favoriteSection,
  isFavorite,
  showOriginalTitle,
  presentation,
  canMoveEarlier,
  canMoveLater,
  sortIndex,
}: ExplorerItemProps) {
  const cardId = useId();
  const [edit, setEdit] = useState(false);
  const [reordering, setReordering] = useState(false);
  const title = showOriginalTitle ? item.titleOriginal || item.title : item.title;
  const saved = useQuery(savedQuickResults(title));
  const {itemRef, handleRef, dropTarget} = useSortableItem(item.url, sortIndex, {keyboard: false});
  const favorites = useSaveFavorites();
  const current = quickSearch.current;
  const run = current?.cardId === cardId && current.search.query === title ? current : undefined;

  useEffect(() => () => quickSearch.cancel(cardId), [cardId, quickSearch, title]);
  const changeHistory = useChangeHistory();

  function toggleFavorite() {
    favorites.mutate((items) => {
      const exists = items.some(({url}) => url === item.url);
      return exists ? items.filter(({url}) => url !== item.url) : [...items, item];
    });
  }

  function move(direction: -1 | 1) {
    favorites.mutate((items) => moveByKey(items, item.url, direction, ({url}) => url));
  }

  const favoriteLabel = message(isFavorite ? 'removeFromFavorite' : 'addInFavorite');
  return (
    <ExplorerCard
      itemRef={itemRef}
      dropTarget={dropTarget}
      title={title}
      url={item.url}
      poster={item.poster}
      zoom={zoom}
      presentation={presentation}
      quickSearchDisabled={!quickSearch.ready || saved.isPending}
      savedResults={saved.data}
      quickRun={
        run && {
          id: run.search.id,
          pending: quickSearch.state === 'pending',
          results: quickSearch.results,
        }
      }
      actions={
        <>
          <IconButton
            label={favoriteLabel}
            icon={isFavorite ? 'remove-favorite' : 'add-favorite'}
            aria-pressed={isFavorite}
            onClick={toggleFavorite}
            busy={favorites.isPending && !edit}
          />
          {favoriteSection && (
            <>
              <IconButton label={message('edit')} icon="edit" onClick={() => setEdit(true)} />
              <AnchoredPanel
                open={reordering}
                className="ts-floating poster__reorder"
                anchor={(ref) => (
                  <IconButton
                    ref={(node) => {
                      ref(node);
                      handleRef?.(node);
                    }}
                    label={message('move')}
                    icon="move"
                    className="action__move"
                    aria-expanded={reordering}
                    onClick={() => setReordering(!reordering)}
                  />
                )}
              >
                <IconButton
                  label={message('explorer_move_earlier')}
                  icon="up"
                  disabled={!canMoveEarlier || favorites.isPending}
                  onClick={() => move(-1)}
                />
                <IconButton
                  label={message('explorer_move_later')}
                  icon="down"
                  disabled={!canMoveLater || favorites.isPending}
                  onClick={() => move(1)}
                />
              </AnchoredPanel>
            </>
          )}
          {favorites.isError && !edit && (
            <span role="alert" className="poster__error">
              {message('favorite_write_error')}
            </span>
          )}
        </>
      }
      dialog={
        edit && (
          <FavoriteEditor
            item={item}
            close={() => {
              favorites.reset();
              setEdit(false);
            }}
            save={(update) =>
              favorites.mutateAsync((items) => replaceFavorite(items, item.url, update))
            }
          />
        )
      }
      onQuickSearch={() => void quickSearch.start(cardId, title)}
      onOpenResult={({title: resultTitle, url, trackerId}) =>
        changeHistory({
          type: 'click',
          query: title,
          result: {title: resultTitle, url, trackerId: trackerId ?? ''},
        })
      }
    />
  );
});

function FavoriteEditor({
  item,
  close,
  save,
}: {
  item: PackagedExplorerItem;
  close: () => void;
  save: (update: PackagedExplorerItem) => Promise<void>;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<{field?: 'title' | 'poster' | 'url'; message: string}>();
  const fields = [
    ['title', 'title'],
    ['titleOriginal', 'originalTitle'],
    ['poster', 'imageUrl'],
    ['url', 'descUrl'],
  ] as const;
  const label = message('favorite_edit');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const read = (key: string) => String(data.get(key) ?? '').trim();
    const update = {
      title: read('title'),
      titleOriginal: read('titleOriginal'),
      poster: read('poster'),
      url: read('url'),
    };
    function invalid(field: 'title' | 'poster' | 'url', key: string) {
      setError({field, message: message(key)});
      form.querySelector<HTMLInputElement>(`input[name="${field}"]`)?.focus();
    }
    if (!update.title) return invalid('title', 'favorite_title_required');
    if (update.poster && !isWebAddress(update.poster))
      return invalid('poster', 'favorite_invalid_url');
    if (!isWebAddress(update.url)) return invalid('url', 'favorite_invalid_url');
    setPending(true);
    setError(undefined);
    try {
      await save(update);
      close();
    } catch (error) {
      if (error instanceof Error && error.message === 'FAVORITE_URL_CONFLICT') {
        invalid('url', 'favorite_url_conflict');
      } else {
        setError({message: message('favorite_write_error')});
      }
    } finally {
      setPending(false);
    }
  }
  return (
    <Dialog
      className="dialog-poster_edit"
      aria-label={label}
      onClose={() => {
        if (!pending) close();
      }}
    >
      <h2>{label}</h2>
      <form onSubmit={(event) => void submit(event)}>
        {fields.map(([name, key]) => (
          <Field
            key={name}
            label={message(key)}
            error={error?.field === name ? error.message : undefined}
          >
            {(props) => (
              <input
                {...props}
                className="ts-control"
                name={name}
                defaultValue={item[name]}
                autoFocus={name === 'title'}
                onChange={() => {
                  if (error?.field === name) setError(undefined);
                }}
              />
            )}
          </Field>
        ))}
        {error && !error.field && <p role="alert">{error.message}</p>}
        <div className="dialog__button_box">
          <Button variant="quiet" onClick={close} disabled={pending}>
            {message('cancel')}
          </Button>
          <Button variant="primary" type="submit" busy={pending}>
            {message('save')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
