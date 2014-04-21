(function($, window, document, undefined) {

	FastClick.attach(document.body);

	if ($.support.transition) {
		$.fn.animateJS = $.fn.animate;
		$.fn.animate = $.fn.transition;
	}

	RB.Breakpoint.updateOnReady = false;
	RB.Breakpoint.add('tablet-to-desktop', 'only screen and (min-width: 768px) and (max-width: 1280px)');
    RB.Breakpoint.add('desktop', 'only screen and (min-width: 1024px)');
    RB.Breakpoint.add('tablet', 'only screen and (min-width: 768px) and (max-width: 1023px)');
    RB.Breakpoint.add('phone', 'only screen and (max-width: 767px)');

})(jQuery, window, document);