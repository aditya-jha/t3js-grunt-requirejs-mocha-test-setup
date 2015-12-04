/**
   * Name: nearByAmenityFactory
   * Description: nearByAmenityFactory
   * @author: [Aditya Jha]
   * Date: Oct 19, 2015
**/

/** globals: [] */
define([
    'services/apiService',
], function() {
    Box.Application.addService('nearByAmenityFactory', function(application) {
        var [factory, nearByAmenityData] = [{}, {}];
        var apiService = application.getService('ApiService');
        var amenities = [{
            name:'school',
            displayName:'School'
        }, {
            name:'restaurant',
            displayName:'Restaurant'
        }, {
            name:'hospital',
            displayName:'Hospital'
        }, {
            name:'shopping_mall',
            displayName:'Shopping Mall'
        }, {
            name:'cinema',
            displayName:'Cinema'
        }, {
            name:'atm',
            displayName:'ATM',
        }, {
            name:'night_life',
            displayName:'Night Life'
        }];

        factory.amenity = amenities;

        var _constructApiUrl = function(latitude, longitude, distance, start, rows) {
            var baseUrl = "apis/getAmenities?";
            var url = [baseUrl, 'latitude='+latitude, '&longitude='+longitude, '&distance='+distance, '&start='+start, '&rows='+rows];
            return url.join('');
        };

        var init = function(nearByAmenityData) {
            for(var i=0;i<amenities.length;i++) {
                if(!nearByAmenityData.hasOwnProperty(amenities[i].name)) {
                    nearByAmenityData[amenities[i].name] = [];
                }
            }
        };

        factory.fetchData = function(latitude, longitude, distance, start, rows) {
            var url = _constructApiUrl(latitude, longitude, distance, start, rows);
            apiService.get(url, true).then((response) => {
                application.broadcast('nearByAmenityDataRecieved', {
                    nearByAmenityData: response
                });
            }, (error) => {
                console.log(error);
            });
        };

        factory.distance = 3;
        return factory;
    });
})
