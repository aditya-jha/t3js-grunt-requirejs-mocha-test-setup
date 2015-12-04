/**
   * Name: mapPolygonService
   * Description: used to draw polygons on map ie: to show boundary for locality etc
   * @author: [Shakib Mohd]
   * Date: Oct 09, 2015
**/

/** globals: [] */

define([], function(){
    Box.Application.addService('mapPolygonService', function(application) {
        'use strict';

            var factory = {};

            factory.Polygon = function(data, type) {
                this.data = data;
                this.type = type;
            };

            factory.Polygon.prototype.init = function(map) {
                var fillColor = this.type.fillColor || '#333',
                strokeColor = this.type.strokeColor || '#2691ec',
                strokeOpacity = this.type.strokeOpacity || 0.8,
                strokeWeight = this.type.strokeWeight || 1,
                fillOpacity = this.type.fillOpacity || 0.5;

                this.mapPolygon  = new google.maps.Polygon({
                    paths: google.maps.geometry.encoding.decodePath(this.data.encodedPolygon),
                    strokeColor,
                    strokeOpacity,
                    strokeWeight,
                    fillColor,
                    fillOpacity,
                });

                /*
                function fromLatLngToPoint(latLng, map) {
                    var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
                    var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
                    var scale = Math.pow(2, map.getZoom());
                    var worldPoint = map.getProjection().fromLatLngToPoint(latLng);

                    return new google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
                }

                google.maps.event.addListener(this.mapPolygon,'mouseover',function(e){
                    var screenPoint = fromLatLngToPoint(e.latLng, map);
                    application.broadcast('polygonMouseOver', this, e, screenPoint);
                    this.setOptions({fillOpacity : this.type.fillOpacity + 0.01});
                });
                google.maps.event.addListener(this.mapPolygon,'mouseout',function(e){
                    application.broadcast('polygonMouseOut', this, e);
                    this.setOptions({fillOpacity : this.type.fillOpacity});
                });
                google.maps.event.addListener(this.mapPolygon,'mousemove',function(e){
                    var screenPoint = fromLatLngToPoint(e.latLng, map);
                    application.broadcast('polygonMouseMove', this, e, screenPoint);
                });
                google.maps.event.addListener(this.mapPolygon,'click',function(e){
                    application.broadcast('polygonClick', this, e);
                });
                */
                this.mapPolygon.setMap(map);
            };

            factory.Polygon.prototype.destroy = function() {
                this.data = null;
                this.type = null;
                this.mapPolygon.setMap(null);
                this.mapPolygon = null;
            }

            return factory;

    });
});
