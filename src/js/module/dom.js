/**
 * Created by Anton on 01.01.2017.
 */
"use strict";
define(function () {
    var extraProperty = {
        text: 'textContent',
        data: function(el, obj) {
            for (var key in obj) {
                el.dataset[key] = obj[key];
            }
        },
        class: function(el, value) {
            if (!Array.isArray(value)) {
                value = [value];
            }
            for (var i = 0, len = value.length; i < len; i++) {
                el.classList.add(value[i]);
            }
        },
        attr: function (el, obj) {
            for (var key in obj) {
                el.setAttribute(key, obj[key]);
            }
        },
        style: function(el, obj) {
            for (var key in obj) {
                var value = obj[key];
                if (key === 'float') {
                    key = 'cssFloat';
                }
                el.style[key] = value;
            }
        },
        append: function(el, value) {
            if (!Array.isArray(value)) {
                value = [value];
            }
            for (var i = 0, len = value.length; i < len; i++) {
                var node = value[i];
                if (typeof node === 'string' && !node) {
                    continue;
                }
                if (typeof node !== 'object') {
                    node = document.createTextNode(node);
                }
                el.appendChild(node);
            }
        },
        on: function(el, eventList) {
            if (typeof eventList[0] !== 'object') {
                eventList = [eventList];
            }
            for (var i = 0, len = eventList.length; i < len; i++) {
                var args = eventList[i];
                if (Array.isArray(args)) {
                    el.addEventListener(args[0], args[1], args[2]);
                }
            }
        }
    };
    /**
     * @param {string|Element|DocumentFragment} element
     * @param [details]
     * @return {Element}
     */
    var create = function (element, details) {
        var el;
        if (typeof element !== 'object') {
            el = document.createElement(element);
        } else {
            el = element;
        }
        var extraProp, value;
        for (var prop in details) {
            value = details[prop];
            extraProp = extraProperty[prop];
            if (typeof extraProp === 'function') {
                extraProp(el, value);
            } else
            if (extraProp !== undefined) {
                el[extraProp] = value;
            } else {
                el[prop] = value;
            }
        }
        return el;
    };
    return {
        closestNode: function (parent, someChild) {
            if (parent === someChild) {
                return null;
            }
            if (!parent.contains(someChild)) {
                return null;
            }
            var parentNode;
            while (parentNode = someChild.parentNode) {
                if (parentNode !== parent) {
                    someChild = parentNode;
                } else {
                    return someChild;
                }
            }
        },
        closest: function (selector, someChild) {
            if (someChild.matches(selector)) {
                return someChild;
            }
            if (!someChild.matches(selector + ' ' + someChild.tagName)) {
                return null;
            }
            var parentNode;
            while (parentNode = someChild.parentNode) {
                if (!parentNode.matches(selector)) {
                    someChild = parentNode;
                } else {
                    return parentNode;
                }
            }
        },
        el: create
    };
});