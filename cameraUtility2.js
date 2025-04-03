(function () {
    'use strict';

    var globalThis = determineGlobalObject();
    polyfillSymbol();
    polyfillSymbolIterator();
    polyfillPromise();
    polyfillObjectAssign();

    function Camera(videoElement, config) {
        this.video = videoElement;
        this.frameTimestamp = 0;
        this.config = Object.assign({}, defaultCameraConfig, config);
    }

    var defaultCameraConfig = { width: 640, height: 480, deviceId: null };

    Camera.prototype.listAvailableCameras = function() {
        navigator.mediaDevices.getUserMedia({video: true})
            .then(function(stream) {
                // After getting permission, list the devices
                navigator.mediaDevices.enumerateDevices()
                    .then(function(devices) {
                        devices.forEach(function(device) {
                            if (device.kind === 'videoinput') {
                                console.log('Camera ID: ' + device.deviceId + ', Label: ' + device.label);
                            }
                        });
                        // Make sure to stop the stream after listing devices
                        stream.getTracks().forEach(track => track.stop());
                    });
            }).catch(function(error) {
                console.error('Error accessing camera: ' + error);
            });
    };

    Camera.prototype.start = function () {
        var camera = this;
        camera.listAvailableCameras(); // This will list cameras before starting
        return new Promise(function (resolve, reject) {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                alert("No navigator.mediaDevices.getUserMedia exists.");
                reject("Media devices not supported.");
            }

            var constraints = {
                video: {
                    width: camera.config.width,
                    height: camera.config.height,
                }
            };

            // Add deviceId to constraints if specified
            if (camera.config.deviceId) {
                constraints.video.deviceId = { exact: camera.config.deviceId };
            }

            navigator.mediaDevices.getUserMedia(constraints)
                .then(function (stream) {
                    camera.video.srcObject = stream;
                    camera.video.onloadedmetadata = function () {
                        camera.video.play();
                        requestAnimationFrame(function () { processFrame(camera); });
                    };
                    resolve();
                }).catch(function (error) {
                    var errorMessage = "Failed to acquire camera feed: " + error;
                    console.error(errorMessage);
                    alert(errorMessage);
                    reject(error);
                });
        });
    };

    function processFrame(camera) {
        if (!camera.video.paused && camera.video.currentTime !== camera.frameTimestamp) {
            camera.frameTimestamp = camera.video.currentTime;
            var onFramePromise = camera.config.onFrame && camera.config.onFrame();
            if (onFramePromise) {
                onFramePromise.then(function () {
                    requestAnimationFrame(function () { processFrame(camera); });
                });
            } else {
                requestAnimationFrame(function () { processFrame(camera); });
            }
        }
    }

    Camera.prototype.stop = function () {
        if (this.video.srcObject) {
            this.video.srcObject.getTracks().forEach(function (track) {
                track.stop();
            });
            this.video.srcObject = null;
        }
    };

    function determineGlobalObject() {
        var possibleGlobals = [
            typeof globalThis === 'object' && globalThis,
            typeof window === 'object' && window,
            typeof self === 'object' && self,
            typeof global === 'object' && global
        ];
        for (var i = 0; i < possibleGlobals.length; ++i) {
            var possibleGlobal = possibleGlobals[i];
            if (possibleGlobal && possibleGlobal.Math === Math) {
                return possibleGlobal;
            }
        }
        throw new Error("Cannot find global object");
    }

    function polyfillSymbol() {
        var Symbol = function Symbol(description) {
            if (this instanceof Symbol) throw new TypeError("Symbol is not a constructor");
            return createSymbol(description);
        };
        function createSymbol(description) {
            var uid = "jscomp_symbol_" + (Math.random() * 1e9 >>> 0) + "_" + (++symbolCounter);
            return { description: description, toString: function () { return uid; } };
        }
        var symbolCounter = 0;
        globalThis.Symbol = globalThis.Symbol || Symbol;
    }

    function polyfillSymbolIterator() {
        var SymbolIterator = globalThis.Symbol && globalThis.Symbol.iterator;
        if (!SymbolIterator) {
            SymbolIterator = globalThis.Symbol.iterator = globalThis.Symbol("Symbol.iterator");
            var iterables = ["Array", "Int8Array", "Uint8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array", "Int32Array", "Uint32Array", "Float32Array", "Float64Array"];
            iterables.forEach(function (type) {
                var Constructor = globalThis[type];
                if (typeof Constructor === 'function' && !Constructor.prototype[SymbolIterator]) {
                    Constructor.prototype[SymbolIterator] = function () { return createIterator(this); };
                }
            });
        }
    }

    function polyfillPromise() {
        // This function is a placeholder for the promise polyfill
    }

    function polyfillObjectAssign() {
        globalThis.Object.assign = globalThis.Object.assign || function (target) {
            for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i];
                if (source) {
                    for (var key in source) {
                        if (Object.prototype.hasOwnProperty.call(source, key)) {
                            target[key] = source[key];
                        }
                    }
                }
            }
            return target;
        };
    }

    globalThis.Camera = Camera;
}).call(this);
