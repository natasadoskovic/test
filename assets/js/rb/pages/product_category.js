(function($, window, document, undefined) {

	// Switch zwischen Grid- und Detail-View beim Product-Filter (HTML-Struktur
    // wird nicht vom Switch-Widget ermoeglicht, daher von Hand)

    var $productList = $('.product-list-holder');

    $('#filter-show-grid-view').on('click', function() {
        $('#filter-show-detail-view').removeClass('active');
        $(this).addClass('active');
        $productList.removeClass('product-list-detail').addClass('product-list-list');
    });

    $('#filter-show-detail-view').on('click', function() {
        $('#filter-show-grid-view').removeClass('active');
        $(this).addClass('active');
        $productList.removeClass('product-list-list').addClass('product-list-detail');
    });

    // Alle Eingaben im Product-Filter auf einmal loeschen
    if($('.product-filter-holder').length > 0) {
        var $productFilterHolder = $('.product-filter-holder');

        $productFilterHolder.find('.link-clear').on('click', function() {
            $productFilterHolder.find('.rb-selection-reset').click();
        });

        var timeout;
        var clearAllVisible = false;
        
        if($productFilterHolder.find('[data-rb-selection].selected').length > 0) {
            clearAllVisible = true;
            $productFilterHolder.addClass('active');
        }

        $productFilterHolder.on('changed.rb-selection reset.rb-selection', function(evt) {
            if(!timeout) {
                timeout = window.setTimeout(function() {
                    if($productFilterHolder.find('[data-rb-selection].selected').length > 0) {
                        if(!clearAllVisible) {
                            $productFilterHolder.addClass('active');
                            clearAllVisible = true;
                        }
                    } else if (clearAllVisible) {
                        $productFilterHolder.removeClass('active');
                        clearAllVisible = false;
                    }

                    timeout = null;
                }, 100);
            }
        });
    }

})(jQuery, window, document);