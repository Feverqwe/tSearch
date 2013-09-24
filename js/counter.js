var google_analytics = parseInt(GetSettings('google_analytics') || 0);
if (!google_analytics) {
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-10717861-22']);
    _gaq.push(['_trackPageview']);
    (function() {
        var ga = document.createElement('script');
        ga.type = 'text/javascript';
        ga.async = true;
        ga.src = 'https://ssl.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(ga, s);
    })();
} else {
    var _gaq = function () {
        return {
            push : function (a) {
                return 1;
            }
        };
    }();
}