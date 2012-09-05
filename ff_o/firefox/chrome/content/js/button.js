var run = function () {
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
    .getService(Components.interfaces.nsIWindowMediator);
    var recentWindow = wm.getMostRecentWindow("navigator:browser");
    recentWindow.delayedOpenTab('chrome://TorrentsMultiSearch/content/index.html#s=', null, null, null, null);
}