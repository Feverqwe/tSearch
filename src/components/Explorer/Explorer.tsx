import {useQuery} from '@tanstack/react-query';
import {useLayoutEffect, useRef, useState} from 'react';

import ExploreSection from './ExploreSection';
import type QuickSearchStore from '../../stores/QuickSearchStore';
import {optionsQuery} from '../../data/options';
import {
  explorerFavorites,
  explorerModules,
  explorerSections,
  useSaveSections,
} from '../../data/explorer';
import {moveByKey} from '../../tools/explorerView';
import moveBetween from '../../tools/moveBetween';
import {SortableList} from '../ui/SortableList';

export default function Explorer({quickSearch}: {quickSearch: QuickSearchStore}) {
  const modules = useQuery(explorerModules);
  const sections = useQuery(explorerSections);
  const favorites = useQuery(explorerFavorites);
  const options = useQuery(optionsQuery);
  const change = useSaveSections();
  const container = useRef<HTMLUListElement>(null);
  const [width, setWidth] = useState(0);
  const [sorting, setSorting] = useState(false);
  const ready = Boolean(sections.data && modules.data && options.data);

  useLayoutEffect(() => {
    const element = container.current;
    if (!element) return;
    const measure = () => setWidth(element.clientWidth);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, [ready]);

  if (!sections.data || !modules.data || !options.data) {
    const isError = sections.isError || modules.isError || options.isError;
    return (
      <p role={isError ? 'alert' : 'status'}>
        {chrome.i18n.getMessage(isError ? 'explorer_load_error' : 'explorer_loading')}
      </p>
    );
  }

  const enabled = options.data.explorerSections;
  const showFavorites = favorites.isError || Boolean(favorites.data?.length);
  const visible = sections.data.filter(
    ({id, moduleId}) =>
      (id !== 'favorites' || showFavorites) &&
      Object.hasOwn(enabled, moduleId) &&
      enabled[moduleId as keyof typeof enabled],
  );
  const sortableIds = visible.map(({id}) => id);
  const visibleIds = new Set(sortableIds);
  return (
    <SortableList
      ids={sortableIds}
      onDraggingChange={setSorting}
      renderPreview={(title) => (
        <div className="section__head section__drag-preview" aria-hidden="true">
          <span className="section__move" />
          <span>{title}</span>
        </div>
      )}
      onMove={(id, previous, next) => {
        change((sections) => {
          const moved = sections.find((section) => section.id === id);
          return moved
            ? moveBetween(
                sections,
                moved,
                sections.find((section) => section.id === previous),
                sections.find((section) => section.id === next),
              )
            : sections;
        });
      }}
    >
      <ul ref={container} className={sorting ? 'explore explore-sort' : 'explore'}>
        {visible.map((section, index) => (
          <ExploreSection
            key={section.id}
            section={section}
            quickSearch={quickSearch}
            module={modules.data[section.moduleId]}
            width={width}
            favorites={favorites.data}
            favoritesLoading={favorites.isFetching}
            favoritesFailed={favorites.isError}
            refreshFavorites={() => void favorites.refetch()}
            options={options.data}
            sortIndex={index}
            canMoveEarlier={index > 0}
            canMoveLater={index < visible.length - 1}
            onMove={(direction) => {
              change((items) => {
                const shuffled = moveByKey(
                  items.filter(({id}) => visibleIds.has(id)),
                  section.id,
                  direction,
                  ({id}) => id,
                );
                return items.map((item) => (visibleIds.has(item.id) ? shuffled.shift()! : item));
              });
            }}
          />
        ))}
      </ul>
    </SortableList>
  );
}
