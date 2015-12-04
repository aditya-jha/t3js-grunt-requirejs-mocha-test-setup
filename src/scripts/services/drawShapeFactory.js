/**
   * Name: drawShapeFactory
   * @author: [Shakib Mohd]
   * Date: Oct 15, 2015
**/

define([
	'modules/mapsModule/scripts/services/mapsConfig',
	'modules/mapsModule/scripts/services/simplifyPolygonPoints'
],	function(){
	Box.Application.addService('drawShapeFactory', function(application) {
		'use strict';

		var mapsConfig = application.getService('mapsConfig');
		var simplifyPolygonPoints = application.getService('simplifyPolygonPoints');

		var factory = {};


		var _toggleMapOptions = function(map, status){
        	status = status ? true : false;
         	map.setOptions({
            	draggable: status,
            	scrollwheel: status,
            	disableDoubleClickZoom: status
        	});
    	}

    	factory.polygonFilter = {
        	create(map, config) {
            	return Filter(map, config, 'arbitraryShape');
        	},
        	setVisibility(filter, visible) {
            	filter.set('visible', visible);
        	},
        	destroy(filter) {
            	if(filter){
                	filter.destroy();
            	}
        	}
    	}

		factory.pencilDrawing = {
        	// intializes map listeners to start free hand drawing
        	init(map, polygonFilter){
				

            	mapsConfig.state.polygonFilter.polygonExist = false;
				map.setOptions({draggableCursor:'url(/modules/mapsModule/images/draw-map.png), default'});

            	google.maps.event.addListener(map, 'mousedown', (mousedownEvent) => {

                    let polyline_obj = this.polyline_obj;

                	if(polyline_obj) {
                    	polyline_obj.set('visible', false);
                    	polyline_obj.setMap(null);
                    	polyline_obj = null;
                	}

					_toggleMapOptions(map, false);

                	polyline_obj = new google.maps.Polyline({
                        map,
                        strokeColor: '#2691ec',
                        strokeOpacity: 0.5,
                        strokeWeight: 2,
                        zIndex: 1,
                        clickable: false
                    });

                	google.maps.event.addListener(map, 'mousemove', (mousemoveEvent) => {
                    	polyline_obj.getPath().push(mousemoveEvent.latLng);
                    	this.polyline_obj = polyline_obj;
                	});


                	google.maps.event.addListener(map, 'mouseup', (mouseupEvent) => {
						google.maps.event.clearListeners(map, 'mousemove');

                    	let polygon_obj = this.currentPolygon;
						let path = polyline_obj.getPath();
                    	polyline_obj.set('visible', false);
                    	polyline_obj.setMap(null);


                    	if((path && path.length<3)){
                        	return;
                    	}

                    	map.setOptions({draggableCursor:'null'});

                    	let theArrayofLatLng = path.j;
                    	let ArrayforPolygontoUse= simplifyPolygonPoints(theArrayofLatLng,50);

                    	_toggleMapOptions(map, true);

                    	google.maps.event.clearListeners(map, 'mousedown');

                    	// remove previous polygon
                    	if(polygon_obj){
                        	this.removePolygon(map);
                    	}

                    	var polyOptions = {
                        	map: map,
                        	fillOpacity: 0,
                        	strokeColor: '#2691ec',
                        	strokeOpacity: 0.5,
                        	strokeWeight: 2,
                        	clickable: false,
                        	zIndex: 1,
                        	suppressUndo: true,
                        	path:ArrayforPolygontoUse,
                        	editable: true
                    	}


                    	// draw polygon
                    	let poly = new google.maps.Polygon(polyOptions);
                    	polygon_obj = poly;
                		application.broadcast('showPolygonFilter', true);
                    	poly.bindTo('visible', polygonFilter);

                    	this.setPolygonPaths(poly.getPath());
                    	this.currentPolygon = poly;

                        var self = this;
						google.maps.event.addListener(poly.getPath(), 'set_at', function(e) {
                        	self.setPolygonPaths(this);
                    	});

                    	google.maps.event.addListener(poly.getPath(), 'insert_at', function(eve) {
                        	self.setPolygonPaths(this);
                    	});

                    	google.maps.event.clearListeners(map, 'mouseup');
                	});
            	});

        	},
        	// holds current polygon reference to read/update/remove when needed
        	currentPolygon: null,
        	polyline_obj: null,
        	// handles broadcast for url update and filter update
        	setPolygonPaths(paths) {

            	let [radius, center, vertices] = [1, {}, paths];
            	let bounds = new google.maps.LatLngBounds();

            	vertices.forEach(function(xy,i){
                	bounds.extend(xy);
            	});

            	center = {'lat':bounds.getCenter().lat(), 'lng':bounds.getCenter().lng()};

            	paths.forEach(function(value, key){
            		let dist = mapsConfig.distanceBetweenPoints({'lat': center.lat, 'lng': center.lng}, {'lat':paths.getAt(key).lat(), 'lng':paths.getAt(key).lng()});
                	if(radius<dist){
                   		radius = dist;
                	}
            	});

            	let maxDistance = mapsConfig.state.polygonFilter.state.maxDistance;

            	if(radius > maxDistance){
                	// when polygon radius is greater than max radius in our mapConfig
                	application.broadcast('maxRadiusLimitExceeded');
                	return;
            	}

            	mapsConfig.state.polygonFilter.state.position = center;
            	mapsConfig.state.polygonFilter.state.distance = radius;

            	if(paths && paths.length){
                	// update filter when path change
                	application.broadcast('updatePolygonFilter', paths);
            	}

            	let encodedPath = google.maps.geometry.encoding.encodePath(paths);
            	setTimeout(function() {
                	//broadcast to update encodedPath in url
                	application.broadcast('setUrlPolygonPath', encodedPath);
            	}, 0);

            	return;
        	},
        	// removes current polygon and its listeners
        	removePolygon(map){
            	let polygonObject = this.currentPolygon;
            	setTimeout(function() {
                	//broadcast to set encodedPath in url
                	application.broadcast('setUrlPolygonPath', null);
            	}, 0);

            	this.currentPolygon = null;

            	if(polygonObject){
                	polygonObject.setMap(null);
                	google.maps.event.clearInstanceListeners(polygonObject);
                	this.currentPolygon = null;
            	}

            	google.maps.event.clearListeners(map, 'mousedown');
                _toggleMapOptions(map, true);
                map.setOptions({draggableCursor:'null'});
        	}
	    };

	    return factory;
	});
});
