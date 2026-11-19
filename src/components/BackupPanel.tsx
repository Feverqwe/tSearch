import {useRef, useState} from 'react';

import type {BackupPlan} from '../data/backupPlan';

import Dialog from './Dialog';
import Button from './ui/Button';

export interface BackupActions {
  exportArchive: () => Promise<void>;
  inspectArchive: (file: File) => Promise<BackupPlan>;
  restoreArchive: (plan: BackupPlan) => Promise<void>;
}

const message = (key: string) => chrome.i18n.getMessage(key);

export default function BackupPanel({
  exportArchive,
  inspectArchive,
  restoreArchive,
}: BackupActions) {
  const fileInput = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const [plan, setPlan] = useState<BackupPlan>();
  const [pending, setPending] = useState<'export' | 'inspect' | 'restore' | 'recover'>();
  const [status, setStatus] = useState<{key: string; error?: boolean}>();
  const [recover, setRecover] = useState<() => Promise<void>>();

  async function runExport() {
    setPending('export');
    setStatus(undefined);
    try {
      await exportArchive();
      setStatus({key: 'backup_exported'});
    } catch {
      setStatus({key: 'backup_export_error', error: true});
    } finally {
      setPending(undefined);
    }
  }

  async function inspect(file: File) {
    setPending('inspect');
    try {
      setPlan(await inspectArchive(file));
    } catch {
      setStatus({key: 'backup_invalid', error: true});
    } finally {
      setPending(undefined);
    }
  }

  async function restore() {
    if (!plan || pending) return;
    setPending('restore');
    try {
      await restoreArchive(plan);
      setStatus({key: 'backup_restored'});
    } catch (error) {
      const retryRestore = (error as {retryRestore?: () => Promise<void>})?.retryRestore;
      if (retryRestore) setRecover(() => retryRestore);
      setStatus({key: retryRestore ? 'backup_partial' : 'backup_failed', error: true});
    } finally {
      setPending(undefined);
      setPlan(undefined);
    }
  }

  async function retryRecovery() {
    if (!recover) return;
    setPending('recover');
    try {
      await recover();
      setRecover(undefined);
      setStatus({key: 'backup_recovered'});
    } catch {
      setStatus({key: 'backup_partial', error: true});
    } finally {
      setPending(undefined);
    }
  }

  return (
    <div className="backup-panel">
      <div className="page__buttons">
        <Button
          variant="primary"
          onClick={() => void runExport()}
          busy={pending === 'export'}
          disabled={Boolean(pending)}
        >
          {message('exportZip')}
        </Button>
        <Button
          ref={opener}
          onClick={() => fileInput.current?.click()}
          busy={pending === 'inspect'}
          disabled={Boolean(pending) || Boolean(recover)}
        >
          {message('importZip')}
        </Button>
        <input
          type="file"
          accept=".zip,application/zip"
          ref={fileInput}
          hidden
          aria-label={message('importZip')}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = '';
            if (file) {
              setStatus(undefined);
              void inspect(file);
            }
          }}
        />
      </div>
      {pending && <p role="status">{message('backup_wait')}</p>}
      {status && <p role={status.error ? 'alert' : 'status'}>{message(status.key)}</p>}
      {recover && (
        <Button busy={pending === 'recover'} onClick={() => void retryRecovery()}>
          {message('backup_retry_restore')}
        </Button>
      )}
      {plan && (
        <Dialog
          returnFocus={opener}
          aria-label={message('backup_review')}
          onClose={() => {
            if (!pending) setPlan(undefined);
          }}
        >
          <h2>{message('backup_review')}</h2>
          <p>{message('backup_replace_description')}</p>
          <ul>
            {(['local', 'sync'] as const).flatMap((area) =>
              Object.keys(plan[area]).map((key) => (
                <li key={`${area}/${key}`}>{message(`backup_entry_${key}`) || `${area}/${key}`}</li>
              )),
            )}
          </ul>
          {plan.skipped.length > 0 && (
            <details>
              <summary>{message('backup_skipped')}</summary>
              <ul>
                {plan.skipped.map((path) => (
                  <li key={path}>{path}</li>
                ))}
              </ul>
            </details>
          )}
          <div className="dialog__button_box">
            <Button
              autoFocus
              variant="quiet"
              disabled={Boolean(pending)}
              onClick={() => setPlan(undefined)}
            >
              {message('cancel')}
            </Button>
            <Button variant="primary" busy={pending === 'restore'} onClick={() => void restore()}>
              {message('backup_confirm')}
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
