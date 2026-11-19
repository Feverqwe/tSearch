import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useEffect, useId, useMemo, useRef, useState} from 'react';
import debounce from 'lodash.debounce';

import ExplorerItem from './ExplorerItem';
import type QuickSearchStore from '../../stores/QuickSearchStore';
import Button from '../ui/Button';
import IconButton from '../ui/IconButton';
import {SortableList, useSortableItem} from '../ui/SortableList';
import {clampPage} from '../../tools/explorerView';
import ExplorerSectionView from './ExplorerSectionView';
import ExplorerViewSettings from './ExplorerViewSettings';
import {
  cachedSectionItems,
  fetchSectionItems,
  sectionItemsKey,
  useSaveFavorites,
  useSaveSections,
  type ExplorerSection,
} from '../../data/explorer';
import type {ExtensionOptions} from '../../data/options';
import type {ExplorerModule} from '../../tools/getExplorerModules';
import getLocale from '../../tools/getLocale';
import moveBetween from '../../tools/moveBetween';
import processLocale from '../../tools/processLocale';

const empty: PackagedExplorerItem[] = [];

interface ExploreSectionProps {
  section: ExplorerSection;
  quickSearch: QuickSearchStore;
  module?: ExplorerModule;
  width: number;
  favorites?: PackagedExplorerItem[] | null;
  options: ExtensionOptions;
  refreshFavorites: () => void;
  favoritesLoading?: boolean;
  favoritesFailed?: boolean;
  onMove: (direction: -1 | 1) => void;
  canMoveEarlier: boolean;
  canMoveLater: boolean;
  sortIndex?: number;
}

export default function ExploreSection({
  section,
  quickSearch,
  module,
  width,
  favorites,
  options,
  refreshFavorites,
  favoritesLoading,
  favoritesFailed,
  onMove,
  canMoveEarlier,
  canMoveLater,
  sortIndex,
}: ExploreSectionProps) {
  const {id, moduleId, collapsed, rowCount} = section;
  const favoriteSection = id === 'favorites';
  const client = useQueryClient();
  const change = useSaveSections();
  const optionsId = useId();
  const [showOptions, setShowOptions] = useState(false);
  const [zoomDraft, setZoomDraft] = useState<number>();
  const [minHeight, setMinHeight] = useState(0);
  const zoom = zoomDraft ?? section.zoom;
  const params = section.moduleParams.replace('%kpFolderId%', options.kpFolderId);
  const key = sectionItemsKey(id, moduleId, params);

  const cached = useQuery({
    ...cachedSectionItems(id, params),
    enabled: !favoriteSection && !collapsed,
  });
  const itemsQuery = useQuery({
    queryKey: key,
    enabled: !favoriteSection && !collapsed && Boolean(module),
    queryFn: async ({signal}) =>
      module ? ((await fetchSectionItems(section, module, params, {signal})) ?? empty) : empty,
  });
  const refresh = useMutation({
    scope: {id: `explorer-items:${id}`},
    onMutate: () => client.cancelQueries({queryKey: key}),
    mutationFn: (command?: string) =>
      module
        ? fetchSectionItems(section, module, params, {command, force: true})
        : Promise.resolve(undefined),
    onSuccess: (items) => {
      if (items) client.setQueryData(key, items);
    },
  });
  const items = favoriteSection ? (favorites ?? empty) : (itemsQuery.data ?? cached.data ?? empty);
  const error = refresh.error ?? itemsQuery.error;
  const failed = favoriteSection ? favoritesFailed : Boolean(error || !module);
  const busy = favoriteSection
    ? Boolean(favoritesLoading)
    : itemsQuery.isFetching || refresh.isPending;
  const authRequired =
    error && typeof error === 'object' && 'code' in error && error.code === 'AUTH_REQUIRED';
  const changeZoom = useMemo(
    () =>
      debounce(
        (zoom: number) =>
          change((sections) => sections.map((item) => (item.id === id ? {...item, zoom} : item))),
        250,
      ),
    [change, id],
  );
  useEffect(
    () => () => {
      changeZoom.flush();
    },
    [changeZoom],
  );
  useEffect(() => {
    if (zoomDraft === section.zoom) setZoomDraft(undefined);
  }, [section.zoom, zoomDraft]);

  function patch(patch: Partial<ExplorerSection>) {
    change((sections) => sections.map((item) => (item.id === id ? {...item, ...patch} : item)));
  }

  function setZoom(zoom: number) {
    setZoomDraft(zoom);
    setMinHeight(0);
    changeZoom(zoom);
  }

  const meta = module?.meta;
  const locale = meta ? getLocale(meta.defaultLocale ?? 'en', meta.locales) : null;
  const actions = meta?.actions ?? [];
  const updateCommand = actions.find(({command}) => command === 'update')?.command;
  const title = favoriteSection
    ? message('favorites')
    : meta
      ? processLocale(meta.name, locale)
      : id;
  const sortable = useSortableItem(id, sortIndex, {label: title});
  return (
    <ExplorerSectionView
      {...sortable}
      id={id}
      title={title}
      collapsed={collapsed}
      loading={busy && !items.length}
      loginRequired={Boolean(authRequired)}
      error={failed}
      empty={!busy && !failed && !items.length}
      onToggle={() => patch({collapsed: !collapsed})}
      actions={
        <>
          {meta?.siteURL && (
            <a
              href={meta.siteURL}
              title={message('goToTheWebsite')}
              aria-label={message('goToTheWebsite')}
              className="ts-button ts-button--quiet ts-icon-button ts-icon-link ts-glyph--website"
              target="_blank"
            />
          )}
          {actions
            .filter(({command}) => command !== updateCommand)
            .map((action) => (
              <ExplorerAction
                key={action.command}
                title={processLocale(action.title, locale)}
                icon={action.icon}
                pending={busy}
                onClick={() => refresh.mutate(action.command)}
              />
            ))}
          <IconButton
            label={message('setupView')}
            icon="settings"
            variant="quiet"
            aria-expanded={showOptions}
            aria-controls={optionsId}
            onClick={() => setShowOptions((shown) => !shown)}
          />
        </>
      }
      settings={
        <ExplorerViewSettings
          id={optionsId}
          hidden={!showOptions}
          zoom={zoom}
          rows={rowCount}
          onZoom={setZoom}
          onResetZoom={() => {
            setZoom(100);
            changeZoom.flush();
          }}
          onRows={(rows) => {
            setMinHeight(0);
            patch({rowCount: rows});
          }}
          refreshing={busy}
          onRefresh={
            favoriteSection
              ? refreshFavorites
              : module
                ? () => refresh.mutate(updateCommand)
                : undefined
          }
          onMoveEarlier={canMoveEarlier ? () => onMove(-1) : undefined}
          onMoveLater={canMoveLater ? () => onMove(1) : undefined}
        />
      }
    >
      <SectionItems
        items={items}
        quickSearch={quickSearch}
        favorites={favorites ?? empty}
        favoriteSection={favoriteSection}
        showOriginalTitle={options.originalPosterName}
        presentation={options.titlePresentation}
        zoom={zoom}
        minHeight={minHeight}
        setMinHeight={setMinHeight}
        displayCount={
          Math.max(1, Math.floor((width + 8) / (Math.max(48, 1.2 * zoom) + 8))) * rowCount
        }
      />
    </ExplorerSectionView>
  );
}

