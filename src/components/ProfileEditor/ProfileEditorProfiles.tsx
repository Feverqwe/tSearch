import {useMutation, useQueryClient} from '@tanstack/react-query';
import {observer} from 'mobx-react-lite';
import {useEffect} from 'react';

import {profilesQuery, saveProfileOrder} from '../../data/catalog';
import {useRouteNavigate} from '../../ui/navigation';
import {profileRoute} from '../../ui/profileRoutes';
import type ProfileEditorStore from '../../stores/ProfileEditorStore';
import ProfileEditorList from './ProfileEditorList';
import getTitle from '../../tools/getTitle';
import Button from '../ui/Button';

export default observer(function ProfileEditorProfiles({
  profileEditorStore: editor,
}: {
  profileEditorStore: ProfileEditorStore;
}) {
  const navigate = useRouteNavigate();
  const client = useQueryClient();
  const save = useMutation({
    mutationFn: () =>
      saveProfileOrder(
        editor.profiles.map(({id}) => id),
        editor.orderBaseline,
      ),
    onSuccess: (profiles) => {
      client.setQueryData(profilesQuery.queryKey, profiles);
      editor.reload(profiles);
    },
  });
  useEffect(() => {
    document.title = getTitle(chrome.i18n.getMessage('manageProfiles'));
  }, []);

  const dirty =
    editor.baseline.length !== editor.profiles.length ||
    editor.baseline.some(({id}, index) => editor.profiles[index]?.id !== id);

  return (
    <>
      {save.isError && (
        <div>
          <p role="alert">{chrome.i18n.getMessage('profile_conflict')}</p>
          <Button
            onClick={async () => {
              editor.reload(await client.fetchQuery({...profilesQuery, staleTime: 0}));
              save.reset();
            }}
          >
            {chrome.i18n.getMessage('refresh')}
          </Button>
        </div>
      )}
      <ProfileEditorList
        profiles={editor.profiles.map(({id, name}) => ({id, name}))}
        onReorder={editor.moveProfile}
        dirty={dirty}
        pending={save.isPending}
        handleCreate={() => {
          const id = crypto.randomUUID();
          editor.createProfile(id);
          void navigate(profileRoute(id));
        }}
        handleSave={() => save.mutate()}
        onMove={(id, direction) => {
          const index = editor.profiles.findIndex((profile) => profile.id === id);
          const adjacent = editor.profiles[index + direction]?.id;
          if (adjacent)
            editor.moveProfile(
              id,
              direction > 0 ? adjacent : undefined,
              direction < 0 ? adjacent : undefined,
            );
        }}
        onRemove={editor.removeProfileById}
      />
    </>
  );
});
