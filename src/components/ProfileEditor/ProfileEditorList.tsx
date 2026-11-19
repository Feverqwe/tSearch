import {RouteLink} from '../../ui/navigation';
import {profileRoute} from '../../ui/profileRoutes';
import Button from '../ui/Button';
import IconButton from '../ui/IconButton';
import {SortableList, useSortableItem} from '../ui/SortableList';

interface ProfileEditorListProps {
  profiles: readonly {id: string; name: string}[];
  onReorder?: (id: string, previous?: string, next?: string) => void;
  handleCreate: () => void;
  handleSave: () => void;
  onRemove: (id: string) => void;
  onMove?: (id: string, direction: -1 | 1) => void;
  pending?: boolean;
  dirty?: boolean;
}

const message = (key: string) => chrome.i18n.getMessage(key);

export default function ProfileEditorList({
  profiles,
  onReorder,
  handleCreate,
  handleSave,
  onRemove,
  onMove,
  pending,
  dirty = true,
}: ProfileEditorListProps) {
  return (
    <div className="profile-list">
      <div className="profile-list-toolbar">
        <Button onClick={handleCreate} disabled={pending}>
          {message('newProfile')}
        </Button>
        <Button variant="primary" onClick={handleSave} busy={pending} disabled={!dirty}>
          {message('save')}
        </Button>
      </div>
      <SortableList ids={profiles.map(({id}) => id)} onMove={onReorder}>
        <div className="manager__profiles">
          {profiles.map(({id, name}, index) => (
            <ProfileRow
              key={id}
              {...{id, name, index, pending, onMove, onRemove}}
              canDrag={Boolean(onReorder) && !pending}
              last={index === profiles.length - 1}
            />
          ))}
        </div>
      </SortableList>
      {profiles.length === 0 && <p>{message('profiles_empty')}</p>}
    </div>
  );
}

function ProfileRow({
  id,
  name,
  index,
  pending,
  last,
  canDrag,
  onMove,
  onRemove,
}: {
  id: string;
  name: string;
  index: number;
  pending?: boolean;
  last: boolean;
  canDrag: boolean;
  onMove: ProfileEditorListProps['onMove'];
  onRemove: ProfileEditorListProps['onRemove'];
}) {
  const {itemRef, handleRef, dropTarget} = useSortableItem(id, canDrag ? index : undefined);
  return (
    <div ref={itemRef} data-id={id} className="item" data-sort-target={dropTarget || undefined}>
      <button
        ref={handleRef}
        type="button"
        className="item__move"
        aria-label={`${message('move')}: ${name}`}
        disabled={!canDrag}
      />
      <RouteLink to={profileRoute(id)} className="item__name">
        {name}
      </RouteLink>
      {onMove && (
        <>
          <Button
            variant="quiet"
            disabled={pending || index === 0}
            aria-label={`${message('explorer_move_earlier')}: ${name}`}
            onClick={() => onMove(id, -1)}
          >
            ↑
          </Button>
          <Button
            variant="quiet"
            disabled={pending || last}
            aria-label={`${message('explorer_move_later')}: ${name}`}
            onClick={() => onMove(id, 1)}
          >
            ↓
          </Button>
        </>
      )}
      <IconButton
        variant="quiet"
        label={`${message('delete')}: ${name}`}
        icon="remove"
        onClick={() => onRemove(id)}
        disabled={pending}
      />
    </div>
  );
}
