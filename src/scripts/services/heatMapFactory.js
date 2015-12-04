/**
   * Description:heatmap factory functions and data
   * @author: [Aditya Jha]
   * Date: Oct 15, 2015
**/

/** globals: [] */
define([
    'services/apiService',
], function() {
    Box.Application.addService('heatMapFactory', function(application) {

        var heatMapData = {};
        var amenities = ['restaurant','school','shopping_mall','cinema','nightlife','pharmacies','atm'];
        var cityAmenities = ['livability','ppsqft','projects'];

        var apiService = application.getService('ApiService');
        var radiusInKm   = 10;
        var factory = {};

        var _constructApiUrl = function(latitude, longitude, distance, start, rows) {

            var radius = distance || 10;
            var baseUrl = "apis/getAmenities?";
            var url = [baseUrl, 'latitude='+latitude, '&longitude='+longitude, '&distance='+radius, '&start='+start, '&rows='+rows];
            return url.join('');
        };

        var init = function(heatMapData) {
            for(var i=0;i<amenities.length;i++) {
                if(!heatMapData.hasOwnProperty(amenities[i])) {
                    heatMapData[amenities[i]] = {
                        count: 0,
                        latlngs: []
                    }
                }
            }
        };

        var _parseHeatMapData = function(data) {
            heatMapData = {};
            init(heatMapData);

            for(var i=0;i<data.length;i++) {
                if(heatMapData.hasOwnProperty(data[i].localityAmenityTypes.name)) {
                    heatMapData[data[i].localityAmenityTypes.name].count += 1;
                    heatMapData[data[i].localityAmenityTypes.name].latlngs.push(new google.maps.LatLng(data[i].latitude, data[i].longitude));
                }
            }

            return heatMapData;
        };

        factory.heatMapData = {};

        factory.heatMap = {
            visible: false,
            type: null,
            radius: 100,
            opacity: 0.6,
            dissipating: false,
            amenities,
            cityAmenities
        };

        factory.fetchData = function(map) {
            let mapCenter  = map.getCenter();
            let url = _constructApiUrl(mapCenter.lat(), mapCenter.lng(), radiusInKm, 0, 1500);
            apiService.get(url, false).then((response) => {
                let keys = Object.keys(response);
                for(var i=0;i<keys.length;i++) {
                    if(response.hasOwnProperty(keys[i])) {
                        let latLngs = [];
                        let arr = response[keys[i]];
                        for(var j=0;j<arr.length;j++) {
                            latLngs.push(new google.maps.LatLng(arr[j].latitude, arr[j].longitude));
                        }
                        response[keys[i]] = latLngs;
                    }
                }
                application.broadcast('heatMapApiDataRecieved', response);
            }, (error) => {
                console.log(error);
            });
        }

        factory.renderHeatMap = {
			init(map, data) {
				let heatMap = new google.maps.visualization.HeatmapLayer({
    				data: data,
    				map: map
  				});
				return heatMap;
			},
			destroy(heatMap) {
				heatMap.setMap(null);
			}
		};

        return factory;
    });
});
