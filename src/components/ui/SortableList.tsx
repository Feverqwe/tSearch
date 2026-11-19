import type {ReactNode} from 'react';
import {DragDropProvider, DragOverlay, PointerSensor} from '@dnd-kit/react';
import {isSortable, useSortable} from '@dnd-kit/react/sortable';
import {PointerActivationConstraints} from '@dnd-kit/dom';
import {SortableKeyboardPlugin} from '@dnd-kit/dom/sortable';

const pointer = PointerSensor.configure({
  activationConstraints(event) {
    return event.pointerType === 'touch'
      ? [new PointerActivationConstraints.Delay({value: 250, tolerance: 5})]
      : [new PointerActivationConstraints.Distance({value: 5})];
  },
});

interface SortableListProps {
  ids: readonly string[];
  children: ReactNode;
  onMove?: (id: string, previous?: string, next?: string) => void;
  onDraggingChange?: (dragging: boolean) => void;
  renderPreview?: (label: string) => ReactNode;
}

export function SortableList({
  ids,
  children,
  onMove,
  onDraggingChange,
  renderPreview,
}: SortableListProps) {
  return (
    <DragDropProvider
      sensors={(defaults) =>
        defaults.map((sensor) => (sensor === PointerSensor ? pointer : sensor))
      }
      onDragStart={() => onDraggingChange?.(true)}
      onDragEnd={({canceled, operation: {source, target}}) => {
        onDraggingChange?.(false);
        if (canceled || !isSortable(source) || !isSortable(target) || source.id === target.id)
          return;
        const id = String(source.id);
        const from = ids.indexOf(id);
        const to = ids.indexOf(String(target.id));
        if (from === -1 || to === -1) return;
        const after = to > from;
        onMove?.(id, ids[after ? to : to - 1], ids[after ? to + 1 : to]);
      }}
    >
      {children}
      {renderPreview && (
        <DragOverlay dropAnimation={null}>
          {(source) => renderPreview(String(source.data.label ?? source.id))}
        </DragOverlay>
      )}
    </DragDropProvider>
  );
}

const pointerOnly = [pointer];
// React owns the displayed order and applies it after the drop.
const sortablePlugins = [SortableKeyboardPlugin];

export function useSortableItem(
  id: string,
  index: number | undefined,
  {label, keyboard = true}: {label?: string; keyboard?: boolean} = {},
) {
  const item = useSortable({
    id,
    index: index ?? 0,
    disabled: index === undefined,
    data: {label},
    plugins: sortablePlugins,
    sensors: keyboard ? undefined : pointerOnly,
  });
  return {
    itemRef: index === undefined ? undefined : item.ref,
    handleRef: index === undefined ? undefined : item.handleRef,
    dropTarget: item.isDropTarget && !item.isDragSource,
  };
}
