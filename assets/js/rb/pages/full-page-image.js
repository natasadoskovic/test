(function($, window, document, undefined) {

	// Auf One-Pager-Seite die Navi zentriert ueber den Seiten positionieren.
    // Wenn das Element in der Position oberhalb des Zentrums der ersten Seite
    // und unterhalb des Zentrums der letzten Seite ankommt muss die Navi absolut
    // positioniert werden...
    if($('.full-view-nav').length > 0) {
        var $nav = $('.full-view-nav');

        $(window).on('finished.rb-expand', function(evt, widthElements, heightElements) {
            if($nav.data('rbWidgetScope')) {
                var floaterScope = $nav.data('rbWidgetScope').floater;
                var floaterOffset = (heightElements.eq(0).outerHeight() - $nav.height()) / 2;

                floaterScope.config.offset = {
                    top    : [ floaterOffset, 'px' ],
                    bottom : [ floaterOffset, 'px' ]
                };

                if(!$('html').hasClass('android-browser')) {
                    floaterOffset += $('header').outerHeight();

                    if($('.cookie-bar').is(':visible')) {
                        floaterOffset += $('.cookie-bar').outerHeight();
                    }

                    floaterScope.config.viewOffset = {
                        top    : [ floaterOffset, 'px' ],
                        bottom : [ 0, 'px' ]
                    };
                }
            }
        });
    }

})(jQuery, window, document);