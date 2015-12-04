/**
 * @fileoverview Module for the
 * @author [Aditya Jha]
 */

/*global Box*/
define([
    'text!modules/mapsModule/views/communicatorModule.html'
], function(template) {
    Box.Application.addModule('communicatorModule', function(context) {

        var doT, $, communicatorModule;

        var _addModuleContainer = function(communicatorModule, content) {
            if($(communicatorModule).children('.mod-content')){
                $(communicatorModule).children('.mod-content').remove();
            }

            var temFun = doT.template(template);
            var htmlContent =  temFun(content);

            $(communicatorModule).append(htmlContent);
        };

        var onmessage = function(name, data) {
            if(name === 'loadCommunicatorModule') {
                _addModuleContainer(communicatorModule, {results:null,type:null});
            } else if(name === 'showUpdatedResults') {
                _addModuleContainer(communicatorModule, {results:data.data,type:data.type});
            }
        };

        var onclick = function(event, element, elementType) {
            let index = parseInt(elementType);
            if(element && element.dataset && element.dataset.target) {
                if(element.dataset.target === 'customDirection') {
                    context.broadcast('displayDirection', {
                        type:'customDirection',
                        index,
                        source:element.dataset.source
                    });
                } else if(element.dataset.target === 'nearByAmenity') {
                    context.broadcast('displayDirection', {
                        type:'nearByAmenity',
                        index:index,
                    });
                }
            }
        };

        return {
            messages: ['loadCommunicatorModule', 'showUpdatedResults'],
            onmessage,
            onclick,
            init() {
                doT = context.getGlobal('doT');
                $ = context.getGlobal('jQuery')
                communicatorModule = context.getElement();
                context.broadcast('moduleLoaded', {'name':'communicatorModule', 'id':communicatorModule.id});
                context.broadcast('mapSubmoduleLoaded', 'communicatorModule');
            },
            destroy() {

            }
        }
    });
});
