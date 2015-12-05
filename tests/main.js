"use strict";
require.config({
    //baseUrl: ".",
    paths: {
        chai: "/node_modules/chai/chai",
        t3: "/tests/t3-testing",
        services: "/src/scripts/services",
        behaviors: "/src/scripts/behaviors",
        submodules: "/src/scripts/submodules",
        views: "/src/scripts/views",
        es6: "/bower_components/requirejs-babel/es6",
        babel: "/bower_components/requirejs-babel/babel-5.8.22.min"
    }
});

require(['t3'], function(Box) {
    window.Box = Box;
    require([
        'mapsConfig'
    ], function() {
        if(typeof(mochaPhantomJS) !== "undefined") {
            mochaPhantomJS.run();
        } else {
            mocha.run();
        }
    });
});
