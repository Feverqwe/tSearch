/**
 * Created by Anton on 22.04.2015.
 */
var magic = {
    domCache: {
        container: document.getElementById('container'),
        frame: document.getElementById('frame')
    },
    once: function() {
        "use strict";
        document.body.classList.remove('loading');
    }
};

engine.init(function() {
    "use strict";
    magic.once();
});