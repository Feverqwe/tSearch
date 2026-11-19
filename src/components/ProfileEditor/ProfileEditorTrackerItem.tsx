import builtInTrackers from '../../trackers.json';
import {observer} from 'mobx-react-lite';
import {useId} from 'react';
import {useMutation} from '@tanstack/react-query';

import blankSvg from '../../assets/img/blank.svg';
import {RouteLink} from '../../ui/navigation';
import {
  type ListedTracker,
  type ProfileEditorProfileStore,
  isInstalledTracker,
} from '../../stores/ProfileEditorStore';
import {removeTrackerRecord} from '../../data/trackerRecords';
import IconButton from '../ui/IconButton';
import {useSortableItem} from '../ui/SortableList';

const message = (key: string) => chrome.i18n.getMessage(key);

export default observer(function ProfileEditorTrackerItem({
  profileEditorProfileStore: profile,
  trackerStore: tracker,
  checked,
  sortIndex,
}: {
  profileEditorProfileStore: ProfileEditorProfileStore;
  trackerStore: ListedTracker;
  checked: boolean;
  sortIndex?: number;
}) {
  const id = useId();
  const remove = useMutation({mutationFn: removeTrackerRecord});
  const profileTracker = profile.getProfileTracker(tracker.id);
  const builtIn = Object.hasOwn(builtInTrackers, tracker.id);
  const installed = isInstalledTracker(tracker);
  const name = tracker.meta.name || tracker.id;
  const {itemRef, handleRef, dropTarget} = useSortableItem(tracker.id, sortIndex);
  const description = 'description' in tracker.meta ? tracker.meta.description : undefined;
  const error = remove.isError
    ? builtIn
      ? 'tracker_restore_error'
      : 'catalog_remove_error'
    : tracker.updateState === 'error'
      ? 'catalog_install_error'
      : undefined;
  return (
    <div
      ref={itemRef}
      className={`tracker-editor-row item${checked ? ' item__selected' : ''}`}
      data-id={tracker.id}
      data-sort-target={dropTarget || undefined}
    >
      {checked ? (
        <button
          ref={handleRef}
          type="button"
          className="item__move"
          aria-label={`${message('move')}: ${name}`}
        />
      ) : (
        <span className="item__move" aria-hidden="true" style={{visibility: 'hidden'}} />
      )}
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          event.currentTarget.checked
            ? profile.addTracker(tracker.id)
            : profile.removeTracker(tracker.id)
        }
      />
      <img src={tracker.getIconUrl() || blankSvg} alt="" />
      <div className="tracker-editor-copy">
        <label htmlFor={id}>{name}</label>
        {checked && profileTracker && (
          <label className="tracker-request-option">
            <input
              type="checkbox"
              checked={
                profileTracker.enableProxy ?? (installed && tracker.meta.requestMode === 'tab')
              }
              onChange={(event) => profileTracker.setEnableProxy(event.currentTarget.checked)}
            />
            {message('enableProxy')}
          </label>
        )}
        <small>
          {message(
            builtIn && installed
              ? 'tracker_builtin'
              : installed
                ? 'tracker_custom'
                : 'tracker_unavailable',
          )}
          {tracker.meta.author && ` · ${tracker.meta.author}`}
          {'version' in tracker.meta && tracker.meta.version ? ` · ${tracker.meta.version}` : ''}
        </small>
        {description && <p>{description}</p>}
        {error && <p role="alert">{message(error)}</p>}
      </div>
      <div className="tracker-editor-actions">
        {'supportURL' in tracker.meta && tracker.meta.supportURL && (
          <a
            href={tracker.meta.supportURL}
            target="_blank"
            aria-label={message('tracker_support')}
            className="ts-button ts-button--quiet ts-icon-button ts-icon-link ts-glyph--website"
          />
        )}
        {tracker.meta.homepageURL && (
          <a
            href={tracker.meta.homepageURL}
            target="_blank"
            aria-label={message('goToTheWebsite')}
            className="ts-button ts-button--quiet ts-icon-button ts-icon-link ts-glyph--website"
          />
        )}
        {!builtIn && (tracker.meta.updateURL || tracker.meta.downloadURL) && (
          <IconButton
            label={message('update')}
            icon="refresh"
            variant="quiet"
            busy={tracker.updateState === 'pending'}
            onClick={() => void tracker.update()}
          />
        )}
        {installed && (
          <>
            <RouteLink
              to={`/editor/tracker/${tracker.id}`}
              target="_blank"
              aria-label={message('edit')}
              className="ts-button ts-button--quiet ts-icon-button ts-icon-link ts-glyph--edit"
            />
            {(!builtIn || tracker.localOverride) && (
              <IconButton
                label={message(builtIn ? 'tracker_restore_builtin' : 'delete')}
                icon="remove"
                variant="quiet"
                busy={remove.isPending}
                onClick={() => remove.mutate(tracker.id)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
});
