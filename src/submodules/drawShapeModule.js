/**
 * @fileoverview Module to hold the custom draw functionality on marketplace maps
 * @author [Aditya Jha]
 */

/*global Box*/

define([
    'text!modules/mapsModule/views/drawShapeModule.html',
    'modules/mapsModule/scripts/services/mapsConfig',
    'modules/mapsModule/scripts/services/drawShapeFactory',
], function(template) {
    Box.Application.addModule('drawShapeModule', function(context) {

        'use strict';

        var scope = {};
        var drawShapeModule, mapsConfig, drawShapeFactory, map, polygonFilter, $, doT;
        scope.drawActiveFlag = false;
        scope.showOption = true;
        scope.polygonExist = false;

        var _drawPolygon = function(encodePath) {
            let polygonPath = google.maps.geometry.encoding.decodePath(encodePath);
            mapsConfig.state.polygonFilter.polygonExist = true;
            mapsConfig.state.polygonFilter.currentDrawingStatus = true;
            scope.drawActiveFlag = true;
            scope.polygonExist = true;
            scope.showOption = true;

            context.broadcast('drawingModeSwitched', scope.drawActiveFlag);

            let polygon_obj = new google.maps.Polygon({
                map,
                fillOpacity: 0,
                strokeColor: '#2691ec',
                strokeOpacity: 0.5,
                strokeWeight: 2,
                clickable: false,
                zIndex: 1,
                suppressUndo: true,
                path: polygonPath,
                editable: true
            });

            context.broadcast('showPolygonFilter', true);
            polygon_obj.bindTo('visible', polygonFilter);

            drawShapeFactory.pencilDrawing.currentPolygon = polygon_obj;

            let paths = polygon_obj.getPaths();
            let n = paths.getLength();

            if(n) {
                drawShapeFactory.pencilDrawing.setPolygonPaths(polygon_obj.getPath());

                // make drawing mode in erase state
                for (var i = 0; i < n; i++) {
                    let path = paths.getAt(i);
                    google.maps.event.addListener(path, 'insert_at', function (e){
                        drawShapeFactory.pencilDrawing.setPolygonPaths(this);
                    });
                    google.maps.event.addListener(path, 'set_at', function (e){
                        drawShapeFactory.pencilDrawing.setPolygonPaths(this);
                    });
                }
            }
        };

        var _startDrawing = function() {
            drawShapeFactory.pencilDrawing.init(map, polygonFilter);
        };

        var _removeCurrentPolygonReference = function() {
            if (!map) return;
            let polygonObject = drawShapeFactory.pencilDrawing.currentPolygon;
            if(polygonObject){
                polygonObject.setMap(null);
                google.maps.event.clearInstanceListeners(polygonObject);
            }
            mapsConfig.state.polygonFilter.polygonExist = false;
            drawShapeFactory.pencilDrawing.currentPolygon = null;
        };

        var _addModuleContainer = function(drawShapeModule) {
            if($(drawShapeModule).children('.mod-content')){
                $(drawShapeModule).children('.mod-content').remove();
            }

            let temFun = doT.template(template),
            htmlContent =  temFun(scope);

            $(drawShapeModule).append(htmlContent);
        };

        var _activateRedraw = function() {
            context.broadcast('showPolygonFilter', false); // remove drawn polygon if any
            // start drawing || active drawing mode
            _startDrawing();
        };

        var _toggleDraw = function(){
            if(!scope.drawActiveFlag ) {
                // if drawingMode is false remove drawn polygon if any,
                context.broadcast('removePolygon');
                context.broadcast('removeCurrentPolygonReference');
                // remove polygon filter from map
                context.broadcast('showPolygonFilter', false);
                if(map){
                    map.setOptions({draggableCursor: null});
                }
            } else {
                // active drawing mode
                // start drawing
                _startDrawing();
            }
        }

        var onclick = function(event, element, elementType) {
            if(elementType === 'toggleDraw') {
                scope.drawActiveFlag = !scope.drawActiveFlag;
                mapsConfig.state.polygonFilter.currentDrawingStatus = scope.drawActiveFlag;
                context.broadcast('drawingModeSwitched', scope.drawActiveFlag);
                _toggleDraw();
                _addModuleContainer(drawShapeModule);
                //changeDrawButtonStatus(scope.drawActiveFlag);
                event.preventDefault();
                event.stopPropagation();
            }
        };

        var onmessage = function(name, data) {
            if(name === 'initMapReferenceIndrawShapeModule'){
                map = data; // where data refers to map
                polygonFilter =  drawShapeFactory.polygonFilter.create(map, mapsConfig.state.polygonFilter.state);

            }else if(name === 'showPolygonFilter') {
                let visibilityStatus = data ? true : false;
                mapsConfig.state.polygonFilter.visible = visibilityStatus;
                drawShapeFactory.polygonFilter.setVisibility(polygonFilter, visibilityStatus);
            }else if(name === 'updatePolygonFilter') {
                polygonFilter.updatePolygonFilter(data);
            }else if(name === 'removePolygon') {
                drawShapeFactory.pencilDrawing.removePolygon(map);
            }else if(name === 'removeCurrentPolygonReference') {
                _removeCurrentPolygonReference();
            }else if(name === 'polygonExistStatusChange') {
                scope.polygonExist = data;
                _addModuleContainer(drawShapeModule);
            }else if(name === 'maxRadiusLimitExceeded') {
                _activateRedraw();
            }else if(name === 'initDrawShapeHere') {
                _addModuleContainer(drawShapeModule);
            } else if(name === 'drawPolygonFromEncodedPath') {
                if(!map) {
                    console.log('map not');
                    return;
                }
                if(!drawShapeFactory.pencilDrawing.currentPolygon) {
                    _drawPolygon(data);
                }
            }
        };

        return {
            behaviors: [],
            messages: ['initMapReferenceIndrawShapeModule', 'showPolygonFilter', 'updatePolygonFilter', 'removePolygon', 'removeCurrentPolygonReference', 'maxRadiusLimitExceeded', 'polygonExistStatusChange', 'initDrawShapeHere', 'drawPolygonFromEncodedPath'],
            onmessage,
            onclick,
            init() {
                drawShapeModule = context.getElement();
                $ = context.getGlobal('jQuery');
                doT = context.getGlobal('doT');
                mapsConfig = context.getService('mapsConfig');
                drawShapeFactory = context.getService('drawShapeFactory');
                scope.polygonExist = mapsConfig.state.polygonFilter.polygonExist;
                drawShapeFactory.pencilDrawing.currentPolygon = null;
                context.broadcast('moduleLoaded', {'name':'drawShapeModule', 'id': drawShapeModule.id});
                context.broadcast('mapSubmoduleLoaded', 'drawShapeModule');
            },
            destroy() {
                $ = null;
                drawShapeModule = null;
                mapsConfig = null;
                drawShapeFactory = null;
                map = null;
            }
        }
    });
});
