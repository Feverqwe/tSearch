"use strict";
define(function () {
    /**
     @license
     Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
     This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
     The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
     The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
     Code distributed by Google as part of the polymer project is also
     subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
     */
    function MakePromise(asap) {
        function Promise(fn) {
            if (typeof this !== 'object' || typeof fn !== 'function') throw new TypeError();
            this._state = null;
            this._value = null;
            this._deferreds = []

            doResolve(fn, resolve.bind(this), reject.bind(this));
        }

        function handle(deferred) {
            var me = this;
            if (this._state === null) {
                this._deferreds.push(deferred);
                return
            }
            asap(function () {
                var cb = me._state ? deferred.onFulfilled : deferred.onRejected
                if (typeof cb !== 'function') {
                    (me._state ? deferred.resolve : deferred.reject)(me._value);
                    return;
                }
                var ret;
                try {
                    ret = cb(me._value);
                }
                catch (e) {
                    deferred.reject(e);
                    return;
                }
                deferred.resolve(ret);
            })
        }

        function resolve(newValue) {
            try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
                if (newValue === this) throw new TypeError();
                if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
                    var then = newValue.then;
                    if (typeof then === 'function') {
                        doResolve(then.bind(newValue), resolve.bind(this), reject.bind(this));
                        return;
                    }
                }
                this._state = true;
                this._value = newValue;
                finale.call(this);
            } catch (e) {
                reject.call(this, e);
            }
        }

        function reject(newValue) {
            this._state = false;
            this._value = newValue;
            finale.call(this);
        }

        function finale() {
            for (var i = 0, len = this._deferreds.length; i < len; i++) {
                handle.call(this, this._deferreds[i]);
            }
            this._deferreds = null;
        }

        /**
         * Take a potentially misbehaving resolver function and make sure
         * onFulfilled and onRejected are only called once.
         *
         * Makes no guarantees about asynchrony.
         */
        function doResolve(fn, onFulfilled, onRejected) {
            var done = false;
            try {
                fn(function (value) {
                    if (done) return;
                    done = true;
                    onFulfilled(value);
                }, function (reason) {
                    if (done) return;
                    done = true;
                    onRejected(reason);
                })
            } catch (ex) {
                if (done) return;
                done = true;
                onRejected(ex);
            }
        }

        Promise.prototype['catch'] = function (onRejected) {
            return this.then(null, onRejected);
        };

        Promise.prototype.then = function (onFulfilled, onRejected) {
            var me = this;
            return new Promise(function (resolve, reject) {
                handle.call(me, {
                    onFulfilled: onFulfilled,
                    onRejected: onRejected,
                    resolve: resolve,
                    reject: reject
                });
            })
        };

        Promise.resolve = function (value) {
            if (value && typeof value === 'object' && value.constructor === Promise) {
                return value;
            }

            return new Promise(function (resolve) {
                resolve(value);
            });
        };

        Promise.reject = function (value) {
            return new Promise(function (resolve, reject) {
                reject(value);
            });
        };


        return Promise;
    }

    function WrapPromise(Promise) {
        /**
         @license
         Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
         This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
         The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
         The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
         Code distributed by Google as part of the polymer project is also
         subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
         */
        Promise.all = Promise.all || function () {
                var args = Array.prototype.slice.call(arguments.length === 1 && Array.isArray(arguments[0]) ? arguments[0] : arguments);

                return new Promise(function (resolve, reject) {
                    if (args.length === 0) return resolve([]);
                    var remaining = args.length;

                    function res(i, val) {
                        try {
                            if (val && (typeof val === 'object' || typeof val === 'function')) {
                                var then = val.then;
                                if (typeof then === 'function') {
                                    then.call(val, function (val) {
                                        res(i, val)
                                    }, reject);
                                    return;
                                }
                            }
                            args[i] = val;
                            if (--remaining === 0) {
                                resolve(args);
                            }
                        } catch (ex) {
                            reject(ex);
                        }
                    }

                    for (var i = 0; i < args.length; i++) {
                        res(i, args[i]);
                    }
                });
            };

        Promise.race = Promise.race || function (values) {
                // TODO(bradfordcsmith): To be consistent with the ECMAScript spec, this
                //     method should take any iterable, not just an array.
                var forcedArray = /** @type {!Array<!Thenable>} */ (values);
                return new Promise(function (resolve, reject) {
                    for (var i = 0, len = forcedArray.length; i < len; i++) {
                        forcedArray[i].then(resolve, reject);
                    }
                });
            };
    }

    var _Promise = null;
    if (typeof Promise === 'function') {
        _Promise = Promise;
    } else {
        _Promise = MakePromise(typeof setImmediate === 'function' ? setImmediate : function (fn) {setTimeout(fn, 0)});
        window.Promise = _Promise;
    }

    WrapPromise(_Promise);

    return _Promise;
});