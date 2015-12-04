module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON( 'package.json' ),
        mocha: {
            test: {
                src: ['tests/*.html'],
                options: {
                    log:true,
                    logErrors: true,
                }
            }
        },
        mocha_phantomjs: {
            all: ['tests/*.html'],
            options: {
                debug:true
            }
        },
        connect: {
            server: {
                options: {
                  port: 8000,
                  base: '.',
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-mocha-phantomjs');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.registerTask('test', ['connect', 'mocha_phantomjs']);
};
