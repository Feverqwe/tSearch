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
            var currentProfileId = storage.currentProfileId;
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

            if (!profileIdProfileMap[currentProfileId]) {
                currentProfileId = storage.currentProfileId = profiles[0].id;
            }

            self.setSelectValue(profiles, currentProfileId);

            self.select(currentProfileId);
        };

        ee.on('reloadProfiles', function () {
            load();
        });

        this.profileIdProfileMap = profileIdProfileMap;
        this.select = function (id) {
            if (activeProfile) {
                activeProfile.destroy();
            }
            activeProfile = new Profile(profileIdProfileMap[id], resultFilter, self.getTrackerList(), ee, storage);
        };
        this.setSelectOptions = function () {};
        this.setSelectValue = function () {};
        this.getTrackerList = function () {};
        this.load = load;
    };
    return ProfileController;
});