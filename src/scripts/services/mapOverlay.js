/**
   * Name: mapOverlay
   * Description: Map overlay used to draw markers on map
   * @author: [Shakib Mohd]
   * Date: OCT 12, 2015
**/



define([], function(){
    Box.Application.addService('mapOverlay', function(application) {
        'use strict';

        var $ = application.getGlobal('jQuery');
        var factory = {};

        factory.getOverlayClass = function() {


            // Creating document fragment to hold all markers html
            let docfrag;

            // Contructor
            let overlay = function(markers, map) {

                let self   = this;
                docfrag = document.createDocumentFragment();
                // Private properties
                this._map = map;
                this._markers = markers;
                // Setting properties
                this.map = map? map:null;
                this.shift = {x : 6, y: 0}; // Shift correction

                for(var i = 0; i < this._markers.length; i++) {
                    let m = this._markers[i];
                    m.markerEvents = [];

                    // Draw overlay only for the mapped items.
                    if (!_isItemMapped(m.data)) {
                        continue;
                    }

                    m.position = new google.maps.LatLng(m.data.latitude, m.data.longitude);
                    var div = document.createElement('div');
                    div.style.borderStyle = 'none';
                    div.style.borderWidth = '0px';
                    div.style.position = 'absolute';
                    m.div = div;
                    var el = $(div);
                    el.append(m.builder.build(m.data));

                    docfrag.appendChild(div);
                }
                this.div =  docfrag;
            };



            var _isItemMapped = function (item) {
                if (item && item.latitude && item.longitude) {
                    return true;
                }
                return false;
            };


            // Inherit from google OverlayView
            overlay.prototype = new google.maps.OverlayView();

            // Update height
            overlay.prototype.updateHeight = function(m) {
                m.divHeight = $(m.div).height();
            };
            // Attach events
            overlay.prototype.attachEvents = function(m) {
                var self = this;
                if(m.markerEvents.length === 0) {
                    var mouseenter, mouseout, click;
                    // HOVER Event
                    mouseenter = google.maps.event.addDomListener(m.div, 'mouseover', () => {
                        m.mouseEnter(); // Fire mouseEnter
                    });
                    mouseout = google.maps.event.addDomListener(m.div, 'mouseout', () => {
                        m.mouseOut(); // Fire mouseOut
                    });
                    m.markerEvents.push(mouseenter);
                    m.markerEvents.push(mouseout);
                    click = google.maps.event.addDomListener(m.div, 'click', () => {
                        m.click();
                    });
                    m.markerEvents.push(click);
                }
            };
           
            // Detach from pane
            overlay.prototype.detachFromPane = function() {
                this.div = $(this.div).detach()[0];
            };
            // Attach to pane
            overlay.prototype.attachToPane = function() {
                let panes = this.getPanes();
                panes.overlayMouseTarget.appendChild(this.div);
            };
            // Remove events
            overlay.prototype.removeEvents = function() {
                    let i, len , m,
                      removeGoogleListener = function(idx, evnt) {
                        google.maps.event.removeListener(evnt);
                    };
                for(i = 0, len = this._markers.length; i < len; i++){
                    m = this._markers[i];
                    $.each(m.markerEvents, removeGoogleListener);
                    m.markerEvents = [];
               }
            };
            // Destroy
            overlay.prototype.destroy = function() {
                this.setMap(null);
                this.removeEvents();
                this.detachFromPane(); 
                this.map = undefined;
                this._map = undefined;
                this._markers = [];
           };

            // ================ Override methods ===============
            // `onAdd` : Called when map is set (i.e. show)
            overlay.prototype.onAdd = function(explicitCall) {

                var i, len, m;
                for(i = 0, len = this._markers.length; i < len; i++){
                    m = this._markers[i];
                    // Draw overlay only for the mapped items.
                    if (!_isItemMapped(m.data)) {
                        continue;
                    }
                    this.attachEvents(m);
                }

                //application.broadcast('mapMarkerAdd', {data: 'add'});
                this.attachToPane();
            };

            // `draw` : Called after onAdd to plot overlay on map
            overlay.prototype.draw = function() {
                let p = this.getProjection(),
                    pixel, m, i, len,
                    // For simplicity (Only 2 types of markers)
                    markerHeight = (this._markers[0].type === 'locality')? 29:20;
                this.detachFromPane();
                for(i = 0, len = this._markers.length; i < len; i++) {
                    m = this._markers[i];

                    // Draw overlay only for the mapped items.
                    if (!_isItemMapped(m.data)) {
                        continue;
                    }

                    var shiftX = this.shift.x;
                    var shiftY = this.shift.y;
                    var mrkrHeight = markerHeight;

                    pixel = p.fromLatLngToDivPixel(m.position);
                    m.div.style.left = (pixel.x - shiftX) + 'px';
                    m.div.style.top = (pixel.y - mrkrHeight - shiftY) + 'px';

                }
                this.attachToPane();
            };
            // `onRemove` : Called when map is set null (i.e. hide)
            overlay.prototype.onRemove = function() {
                let i, len, m;
                for(i = 0, len = this._markers.length; i < len; i++){
                    m = this._markers[i];
                    // Draw overlay only for the mapped items.
                    if (!_isItemMapped(m.data)) {
                        continue;
                    }
                    $(m.div).find('a').unbind('click');
                    m.div.parentNode.removeChild(m.div);
                    m.div = null;
                    m.destroy();
                    m.position = undefined;
                    m = undefined;
                }
                this.div = null;
            };
            // =================================================

            return overlay;
        };

        return factory;
    });
});
