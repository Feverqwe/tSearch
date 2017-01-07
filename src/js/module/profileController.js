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
        var load = function () {
            for (var key in profileIdProfileMap) {
                delete profileIdProfileMap[key];
            }
            var profiles = storage.profiles;
            if (profiles.length === 0) {
                profiles.push(ProfileManager.prototype.getDefaultProfile(profileIdProfileMap));
            }

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
            profiles.forEach(function (/**profile*/item) {
                profileIdProfileMap[item.id] = item;
            });

            self.setSelectOptions(profiles);

            var currentProfileId = storage.currentProfileId;
            if (!profileIdProfileMap[currentProfileId]) {
                storage.currentProfileId = profiles[0].id;
            }
        };

        ee.on('reloadProfiles', function () {
            load();
            self.select(activeProfile.id);
        });

        ee.on('selectProfileById', function (id) {
            self.select(id);
        });

        this.profile = activeProfile;
        this.profileIdProfileMap = profileIdProfileMap;
        this.select = function (id) {
            var profile = profileIdProfileMap[id];
            self.setSelectValue(storage.profiles, profile.id);
            if (activeProfile) {
                activeProfile.destroy();
            }
            activeProfile = new Profile(profile, resultFilter, self.getTrackerList(), ee, storage);
            self.profile = activeProfile;
        };
        this.setSelectOptions = function () {};
        this.setSelectValue = function () {};
        this.getTrackerList = function () {};
        this.load = load;
    };
    return ProfileController;
});