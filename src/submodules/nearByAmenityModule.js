/**
 * @fileoverview Module for the near by Amenity
 * @author [Aditya Jha]
 */

/*global Box*/
define([
    'text!modules/mapsModule/views/nearByAmenityModule.html',
    'modules/mapsModule/scripts/services/nearByAmenityFactory',
    'modules/mapsModule/submodules/mapMarkersEvents',
    'modules/mapsModule/scripts/services/markerFactory',
    'modules/mapsModule/scripts/services/mapFactory',
    'modules/mapsModule/scripts/services/mapDirection',
], function(template) {
    "use strict";
    Box.Application.addModule('nearByAmenityModule', function(context) {

        var map, nearByAmenityModule, $, doT, amenity, nearByAmenityFactory, mapFactory,
        nearByAmenityData = [], nearByAmenityDataMarkers = {}, position,
        templateData = [], markerFactory, mapDirection, listData, direction,
        selectedElement;
        var olay = {
            type:null,
            overlay:null
        };
        var rendererOptions = {
            hideRouteList: true,
            suppressMarkers: true,
            preserveViewport: true,
            suppressInfoWindows: true
        };

        var _initTemplateData = function() {
            for(var i=0;i<amenity.length;i++) {
                templateData.push({
                    name:amenity[i].name,
                    count:0,
                    displayName:amenity[i].displayName
                });
            }
        };

        var _updateTemplateData = function(data) {
            for(var i=0;i<templateData.length;i++) {
                if(data.hasOwnProperty(templateData[i].name)) {
                    templateData[i].count = data[templateData[i].name].length;
                }
            }
            _addModuleContainer(nearByAmenityModule);
        };

        var _removeOverlay = function() {
            olay.overlay.destroy();
            olay.type = null;
            olay.overlay = null;
        };

        var _drawNeighbourhoodMarkers = function(type, markers) {
            if(olay.type && olay.type === type) { // An overlay of same type already exists
                return;
            } else if(olay.type && olay.type !== type) { // An overlay of different type exists
                _removeOverlay();
            }

            if(!markers || !markers.length) {
                return;
            }
            mapFactory.action.markers.add(map, markers);
            olay.type = type;
            olay.overlay = new Overlay(markers, map);
            olay.overlay.setMap(map);

            mapFactory.action.bounds(map, markers, false, {latitude:position.lat,longitude:position.lng});
        };

        var _drawDirectionCallback = function(status, details){
            let selectionId = String(details.lat).replace('.', '') + '-' + String(details.lng).replace('.', '');
            let $selection = $('#'+selectionId).find('.waiting');
            if(status === 'OK' && !$selection.hasClass('completed')) {
                $selection.addClass('completed');
                $selection.html('<span class="dstnc_wrap"><i class="pt pt-icon-road"></i> ' + details.distance + '</span><span class="time_car_wrap"><i class="pt pt-icon-truck"></i> ' + details.duration + '</span>');
            }
        }

        var _drawDirection = function(marker) {
            let destination = {lat: marker.latitude, lng: marker.longitude};
            mapDirection.getDirection(position, destination, _drawDirectionCallback, rendererOptions);
            direction = true;
        };

        var _removeDirection = function() {
            if(direction) {
                mapDirection.removeDirection();
                direction = false;
            }
        };

        var _addNeighbourhoodMarkers = function(type, position, results) {
            let markerList = [];

            for(let i=0; i<results.length; i++) {
                let m = new markerFactory.marker(type, results[i]);
                (function(m){
                    m.mouseEnter(function(event){
                        $(m.div).find('.on-hov').css('display','block');
                        _drawDirection(m.data);
                    });
                    m.mouseOut(function() {
                        $(m.div).find('.on-hov').css('display','none');
                        _removeDirection();
                    });
                })(m);
                markerList.push(m);
            }

            nearByAmenityDataMarkers[type] = markerList;
            _drawNeighbourhoodMarkers(type,nearByAmenityDataMarkers[type]);
        };

        var _addModuleContainer = function(nearByAmenityModule) {
            if($(nearByAmenityModule).children('.mod-content')){
                $(nearByAmenityModule).children('.mod-content').remove();
            }

            let temFun = doT.template(template),
            htmlContent =  temFun({
                amenities:templateData
            });

            $(nearByAmenityModule).append(htmlContent);
        };

        var _getResults = function(data) {
            listData = [];
            data.sort(function(a,b) {
                if(a.geoDistance <= b.geoDistance) return -1;
                else return 1;
            });
            for(var i=0;i<data.length && i<5;i++) {
                listData.push(data[i]);
                listData[i].geoDistance = parseFloat(listData[i].geoDistance).toFixed(2);
                listData[i].geoDistance = listData[i].geoDistance.toString() + ' km';
            }
            return listData;
        };

        var _displaySelectedResult = function(data) {
            let index = parseInt(data.index),
            destination = {lat: listData[index].latitude, lng: listData[index].longitude};
            mapDirection.getDirection(position, destination, _drawDirectionCallback, rendererOptions);
        };

        var _removeSelectedClass = function(nearByAmenityModule) {
            if(selectedElement) {
                $(nearByAmenityModule).find('[data-type="'+ selectedElement +'"]').removeClass('selected');
                selectedElement = undefined;
            }
        };

        var onclick = function (event, element, elementType) {
            context.broadcast('nearByAmenityModuleClicked');
            for(var i=0;i<amenity.length;i++) {
                if(elementType === amenity[i].name && templateData[i].count && elementType !== selectedElement) {
                    _removeDirection();
                    // draw markers
                    _removeSelectedClass(nearByAmenityModule);
                    $(element).addClass('selected');
                    selectedElement = elementType;
                    _addNeighbourhoodMarkers(elementType, position, nearByAmenityData[elementType]);
                    context.broadcast('showUpdatedResults', {type:"nearByAmenity", data:_getResults(nearByAmenityData[elementType])});
                    break;
                }
            }
        };

        var onmessage = function(name, data) {
            if(name === 'initMapReferenceInnearByAmenityModule') {
                map = data;
                // mapFactory.action.center(map, {lat:position.lat(),lng:position.lng()});
                context.broadcast('nearByAmenityModuleInitiated');
                mapFactory.action.center(map, position);
                mapDirection.init();
                mapDirection.setMapRef(map);
            } else if(name === 'nearByAmenityDataRecieved') {
                nearByAmenityData = data.nearByAmenityData;
                _updateTemplateData(nearByAmenityData);
                var toClick = $(nearByAmenityModule).find('[data-type]');
                if(toClick.length > 0) {
                    $(toClick[0]).trigger('click');
                }
            } else if(name === 'removeAmenityModule') {
                if(olay.type) {
                    _removeOverlay();
                }
                _removeDirection();
                _removeSelectedClass(nearByAmenityModule);
            } else if(name === 'loadNearByAmenityModule') {
                nearByAmenityFactory.fetchData(position.lat, position.lng, nearByAmenityFactory.distance, 0, 2000);
                _addModuleContainer(nearByAmenityModule);
            } else if(name === 'displayDirection') {
                if(data.type === 'nearByAmenity') {
                    _displaySelectedResult(data);
                    direction = true;
                }
            }
        };

        return {
            messages: ['nearByAmenityDataRecieved', 'initMapReferenceInnearByAmenityModule', 'removeAmenityModule', 'loadNearByAmenityModule', 'displayDirection'],
            behaviors: [],
            onmessage,
            onclick,
            init() {
                nearByAmenityModule = context.getElement();
                nearByAmenityData = null;
                $ = context.getGlobal('jQuery');
                doT = context.getGlobal('doT');
                nearByAmenityFactory = context.getService('nearByAmenityFactory');
                markerFactory = context.getService('markerFactory');
                mapFactory = context.getService('mapFactory');
                mapDirection = context.getService('mapDirection');
                amenity = nearByAmenityFactory.amenity;
                _initTemplateData();
                position = {lat: parseFloat(nearByAmenityModule.dataset.lat), lng: parseFloat(nearByAmenityModule.dataset.lng)};
                context.broadcast('moduleLoaded', {'name':'nearByAmenityModule', 'id':nearByAmenityModule.id});
	            context.broadcast('mapSubmoduleLoaded', 'nearByAmenityModule');
                direction = false;
            },
            destroy() {
                nearByAmenityModule = null;
                $ = null;
                mapDirection.destroy();
            }
        }
    });
});
