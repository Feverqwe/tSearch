window.GoogleAnalyticsObject = 'ga';
var ga = window.ga = window.ga || function() {
    var list = [];
    for (var i = 0, len = arguments.length; i < len; i++) {
        list.push(JSON.stringify(arguments[i]));
    }
    console.log(list.join(', '));
    (window.ga.q = window.ga.q || []).push(arguments);
};
ga.l = Date.now();

ga('create', 'UA-10717861-22', 'auto');
ga('set', 'forceSSL', true);
ga('set', 'checkProtocolTask', null);
ga('require', 'displayfeatures');
ga('send', 'pageview');

engine.initCounter = function() {
    "use strict";
    var gas = document.createElement('script');
    gas.async = 1;
    gas.src = 'https://www.google-analytics.com/analytics.js';
    var success = function() {
        var pos = document.getElementsByTagName('script')[0];
        // TODO: Fix me!
        // pos.parentNode.insertBefore(gas, pos);
    };
    engine.ajax({
        type: 'HEAD',
        url: gas.src,
        success: success
    });
};