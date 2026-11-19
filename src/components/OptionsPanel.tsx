import {type ReactNode, useRef, useState} from 'react';

import type {ExtensionOptions, OptionsChange} from '../data/options';
import {type TabProxyMode, readTabProxyMode} from '../tools/tabProxy';
import {RouteNavLink} from '../ui/navigation';

import BackupPanel, {type BackupActions} from './BackupPanel';
import TitleOptions from './TitleOptions';
import Field from './ui/Field';

import '../assets/css/options.less';

type BooleanKeys<T> = {[K in keyof T]-?: T[K] extends boolean ? K : never}[keyof T];
type SectionKey = keyof ExtensionOptions['explorerSections'];

interface OptionsPanelProps {
  page?: string;
  options: ExtensionOptions;
  update: (change: OptionsChange) => Promise<ExtensionOptions>;
  backup: BackupActions;
  themeControl?: ReactNode;
  extraPages?: {id: string; label: string; href?: string}[];
  content?: ReactNode;
}

const message = (key: string) => chrome.i18n.getMessage(key);

export default function OptionsPanel({
  page = 'main',
  options,
  update,
  backup,
  themeControl,
  extraPages = [],
  content: customContent,
}: OptionsPanelProps) {
  const checkbox = (name: BooleanKeys<ExtensionOptions>) => (
    <OptionCheckbox
      key={name}
      name={name}
      checked={options[name]}
      onChange={(checked) => update((previous) => ({...previous, [name]: checked}))}
    />
  );

  const navigation = [
    {id: 'main', label: 'basic'},
    ...extraPages,
    {id: 'titles', label: 'settings_titles'},
    {id: 'explorer', label: 'mainPage'},
    {id: 'backup', label: 'backupRestore'},
  ];
  let content = customContent;
  switch (page) {
    case 'main':
      content = (
        <>
          <section className="settings-group">
            <h2>{message('settings_results')}</h2>
            {['hidePeerRow', 'hideSeedRow', 'singleResultTable'].map((key) =>
              checkbox(key as BooleanKeys<ExtensionOptions>),
            )}
          </section>
          <section className="settings-group">
            <h2>{message('settings_search')}</h2>
            {checkbox('categoryWordFilter')}
            {checkbox('defineCategory')}
            {checkbox('rankByReleaseDate')}
            {checkbox('rankBySeeds')}
            {checkbox('rankByLeeches')}
            <TabProxyModeOption
              value={options.tabProxyMode}
              onChange={(tabProxyMode) => update((previous) => ({...previous, tabProxyMode}))}
            />
          </section>
          <section className="settings-group">
            <h2>{message('settings_browser')}</h2>
            {checkbox('contextMenu')}
            {checkbox('disablePopup')}
            {checkbox('invertIcon')}
            {themeControl}
          </section>
        </>
      );
      break;
    case 'explorer':
      content = (
        <>
          <section className="settings-group settings-explorer">
            <h2>{message('settings_showcase')}</h2>
            {checkbox('originalPosterName')}
            <FolderOption
              value={options.kpFolderId}
              onChange={(kpFolderId) => update((previous) => ({...previous, kpFolderId}))}
            />
          </section>
          <section className="settings-group">
            <h2>{message('showSections')}</h2>
            {(Object.keys(options.explorerSections) as SectionKey[]).map((name) => (
              <OptionCheckbox
                key={name}
                name={name}
                checked={options.explorerSections[name]}
                onChange={(checked) =>
                  update((previous) => ({
                    ...previous,
                    explorerSections: {...previous.explorerSections, [name]: checked},
                  }))
                }
              />
            ))}
          </section>
        </>
      );
      break;
    case 'titles':
      content = (
        <TitleOptions
          value={options.titlePresentation}
          update={(change) =>
            update((previous) => ({
              ...previous,
              titlePresentation: change(previous.titlePresentation),
            }))
          }
        />
      );
      break;
    case 'backup':
      content = (
        <section className="settings-group">
          <h2>{message('settings_backup')}</h2>
          <BackupPanel {...backup} />
        </section>
      );
      break;
  }

  return (
    <div className="main options-ctr">
      <nav className="sections" aria-label={message('options')}>
        {navigation.map(({id, label, ...link}) => (
          <RouteNavLink
            key={id}
            to={'href' in link && link.href ? link.href : `/options/${id}`}
            className="sections__item"
          >
            {message(label)}
          </RouteNavLink>
        ))}
      </nav>
      <main className="options">
        <h1>{message('options')}</h1>
        {content}
      </main>
    </div>
  );
}

function TabProxyModeOption({
  value,
  onChange,
}: {
  value: TabProxyMode;
  onChange: (mode: TabProxyMode) => Promise<unknown>;
}) {
  const [pending, setPending] = useState<TabProxyMode>();
  const [error, setError] = useState(false);
  return (
    <Field
      label={message('tab_proxy_mode')}
      error={error ? message('settings_save_error') : undefined}
    >
      {(props) => (
        <select
          {...props}
          className="ts-control"
          value={pending ?? value}
          disabled={pending !== undefined}
          onChange={async (event) => {
            const mode = readTabProxyMode(event.currentTarget.value);
            setPending(mode);
            setError(false);
            try {
              await onChange(mode);
            } catch {
              setError(true);
            } finally {
              setPending(undefined);
            }
          }}
        >
          <option value="tab">{message('tab_proxy_tab')}</option>
          <option value="window">{message('tab_proxy_window')}</option>
        </select>
      )}
    </Field>
  );
}

function FolderOption({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => Promise<unknown>;
}) {
  const [error, setError] = useState(false);
  const [draft, setDraft] = useState<string>();
  return (
    <Field label={message('kpFolderId')} error={error ? message('settings_save_error') : undefined}>
      {(props) => (
        <input
          {...props}
          className="ts-control"
          value={draft ?? value}
          onChange={(event) => {
            setError(false);
            setDraft(event.currentTarget.value);
          }}
          onBlur={async () => {
            if (draft === undefined) return;
            try {
              await onChange(draft);
              setDraft((previous) => (previous === draft ? undefined : previous));
            } catch {
              setError(true);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur();
          }}
        />
      )}
    </Field>
  );
}

function OptionCheckbox({
  name,
  checked,
  onChange,
}: {
  name: string;
  checked: boolean;
  onChange: (value: boolean) => Promise<ExtensionOptions>;
}) {
  const [pending, setPending] = useState<boolean>();
  const [error, setError] = useState(false);
  const revision = useRef(0);

  return (
    <div>
      <label className="option">
        <input
          type="checkbox"
          checked={pending ?? checked}
          onChange={async (event) => {
            const value = event.currentTarget.checked;
            const current = ++revision.current;
            setPending(value);
            setError(false);
            try {
              await onChange(value);
            } catch {
              if (current === revision.current) setError(true);
            } finally {
              if (current === revision.current) setPending(undefined);
            }
          }}
        />
        {message(name)}
      </label>
      {error && (
        <p role="alert" className="settings-error">
          {message('settings_save_error')}
        </p>
      )}
    </div>
  );
}
