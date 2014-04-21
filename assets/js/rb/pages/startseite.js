(function($, window, document, undefined) {

	// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    // Vorschau auf vorheriges und naechstes Board in der Tablet-Ansicht
    // ------------------------------------------------------------------------

    if($('.slider-footer .slider-footer-inner').length > 0) {
        var $previewPrevious = $('.slider-footer .slider-preview-previous');
        var $previewNext     = $('.slider-footer .slider-preview-next');

        var updateSliderTitleMargin = function updateSliderTitleMargin() {
            $('.slider-nav > li > a').each(function() {
                var active = $(this).hasClass('active');

                if(!active) {
                    $(this).css('display', 'block').addClass('active');
                }

                $(this).css('margin-left', -($(this).outerWidth(true)/2));

                if(!active) {
                    $(this).css('display', '').removeClass('active');
                }
            });
        };

        var updateSliderPreview = function updateSliderPreview() {
            var $activeTab = $('.slider-nav .active');
            var $activeLi = $activeTab.parent();

            if($activeLi.prev().length > 0) {
                $previewPrevious.html($activeLi.prev().children().html());
            } else {
                $previewPrevious.html($activeLi.parent().children('li').last().children().html());
            }

            if($activeLi.next().length > 0) {
                $previewNext.html($activeLi.next().children().html());
            } else {
                $previewNext.html($activeLi.parent().children('li').first().children().html());
            }

            var previewWidth = $activeTab.offset().left - $previewPrevious.offset().left;

            $previewPrevious.css('width', previewWidth);
            $previewNext.css('width', previewWidth);

            $previewNext.css('left', $previewPrevious.position().left + previewWidth + $activeTab.outerWidth());

            var $previewPreviousContent = $previewPrevious.children('span');
            var correctiveContentMargin = previewWidth-$previewPreviousContent.outerWidth();

            if(correctiveContentMargin < 0) {
                $previewPreviousContent.css('margin-left', correctiveContentMargin);
            }
        };

        var $slideButtons = $('.slider-footer .slider-back, .slider-footer .slider-next');

        RB.Breakpoint.enter('tablet', function() {
            updateSliderTitleMargin();
            updateSliderPreview();

            $(window).on('resize.tablet-slider-preview', function() {
               updateSliderPreview();
            });

            $slideButtons.on('click.tablet-slider-preview', function() {
                // zunaechst alle Click-Event-Handler abarbeiten, daher das Update
                // mit setTimeout erst nach dem aktuellen JS-Ausfuehrungskontext
                // ausfuehren lassen.
                window.setTimeout(function() {
                    updateSliderPreview();
                }, 0);
            });
        });

        RB.Breakpoint.leave('tablet', function() {
            $(window).off('resize.tablet-slider-preview');
            $slideButtons.off('click.tablet-slider-preview');
            $('.slider-nav > li > a').css('margin-left', '');
        });
    }

})(jQuery, window, document);