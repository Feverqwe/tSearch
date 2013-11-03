var run = function() {
    var ifr = document.getElementById('myframe');
    var panel = document.getElementById('tms_popup');
    ifr.contentWindow.location.reload();
    ifr.style.height = "66px";
    panel.sizeTo(660, 66);
    panel.openPopup(document.getElementById('torrentsmultysearch-button'));
};
var addButton = function() {
    var startButtonId = "torrentsmultysearch-button";
    var navBarId = "nav-bar";
    var navBar = document.getElementById(navBarId);
    var currentSet = navBar.currentSet;

    // Append only if the button is not already there.
    var curSet = currentSet.split(",");
    if (curSet.indexOf(startButtonId) === -1)
    {
        navBar.insertItem(startButtonId);
        navBar.setAttribute("currentset", navBar.currentSet);
        document.persist("nav-bar", "currentset");
        try
        {
            // The current global scope is not browser.xul.
            top.BrowserToolboxCustomizeDone(true);
        }
        catch (e)
        {
        }
    }
};
var firstRun = function() {
    var prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch('extensions.TorrentsMultiSearch.storage.');
    var name = 'firstRunPref';
    var type = prefs.getPrefType(name);
    var val = undefined;
    if (type === prefs.PREF_STRING) {
        val = prefs.getCharPref(name);
    }
    if (val !== '1') {
        prefs.setCharPref(name, '1');
        window.addEventListener("load", addButton, false);
    }
};
firstRun();