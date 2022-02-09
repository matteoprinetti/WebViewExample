module.exports = function (grunt) {
    'use strict';
    grunt.loadNpmTasks('@sap/grunt-sapui5-bestpractice-build');
	grunt.config.merge({
        compatVersion: "1.56",
        deploy_mode: "html_repo"
    });    
    grunt.registerTask('default', [
        'lint',
        'clean',
        'build'
    ]);
};