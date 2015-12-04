/**
 * @fileoverview Type-ahead for location search using google apis and default amenity to be shown on commute
 * @author [Aditya Jha]
 */

/*global Box*/

define([
    'text!modules/mapsModule/views/customDirection.html',
    'text!modules/mapsModule/views/customDirectionSuggestions.html',
    'modules/mapsModule/scripts/services/mapsConfig',
    'modules/mapsModule/scripts/services/mapDirection',
    'modules/mapsModule/scripts/services/placeService',
    'services/apiService',
    'services/localStorageService'
], function(template, suggestionsTemplete) {
    Box.Application.addModule('customDirectionModule', function(context) {
        'use strict';

        var doT, $, customDirectionModule, searchTextId, map, apiService,
            autoCompleteService, suggestionsInfo, position, cityId, mapsConfig,
            selectedResults, mapDirection, placeService, localStorageService,
            citySearchStorageKey;
        var suggestionsDivId = 'customDirectionModule_suggestions';
        var searchTextId = 'customDirectionModule_searchText';
        var rendererOptions = {
            hideRouteList: true,
            suppressMarkers: false,
            preserveViewport: false,
            suppressInfoWindows: false
        };

        var _attachEvents = function() {

            $('#'+searchTextId).focus(function() {
                $('#'+suggestionsDivId).show();
            });

            $('#'+searchTextId).blur(function(event) {
                var searchText = $('#'+searchTextId).val()
                if(searchText.length === 0) {
                    $('#'+suggestionsDivId).empty();
                } else {
                    $('#'+suggestionsDivId).hide();
                }
            });
        };

        var _renderTemplate = function(template, content) {
            var temFun = doT.template(template);
            var htmlContent = temFun(content);
            return htmlContent;
        };

        var _clearTemplate = function(customDirectionModule) {
            if($(customDirectionModule).children('.mod-content')){
                $(customDirectionModule).children('.mod-content').remove();
            }
        };

        var _addModuleContainer = function(customDirectionModule, show) {
            _clearTemplate(customDirectionModule);
            $(customDirectionModule).append(_renderTemplate(template, {show:show}));
        };

        var _displaySuggestions = function(results) {
            let ref = document.getElementById(suggestionsDivId);
            if(!ref) {
                console.log("no such div exists");
                return;
            }
            if(results) {
                suggestionsInfo = results;
                $(ref).html(_renderTemplate(suggestionsTemplete, {suggestions:suggestionsInfo}));
            } else {
                suggestionsInfo = ['No Results Found'];
                $(ref).html('No Results Found');
            }
        };

        var _checkIfAlreadyExists = function(result) {
            for(var i=0;i<selectedResults.length;i++) {
                if(selectedResults[i].placeId == result.placeId) {
                    return true;
                }
            }
            return false;
        };

        var _removeFirstResult = function() {
            if(selectedResults.length >= 5) {
                let removeCount = selectedResults.length - 4; // 4 because we want to remove 1 elementå
                selectedResults.splice(0,removeCount);
            }
        };

        var _updateSelectedResults = function(result) {
            if(_checkIfAlreadyExists(result)) {
                return;
            }
            _removeFirstResult();
            selectedResults.push(result);
            localStorageService.setItem(citySearchStorageKey, {results:selectedResults});
        };

        var _displaySelectedResult = function(data) {
            let index = parseInt(data.index);
            if(!data.source) {
                placeService.getPlaceDetail(selectedResults[index].placeId, _placeDetailFromId);
            } else {
                let destination = {lat: selectedResults[index].latitude, lng: selectedResults[index].longitude};
                mapDirection.getDirection(position, destination, null, rendererOptions);
            }
        };

        var _parseApiResponse = function(response) {
            let amenities = [];
            for(var i=0;i<response.data.amenities.length;i++) {
                if(response.data.amenities[i].localityAmenityTypes.name === 'airport') {
                    amenities.push({
                        description:response.data.amenities[i].name,
                        distance:parseFloat(mapsConfig.distanceBetweenPoints(position, {lat:response.data.amenities[i].latitude, lng:response.data.amenities[i].longitude})).toFixed(2).toString() + ' km',
                        source:"proptiger",
                        latitude:response.data.amenities[i].latitude,
                        longitude:response.data.amenities[i].longitude,
                        placeId:response.data.amenities[i].id
                    });
                }
            }
            return amenities;
        };

        var _populateSelectedResults = function(cityId) {
            selectedResults = null;
            selectedResults = localStorageService.getItem(citySearchStorageKey);
            if(selectedResults) {
                selectedResults = selectedResults.results;
            } else {
                apiService.get("apis/getAmenities/"+cityId, false).then((response) => {
                    selectedResults = _parseApiResponse(response);
                    localStorageService.setItem(citySearchStorageKey, {results:selectedResults});
                }, (error) => {
                    selectedResults = [];
                    console.log("could not log api data");
                });
            }
        };

        var _updateLatestResult = function(status, details) {
            if(status !== 'OK'){
                return;
            }

            var last = selectedResults.length - 1;
            if(last < 0) {
                return;
            }
            selectedResults[last].distance = details.distance;
            selectedResults[last].duration = details.duration;
            context.broadcast('showUpdatedResults', {data:selectedResults, type:'customDirection'});
        };

        var _placeDetailFromId = function(place) {
            let result = {
                destination: place.geometry.location,
                placeId: place.place_id,
                description: place.name,
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng(),
                distance: null,
                duration: null
            }
            _updateSelectedResults(result);
            let destination = {lat: result.destination.lat(), lng: result.destination.lng()};
            mapDirection.getDirection(position, destination, _updateLatestResult, rendererOptions);
        };

        var onkeyup = function(event, element, elementType) {
            if(elementType === 'searchText') {
                let searchText = element.value;
                if(searchText.length === 0) {
                    return;
                }
                let origin  = new google.maps.LatLng(position.lat, position.lng);
                placeService.getSuggestions(position, 2, searchText, _displaySuggestions);
            }
        };

        var onclick = function(event, element, elementType) {
            context.broadcast('customDirectionModuleClicked');
            if(!element) {
                return;
            }
            if(elementType === 'commute') {
                _addModuleContainer(customDirectionModule, true);
                _attachEvents();
                context.broadcast('showUpdatedResults', {data:selectedResults, type:'customDirection'});
            } else if(element.dataset.target && element.dataset.target === 'suggestion') {
                placeService.getPlaceDetail(elementType, _placeDetailFromId);
                $('#'+searchTextId).trigger('blur');
            }
        };

        var onmousedown = function(event, element, elementType) {
            if(element && element.dataset.target) {
                event.preventDefault();
                placeService.getPlaceDetail(elementType, _placeDetailFromId);
                $('#'+searchTextId).trigger('blur');
            }
        };

        var onmessage = function(name, data) {
            if(name === 'initMapReferenceIncustomDirectionModule') {
                map = data;
                mapDirection.init();
                placeService.init(map);
                mapDirection.setMapRef(map);
            } else if(name === 'removeCustomDirectionModule') {
                mapDirection.removeDirection();
                _addModuleContainer(customDirectionModule, false);
                $(customDirectionModule).find('[data-type="commute"]').removeClass('selected');
            } else if(name === 'loadCustomDirectionModule') {
                _addModuleContainer(customDirectionModule, true);
                context.broadcast('showUpdatedResults', {data:selectedResults, type:'customDirection'});
                _attachEvents();
            } else if(name === 'displayDirection') {
                if(data.type === 'customDirection') {
                    _displaySelectedResult(data);
                }
            }
        };

        return {
            behaviors: [],
            messages: ['initMapReferenceIncustomDirectionModule', 'removeCustomDirectionModule', 'loadCustomDirectionModule', 'displayDirection'],
            onmessage,
            onkeyup,
            onclick,
            onmousedown,
            init() {
                $ = context.getGlobal('jQuery');
                doT = context.getGlobal('doT');
                customDirectionModule = context.getElement();
                mapDirection = context.getService('mapDirection');
                placeService = context.getService('placeService');
                localStorageService = context.getService('localStorageService');
                position = {lat: parseFloat(customDirectionModule.dataset.lat), lng: parseFloat(customDirectionModule.dataset.lng)};
                cityId = parseInt(customDirectionModule.dataset.cityid);
                citySearchStorageKey = "city"+cityId.toString();
                apiService = context.getService('ApiService');
                mapsConfig = context.getService('mapsConfig');
                suggestionsInfo = [];
                _populateSelectedResults(cityId);
                context.broadcast('moduleLoaded', {'name':'customDirectionModule', 'id':customDirectionModule.id});
                context.broadcast('mapSubmoduleLoaded', 'customDirectionModule');
            },
            destroy() {
                $ = null;
                doT = null;
                placeService.destroy();
                mapDirection.destroy();
            }
        }
    });
});
