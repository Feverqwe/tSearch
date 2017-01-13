/**
 * Created by Anton on 12.01.2017.
 */
"use strict";
var utils = require('./utils');

window.GoogleAnalyticsObject = 'ga';
var ga = window.ga = window.ga || function() {
        (window.ga.q = window.ga.q || []).push(arguments);
    };

ga.l = Date.now();
ga('create', 'UA-10717861-22', 'auto');
ga('set', 'forceSSL', true);
ga('set', 'checkProtocolTask', null);
ga('set', 'appName', 'tms');
ga('set', 'appId', 'tmsV4');
ga('set', 'appVersion', chrome.runtime.getManifest().version);
ga('require', 'displayfeatures');
ga('send', 'pageview');

var exceptionTracker = function () {
    var ddBl = {};
    window.addEventListener('error', function(e) {
        var filename = e.filename;
        var message = e.message;

        if (!filename || !message || typeof filename !== 'string' || typeof message !== 'string') {
            return;
        }

        filename = filename.match(/\/([^\/]+)$/);
        filename = filename && filename[1];
        if (!filename) {
            return;
        }

        if (e.lineno) {
            filename += ':' + e.lineno;
        }

        var desc = [filename, message].join(' ');

        if (ddBl[desc]) {
            return;
        }
        ddBl[desc] = true;

        ga('send', 'exception', {
            exDescription: desc
        });
    });
};

var counter = function() {
    chrome.storage.local.get({
        doNotSendStatistics: false
    }, function (storage) {
        if (storage.doNotSendStatistics) return;

        var url = 'https://www.google-analytics.com/analytics.js';
        utils.request({
            type: 'HEAD',
            url: url
        }, function (err) {
            if (err) return;

            var gas = document.createElement('script');
            gas.src = url;
            document.head.appendChild(gas);

            exceptionTracker.init();
        });
    });
};

module.exports = counter;