(function($, window, document, undefined) {

    // Anpassung der Hoehe der Tab-Inhalte auf der Produkt-Detailseite im
    // Desktop-Modus

    function updateTabContentHeight(item) {
        $('#accordion-holder').css(
            'height',
            $(item).parent().find('div.product-tab-inner').height() + 70
        );
    }

    // Die Tabs und die Hoehenberechnung sind nur im Desktop-
    // Modus aktiv
    RB.Breakpoint.enter('desktop', function() {
        // Beim Klick auf ein Tab die Hoehe des Containers anpassen
        $('.rb-accordion-item-toggle').on('click.asc-height-calculation', function() {
            updateTabContentHeight(this);
        });

        var $openTab = $('#accordion-holder .rb-tabs-active');

        if($openTab.length === 0) {
            $openTab = $('#accordion-holder [data-rb-tabs-tab]').first();
        }

        // Die Hoehe des Containers sofort anpassen anhand des
        // initial aktiven Tabs
        updateTabContentHeight($openTab[0]);
    });

    // Beim Verlassen des Desktop-Modus sowohl die gesetzte Hoehe als auch
    // das Click-Event (anhand des vergebenen Namespace) wieder entfernen.
    RB.Breakpoint.leave('desktop', function() {
        $('#accordion-holder').css('height', '');
        $('.rb-accordion-item-toggle').off('click.asc-height-calculation');
    });

    $('.button-add-to-watchlist, .link-watch, .button-watch, .link-fav').click(function() {
        $('.button-watchlist').addClass('effect-attention');

        window.setTimeout(function() {
            $('.button-watchlist').removeClass('effect-attention');
        }, 5000);
    });

    // Thumbails auf Produkt-Detailseiten
    if($('.product-images').length > 0) {
        var $container = $('.product-images');
        var $images = $('.product-image-detail > *');
        var $thumbs = $('.thumbnails > *', $container);
        var $prev = $('.rb-tabs-prev', $container);
        var $next = $('.rb-tabs-next', $container);

        $thumbs.on('click', function() {
            $images.hide().eq($thumbs.index(this)).show();

            $('#product-image-lightbox-trigger').
                attr('href', $(this).data('zoomImage')).
                removeClass('rb-lightbox-loaded');
        });

        var prevImage = function() {
            var index = $images.index($images.filter(':visible'));

            if(index > 0) {
                index -= 1;
            } else {
                index = $images.length-1;
            }

            $images.hide().eq(index).show();
        };

        var nextImage = function() {
            var index = $images.index($images.filter(':visible'));

            if(index < $images.length-1) {
                index += 1;
            } else {
                index = 0;
            }

            $images.hide().eq(index).show();
        };

        $prev.on('click', function() {
            if($.inArray('phone', RB.Breakpoint.current()) !== -1) {
                prevImage();
            }
        });

        $next.on('click', function() {
            if($.inArray('phone', RB.Breakpoint.current()) !== -1) {
                nextImage();
            }
        });

        var hammerOptions = {
            // Fix fuer Chrome on Android
            drag_min_distance: 1,
            swipe_velocity: 0.1
        };

        $('.product-image-detail', $container).hammer(hammerOptions).
            on('swipeleft', function() {
                if($.inArray('phone', RB.Breakpoint.current()) !== -1) {
                    prevImage();
                }
            }).
            on('swiperight', function() {
                if($.inArray('phone', RB.Breakpoint.current()) !== -1) {
                    nextImage();
                }
            });
    }

})(jQuery, window, document);