/**
   * Name: maps Behaviour
   * Description: Maps Module Behavior
   * @author: [Shakib Mohd]
   * Date: Oct 05, 2015
**/

define([
	'modules/mapsModule/scripts/services/mapsConfig',
	'services/urlService',
], function(){
	Box.Application.addBehavior('mapsBehavior', function(context) {
		"use strict";

		var mapsConfig, drawShapeUrlKey = 'path';
		var urlService = Box.Application.getService('URLService');
		var onmessage = function(name, data) {
			if(name === 'setUrlPolygonPath') {
				let encodedPath = data;
				if(encodedPath){
	                encodedPath = escape(encodedPath);
	            }
	            let polygonExistFlag = encodedPath ? false : true,
				value = urlService.getUrlParam(drawShapeUrlKey);
				if(!polygonExistFlag) {
					if(!value || (value && escape(value) != encodedPath)) {
						urlService.changeUrlParam(drawShapeUrlKey, encodedPath);
					}
				} else if(value) {
					urlService.removeUrlParam(drawShapeUrlKey);
					context.broadcast('hideMarkers');
				}
				context.broadcast('showMapFilter', polygonExistFlag);
	            mapsConfig.state.polygonFilter.polygonExist = polygonExistFlag;
				context.broadcast('polygonExistStatusChange', !polygonExistFlag);
			} else if(name == 'drawingModeSwitched') {
				if(data) {
					context.broadcast('hideHeatMapModule');
					context.broadcast('hideSearchInViewPortModule');
					context.broadcast('hideMasterPlan');
					context.broadcast('hideMarkers');
					$('.bot-control').hide();
				} else {
					context.broadcast('showHeatMapModule');
	                context.broadcast('showSearchInViewPortModule');
	                context.broadcast('showMasterPlan');
	                context.broadcast('showMarkers');
					$('.bot-control').show();
				}
			}else if(name == 'zoomUpdated'){
				context.broadcast('updateSvgStroke', data);
			}else if(name == 'listingShortlistStatusUpdated'){
				context.broadcast('updateMarkerShortlistStatus', {
					selector : data.selector,
					isShortlisted: data.isShortlisted
				});
			}
		};

    	return {
			messages: ['setUrlPolygonPath', 'drawingModeSwitched', 'zoomUpdated', 'listingShortlistStatusUpdated'],
			onmessage,
			init() {
				mapsConfig = context.getService('mapsConfig');
			},
			destroy(){
				mapsConfig = null;
			}
    	};
	});
});
