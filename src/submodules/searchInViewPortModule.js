/**
 * @fileoverview Module to hold the custom draw functionality on marketplace maps
 * @author [Aditya Jha]
 */

/*global Box*/

define([
    'text!modules/mapsModule/views/searchInViewPortModule.html',
    'modules/mapsModule/scripts/services/mapFactory',
    'services/urlService'
], function(template) {
    Box.Application.addModule('searchInViewPortModule', function(context) {

        'use strict';

        var map, searchInViewPortModule, divBounds, mapFactory, $, doT, urlService;

        var _updateUrlForSearch = function() {
            divBounds = mapFactory.action.getBounds(map);
            let lat = divBounds.getSouthWest().lat().toFixed(5) + ',' + divBounds.getNorthEast().lat().toFixed(5);
            let lng = divBounds.getSouthWest().lng().toFixed(5) + ',' + divBounds.getNorthEast().lng().toFixed(5);
            let urlParam = {
                latitude: lat,
                longitude: lng
            };
            let newUrl = urlService.changeMultipleUrlParam(urlParam, null, true);
            urlService.ajaxyUrlChange(newUrl, true);
        };

        var _addModuleContainer = function(searchInViewPortModule) {
            if($(searchInViewPortModule).children('.mod-content')){
                $(searchInViewPortModule).children('.mod-content').remove();
            }

            let temFun = doT.template(template),
            htmlContent =  temFun();

            $(searchInViewPortModule).append(htmlContent);
        };

        var onclick = function(event, element, elementType) {
            if(elementType === 'searchHere') {
                _updateUrlForSearch();
            }
        };

        var onmessage = function(name, data) {
            if(name === 'initMapReferenceInsearchInViewPortModule') {
                map = data;
                mapFactory.bind.pan(map);
            } else if(name === 'initSearchHere') {
                _addModuleContainer(searchInViewPortModule);
            } else if(name === 'hideSearchInViewPortModule') {
                $('#'+searchInViewPortModule.id).hide();
            } else if(name === 'showSearchInViewPortModule') {
                $('#'+searchInViewPortModule.id).show();
            }
        };

        return {
            messages: ['initMapReferenceInsearchInViewPortModule', 'initSearchHere', 'hideSearchInViewPortModule', 'showSearchInViewPortModule'],
            behaviors: [],
            onmessage,
            onclick,
            init() {
                searchInViewPortModule = context.getElement();
                mapFactory = context.getService('mapFactory');
                urlService = context.getService('URLService');
                $ = context.getGlobal('jQuery');
                doT = context.getGlobal('doT');
                //_addModuleContainer(searchInViewPortModule);
                context.broadcast('moduleLoaded', {'name':'searchInViewPortModule', 'id':searchInViewPortModule.id});
	            context.broadcast('mapSubmoduleLoaded', 'searchInViewPortModule');
            },
            destroy() {
                searchInViewPortModule = null;
                $ = null;
                divBounds = null;
                mapFactory = null;
            }
        }
    });
});
