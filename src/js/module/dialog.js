define(function () {
    var Dialog = function () {
        var self = this;
        var prefix = 'dialog';
        var inputList = [];

        var getLayer = function () {
            var el = document.createElement('div');
            el.classList.add(prefix + '__layer');
            return el;
        };
        var getBody = function () {
            var el = document.createElement('div');
            el.classList.add(prefix + '__body');
            return el;
        };
        var closeEvent = function (e) {
            if (!layer.contains(e.target)) {
                self.destroy();
            }
        };

        var body = this.body = getBody();
        var layer = this.layer = getLayer();

        this.destroy = function () {
            document.removeEventListener('click', closeEvent, true);
            var parent = layer.parentNode;
            if (parent) {
                parent.removeChild(layer);
            }
        };
        this.show = function () {
            layer.appendChild(body);
            document.addEventListener('click', closeEvent, true);
            document.body.appendChild(layer);
        };

        this.addInput = function (input) {
            inputList.push(input);
            return input;
        };
        this.getValues = function () {
            var keyValue = {};
            inputList.forEach(function (input) {
                var value = input.value.trim();
                if (value) {
                    keyValue[input.name] = input.value;
                }
            });
            return keyValue;
        };
    };
    return Dialog;
});