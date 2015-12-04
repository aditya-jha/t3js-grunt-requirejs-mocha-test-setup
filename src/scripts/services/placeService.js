/**
 * @fileoverview
 * @author [Aditya Jha]
 */

/*global Box*/
define([], function() {
    Box.Application.addService('placeService', function(application) {

        var factory = {};
        var placeService, autocompleteService;

        factory.init = function(map) {
            placeService = new google.maps.places.PlacesService(map);
            autocompleteService = new google.maps.places.AutocompleteService();
        };

        factory.getSuggestions = function(location, radius, searchText, callback) {
            circle = new google.maps.Circle({
                center: location,
                radius: radius
            });
            autocompleteService.getPlacePredictions({
                input: searchText,
                componentRestrictions: {country:'in'},
                bounds: circle.getBounds()
            }, (results, status) => {
                if(status == 'OK') {
                    callback(results);
                } else {
                    callback();
                }
            });
        };

        factory.getPlaceDetail = function(placeId, callback) {
            placeService.getDetails({
                placeId:placeId
            }, (place, status) => {
                if(status === google.maps.places.PlacesServiceStatus.OK) {
                    if(callback) {
                        callback(place);
                    }
                } else {
                    console.log("invalid placeid");
                }
            });
        };

        factory.destroy = function() {
            placeService = null;
            autocompleteService = null;
        };

        return factory;
    });
});
