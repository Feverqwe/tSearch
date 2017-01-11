/**
 * Created by Anton on 06.01.2017.
 */
"use strict";
define([
    './profile'
], function (Profile) {
    var ProfileController = function (storage, ee, ProfileManager, resultFilter) {
        var self = this;
        var profileIdProfileMap = {};
        var activeProfile = null;

        var refreshProfileIdMap = function () {
            for (var key in profileIdProfileMap) {
                delete profileIdProfileMap[key];
            }
            storage.profiles.forEach(function (/**profile*/item) {
                profileIdProfileMap[item.id] = item;
            });
        };

        var load = function () {
            var profiles = storage.profiles;
            if (profiles.length === 0) {
                profiles.push(ProfileManager.prototype.getDefaultProfile(self));
            }

            refreshProfileIdMap();

            /**
             * @typedef {Object} profileTracker
             * @property {string} id
             */

            /**
             * @typedef {Object} profile
             * @property {string} name
             * @property {number} id
             * @property {[profileTracker]} trackers
             */

            self.setSelectOptions(profiles);

            var currentProfileId = storage.currentProfileId;
            if (!profileIdProfileMap[currentProfileId]) {
                storage.currentProfileId = profiles[0].id;
            }
        };

        ee.on('selectProfileById', function (id) {
            if (!profileIdProfileMap[id]) {
                id = storage.currentProfileId;
            }
            self.select(id);
        });

        ee.on('profileRemoved', function (id) {
            if (activeProfile.id === id) {
                self.load();
                self.select(storage.currentProfileId, true);
            } else {
                refreshProfileIdMap();
                self.setSelectOptions(storage.profiles);
            }
        });
        ee.on('profileInsert', function (id) {
            refreshProfileIdMap();
            self.setSelectOptions(storage.profiles);
        });
        ee.on('profilesSortChange', function () {
            self.setSelectOptions(storage.profiles);
        });

        ee.on('profileFieldChange', function (id, changes) {
            if (activeProfile.id === id && changes.indexOf('name') !== -1) {
                self.setSelectOptions(storage.profiles);
                self.setSelectValue(storage.profiles, id);
            }
        });

        this.setSelectOptions = function () {};
        this.setSelectValue = function () {};
        this.setTrackerList = function () {};

        this.profile = activeProfile;
        this.getProfileById = function (id) {
            return profileIdProfileMap[id] || null;
        };
        this.getProfileId = function () {
            var id = 1;
            while (profileIdProfileMap[id]) {
                id++;
            }
            return id;
        };
        this.select = function (id, force) {
            var profile = profileIdProfileMap[id];
            if (force || !activeProfile || activeProfile.id !== profile.id) {
                self.setSelectValue(storage.profiles, profile.id);
                if (activeProfile) {
                    activeProfile.destroy();
                }
                activeProfile = new Profile(profile, resultFilter, self.setTrackerList, ee, storage);
                self.profile = activeProfile;
            }
        };
        this.load = load;
    };
    return ProfileController;
});