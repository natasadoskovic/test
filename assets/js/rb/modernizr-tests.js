(function(window, document, undefined) {

	Modernizr.addTest('android-browser', function() {
		return !!navigator.userAgent.match(/Android.*Version\/4\.0/);
	});

	Modernizr.addTest('ios-safari', function() {
		return !!navigator.userAgent.match(/(iPhone|iPad).*AppleWebKit.*Safari/);
	});

})(window, document);