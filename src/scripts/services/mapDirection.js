/**
 * @fileoverview
 * @author [Aditya Jha]
 */

/*global Box*/
define([], function() {
    Box.Application.addService('mapDirection', function(application) {

        var factory = {};
        var map, directionService, directionDisplay;

        factory.init = function() {
            directionService = new google.maps.DirectionsService();
        };

        factory.getMapRef = function() {
            return map;
        };

        factory.setMapRef = function(mapRef) {
            map = mapRef;
        };

        factory.removeDirection = function() {
            if(directionDisplay) {
                directionDisplay.setMap(null);
                // directionDisplay = null;
            }
        };

        factory.getDirection = function(origin, destination, callback, rendererOptions) {
            factory.removeDirection();
            directionDisplay = new google.maps.DirectionsRenderer(rendererOptions);

            var request = {
                origin:new google.maps.LatLng(origin.lat, origin.lng),
                destination:new google.maps.LatLng(destination.lat, destination.lng),
                travelMode: google.maps.TravelMode.DRIVING
            };

            directionService.route(request, function(response, status) {
                if(status === google.maps.DirectionsStatus.OK) {
                    directionDisplay.setDirections(response);
                    directionDisplay.setMap(map);
                    if(callback) {
                        callback('OK', {
                            mode: 'DRIVING',
                            distance: response.routes[0].legs[0].distance.text,
                            duration: response.routes[0].legs[0].duration.text,
                            lat: destination.lat,
                            lng: destination.lng
                        });
                    }
                } else {
                    callback('ERROR', {msg: 'Error calculating direction'});
                }
            });
        };

        factory.destroy = function() {
            map = null;
            directionService = null;
            directionDisplay = null;
        };

        return factory;
    });
});
