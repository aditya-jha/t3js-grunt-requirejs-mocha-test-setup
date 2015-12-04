/**
   * Name: markerFactory
   * Description: handles bindings of markers
   * @author: [Shakib Mohd]
   * Date: Oct 12, 2015
**/

/** globals: [] */

define([
	'modules/mapsModule/scripts/services/mapsConfig',
	'modules/mapsModule/scripts/services/markerBuilder',
], function(){
	Box.Application.addService('markerFactory', function(application) {
		'use strict';

		var MarkerBuilder = application.getService('markerBuilder');
		var factory = {};	


		var _isEmpty = function(arg){
			if(arg && arg.length){
				return false;
			}
			return true;
		}


	    // =========================================
	    // Marker Class
	    // =========================================
	    factory.marker = function(type, data) {
	        this.type = type;
	        this.data = data;
	        // Callbacks
	        this._callbacks = {
	            mouseEnter: [],
	            mouseOut: [],
	            click: [],
	            resume: []
	        };
	    };

	    // =============== Initiate marker ============== //
	    factory.marker.prototype.init = function(map) {
	        let self = this, id = self.type+'Id',
	            selector = '#'+self.type+'_'+self.data[id];


	        self.elem = null;

	        self.addMarkerBuilder();


	        // Marker Events
	        self.mouseEnter(function(){
	            if(!self.elem) self.elem = $(selector);
	            /**start: remove all opened tooltip **/
	            $('.listing_marker').parent().css('z-index',0);
	            $('.listing_marker').removeClass('st-h');
	            /**end:  remove all opened tooltip **/
	            self.elem.parent().css('z-index',1);
	            self.elem.addClass('st-h');
	        });

	        self.mouseOut(function() {
	        	self.elem.parent().css('z-index',0);
	            self.elem.removeClass('st-h');
	        });

	        self.click(function() {
	           
	        });

	    };
	    // ============================================== //
	    factory.marker.prototype.destroy = function(){
	        for(var cb in this._callbacks) {
	            this._callbacks[cb] = [];
	        }
	        this._callbacks = {};
	        this.template = undefined;
	        // this.scope.$destroy();
	        this.scope = undefined;
	        this.data = undefined;
	        this.builder = undefined;
	        this.elem = undefined;
	        this.type = undefined;
	    };

	    // =============== Events Handler =============== //
	    // Add event callback
	    factory.marker.prototype.addCallback = function(name, callback) {
	        if(!(this._callbacks && this._callbacks.hasOwnProperty(name))) {
	            this._callbacks[name] = [];
	        }
	        this._callbacks[name].push(callback);
	        return this;
	    };

	    // Trigger event callback
	    factory.marker.prototype.triggerEvent = function(name, page) {
	        $.each(this._callbacks[name], (idx, func) => {
	            setTimeout(() => {
	                func(this.data, page);
	            }, 0);
	        });
	        return this;
	    };
	    // ============================================== //

	    factory.marker.prototype.addMarkerBuilder = function(){
	        let self = this;
	        this.builder = MarkerBuilder[this.type];
	    };

	    // =============== Predefined Events =============== //
	    // mouseEnter
	    // mouseEnter() => To trigger mouseEnter
	    // mouseEnter(callback) => To add callback
	    factory.marker.prototype.mouseEnter = function(callback) {
	        if(_isEmpty(arguments)) {
	            this.triggerEvent('mouseEnter', 'MAP');
	        } else {
	            this.addCallback('mouseEnter', callback);
	        }
	        return this;
	    };

	    // mouseOut
	    // mouseOut() => To trigger mouseOut
	    // mouseOut(callback) => To add callback
	    factory.marker.prototype.mouseOut = function(callback) {
	        if(_isEmpty(arguments)) {
	            this.triggerEvent('mouseOut', 'MAP');
	        } else {
	            this.addCallback('mouseOut', callback);
	        }
	        return this;
	    };

	    // click
	    // click() => To trigger click
	    // click(callback) => To add callback
	    factory.marker.prototype.click = function(callback) {
	        if(_isEmpty(arguments)) {
	            this.triggerEvent('click', 'MAP');
	        } else {
	            this.addCallback('click', callback);
	        }
	        return this;
	    };

	    // resume
	    // resume() => To trigger resume
	    // resume(callback) => To add callback
	    factory.marker.prototype.resume = function(callback) {
	        if(_isEmpty(arguments)) {
	            this.triggerEvent('resume');
	        } else {
	            this.addCallback('resume', callback);
	        }
	        return this;
	    };

	    return factory;
	});
});