/**
   * Name: markerBuilder
   * Description: builds marker html based on marker type
   * @author: [Shakib Mohd]
   * Date: Oct 12, 2015
**/

/** globals: [] */

define([
    'text!modules/mapsModule/views/markers/listingMarker.html',
    'text!modules/mapsModule/views/markers/propertyMarker.html',
    'text!modules/mapsModule/views/markers/amenityMarker.html',
    'scripts/services/shortlist'
], function(listingMarkerHtml, propertyMarkerHtml, amentiyMarkerHtml){

	Box.Application.addService('markerBuilder', function(application) {
		'use strict';

        var $, doT, temFun, htmlContent, templateData, shortlistService;
		$ = application.getGlobal('jQuery');
        doT = application.getGlobal('doT');
        shortlistService = application.getService('shortlistService');


        var project = {
            build(data){
            }
        };
        
        var property = {
            build(data){
                let classes = [], tempClass;
                this.type = 'property';

                classes.push(this.type);
                tempClass = data.addDefaultClass || '';
                classes.push(tempClass);
                classes = classes.join(' ');

                templateData = {
                    id: data.selector,
                    classes: classes
                }

                temFun = doT.template(propertyMarkerHtml);
                htmlContent =  temFun(templateData);
                return $(htmlContent);
            }
        }

		var listing = {
            build(data){
                let classes = [], tempClass;
                this.type = 'listing';

                classes.push(this.type);
                tempClass = data.addDefaultClass || '';
                classes.push(tempClass);
                tempClass = shortlistService.checkListing('listing', data.listingId) ? 'shortlisted' : '';
                classes.push(tempClass);
                classes = classes.join(' ');

                templateData = {
                    id: data.selector,
                    classes: classes,
                    priceInWord: data.priceInWord || 'N/A',
                    sizeInfo: data.sizeInfo || '',
                    bhkInfo: data.bhkInfo || '',
                    shortlisted: shortlistService.checkListing('listing', data.listingId) ? 'shortlisted' : ''
                }

                temFun = doT.template(listingMarkerHtml);
                htmlContent =  temFun(templateData);
                return $(htmlContent);
            }
		};

		var amenity = {
            stringReplace(orig_str, pattern, replaceWith) {
                return String(orig_str).replace(pattern, replaceWith);
            },
            build(data, type, iconName) {
                this.type = type;
                templateData = {
                    id: this.stringReplace(data.latitude, '.', '') + '-'+ this.stringReplace(data.longitude, '.', ''),
                    amenityType: type,
                    iconName: iconName || '',
                    name: data.name
                }

                temFun = doT.template(amentiyMarkerHtml);
                htmlContent =  temFun(templateData);
                return $(htmlContent);
            }
        };


        var school = {
            build(data) {
                return amenity.build(data, 'school', 'school');
            }
        };

        var restaurant = {
            build(data) {
                return amenity.build(data, 'restaurant', 'restaurant');
            }
        };

        var hospital = {
            build(data) {
                return amenity.build(data, 'hospital', 'hospital');
            }
        };

        var shopping_mall = {
            build(data) {
                return amenity.build(data, 'shopping_mall', 'shopping_mall');
            }
        };

        var atm = {
            build(data) {
                return amenity.build(data, 'atm', 'atm');
            }
        };

		var cinema = {
            build(data) {
                return amenity.build(data, 'cinema', 'cinema');
            }
        };

        var night_life = {
            build(data) {
                return amenity.build(data, 'night_life', 'night_life');
            }
        };

		return {
			listing,
			project,
            property,
			school,
            restaurant,
            hospital,
            shopping_mall,
            atm,
    		night_life,
			cinema,
		}
	});

});
