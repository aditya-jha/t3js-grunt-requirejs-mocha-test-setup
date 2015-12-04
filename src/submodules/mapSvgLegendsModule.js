/**
   * Name: map masterplan svg legend
   * Description: masterplan svg used on maps
   * @author: [Shakib Mohd]
   * Date: Oct 05, 2015
**/

/** globals: [] */

define([
	'text!modules/mapsModule/views/mapSvgLegendsModule.html',
	'modules/mapsModule/scripts/services/mapSvgLegendFactory',
	'modules/mapsModule/scripts/services/mapsConfig'
], function(template){

	Box.Application.addModule('mapSvgLegendsModule', function(context) {
		var mapSvgLegendsModule, mapsConfig, mapSvgLegendFactory, $;
		var scope = {};

		var map, listeners, viewLevel, roadScaleFactor, trainScaleFactor, zoomBreakPoints, latLngHashMap, dataHashMap, doT;
		var _beforeInitialize = function(){
			scope.state = mapsConfig.state;
		    scope.masterPlanActive = false;
		    scope.showSvgLegends = false;
		    scope.toggleSvgLegendOpened = false;
		    scope.disableMasterPlanButton = false;

		    listeners = [],
		    viewLevel = 'locality',
		    roadScaleFactor = mapSvgLegendFactory.masterPlanScaleFactor.roadScaleFactor,
		    trainScaleFactor = mapSvgLegendFactory.masterPlanScaleFactor.trainScaleFactor,
		    zoomBreakPoints = [
		        {zoom: 14, status: false},
		        {zoom: 16, status: false},
		        {zoom: 18, status: false},
		        {zoom: 20, status: false},
		        {zoom: 21, status: false}
		    ];

		    dataHashMap = {
		        'default': {name: '', source: 'http://google.com', year: ''},
		        'noida': {name: 'Noida', source: 'http://www.noidaauthorityonline.com', year:2031},
		        'bangalore': {name: 'Bangalore', source: 'http://www.bdabangalore.org', year:2021},
		        'pune': {name: 'Pune', source: 'http://www.punecorporation.org', year:2027},
		    }

		    scope.citySvgs = {name: 'Noida', source: 'http://www.noidaauthorityonline.com', year:2031};

		    scope.legendsArray = mapSvgLegendFactory.legendsArray;

		};


		var _toggleSVgLegend = function(reset) {

            scope.state.activateToggleCollage = true;
            scope.state.collapseState = true;

            if(!reset){
                _resetSvgLegends();
                scope.toggleSvgLegendOpened = !scope.toggleSvgLegendOpened;
                if(scope.toggleSvgLegendOpened){
                    _activateDefaultMasterPlan();
                }
            }else{
				$(".svg-legend").slideToggle();
				scope.toggleSvgLegendOpened = false;
				context.broadcast('svgLegendButtonClicked', false);
				return;
            }
			$(".svg-legend").slideToggle(400,function(){});
            context.broadcast('svgLegendButtonClicked', scope.toggleSvgLegendOpened);
        };


		var _resetSvgLegends = function(){
	        $('.masterplan-svg').fadeOut(1000);
            scope.masterPlanActive = false;
            //mapSvgLegendsModule.broadcast('masterPlanActive', false);
	    };

	    var handleActiveMasterPlan = function(index){ // function to show/hide respective legend and toggle active class
			$('.masterplan-svg').fadeOut(1000);
			$('.svg-sub-item').hide();
			$('.options>span').removeClass('active');
			$('.svg-legend').removeClass('collapse');

			var value = scope.legendsArray[index];

			if(typeof index !== "undefined" && value.visible){
				$('.options-'+index).addClass('active');
				$('.svg-sub-item-'+index).show();
				$('#'+value.name).fadeIn(1000);
			}
		}

	    var _activateDefaultMasterPlan = function(){
	        scope.legendsArray.forEach(function(value, key){
	            if(value.visible && value.name == 'landusage' && viewLevel == 'locality'){
	                scope.masterPlanActive = true;
	                handleActiveMasterPlan(key);
	            }else if(value.visible && viewLevel == 'project' && value.name == 'roads'){
	                scope.masterPlanActive = true;
	                handleActiveMasterPlan(key);
	            }

	        });
	        //mapSvgLegendsModule.broadcast('masterPlanActive', true);
	    }

	    var _updateSvgStroke = function(refToSvg, factor) {
	        for(var i=0;i<refToSvg.length;i++) {
	            let stroke = refToSvg[i].getAttribute('stroke-width');
	            if(stroke != null && stroke != undefined) {
	                refToSvg[i].setAttribute('stroke-width', stroke*factor);
	            }
	        }
	    }

	    var updateSvgStroke = function(zoom) {
	        let refToRoadSvg = $("#roads svg path"),
	        refToTrainSvg = $('#train svg path');

	        for(var i=0; i<zoomBreakPoints.length; i++) {
	            if(zoomBreakPoints[i].zoom == zoom && zoomBreakPoints[i].status == false) {
	                _updateSvgStroke(refToRoadSvg, roadScaleFactor.decrease);
	                _updateSvgStroke(refToTrainSvg, trainScaleFactor.decrease);
	                zoomBreakPoints[i].status = true;
	                break;
	            }
	            else if(zoom < zoomBreakPoints[i].zoom && zoomBreakPoints[i].status == true) {
	                _updateSvgStroke(refToRoadSvg, roadScaleFactor.increase);
	                _updateSvgStroke(refToTrainSvg, trainScaleFactor.increase);
	                zoomBreakPoints[i].status = false;
	                break;
	            }
	        }
	    }

	    var _addSvgOverlay = function(data){
	    	if(!map) return;
            let svgName = data && data.svgName ? data.svgName : '';
            let cityName = data && data.city ? data.city: 'Noida';
            cityName = cityName.toLowerCase();

            if(!(latLngHashMap[cityName] && latLngHashMap[cityName].length)){
                return;
            }

            mapSvgLegendFactory.svgOverlay.init({
                map,
                svgName,
                city: cityName,
                zIndex: data.zIndex,
                leftTop: latLngHashMap[cityName][0],
                rightTop: latLngHashMap[cityName][1],
                leftBottom: latLngHashMap[cityName][2]
            });
        }


	    /**
		* This function listens to messages from other modules and takes action accordingly.
		* @param {message} name,data The name of the custom event and additional data, if any.
	    * @returns {void}
	    */
		var onmessage = function(name, data) {
			if(name === 'initMapReferenceInmapSvgLegendsModule'){
				map = data; // where data refers to map
			}else if(name === 'showSvgLegends'){
				let cityName; // it will be selected city
				scope.showSvgLegends = data ? true : false;
		        let city =  cityName ? cityName.toLowerCase() : 'default';
		        scope.citySvgs = dataHashMap[city];
		        _addModuleContainer(mapSvgLegendsModule);
			}else if(name === 'masterPlanSvgAdded'){
				let svgType = data;
				if(svgType){
	                scope.legendsArray.forEach(function(value, key){
			        	if(value.name == svgType){
			                value.visible = true;
							$('.options-'+key).removeClass('hide');			            }
			        }); // to show respective legend
	            }
			}else if(name === 'resetSvgLegends'){
				if(scope.disableMasterPlanButton){
		            return;
		        }
		        _resetSvgLegends();
		        _toggleSVgLegend(true);
		        scope.disableMasterPlanButton = false;
			}else if(name === 'showDisabledSvgLegends'){
				scope.disableMasterPlanButton = data ? true : false;
		        if(data && toggleSVgLegend) {
		            _resetSvgLegends();
		            _toggleSVgLegend(true);
		        }
			}else if(name === 'updateSvgStroke'){
				updateSvgStroke(data); // data is zoom level
			}else if(name === 'addSvgOverlay'){
                let svgOverlayElement = $('#'+data.svgName);
                if(svgOverlayElement && svgOverlayElement.length){ // If svg overlay already exist
                    return;
                }
                _addSvgOverlay(data);
            } else if(name === 'hideMasterPlan') {
				if(scope.masterPlanActive) {
					_toggleSVgLegend(false);
					_resetSvgLegends()
				}
				$('#'+mapSvgLegendsModule.id).hide();
			} else if(name === 'showMasterPlan') {
				$('#'+mapSvgLegendsModule.id).show();
			} else if(name === 'activateMasterPlan') { // to activate and deactive without clicking on button of module
				scope.toggleSvgLegendOpened = data ? false : true;
				_toggleSVgLegend();
			}
		};

		var onclick = function(event, element, elementType) {
	        if(elementType === 'toggleSVgLegend') {
	        	_toggleSVgLegend();
	        }else if(elementType == 'closeMasterPlan'){
				_toggleSVgLegend();
			}else if(elementType == 'optionClicked'){
				let index =  $(element).data('index');
				handleActiveMasterPlan(index);
			}else if(elementType == 'legend-header'){
				$(element).parent().toggleClass('collapse');
			}
	    };

		var _addModuleContainer = function(mapSvgLegendsModule){
	        if($(mapSvgLegendsModule).children('.mod-content')){
	            $(mapSvgLegendsModule).children('.mod-content').remove();
	        }

	        let temFun = doT.template(template),
	        htmlContent =  temFun(scope);
	        $(mapSvgLegendsModule).append(htmlContent);
	    };

		return {
	        behaviors: [],
	        messages: ['initMapReferenceInmapSvgLegendsModule', 'showSvgLegends' , 'showDisabledSvgLegends', 'masterPlanSvgAdded', 'resetSvgLegends', 'updateSvgStroke',  'addSvgOverlay', 'hideMasterPlan', 'showMasterPlan', 'activateMasterPlan'],
	        onmessage,
			onclick,
	        init() {
	            // capture the reference when the module is started
	            mapSvgLegendsModule = context.getElement();
				$ = context.getGlobal('jQuery');
				doT = context.getGlobal('doT');
				let dataset = mapSvgLegendsModule.dataset; 
				scope.tabular = dataset.tabular == "true" ? true : false;
	            mapsConfig = context.getService('mapsConfig');
	            mapSvgLegendFactory = context.getService('mapSvgLegendFactory');
	            latLngHashMap = mapSvgLegendFactory.citySvgLatLongHashMap;
	            _beforeInitialize(); // to initialize variable values
	            _addModuleContainer(mapSvgLegendsModule);
	            context.broadcast('moduleLoaded', {'name':'mapSvgLegendsModule', 'id': mapSvgLegendsModule.id});
	            context.broadcast('mapSubmoduleLoaded', 'mapSvgLegendsModule');
	        },
	        destroy(){
	        	map = null;
				$ = null;
	        }
	    };
	});
});