const message = (key: string) => chrome.i18n.getMessage(key);

function ExplorerAction({
  title,
  pending,
  icon,
  onClick,
}: {
  title: string;
  pending: boolean;
  icon?: string;
  onClick: () => void;
}) {
  return icon === 'update' ? (
    <IconButton label={title} icon="refresh" busy={pending} variant="quiet" onClick={onClick} />
  ) : (
    <Button variant="quiet" busy={pending} onClick={onClick}>
      {title}
    </Button>
  );
}

function SectionItems({
  items,
  quickSearch,
  favorites,
  favoriteSection,
  showOriginalTitle,
  presentation,
  zoom,
  minHeight,
  setMinHeight,
  displayCount,
}: {
  items: PackagedExplorerItem[];
  quickSearch: QuickSearchStore;
  favorites: PackagedExplorerItem[];
  favoriteSection: boolean;
  showOriginalTitle: boolean;
  presentation: ExtensionOptions['titlePresentation'];
  zoom: number;
  minHeight: number;
  setMinHeight: (height: number) => void;
  displayCount: number;
}) {
  const [page, setPage] = useState(0);
  const node = useRef<HTMLUListElement>(null);
  const save = useSaveFavorites().mutate;
  const pageCount = Math.ceil(items.length / displayCount);
  const activePage = clampPage(page, items.length, displayCount);
  useEffect(() => {
    if (activePage !== page) setPage(activePage);
  }, [activePage, page]);
  function selectPage(index: number) {
    const height = node.current?.clientHeight ?? 0;
    if (height > minHeight) setMinHeight(height);
    setPage(index);
  }
  const visible = items.slice(activePage * displayCount, (activePage + 1) * displayCount);
  const favoriteUrls = new Set(favorites.map(({url}) => url));

  const cards = (
    <ul ref={node} className="section__body" style={{minHeight}}>
      {visible.map((item, index) => (
        <ExplorerItem
          key={item.url}
          item={item}
          quickSearch={quickSearch}
          zoom={zoom}
          favoriteSection={favoriteSection}
          sortIndex={favoriteSection ? index : undefined}
          canMoveEarlier={activePage * displayCount + index > 0}
          canMoveLater={activePage * displayCount + index < items.length - 1}
          isFavorite={favoriteUrls.has(item.url)}
          showOriginalTitle={showOriginalTitle}
          presentation={presentation}
        />
      ))}
    </ul>
  );

  return (
    <>
      {pageCount > 1 && (
        <ul className="section__pages">
          {Array.from({length: pageCount}, (_, index) => (
            <li key={index}>
              <Button
                aria-current={activePage === index ? 'page' : undefined}
                onPointerEnter={(event) => {
                  if (event.pointerType === 'mouse') selectPage(index);
                }}
                onClick={() => selectPage(index)}
              >
                {index + 1}
              </Button>
            </li>
          ))}
        </ul>
      )}
      {favoriteSection ? (
        <SortableList
          ids={visible.map(({url}) => url)}
          onMove={(url, previous, next) => {
            save((items) => {
              const moved = items.find((item) => item.url === url);
              return moved
                ? moveBetween(
                    items,
                    moved,
                    items.find((item) => item.url === previous),
                    items.find((item) => item.url === next),
                  )
                : items;
            });
          }}
        >
          {cards}
        </SortableList>
      ) : (
        cards
      )}
    </>
  );
}
