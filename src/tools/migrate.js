import storageGet from "./storageGet";
import getLogger from "./getLogger";
import getTrackerCodeMeta from "./getTrackerCodeMeta";
import storageSet from "./storageSet";

const logger = getLogger('migrate');

const migrateProfiles = function (storage, oldStorage) {
  const profiles = storage.profiles;
  const oldProfiles = oldStorage.profiles;
  if (Array.isArray(oldProfiles)) {
    oldProfiles.forEach((profile) => {
      profiles.push({
        id: `migrated-${profile.id}`,
        name: profile.name,
        trackers: profile.trackers,
      });
    });
  }
};

const migrateCustomTrackers = function (storage, oldStorage) {
  const trackers = storage.trackers;
  const oldTrackers = oldStorage.trackers;
  if (oldTrackers) {
    Object.entries(oldTrackers).forEach(([id, tracker]) => {
      try {
        trackers[id] = {
          id: id,
          meta: getTrackerCodeMeta(tracker.code),
          info: {
            lastUpdate: 0,
            disableAutoUpdate: false,
          },
          code: tracker.code,
        };
      } catch (err) {
        logger.error('Migrate tracker error', err);
      }
    });
  }
};

const migrate = function () {
  return storageGet({
    migrate3: false
  }).then((storage) => {
    if (storage.migrate3) return;

    return storageGet(null).then(function (oldStorage) {
      const syncStorage = {
        options: {},
        profiles: [],
      };
      const localStorage = {
        trackers: {},
        migrate3: true
      };
      if (oldStorage.hasOwnProperty('contextMenu')) {
        syncStorage.options.contextMenu = !!oldStorage.contextMenu;
      }
      if (oldStorage.hasOwnProperty('hidePeerRow')) {
        syncStorage.options.hidePeerRow = !!oldStorage.hidePeerRow;
      }
      if (oldStorage.hasOwnProperty('hideSeedRow')) {
        syncStorage.options.hideSeedRow = !!oldStorage.hideSeedRow;
      }
      if (oldStorage.hasOwnProperty('invertIcon')) {
        syncStorage.options.invertIcon = !!oldStorage.invertIcon;
      }
      if (oldStorage.hasOwnProperty('kpFolderId') && typeof oldStorage.kpFolderId === 'string') {
        syncStorage.options.kpFolderId = oldStorage.kpFolderId;
      }
      if (oldStorage.hasOwnProperty('disablePopup')) {
        syncStorage.options.disablePopup = !!oldStorage.disablePopup;
      }
      if (oldStorage.hasOwnProperty('categoryWordFilter')) {
        syncStorage.options.categoryWordFilter = !!oldStorage.categoryWordFilter;
      }
      if (oldStorage.hasOwnProperty('trackerListHeight') && typeof trackerListHeight === 'number') {
        syncStorage.options.trackerListHeight = oldStorage.trackerListHeight;
      }
      if (oldStorage.hasOwnProperty('useEnglishPosterName') && oldStorage.useEnglishPosterName) {
        syncStorage.options.originalPosterName = true;
      } else
      if (!/^ru-?/.test(chrome.i18n.getUILanguage())) {
        syncStorage.options.originalPosterName = true;
      }

      migrateCustomTrackers(localStorage, oldStorage);
      migrateProfiles(syncStorage, oldStorage);

      if (Object.keys(localStorage.trackers).length === 0) {
        delete localStorage.trackers;
      }
      if (Object.keys(syncStorage.options).length === 0) {
        delete syncStorage.options;
      }
      if (syncStorage.profiles.length === 0) {
        delete syncStorage.profiles;
      }

      return Promise.all([
        storageSet(localStorage, 'local'),
        storageSet(syncStorage, 'sync'),
      ]);
    });
  });
};

export default migrate;