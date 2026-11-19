import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useEffect, useId, useRef, useState} from 'react';

import '../assets/css/editor.less';
import Button from '../components/ui/Button';
import Dialog from '../components/Dialog';
import TrackerEditor from '../components/TrackerEditor';
import {editableTracker, saveEditableTracker, type TrackerDraft} from '../data/editableTracker';
import {parseTrackerDefinition} from '../tools/trackerDefinition';
import {isTrackerScript, prepareTrackerScript} from '../tools/trackerScript';
import getTitle from '../tools/getTitle';
import builtInTrackers from '../trackers.json';

interface EditorProps {
  type: string;
  id: string;
}

export default function Editor({type, id}: EditorProps) {
  const query = useQuery(editableTracker(type, id));

  useEffect(() => {
    document.title = getTitle(chrome.i18n.getMessage('editor_heading'));
  }, []);

  if (!query.data) {
    return (
      <p role={query.isError ? 'alert' : 'status'}>
        {chrome.i18n.getMessage(query.isError ? 'editor_load_error' : 'editor_loading')}
      </p>
    );
  }

  return (
    <EditorForm key={JSON.stringify([type, id])} type={type} id={id} initialDraft={query.data} />
  );
}

function EditorForm({type, id, initialDraft}: EditorProps & {initialDraft: TrackerDraft}) {
  const client = useQueryClient();
  const [draft, setDraft] = useState(initialDraft);
  const [saved, setSaved] = useState(initialDraft);
  const [confirm, setConfirm] = useState(false);
  const [scriptConfirmation, setScriptConfirmation] = useState<{
    draft: TrackerDraft;
    origin: string;
  }>();
  const [fileCode, setFileCode] = useState({revision: 0, code: initialDraft.code});
  const [importError, setImportError] = useState(false);
  const fileRead = useRef(0);
  const labelId = useId();
  const save = useMutation({
    mutationFn: ({draft, script}: {draft: TrackerDraft; script?: boolean}) =>
      saveEditableTracker(type, id, draft, saved.code, script),
    onSuccess: (_, submitted) => {
      const persisted = submitted.script
        ? {...submitted.draft, autoUpdate: false}
        : submitted.draft;
      setSaved(persisted);
      if (submitted.script) setDraft((value) => ({...value, autoUpdate: false}));
      void client.invalidateQueries({queryKey: ['storage', 'local', 'trackers']});
    },
  });
  const hasChanges = saved.code !== draft.code || saved.autoUpdate !== draft.autoUpdate;
  const script = isTrackerScript(draft.code);
  const submit = () => {
    if (save.isPending || scriptConfirmation) return;
    if (script) {
      try {
        parseTrackerDefinition(draft.code);
      } catch {
        try {
          setScriptConfirmation({draft, origin: prepareTrackerScript(draft.code).meta.connect[0]});
        } catch {
          save.mutate({draft});
        }
        return;
      }
    }
    save.mutate({draft});
  };

  return (
    <div className="page-ctr page-ctr--editor">
      <header className="editor__head">
        <h1>{chrome.i18n.getMessage('editor_heading')}</h1>
        <label>
          <input
            type="checkbox"
            className="option__auto-update"
            checked={!script && draft.autoUpdate}
            disabled={script || Object.hasOwn(builtInTrackers, id)}
            onChange={(event) => {
              const autoUpdate = event.currentTarget.checked;
              setDraft((draft) => ({...draft, autoUpdate}));
            }}
          />
          <span>{chrome.i18n.getMessage('autoUpdate')}</span>
        </label>
        <div className="head__action">
          <label>
            <span>{chrome.i18n.getMessage('editor_import_file')}</span>
            <input
              type="file"
              accept=".js,.json"
              disabled={save.isPending}
              onChange={async (event) => {
                const input = event.currentTarget;
                const file = input.files?.[0];
                input.value = '';
                if (!file) return;
                const read = ++fileRead.current;
                try {
                  const code = await file.text();
                  if (read !== fileRead.current) return;
                  setFileCode(({revision}) => ({revision: revision + 1, code}));
                  setDraft((draft) => ({...draft, code}));
                  setImportError(false);
                } catch {
                  if (read === fileRead.current) setImportError(true);
                }
              }}
            />
          </label>
          <Button variant="primary" busy={save.isPending} onClick={submit}>
            {chrome.i18n.getMessage('save')}
            {hasChanges ? '*' : ''}
          </Button>
          <Button
            disabled={save.isPending}
            onClick={() => (hasChanges ? setConfirm(true) : window.close())}
          >
            {chrome.i18n.getMessage('close')}
          </Button>
        </div>
      </header>
      {save.isError && (
        <p className="editor-error" role="alert">
          {chrome.i18n.getMessage(
            save.variables?.script ? 'editor_script_invalid' : 'editor_save_error',
          )}
        </p>
      )}
      {importError && <p role="alert">{chrome.i18n.getMessage('editor_import_error')}</p>}
      {scriptConfirmation && (
        <Dialog
          aria-label={chrome.i18n.getMessage('editor_enable_script')}
          onClose={() => setScriptConfirmation(undefined)}
        >
          <p>{chrome.i18n.getMessage('editor_script_confirm', scriptConfirmation.origin)}</p>
          <div className="dialog__button_box">
            <Button variant="quiet" autoFocus onClick={() => setScriptConfirmation(undefined)}>
              {chrome.i18n.getMessage('cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                save.mutate({draft: scriptConfirmation.draft, script: true});
                setScriptConfirmation(undefined);
              }}
            >
              {chrome.i18n.getMessage('editor_enable_script')}
            </Button>
          </div>
        </Dialog>
      )}
      {confirm && (
        <Dialog
          aria-label={chrome.i18n.getMessage('discard_changes')}
          onClose={() => setConfirm(false)}
        >
          <p>{chrome.i18n.getMessage('discard_changes')}</p>
          <div className="dialog__button_box">
            <Button variant="quiet" autoFocus onClick={() => setConfirm(false)}>
              {chrome.i18n.getMessage('cancel')}
            </Button>
            <Button variant="primary" onClick={() => window.close()}>
              {chrome.i18n.getMessage('close')}
            </Button>
          </div>
        </Dialog>
      )}
      <div className="editor__body">
        <span id={labelId}>{chrome.i18n.getMessage('tracker_code')}</span>
        <TrackerEditor
          key={fileCode.revision}
          labelId={labelId}
          initialValue={fileCode.code}
          onChange={(code) => setDraft((draft) => ({...draft, code}))}
          onSave={submit}
        />
      </div>
    </div>
  );
}
