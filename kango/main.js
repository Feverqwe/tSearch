function tSearch_init() {
	kango.ui.browserButton.addEventListener(kango.ui.browserButton.event.Command, function() {
		kango.browser.tabs.create({url: document.URL.replace('background','build/index')});
	});
}
tSearch_init();