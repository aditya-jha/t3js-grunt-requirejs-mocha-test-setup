/**
 * @fileoverview Module for the heatmaps functionality
 * @author [Aditya Jha]
 */

/*global Box*/

define([
    'text!modules/mapsModule/views/heatMapModule.html',
    'modules/mapsModule/scripts/services/heatMapFactory',
], function(template) {
    Box.Application.addModule('heatMapModule', function(context) {

        'use strict';

        var map, heatMapModule, mapsConfig, amenities, cityAmenities, heatMapFactory, heatMapRef, $, doT;
        var heatMapUIElements = {
            showHeatMapOptions: false,
            cityLevelOptions: false
        };

        var heatMapTypes = [{id: 'heatMap_restaurant',  name: 'restaurant', icon: 'restaurant'},
                    {id: 'heatMap_school',  name: 'school',  icon: 'restaurant'},
                    {id: 'heatMap_shopping_mall',  name: 'shopping_mall',  icon: 'restaurant'},
                    {id: 'heatMap_cinema',  name: 'cinema',  icon: 'restaurant'},
                    {id: 'heatMap_nightlife',  name: 'nightlife',  icon: 'restaurant'},
                    {id: 'heatMap_pharmacies',  name: 'pharmacies',  icon: 'restaurant'},
                    {id: 'heatMap_atm',  name: 'atm',  icon: 'restaurant'}];

        var _addModuleContainer = function(heatMapModule) {
            if($(heatMapModule).children('.mod-content')){
                $(heatMapModule).children('.mod-content').remove();
            }

            let temFun = doT.template(template),
            htmlContent =  temFun({
                showHeatMapOptions: heatMapUIElements.showHeatMapOptions,
                showCityLevelOptions: heatMapUIElements.showCityLevelOptions,
                heatMapTypes: heatMapTypes
            });

            $(heatMapModule).append(htmlContent);
        };

        var _disableButtons = function() {
            for(var i=0;i<amenities.length;i++) {
                var id = "heatMap_" + amenities[i];
                document.getElementById(id).setAttribute('disabled',true);
            }
        };

        var _enableButtons = function() {
            let data = heatMapFactory.heatMapData;
            for(var i=0;i<amenities.length;i++) {
                let id = "heatMap_" + amenities[i];
                if(data[amenities[i]] && data[amenities[i]].length > 0 && document.getElementById(id)) {
                    document.getElementById(id).setAttribute('disabled',false);
                }
            }
        };

        var _showHeatMap = function(map, type) {
            let _heatMapRef = heatMapFactory.renderHeatMap.init(map, heatMapFactory.heatMapData[type]);
            heatMapFactory.heatMap.visible = true;
            heatMapFactory.heatMap.type = type;
            return _heatMapRef;
        };

        var _removeHeatMap = function(heatMapRef) {
            heatMapFactory.renderHeatMap.destroy(heatMapRef);
            heatMapRef = null;
            heatMapFactory.heatMap.visible = false;
            heatMapFactory.heatMap.type = null;
        };

        var onclick = function(event, element, elementType) {
            if(elementType === 'toggleHeatMap' || elementType === 'closeHeatMap') {
				heatMapUIElements.showHeatMapOptions =  elementType === 'closeHeatMap' ? true : heatMapUIElements.showHeatMapOptions;
                heatMapUIElements.showHeatMapOptions = !heatMapUIElements.showHeatMapOptions;
                heatMapUIElements.showCityLevelOptions = !heatMapUIElements.showCityLevelOptions;
                _addModuleContainer(heatMapModule);

                if(!heatMapUIElements.showHeatMapOptions) {
                    if(heatMapRef != null) {
                        _removeHeatMap(heatMapRef);
                    }
                } else {
                    heatMapFactory.fetchData(map);
                }

				context.broadcast('toggleHeatMapClicked', heatMapUIElements.showHeatMapOptions);

            } else {
                for(var i=0;i<amenities.length;i++) {
                    if(elementType == amenities[i]) {
                        $('.options > .heatmap-option').removeClass('active');
                        if(heatMapFactory.heatMap.type != null && heatMapFactory.heatMap.type != amenities[i]) {
                            _removeHeatMap(heatMapRef);
                        } else if(heatMapFactory.heatMap.type != null && heatMapFactory.heatMap.type == amenities[i]) {
                            _removeHeatMap(heatMapRef);
                            return;
                        }

                        var disabled = document.getElementById('heatMap_'+amenities[i]).getAttribute('disabled');

                        if(disabled == 'false'){
                            $(element).addClass('active');
                            heatMapRef = _showHeatMap(map, amenities[i]);
                        }
                    }
                }
            }
        };

        var onmessage = function(name, data) {
            if(name === 'initMapReferenceInheatMapModule') {
                map = data;
            } else if(name === 'heatMapApiDataRecieved') {
                heatMapFactory.heatMapData = data;
                _enableButtons(data);
            } else if(name === 'hideHeatMapModule') {
                if(heatMapFactory.heatMap.visible && heatMapFactory.heatMap.type != null) {
                    _removeHeatMap(heatMapRef);
                }
                $('#'+heatMapModule.id).hide();
            } else if(name === 'showHeatMapModule') {
                $('#'+heatMapModule.id).show();
            }
        };

        return {
            behaviors: [],
            messages: ['initMapReferenceInheatMapModule', 'heatMapApiDataRecieved', 'hideHeatMapModule', 'showHeatMapModule'],
            onmessage,
            onclick,
            init() {
                heatMapModule = context.getElement();
                $ = context.getGlobal('jQuery');
                doT = context.getGlobal('doT');
                mapsConfig = context.getService('mapsConfig');
                heatMapFactory = context.getService('heatMapFactory');
                amenities = heatMapFactory.heatMap.amenities;
                cityAmenities = heatMapFactory.heatMap.cityAmenities;
                _addModuleContainer(heatMapModule);
                heatMapRef = null;
                context.broadcast('moduleLoaded', {'name':'heatMapModule', 'id':heatMapModule.id});
	            context.broadcast('mapSubmoduleLoaded', 'heatMapModule');
            },
            destroy() {
                map = null;
                $ = null;
                heatMapRef = null;
                heatMapModule = null;
                mapsConfig = null;
                amenities = null;
                cityAmenities = null;
            }
            
        }
    });
});
