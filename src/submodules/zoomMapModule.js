/**
 * @fileoverview Module to hold the zoomin(+) and zoomout(-) functionality on marketplace maps
 * @author [Aditya Jha]
 */

/*global Box*/
define([], function(){
    Box.Application.addModule('zoomMapModule', function(context) {

        'use strict';

        var zoomMapModule, $;

        var _addModuleContainer = function(zoomMapModule) {
            let htmlContent = '<div class="map-zoom-control"><button data-type="zoomin">+</button><button data-type="zoomout">-</button></div>';
            $(zoomMapModule).append(htmlContent);
        };

        var onclick = function(event, element, elementType) {
            if(elementType === 'zoomin') {
                context.broadcast('mapZoomin','');
            }
            if(elementType === 'zoomout') {
                context.broadcast('mapZoomout','');
            }
        };

        return {
            behaviors: [],
            messages: [],
            onclick,
            init() {
                zoomMapModule = context.getElement();
                $ = context.getGlobal('jQuery');
                _addModuleContainer(zoomMapModule);
            },
            destroy() {
                zoomMapModule = null;
                $ = null;
            }
        }
    });
});
