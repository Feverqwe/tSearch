var run = function () {
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
    .getService(Components.interfaces.nsIWindowMediator);
    var recentWindow = wm.getMostRecentWindow("navigator:browser");
    recentWindow.delayedOpenTab('chrome://TorrentsMultiSearch/content/index.html#s=', null, null, null, null);
}
var addButton = function () {
    var startButtonId =  "torrentsmultysearch-button";
    var navBarId = "nav-bar";
    var navBar = document.getElementById(navBarId);
    var currentSet = navBar.currentSet;
	
    // Append only if the button is not already there.
    var curSet = currentSet.split(",");
    if (curSet.indexOf(startButtonId) == -1)
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
}
window.addEventListener("load",addButton,false);