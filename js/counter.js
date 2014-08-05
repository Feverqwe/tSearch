window.GoogleAnalyticsObject = 'ga';
var ga = window.ga = window.ga || function() {
    (window.ga.q = window.ga.q || []).push(arguments)
};
ga.l = 1 * new Date();

ga('create', 'UA-10717861-22', 'auto');
ga('set', 'forceSSL', true);
ga('set', 'checkProtocolTask', null);
ga('require', 'displayfeatures');
ga('send', 'pageview');

var counter = function() {
    var gas = document.createElement('script');
    gas.async = 1;
    gas.src = 'https://www.google-analytics.com/analytics.js';
    engine.ajax({
        type: 'HEAD',
        url: gas.src,
        success: function() {
            var pos = document.getElementsByTagName('script')[0];
            pos.parentNode.insertBefore(gas, pos);
        }
    });
};