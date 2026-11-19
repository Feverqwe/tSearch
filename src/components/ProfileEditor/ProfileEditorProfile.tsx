import Button from '../ui/Button';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {profilesQuery, saveProfileDraft} from '../../data/catalog';
import {ProfileConflict} from '../../data/profileChanges';
import {isWebAddress} from '../../tools/explorerView';
import {profileRoute} from '../../ui/profileRoutes';
import {useRouteNavigate} from '../../ui/navigation';
import IconButton from '../ui/IconButton';
import Field from '../ui/Field';
import {useSaveOptions} from '../../data/options';
import {RootContext} from '../../stores/rootContext';
import {observer} from 'mobx-react-lite';
import {
  useContext,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
  type ReactElement,
} from 'react';
import {RouteLink as Link} from '../../ui/navigation';
import getTitle from '../../tools/getTitle';
import TackerStore from './TackerStore';
import ProfileEditorTrackerItem from './ProfileEditorTrackerItem';
import Dialog from '../Dialog';

import {SortableList} from '../ui/SortableList';

import type {ListedTracker, ProfileCategory} from '../../stores/ProfileEditorStore';
import type ProfileEditorStore from '../../stores/ProfileEditorStore';
import type {ProfileEditorProfileStore} from '../../stores/ProfileEditorStore';
interface ProfileEditorProfileProps {
  profileEditorStore: ProfileEditorStore;
  profileEditorProfileStore: ProfileEditorProfileStore;
}
interface ProfileEditorTackerListProps {
  profileEditorProfileStore: ProfileEditorProfileStore;
}
interface ProfileEditorFilterButtonProps {
  title: string;
  isActive: boolean;
  count?: number;
  onClick: () => void;
}

