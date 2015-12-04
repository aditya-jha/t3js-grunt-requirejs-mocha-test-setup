
/**
   * Name: mapSvgLegendFactory
   * @author: [Shakib Mohd]
   * Date: Oct 14, 2015
**/

define([
	'services/apiService',
	'modules/mapsModule/scripts/services/mapSvgOverlay'
], function(){
	Box.Application.addService('mapSvgLegendFactory', function(application) {
		'use strict';

		

		var factory = {};

		var ApiService = application.getService('ApiService');

		var _getSvgOpactiy = function(svgName){
	        let opacityHashMap = {
	        	'drains_electric': 0.5,
	        	'landusage': 0.3,
	        	'roads': 0.5,
	        	'train': 0.5,

	        },
	       	opacity = opacityHashMap[svgName] || 1;
	        return opacity;
	    };

 		// svg overlay for masterplan svgs
	    factory.svgOverlay = {
	        init(options){

	        	let svgOverlay = application.getService('mapSvgOverlay');
	            let overlay,
	            svgRef = svgOverlay.getSvgOverlay(),
	            city = options.city ? options.city.toLowerCase() : 'default';

	           ApiService.get('modules/mapsModule/svg/'+city+'/'+options.svgName+'.svg').then((response) => {
                    let data = new XMLSerializer().serializeToString(response.documentElement); // to convert response into xml
	           		overlay = new svgRef({
	                    content: data,
	                    map: options.map,
	                    opacity: _getSvgOpactiy(options.svgName),
	                    zIndex: options.zIndex || 'auto',
	                    id: options.svgName || 'default',
	                    leftTop: options.leftTop,
	                    rightTop: options.rightTop,
	                    leftBottom: options.leftBottom
	                });
	           });
	        }
	    }

	    factory.masterPlanScaleFactor = {
	        roadScaleFactor : {
	            increase: 2,
	            decrease: 0.5
	        },
	        trainScaleFactor : {
	            increase: 2,
	            decrease: 0.5
	        }
	    }

		factory.citySvgLatLongHashMap = {
			'noida': [
			  [28.66347872760795, 77.09346771240234],
			  [28.66347872760795, 77.75127410888672],
			  [28.376297906469308, 77.09346771240234]
			],
			'bangalore': [
			  [13.283387236490535, 76.98394775390625],
			  [13.283387236490535, 78.30024719238281],
			  [12.647038251367576, 76.98394775390625]

			],
			'pune': [
			  [18.858858917152634, 73.21014404296875],
			  [18.858858917152634, 74.52713012695312],
			  [18.238481676022758, 73.21014404296875]
			]
		}

	    factory.legendsArray = [
            {   'name': 'landusage',
                'id': 'landusage_legend',
                'label': 'Land Usage',
                'labelFor': 'landusage',
                'subLegends': [
                    {'name':'Agricultural', 'cls':'agri'},
                    {'name':'Industry/SEZ', 'cls':'indus'},
                    {'name':'Institutional/facility', 'cls':'inst'},
                    {'name':'Residential(Low density)', 'cls':'resid'},
                    {'name':'Park & Play Ground', 'cls':'parkplay'},
                    {'name':'Commercial', 'cls':'comm'},
                    {'name':'Village Population', 'cls':'village'}
                ],
                'visible': false
            },
            {   'name': 'train',
                'id': 'train_legend',
                'label': 'Rails & Metros',
                'labelFor': 'trains',
                'subLegends': [
                    {'name': 'Metros', 'cls':'metro-line-exist'},
                    {'name': 'Metros (Proposed)', 'cls':'metro-line'},
                    {'name': 'Trains', 'cls':'railway-line-exist'},
                    {'name': 'Trains (Proposed)', 'cls':'railway-line'}
                ],
                'visible': false
            },
            {   'name': 'roads',
                'id': 'roads_legend',
                'label': 'Roads and Highways',
                'labelFor': 'roads',
                'subLegends': [
                    {'name': 'Highways', 'cls': 'nh'},
                    {'name': 'Highways (proposed)', 'cls': 'nh-proposed'},
                    {'name': 'Roads', 'cls':'street'}
                ],
                'visible': false
            },
            {   'name': 'drains_electric',
                'id': 'drains_electric_legend',
                'label': 'Drains & Electric',
                'subLegends': [
                    {'name': 'Drains/Canals', 'cls': 'drain-canal'},
                    {'name': 'High Tension Lines', 'cls': 'tension-line'},
                ],
                'labelFor': 'drains',
                'visible': false
            }
        ];

	    return factory;
	});
});

