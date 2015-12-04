/**
 * @fileoverview Service to hold the filter info
 * @author [Aditya Jha]
 */

/*global Box*/

define([], function() {
    Box.Application.addService('mapFilter', function(application) {

        var mapFilter = {};

        function _latlng(lat, lng) {
            return new google.maps.LatLng(lat, lng);
        }

        // Box containing India
        function _indiaBoxPoints() {
            return [
                _latlng(5, 65),
                _latlng(40, 65),
                _latlng(40, 100),
                _latlng(5, 100)
            ];
        }

        /* Function _polygonPoints
         * Description: Returns a list of google.maps.LatLng objects representing a polygon.
         * @return     ~ { plot: Array(google.maps.LatLng), bounds: LatLngBounds }
         */
        function _polygonPoints(polygonPath){
            let polygon = {
                plot: [],
                bounds: new google.maps.LatLngBounds()
            };

            if(polygonPath && polygonPath.length){
                polygon.plot = polygonPath;
                let vertices = polygonPath;
                let bounds = new google.maps.LatLngBounds();

                vertices.forEach(function(xy,i){
                    bounds.extend(xy);
                });
                polygon.bounds = bounds;
            }

            return polygon;
        }

        // class to create Arbitrary Shape Filter
        function _CreateArbitraryShapeFilter() {
            function ArbitraryShape(map, state, position) {
                let polygonPlot = _polygonPoints([]);
                let self = this;

                this.bounds = polygonPlot.bounds;
                this.plot = polygonPlot.plot;
                this.set('visible', false);

                let boxPoints = _indiaBoxPoints(),
                    pathsArray = [boxPoints, self.plot],
                    // Plot polygon
                    polygon = new google.maps.Polygon({
                        map: map,
                        paths: pathsArray,
                        fillColor: '#fff',
                        fillOpacity: 0.45,
                        strokeWeight: 0,
                        strokePosition: google.maps.StrokePosition.OUTSIDE
                    });

                polygon.bindTo('visible', self);

                this.updatePolygonFilter = function(shapeObject_point) {
                    var polygonPlot = _polygonPoints(shapeObject_point);
                    self.bounds = polygonPlot.bounds;
                    self.plot   = polygonPlot.plot;

                    shapeObject_point = shapeObject_point && shapeObject_point.length ? shapeObject_point : [];
                    pathsArray[1] = shapeObject_point;
                    polygon.setPaths(pathsArray);
                    map.fitBounds(self.bounds);
                }

                self.destroy = function() {
                    google.maps.event.clearInstanceListeners(polygon);
                    polygon.setMap(null);
                    this.mapPolygon = null;
                }
            }
            ArbitraryShape.prototype = new google.maps.MVCObject();
            return ArbitraryShape;
        }

        // Factory class to create filter in map
        //@return a function to create any type of filter on map based on parameter
        mapFilter.getFilterClass = function() {
            function filterClass(map, state, shapeType) {
                let shapeObject;
                let defaultPosition = (state && state.position && state.position.lat && state.position.lng)? _latlng(state.position.lat, state.position.lng):map.getCenter();

                if(shapeType === 'arbitraryShape') {
                    shapeObject = _CreateArbitraryShapeFilter();
                    shapeObject = new shapeObject(map, state, defaultPosition);
                }

                return shapeObject;
            }
            // to access googlemaps mvc functions in the class
            filterClass.prototype = new google.maps.MVCObject();
            return filterClass;
        }

        return mapFilter;
    });
});