const ProfileEditorProfile = observer(function ProfileEditorProfile({
  profileEditorStore,
  profileEditorProfileStore: profile,
}: ProfileEditorProfileProps) {
  const {optionValues} = useContext(RootContext);
  const client = useQueryClient();
  const navigate = useRouteNavigate();
  const {baseline, dirty} = profile;
  const save = useMutation({
    mutationFn: () => saveProfileDraft(profile.toRecord(), baseline),
    onSuccess: (profiles) => {
      client.setQueryData(profilesQuery.queryKey, profiles);
      profileEditorStore.acceptSaved(profiles, profile.id);
    },
  });
  const [exit, setExit] = useState(false);
  const [repoError, setRepoError] = useState('');
  const saveOptions = useSaveOptions();
  const [showStore, setShowStore] = useState(false);
  const [repos, setRepos] = useState<string[] | null>(null);
  const repositoryInput = useRef<HTMLInputElement>(null);
  const repositorySelect = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    document.title = getTitle(chrome.i18n.getMessage('profile_edit_title', [profile.name]));
  }, [profile]);

  function closeProfile() {
    const latest = profileEditorStore.baseline.find(({id}) => id === profile.id);
    if (!latest) profileEditorStore.removeProfileById(profile.id);
    else {
      // Restore only the open record; unsaved order changes belong to the list.
      profileEditorStore.restore(latest);
    }
    void navigate(profileRoute());
  }
  function handleCategoryClick(category: ProfileCategory) {
    setShowStore(false);
    profile.setCategory(category);
  }
  function closeSources() {
    if (saveOptions.isPending) return;
    setRepoError('');
    setRepos(null);
  }
  async function handleSourcesSubmit(event: FormEvent) {
    event.preventDefault();
    if (!repos || saveOptions.isPending) return;
    try {
      await saveOptions.mutateAsync((options) => ({...options, repositories: repos}));
      setRepoError('');
      setRepos(null);
    } catch {
      setRepoError(chrome.i18n.getMessage('settings_save_error'));
    }
  }
  function handlePutRepository() {
    const value = repositoryInput.current?.value.trim();
    if (!value || !isWebAddress(value)) {
      setRepoError(chrome.i18n.getMessage('favorite_invalid_url'));
      repositoryInput.current?.focus();
      return;
    }
    setRepoError('');
    setRepos((current) => (current?.includes(value) ? current : [...(current ?? []), value]));
    if (repositoryInput.current) repositoryInput.current.value = '';
  }
  function handleDeleteRepository(event: MouseEvent) {
    event.preventDefault();
    const selected = new Set(
      Array.from(repositorySelect.current?.selectedOptions ?? [], (option) => option.value),
    );
    setRepos((current) => current?.filter((url) => !selected.has(url)) ?? null);
  }

  const categories = (
    ['all', 'selected', 'builtIn', 'installed', 'withoutList'] satisfies ProfileCategory[]
  ).map((type) => {
    const isActive = !showStore && type === profile.category;
    const count = profile.getTrackerCountByCategory(type);
    const title = chrome.i18n.getMessage('filter_' + type);
    return (
      <ProfileEditorFilterButton
        key={`category-${type}`}
        title={title}
        onClick={() => handleCategoryClick(type)}
        count={count}
        isActive={isActive}
      />
    );
  });

  categories.push(
    <ProfileEditorFilterButton
      key="category-store"
      title={chrome.i18n.getMessage('external_trackers')}
      onClick={() => setShowStore(true)}
      isActive={showStore}
    />,
  );

  let sourcesDialog = null;
  let listControls = [];
  let trackerList = null;
  if (showStore) {
    trackerList = <TackerStore />;

    listControls.push(
      <Button key="sources" onClick={() => setRepos([...optionValues.repositories])}>
        {chrome.i18n.getMessage('sources')}
      </Button>,
    );
    listControls.push(
      <IconButton
        key="refresh"
        icon="refresh"
        label={chrome.i18n.getMessage('refresh')}
        onClick={() => void client.invalidateQueries({queryKey: ['tracker-repositories']})}
      />,
    );

    if (repos !== null) {
      const options = repos.map((url) => {
        return (
          <option key={url} value={url}>
            {url}
          </option>
        );
      });

      sourcesDialog = (
        <Dialog
          className="dialog-repositories"
          aria-label={chrome.i18n.getMessage('repositories')}
          onClose={closeSources}
        >
          <form onSubmit={(event) => void handleSourcesSubmit(event)}>
            <h2>{chrome.i18n.getMessage('repositories')}</h2>
            <label className="dialog__label" htmlFor="selectRepoUrls">
              {chrome.i18n.getMessage('repositories')}
            </label>
            <div>
              <select
                ref={repositorySelect}
                onChange={(event) => {
                  if (repositoryInput.current)
                    repositoryInput.current.value = event.currentTarget.value;
                }}
                id="selectRepoUrls"
                multiple={true}
              >
                {options}
              </select>
            </div>
            <div>
              <Button onClick={handleDeleteRepository}>{chrome.i18n.getMessage('delete')}</Button>
            </div>
            <label className="dialog__label" htmlFor="repoUrl">
              {chrome.i18n.getMessage('add_repository')}
            </label>
            <div>
              <input
                ref={repositoryInput}
                className="ts-control"
                aria-describedby={repoError ? 'repo-edit-error' : undefined}
                id="repoUrl"
                type="text"
                placeholder="https://..."
              />
            </div>
            <div>
              <Button onClick={handlePutRepository}>{chrome.i18n.getMessage('add')}</Button>
            </div>

            {repoError && (
              <p role="alert" id="repo-edit-error">
                {repoError}
              </p>
            )}
            <div className="dialog__button_box">
              <Button variant="quiet" onClick={closeSources} disabled={saveOptions.isPending}>
                {chrome.i18n.getMessage('cancel')}
              </Button>
              <Button variant="primary" type="submit" busy={saveOptions.isPending}>
                {chrome.i18n.getMessage('save')}
              </Button>
            </div>
          </form>
        </Dialog>
      );
    }
  } else {
    trackerList = (
      <ProfileEditorTackerList key={profile.category} profileEditorProfileStore={profile} />
    );
  }

  return (
    <div className="manager">
      <div className="manager__body">
        <Field label={chrome.i18n.getMessage('profile_name')}>
          {(props) => (
            <input
              {...props}
              className="ts-control"
              type="text"
              value={profile.name}
              onChange={(event) => profile.setName(event.currentTarget.value)}
            />
          )}
        </Field>
        {save.isError && (
          <div>
            <p role="alert">
              {chrome.i18n.getMessage(
                save.error instanceof ProfileConflict ? 'profile_conflict' : 'settings_save_error',
              )}
            </p>
            {save.error instanceof ProfileConflict && (
              <Button
                onClick={async () => {
                  profileEditorStore.reload(
                    await client.fetchQuery({...profilesQuery, staleTime: 0}),
                  );
                  save.reset();
                }}
              >
                {chrome.i18n.getMessage('refresh')}
              </Button>
            )}
          </div>
        )}
        <div className="manager__sub_header sub_header__filter">
          <div className="filter__box">{categories}</div>
          <div className="filter__search">
            <input
              className="ts-control filter__input"
              type="search"
              aria-label={chrome.i18n.getMessage('profile_find_tracker')}
              placeholder={chrome.i18n.getMessage('profile_find_tracker')}
              onChange={(event) => {
                setShowStore(false);
                profile.setFilterText(event.currentTarget.value);
                profile.setCategory('all');
              }}
            />
          </div>
        </div>
        {trackerList}
        <div className="manager__footer">
          {listControls}
          <Link to={'/codeMaker'} target="_blank" className="ts-button">
            {chrome.i18n.getMessage('createCode')}
          </Link>
          <Link to={'/editor/tracker'} target="_blank" className="ts-button">
            {chrome.i18n.getMessage('addTracker')}
          </Link>
          <Button
            variant="primary"
            disabled={!dirty || !profile.name.trim()}
            busy={save.isPending}
            onClick={() => save.mutate()}
          >
            {chrome.i18n.getMessage('save')}
          </Button>
          <Link
            className="ts-button"
            to={profileRoute()}
            onClick={(event) => {
              if (
                (dirty || !baseline) &&
                !event.ctrlKey &&
                !event.metaKey &&
                !event.shiftKey &&
                !event.altKey &&
                event.button === 0
              ) {
                event.preventDefault();
                setExit(true);
              }
            }}
          >
            {chrome.i18n.getMessage('cancel')}
          </Link>
        </div>
      </div>
      {sourcesDialog}
      {exit && (
        <Dialog
          aria-label={chrome.i18n.getMessage('discard_changes')}
          onClose={() => setExit(false)}
        >
          <p>{chrome.i18n.getMessage('discard_changes')}</p>
          <div className="dialog__button_box">
            <Button variant="quiet" autoFocus onClick={() => setExit(false)}>
              {chrome.i18n.getMessage('cancel')}
            </Button>
            <Button variant="primary" onClick={closeProfile}>
              {chrome.i18n.getMessage('close')}
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
});

const ProfileEditorTackerList = observer(function ProfileEditorTackerList({
  profileEditorProfileStore: profile,
}: ProfileEditorTackerListProps) {
  const trackerIdsRef = useRef<string[]>([]);
  const trackerIds = [...trackerIdsRef.current];
  useEffect(() => {
    trackerIdsRef.current = trackerIds;
  }, [trackerIds]);

  const removedIds = trackerIds.slice(0);

  const checkedTrackerIds = profile.selectedTrackerIds;

  const sortableIds: string[] = [];
  const checkedTrackers: ReactElement[] = [];
  const uncheckedTrackers: ReactElement[] = [];

  const appendTracker = (trackerStore: ListedTracker) => {
    const checked = checkedTrackerIds.indexOf(trackerStore.id) !== -1;
    const item = (
      <ProfileEditorTrackerItem
        key={`tracker-${trackerStore.id}`}
        profileEditorProfileStore={profile}
        trackerStore={trackerStore}
        checked={checked}
        sortIndex={checked ? sortableIds.length : undefined}
      />
    );
    if (checked) {
      sortableIds.push(trackerStore.id);
      checkedTrackers.push(item);
    } else {
      uncheckedTrackers.push(item);
    }
  };

  profile.categoryTrackers.forEach((trackerStore) => {
    const id = trackerStore.id;
    const pos = removedIds.indexOf(id);
    if (pos !== -1) {
      removedIds.splice(pos, 1);
    }
    if (trackerIds.indexOf(id) === -1) {
      trackerIds.push(id);
    }
    appendTracker(trackerStore);
  });

  if (!profile.filterText) {
    removedIds.forEach((id) => {
      const trackerStore = profile.getTrackerById(id);
      if (trackerStore) {
        appendTracker(trackerStore);
      }
    });
  }

  return (
    <SortableList ids={sortableIds} onMove={profile.moveTracker}>
      <div className="manager__trackers">{checkedTrackers.concat(uncheckedTrackers)}</div>
    </SortableList>
  );
});

function ProfileEditorFilterButton({
  title,
  isActive,
  count: total,
  onClick,
}: ProfileEditorFilterButtonProps) {
  let count = null;
  if (typeof total === 'number') {
    count = <span className="item__count">{total}</span>;
  }

  return (
    <Button variant={isActive ? 'quiet' : 'outline'} aria-pressed={isActive} onClick={onClick}>
      {title} {count}
    </Button>
  );
}

export default ProfileEditorProfile;
