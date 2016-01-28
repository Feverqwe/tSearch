window.GoogleAnalyticsObject = 'ga';
var ga = window.ga = window.ga || function() {
    (window.ga.q = window.ga.q || []).push(arguments);
};

ga.l = Date.now();
ga('create', 'UA-10717861-22', 'auto');
ga('set', 'forceSSL', true);
ga('set', 'checkProtocolTask', null);
ga('set', 'appName', 'tms');
ga('set', 'appId', '{appId}');
ga('set', 'appVersion', '{appVersion}');
ga('require', 'displayfeatures');
ga('send', 'pageview');

engine.exceptionTracker = {
    ddBl: {},
    onError: function(e) {
        "use strict";
        var _this = engine.exceptionTracker;

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

        if (_this.ddBl[desc]) {
            return;
        }
        _this.ddBl[desc] = true;

        ga('send', 'exception', {
            exDescription: desc
        });
    },
    init: function() {
        "use strict";
        window.addEventListener('error', this.onError);
    }
};

engine.initCounter = function() {
    "use strict";
    var gas = document.createElement('script');
    gas.async = 1;
    gas.src = 'https://www.google-analytics.com/analytics.js';
    var success = function() {
        var firstScript = document.getElementsByTagName('script')[0];
        firstScript.parentNode.insertBefore(gas, firstScript);

        engine.exceptionTracker.init();
    };
    if (mono.isWebApp) {
        return success();
    }
    mono.ajax({
        type: 'HEAD',
        url: gas.src,
        success: success
    });
};