/**
 * Created by Anton on 04.01.2017.
 */
"use strict";
define(function () {
    var FrameWorker = function (id) {
        var self = this;
        var stack = [];
        var frame = null;
        var contentWindow = null;

        var msgListener = function(event) {
            if (event.source === contentWindow) {
                if (self.onmessage) {
                    self.onmessage(event.data);
                }
            }
        };

        var load = function () {
            frame = document.createElement('iframe');
            frame.src = 'sandbox.html#id=' + id;
            frame.style.display = 'none';
            frame.onload = function () {
                contentWindow = frame.contentWindow;
                window.addEventListener("message", msgListener);
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
        this.onmessage = null;
        this.terminate = function () {
            if (frame && frame.parentNode) {
                frame.parentNode.removeChild(frame);
            }
            frame = null;
            window.removeEventListener("message", msgListener);
            self.onmessage = null;
        };

        load();
    };
    return FrameWorker;
});