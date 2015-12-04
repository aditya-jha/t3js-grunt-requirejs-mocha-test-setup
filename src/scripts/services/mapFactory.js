/**
   * Name: mapFactory
   * Description: Maps API
   * @author: [Shakib Mohd]
   * Date: Oct 05, 2015
**/

/** globals: google */

define([
	'modules/mapsModule/scripts/services/mapFilter',
	'modules/mapsModule/scripts/services/mapsConfig',
	'modules/mapsModule/scripts/services/mapOverlay'
], function(){
	Box.Application.addService('mapFactory', function(application) {
		'use strict';

		var factory = {};
		var mapFilter = application.getService('mapFilter');
		var mapsConfig = application.getService('mapsConfig');
		var mapOverlay = application.getService('mapOverlay');

		var _addScript = function(script) {
	        let s = document.createElement('script');
	        s.setAttribute( 'src', script.url);
	        //s.onload=callback;
	        document.body.appendChild(s);
	    }

	    // ===========================================
	    // Initialize the map and return a reference
	    // ===========================================
		factory.initialize = function(mapsConfig, elementId){
	        let state = mapsConfig.state,
	        mapStyles = mapsConfig.styles,
	        map,
	        options = {
	            zoom: state.zoom,
	            zoomControl: state.zoomControl || false,
	            zoomControlOptions: state.zoomControlOptions || undefined,
	            minZoom:   5,
	            panControl: false,
	            scrollwheel: false,
	            streetViewControl: false,
	            mapTypeControl: state.mapTypeControl || false,
	            mapTypeId:   google.maps.MapTypeId.ROADMAP,
	            scaleControl: state.scaleControl && true,
	            scaleControlOptions: {
	                position: google.maps.ControlPosition.TOP_LEFT
	            },
	            center: new google.maps.LatLng(state.center.lat, state.center.lng),
	            styles: mapStyles.defaultStyle
	        };

	        map = new google.maps.Map(document.getElementById(mapsConfig.mapModuleId), options);

	        if(!window.Overlay) {
	            window.Overlay = mapOverlay.getOverlayClass();
	        }

			if(!window.Filter) {
				// filter factory class for all shapes on the map
				window.Filter = mapFilter.getFilterClass();
			}

			return map;
	    }

	     // =========================================
	    // Include Google Maps JS asynchronously
	    // =========================================
	    factory.includeJS = function(callback) {
	        callback = typeof callback == 'function' ? callback : (function(){
	        });

	        if(!window.google) {
	            var url,
	                baseUrl = 'https://maps.googleapis.com/maps/api/js',
	                params = [],
	                config = {
	                    v: '3',
	                    region: 'in',
	                    language: 'en',
	                    libraries: ['places', 'geometry', 'drawing', 'visualization'],
	                    callback: 'googleCallback',
	                    key: 'AIzaSyBTrqqnHWF8jIxxi0XP7DHtkJAMOgGOw3E'
	                }, key, value;

	            for(key in config) {
	                if(config.hasOwnProperty(key)){
	                    value = config[key];
	                    value = (value instanceof Array)? value.join() : value;
	                    params.push(key+'='+value);
	                }
	            }
	            url = baseUrl+'?'+params.join('&');

	            window.googleCallback = callback;
	            _addScript({ url:url });
	        } else {
	            window.googleCallback = undefined;
	            callback();
	        }
	    };

	    factory.action = {
	    	zoom(map, zoom) {
	            zoom = parseInt(zoom)? parseInt(zoom):10;
	            map.setZoom(zoom);
	        },
	        setOptions(map, options){
	        	if(options){
	        		map.setOptions(options);
	        	}
	        },
	        zoomLevel(map, zoomMin, zoomMax) {
	            zoomMin = parseInt(zoomMin)? parseInt(zoomMin):10;
	            zoomMax = parseInt(zoomMax)? parseInt(zoomMax):22;
	            let options = {
	                minZoom: zoomMin,
	                maxZoom: zoomMax
	            };
	            map.setOptions(options);
	        },
	        center(map, center) {
	            var lat, lng, c;
	            if(center.lat && center.lng){
		            lat = parseFloat(center.lat)? parseFloat(center.lat):0;
		            lng = parseFloat(center.lng)? parseFloat(center.lng):0;
		            c = new google.maps.LatLng(lat, lng);
		            map.setCenter(c);
	            }
	        },
			getBounds(map) {
				return map.getBounds();
			},
        	markers: {
	            add(map, markers) {
	                if(!markers || !markers.length) {
	                    return;
	                }

	                for (var i=0; i<markers.length; i++) {
	                    markers[i].init(map);
	                }
	            }/*,
	            simple: function(map, dataList) {
	                var data;
	                for(var i=0; i<dataList.length; i++) {
	                    data = dataList[i];
	                    new google.maps.Marker({
	                        position: new google.maps.LatLng(data.latitude,data.longitude),
	                        map: map,
	                        title: data.title
	                    });
	                }
	            }*/
	        },
			polygons: {
	            add(map, polygons) {
	                if(!polygons || !polygons.length) {
	                    return;
	                }
	                for(var i = 0; i < polygons.length; i++) {
	                    polygons[i].init(map);
	                }
	            }
	        },
	        bounds(map, markerList, otherBounds, projectLatLng) {
	            var pos,
	                bounds = new google.maps.LatLngBounds();
	            if(otherBounds) {
	                bounds.extend(otherBounds.getCenter());
	                bounds.extend(otherBounds.getNorthEast());
	                bounds.extend(otherBounds.getSouthWest());
	            }
	            for (var i = 0; i < markerList.length; i++) {
	                if(markerList[i].data.latitude && markerList[i].data.longitude){
	                    pos = new google.maps.LatLng(markerList[i].data.latitude, markerList[i].data.longitude);
	                    bounds.extend(pos);
	                }
	            }

	            if(projectLatLng && projectLatLng.latitude && projectLatLng.longitude){
	                pos = new google.maps.LatLng(projectLatLng.latitude, projectLatLng.longitude);
	                bounds.extend(pos);
	            }

	            if(pos || otherBounds){
	                map.fitBounds(bounds);
	            }
	        },
			divBounds(map) {
				if(!map) {
					console.log("map undefined");
					return;
				}
				return map.getBounds();
			},
			fitBounds(map, latLngs) {
				// this function only accepts latlngs bounds object
				map.fitBounds(latLngs);
 			}
	    };

	    // =========================================
	    // Map Bindings
	    // =========================================
	    factory.bind = {
	        zoom(map, callback) {
	            google.maps.event.addListener(map, 'zoom_changed', () => {
	                callback(map.getZoom());
	            });
	        },
	        center(map, callback) {
	            google.maps.event.addListener(map, 'center_changed', () => {
	                let c = map.getCenter(),
	                    center = {
	                        lat: c.lat(),
	                        lng: c.lng()
	                    };
	                callback(center);
	            });
	        },
	        filter(filter, callback) {
	            filter.addListener('state_changed', () => {
	                let position = filter.get('position'),
	                    distance = filter.get('distance');
	                callback(position.lat(), position.lng(), distance);
	            });
	        },
			pan(map) {
				google.maps.event.addListener(map, 'dragend', () => {
					$('.map-btn-wrapper.top-control').css('display','table');
					$('#svgLegends > .svg-legend').addClass('svg-legend-moved');
	                application.broadcast('initSearchHere');
					application.broadcast('initDrawShapeHere');
	            });
			}
	    };

	    return factory;
	});
});
