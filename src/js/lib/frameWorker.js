/**
 * Created by Anton on 04.01.2017.
 */
define(function () {
    var FrameWorker = function () {
        var self = this;
        var stack = [];
        var frame = null;
        var contentWindow = null;

        var load = function () {
            frame = document.createElement('iframe');
            frame.src = 'sandbox.html';
            frame.style.display = 'none';
            frame.onload = function () {
                contentWindow = frame.contentWindow;
                while (stack.length) {
                    self.postMessage(stack.shift());
                }
            };
            document.body.appendChild(frame);
        };

        this.postMessage = function (msg) {
            if (contentWindow) {
                contentWindow.postMessage(msg, '*');
            } else {
                stack.push(msg);
            }
        };

        var msgListener = function(event) {
            if (event.source === contentWindow) {
                if (self.onmessage) {
                    self.onmessage(event.data);
                }
            }
        };
        window.addEventListener("message", msgListener);

        this.onmessage = null;
        this.terminate = function () {
            if (frame) {
                frame.parentNode.removeChild(frame);
                frame = null;
            }
            window.removeEventListener("message", msgListener);
            self.onmessage = null;
        };

        load();
    };
    return FrameWorker;
});