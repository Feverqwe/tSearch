import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useContext, useEffect} from 'react';

import QualityEditor from '../components/QualityEditor';
import {
  effectiveQuality,
  qualityRevision,
  qualitySettingsQuery,
  QualityConflict,
  saveQualitySettings,
} from '../data/qualitySettings';
import type {QualityConfig} from '../tools/qualityConfig';
import type {ExtensionOptions} from '../data/options';
import ProfileEditor from './ProfileEditor';
import Header from '../components/Header';
import ThemeControl from '../ui/ThemeControl';
import OptionsPanel from '../components/OptionsPanel';
import ScrollTop from '../components/ScrollTop';
import {optionsQuery, useSaveOptions} from '../data/options';
import {exportZip, inspectBackup, restoreBackup} from '../data/backup';
import {setTabProfile} from '../data/catalog';
import {normalizeProfiles} from '../stores/ProfileStore';
import {RootContext} from '../stores/rootContext';
import getTitle from '../tools/getTitle';

export default function Options({page, detail}: {page?: string; detail?: string}) {
  const query = useQuery(optionsQuery);
  const update = useSaveOptions().mutateAsync;
  const {profiles} = useContext(RootContext);

  useEffect(() => {
    document.title = getTitle(chrome.i18n.getMessage('options'));
  }, []);

  const options = query.data;
  if (!options) {
    return (
      <p role={query.isError ? 'alert' : 'status'}>
        {chrome.i18n.getMessage(query.isError ? 'settings_load_error' : 'settings_loading')}
      </p>
    );
  }

  return (
    <div className="page-ctr">
      <Header />
      <OptionsPanel
        page={page}
        options={options}
        update={update}
        themeControl={<ThemeControl />}
        extraPages={[
          {id: 'profiles', label: 'profile'},
          {id: 'quality', label: 'quality_settings'},
        ]}
        content={
          page === 'profiles' ? (
            <ProfileEditor id={detail} />
          ) : page === 'quality' ? (
            <QualitySettings options={options} />
          ) : undefined
        }
        backup={{
          exportArchive: exportZip,
          inspectArchive: inspectBackup,
          restoreArchive: async (plan) => {
            await restoreBackup(plan);
            if (!Object.hasOwn(plan.local, 'profileId')) return;
            const records = Object.hasOwn(plan.sync, 'profiles')
              ? normalizeProfiles(plan.sync.profiles)
              : profiles.profiles;
            const {profileId} = plan.local;
            profiles.setProfiles(records, typeof profileId === 'string' ? profileId : null);
            if (profiles.profile) setTabProfile(profiles.profile.id);
          },
        }}
      />
      <ScrollTop />
    </div>
  );
}

function QualitySettings({options}: {options: ExtensionOptions}) {
  const client = useQueryClient();
  const quality = useQuery(qualitySettingsQuery);
  const mutation = useMutation({
    mutationFn: ({config, expected}: {config: QualityConfig; expected: string}) =>
      saveQualitySettings(config, expected),
    onSuccess: ({record, options}) => {
      client.setQueryData(qualitySettingsQuery.queryKey, record);
      client.setQueryData(optionsQuery.queryKey, options);
    },
    onError: async (error) => {
      if (error instanceof QualityConflict) {
        await Promise.all([
          client.invalidateQueries({queryKey: qualitySettingsQuery.queryKey}),
          client.invalidateQueries({queryKey: optionsQuery.queryKey}),
        ]);
      }
    },
  });
  if (quality.data === undefined) {
    return (
      <p role={quality.isError ? 'alert' : 'status'}>
        {chrome.i18n.getMessage(quality.isError ? 'settings_load_error' : 'settings_loading')}
      </p>
    );
  }
  return (
    <QualityEditor
      saved={effectiveQuality(quality.data, options)}
      revision={qualityRevision(quality.data, options)}
      pending={mutation.isPending}
      error={
        mutation.error
          ? mutation.error instanceof QualityConflict
            ? 'conflict'
            : 'write'
          : undefined
      }
      onResetStatus={mutation.reset}
      onSave={async (config, expected) => {
        await mutation.mutateAsync({config, expected});
      }}
    />
  );
}
