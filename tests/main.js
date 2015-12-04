
require.config({
    //baseUrl: ".",
    paths: {
        chai: "../node_modules/chai/chai",
        t3: "t3-testing",
        services: "../src/scripts/services",
        behaviors: "../src/scripts/behaviors",
        submodules: "../src/scripts/submodules",
        views: "../src/scripts/views"
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
