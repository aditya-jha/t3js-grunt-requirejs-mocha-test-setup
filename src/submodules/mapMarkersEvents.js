define([], function(){
    Box.Application.addModule('mapMarkersEvents', function(context) {

        var LISTING_MARKER_CLASS = 'listing_marker';

    	var onmessage = function(name, data){
    		if(name === 'triggerListingMouseenter'){ 

                /**start: remove all opened tooltip **/
                $('.'+LISTING_MARKER_CLASS).parent().css('z-index',0);
                $('.'+LISTING_MARKER_CLASS).removeClass('st-h');
                /**end:  remove all opened tooltip **/

                let elem = $('#'+data.selector);
                elem.parent().css('z-index',1);
                elem.addClass('st-h');
            } else if(name === 'triggerListingMouseleave'){
                let elem = $('#'+data.selector);
                elem.parent().css('z-index',0);
                elem.removeClass('st-h');
            }else if(name === 'hideMarkers') {
                $('.'+LISTING_MARKER_CLASS).hide();
            } else if(name === 'showMarkers') {
                $('.'+LISTING_MARKER_CLASS).show();
            }
    	}

    	return {
            messages: ['triggerListingMouseenter', 'triggerListingMouseleave', 'hideMarkers', 'showMarkers'],
            onmessage,
            init() {

            },
            destroy() {

            },
        }

    });
});
