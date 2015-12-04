/**
   * Name: mapModule
   * Description: Maps Module Logic
   * @author: [Shakib Mohd]
   * Date: Oct 05, 2015
**/

/** globals: [google, window, document] */
define([
    'text!modules/mapsModule/views/index.html',
    'modules/mapsModule/scripts/services/mapsConfig',
    'modules/mapsModule/scripts/services/mapFactory',
    'modules/mapsModule/scripts/services/mapPolygonService',
    'modules/mapsModule/submodules/mapMarkersEvents',
    'modules/mapsModule/submodules/zoomMapModule',
    'modules/mapsModule/scripts/services/markerFactory',
    'modules/mapsModule/scripts/behaviors/mapsBehavior',
    'services/apiService',
], function(template){
    "use strict";
    Box.Application.addModule('mapsModule', function(context) {

        var mapsModule, mapsConfig, mapFactory, markerFactory, mapPolygonService, map,
        boundaryPolygons, apiService, doT, mapsModuleRef;

        // waitForMap
        var _waitForMap = function(func){
            return function waitingForMap() {
                let [self, selfArguments] = [this, arguments];

                if(!map) {
                    $('.body_map').bind('map-loaded', function insideWaitingForMap() {
                       func.apply(self, selfArguments);
                    });
                } else {
                    func.apply(self, arguments);
                }
            };
        };

        var _addModuleContainer = function(mapsModule){
            if($(mapsModule).children('.mod-content')){
                $(mapsModule).children('.mod-content').remove();
            }
            var temFun = doT.template(template);
            var htmlContent =  temFun({mapModuleId: mapsConfig.mapModuleId});
            $(mapsModule).append(htmlContent);
            Box.Application.startAll($('#'+mapsConfig.mapModuleId+'-mandatory-submodules'));
        };


        // Zoom Level
        var _setZoomLevel = function(config) {
            if(!map) return;
            mapFactory.action.zoomLevel(map, config.minZoom, config.maxZoom);
        }
        _setZoomLevel = _waitForMap(_setZoomLevel);

        var _setMapCener = function(data){
             if(!map) return;
             mapFactory.action.center(map, {lat: data.latitude, lng: data.longitude});
        }
        _setMapCener = _waitForMap(_setMapCener);

        var _mapSubmoduleLoaded = function(data){
            if(!map) return;
            context.broadcast('initMapReferenceIn'+data, map); // broadcast for map's submodules
            switch(data){
                case 'mapSvgLegendsModule':
                    context.broadcast('showSvgLegends', true);
                    context.broadcast('addSvgOverlay', {'svgName': 'landusage', 'city': 'bangalore'});
                    context.broadcast('addSvgOverlay', {'svgName': 'roads', 'city': 'bangalore'});
                    context.broadcast('addSvgOverlay', {'svgName': 'train', 'city': 'bangalore'});
                    //context.broadcast('addSvgOverlay', {'svgName': 'drains_electric', 'city': 'bangalore'});
                    break;
            }
            return;
        }
        _mapSubmoduleLoaded = _waitForMap(_mapSubmoduleLoaded);

        /**
        * This function listens to messages from other modules and takes action accordingly.
        * @param {message} name,data The name of the custom event and additional data, if any.
        * @returns {void}
        */
        var onmessage = function(name, data) {
            if(name === 'mapZoomin') {
                let currZoom = map.getZoom();
                if(currZoom < mapsConfig.state.maxZoom) {
                    mapFactory.action.zoom(map, currZoom + 1);
                    if((currZoom + 1) === mapsConfig.state.maxZoom) {
                        // disable the zoom in functionality
                    }
                } else {
                    // ideally the zoom in button should be disabled
                }
            } else if(name === 'mapZoomout') {
                let currZoom = map.getZoom();
                if(currZoom > mapsConfig.state.minZoom) {
                    mapFactory.action.zoom(map, currZoom - 1);
                    if((currZoom - 1) === mapsConfig.state.minZoom) {
                        // disable the zoom out functionality
                    }
                } else {
                    // ideally zoomout button should be disabled
                }
            } else if(name === 'mapSetCenter'){
                _setMapCener(data);
            }else if(name === 'mapSubmoduleLoaded'){
                _mapSubmoduleLoaded(data);
            } else if(name === 'setZoomLevels') {
                _setZoomLevel(data);
            } else if(name === 'drawBoundaryPolygons') {
                _drawBoundaryPolygons(data); // data referes to polygonsList
            } else if(name === 'destroyBoundaryPolygons') {
                _destroyBoundaryPolygons();
            } else if(name === 'drawMarkers') {
                if(data.markers){
                    _drawMarkers(data.markers, data.markerType, data.markersFitFlag);
                }
            } else if(name === 'viewPortFitBound') {
                _fitBoundOnViewPort(data);
            }else if(name === 'updateMarkerShortlistStatus'){
                _updateMarkerShortlistStatus(data);
            }
        };

        var  _updateMarkerShortlistStatus = function(data){
            let selector = $('#'+data.selector);
            if(!selector) return;

            if(data.isShortlisted){
                selector.addClass('shortlisted');
            }else{
                selector.removeClass('shortlisted');
            }

        }
        _updateMarkerShortlistStatus = _waitForMap(_updateMarkerShortlistStatus);

        var _fitBoundOnViewPort = function(data) {
            let latitude = data['latitude'];
            let longitude = data['longitude'];

            latitude = latitude.split(',');
            longitude = longitude.split(',');

            if(latitude.length !== 2 && longitude.length !== 2) {
                console.log("this should not have occured");
                return;
            }

            let sw = new google.maps.LatLng(latitude[0], longitude[0]);
            let ne = new google.maps.LatLng(latitude[1], longitude[1]);
            let bounds = new google.maps.LatLngBounds(sw, ne);

            mapFactory.action.fitBounds(map, bounds);
        }

        function _latlng(lat, lng) {
            return new google.maps.LatLng(+lat, +lng);
        }

        var _coordinateToPolygon = function(){
            let polygonList = [], coordinates = [];
            let coordinates1 = [[77.3654681,28.5607979],[77.365454,28.560678],[77.3655439,28.5606709],[77.365606,28.5606669],[77.367154,28.560566],[77.367527,28.560539],[77.3676711,28.5605291],[77.3676811,28.5605281],[77.367739,28.560523],[77.367947,28.5605049],[77.368022,28.560498],[77.368277,28.5604729],[77.368417,28.560449],[77.3685731,28.560416],[77.3687031,28.560384],[77.368832,28.560352],[77.368961,28.5603151],[77.3689799,28.560309],[77.369138,28.560251],[77.3693079,28.560185],[77.369466,28.560113],[77.3696561,28.5600141],[77.3696801,28.560002],[77.369812,28.559921],[77.37002,28.559783],[77.3701729,28.559666],[77.3703741,28.559483],[77.370544,28.559311],[77.3705929,28.559257],[77.3706959,28.559115],[77.370871,28.558853],[77.3713821,28.55797],[77.371777,28.557288],[77.37199,28.556932],[77.3721581,28.5566501],[77.3722881,28.556432],[77.3724451,28.556177],[77.372749,28.5557811],[77.3732599,28.5552051],[77.3734239,28.555046],[77.37374,28.554741],[77.374188,28.554318],[77.3745311,28.5539961],[77.376246,28.555564],[77.37702,28.5562839],[77.377998,28.557503],[77.3785209,28.558702],[77.378772,28.559501],[77.379158,28.5606799],[77.3792491,28.561959],[77.379454,28.562638],[77.379615,28.562922],[77.379262,28.563398],[77.3792089,28.56347],[77.379134,28.563584],[77.379002,28.5637679],[77.378923,28.563884],[77.378871,28.563957],[77.378759,28.5640829],[77.378725,28.5641281],[77.3786679,28.564229],[77.3785519,28.564461],[77.378506,28.564524],[77.378362,28.564721],[77.3782531,28.5648871],[77.378232,28.5649439],[77.378217,28.565038],[77.3782059,28.5650949],[77.378149,28.5651901],[77.3781139,28.5652589],[77.3780689,28.565344],[77.377962,28.5655181],[77.377827,28.565752],[77.377694,28.5659559],[77.377526,28.566216],[77.3774251,28.5663811],[77.377365,28.5664859],[77.377103,28.5668561],[77.376872,28.5672049],[77.376459,28.567864],[77.376346,28.56806],[77.376237,28.5682171],[77.376066,28.568436],[77.3759239,28.568634],[77.375877,28.568697],[77.3757149,28.5689941],[77.3756089,28.5691839],[77.3755781,28.569235],[77.3755611,28.5692589],[77.3755259,28.569292],[77.375399,28.569516],[77.375303,28.56967],[77.375124,28.569956],[77.375053,28.570057],[77.3750379,28.570077],[77.374965,28.570213],[77.374923,28.570274],[77.3748329,28.5703969],[77.374587,28.5707529],[77.374503,28.570881],[77.3744789,28.570903],[77.3744459,28.570918],[77.3744189,28.570928],[77.3743671,28.57093],[77.3743199,28.570927],[77.374273,28.570925],[77.3742379,28.570925],[77.3741969,28.5709331],[77.374144,28.5709551],[77.37411,28.5709669],[77.374079,28.5709721],[77.374044,28.5709689],[77.373948,28.570935],[77.373811,28.5708861],[77.3733449,28.570669],[77.372737,28.570408],[77.371527,28.56982],[77.370954,28.5695411],[77.370618,28.56937],[77.3704529,28.569275],[77.370358,28.569214],[77.3703199,28.569187],[77.370246,28.5691329],[77.369577,28.568687],[77.369324,28.5685131],[77.3684879,28.5679389],[77.3680579,28.567566],[77.367619,28.567264],[77.3670839,28.5668961],[77.366574,28.566546],[77.366337,28.5663911],[77.365973,28.566154],[77.3654441,28.56581],[77.3650929,28.565598],[77.3650228,28.565556],[77.365067,28.565475],[77.3651649,28.5652639],[77.365201,28.5651799],[77.365279,28.5650009],[77.365292,28.564971],[77.365368,28.5647809],[77.3655021,28.564317],[77.365507,28.564294],[77.3655579,28.5640879],[77.3655641,28.564043],[77.3655841,28.563921],[77.365589,28.5638851],[77.365594,28.5638481],[77.3656159,28.5636839],[77.3656259,28.5635031],[77.3656291,28.5634561],[77.3656251,28.5633709],[77.3655949,28.5629339],[77.365593,28.5629],[77.3655518,28.562523],[77.3655471,28.562046],[77.365572,28.5616971],[77.3654681,28.5607979]];
            for(var i=0; i<coordinates1.length; i++){
                coordinates.push(_latlng(+coordinates1[i][1], +coordinates1[i][0]));
            }

            let encodedPolygon = google.maps.geometry.encoding.encodePath(coordinates);
            polygonList.push(new mapPolygonService.Polygon({encodedPolygon: encodedPolygon}, {}));

            return polygonList;
        };

        var _drawBoundaryPolygons = function(polygonsList) {
            if(!map) return;
            _destroyBoundaryPolygons();
            boundaryPolygons = polygonsList;
            mapFactory.action.polygons.add(map, boundaryPolygons);
        };
        _drawBoundaryPolygons = _waitForMap(_drawBoundaryPolygons);

        var _destroyBoundaryPolygons = function() {
            if(!map) return;
            for(var i = 0; boundaryPolygons && (i < boundaryPolygons.length); i++) {
                boundaryPolygons[i].destroy();
            }
            boundaryPolygons = [];
        };
        _destroyBoundaryPolygons = _waitForMap(_destroyBoundaryPolygons);

        var beforeInitialize = function(){
            //reset factory flags for drawing mode on loading of this directive
            mapsConfig.state.polygonFilter.polygonExist = false;
            mapsConfig.state.polygonFilter.visible = false;
            mapsConfig.state.polygonFilter.currentDrawingStatus = false;
        }

        var markers, curr, markerOverlay;
        var _addMarkersToMap = function(currMarkers, markersFitFlag) {
            if (!map) return;
            markers = currMarkers;
            curr = currMarkers;

            if(markerOverlay) {
                markerOverlay.destroy();
                markerOverlay = null;
            }

            // when there is no marker to draw
            if(!(curr && curr.length)) return;

            mapFactory.action.markers.add(map, curr);

            markerOverlay = new Overlay(curr, map);
            markerOverlay.setMap(map);

            if(markersFitFlag){
                mapFactory.action.bounds(map, curr, false);
            }
        }
        _addMarkersToMap = _waitForMap(_addMarkersToMap);


        var _drawMarkers = function(data, markerType, markersFitFlag){
            let markers = [], marker;
            for(var i=0; i<data.length; i++){
                marker = new markerFactory.marker(markerType, data[i]);
                markers.push(marker);
            }

            _addMarkersToMap(markers, markersFitFlag);
        }

        var _attachMouseWheelEvents = function(){
            mapsModuleRef.attr("tabindex","0");
            mapsModuleRef.off('focus').on('focus',function(){
                mapFactory.action.setOptions(map, {scrollwheel: true});
            });
            mapsModuleRef.off('blur').on('blur',function(){
                mapFactory.action.setOptions(map, {scrollwheel: false});
            });
        }

        var proceed = function(){
            context.broadcast('moduleLoaded', {'name': 'mapsModule', 'id': mapsModule.id});
            let elementId   =  mapsConfig.mapModuleId;
            map = mapFactory.initialize(mapsConfig, elementId);

            _attachMouseWheelEvents(); // attach event to solve scrolling zoom in/out issue

            mapFactory.bind.zoom(map, function(zoom) {
                mapsConfig.state.zoom = zoom;
                context.broadcast('zoomUpdated', zoom);
            });

            setTimeout(function(){
                // Trigger MAP LOAD*/
                $('.body_map').trigger('map-loaded');
            }, 0);

            /*var polygonList = _coordinateToPolygon();
            _drawBoundaryPolygons(polygonList);*/
        }

        return {
            behaviors: ['mapsBehavior'],
            messages: ['mapZoomin', 'mapZoomout', 'mapSetCenter', 'drawBoundaryPolygons', 'destroyBoundaryPolygons', 'drawMarkers', 'mapSubmoduleLoaded', 'viewPortFitBound', 'updateMarkerShortlistStatus'],
            onmessage,
            init() {

                // capture the reference when the module is started
                mapsModule = context.getElement();
                mapsModuleRef = $('#'+mapsModule.id);
                mapsConfig = context.getService('mapsConfig');
                mapFactory = context.getService('mapFactory');
                apiService = context.getService('ApiService');
                markerFactory = context.getService('markerFactory');
                mapPolygonService = context.getService('mapPolygonService');
                doT = context.getGlobal('doT');
                beforeInitialize();
                _addModuleContainer(mapsModule);

                mapFactory.includeJS(proceed);

                let dataset = mapsModule.dataset;
                if(dataset.maptype == 'property' && dataset.lat && dataset.lng){
                    context.broadcast('mapSetCenter', {latitude:dataset.lat, longitude:dataset.lng});
                    context.broadcast('drawMarkers', {markers:[{latitude:dataset.lat, longitude:dataset.lng}], markerType: 'property'});
                }
            },
            destroy(){
                if(window.google) {
                    if(map) {
                        google.maps.event.clearInstanceListeners(map);
                    }
                    google.maps.event.clearInstanceListeners(window);
                    google.maps.event.clearInstanceListeners(document);
                }
                map = null;
                ptMapsModule = null;
                moduleConfig = null;
                mapsModuleRef.off('focus');
                mapsModuleRef.off('blur');
                $('.body_map').unbind('map-loaded');
                boundaryPolygons = [];
                mapsModule = null;
            }
        };

    }); // end of Module
}); //end of define
