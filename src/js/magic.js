/**
 * Created by Anton on 22.04.2015.
 */
var magic = {
    domCache: {
        top: document.querySelector('.top'),
        frame: document.querySelector('.frame'),
        container: document.querySelector('.container')
    },
    onResize: function() {
        "use strict";
        var topStyle = window.getComputedStyle(this.domCache.top);
        var topHeight = parseFloat(topStyle.getPropertyValue('height'));

        var bodyStyle = window.getComputedStyle(document.body);
        var bodyHeight = parseFloat(bodyStyle.getPropertyValue('height'));

        this.domCache.frame.style.height = Math.floor(bodyHeight - topHeight) + 'px';
    },
    once: function() {
        "use strict";
        var _this = this;
        for (var i = 0, node; node = document.body.childNodes[i]; i++) {
            if (node.nodeType === 3) {
                node.parentNode.removeChild(node);
            }
        }
        document.body.classList.remove('loading');
        window.addEventListener('resize', function() {
            _this.onResize();
        });
        _this.onResize();
    }
};

engine.init(function() {
    "use strict";
    magic.once();
});