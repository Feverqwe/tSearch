import downloadBlob from '../tools/downloadBlob';
import storageGet from '../tools/storageGet';
import storageSet from '../tools/storageSet';

import type {BackupPlan} from './backupPlan';

export async function exportZip() {
  const [{createBackup}, local, sync] = await Promise.all([
    import('./backupPlan'),
    storageGet(null, 'local'),
    storageGet(null, 'sync'),
  ]);
  const blob = await createBackup({local, sync});
  const nowDate = new Date();
  const date = String(nowDate.getDate()).padStart(2, '0');
  const month = String(nowDate.getMonth() + 1).padStart(2, '0');
  const year = nowDate.getFullYear();
  downloadBlob(blob, `tms-backup-${year}-${month}-${date}.zip`);
}
export async function inspectBackup(file: File) {
  const {planBackup} = await import('./backupPlan');
  return planBackup(file);
}

export async function restoreBackup(plan: BackupPlan) {
  const {BackupWriteError, writeBackup} = await import('./backupPlan');
  return navigator.locks.request('tsearch:backup', async () => {
    try {
      await writeBackup(plan, {
        get: (area, keys) => storageGet(keys, area),
        set: (area, entries) => storageSet(entries, area),
        remove: (area, keys) => chrome.storage[area].remove(keys),
      });
    } catch (error) {
      if (error instanceof BackupWriteError && error.retryRestore) {
        const retry = error.retryRestore;
        throw new BackupWriteError(() => navigator.locks.request('tsearch:backup', retry));
      }
      throw error;
    }
  });
}
