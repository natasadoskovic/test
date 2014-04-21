(function($, window, document, undefined) {

	RB.Widget.create('link', function(scope) {
		scope.root().on('click', function() {
			if(scope.enabled) {
				var href = scope.config['href'];

				if(scope.config['blank']) {
					window.open(href);
				} else {
					location.href = href;
				}
			}
		});
	});

})(jQuery, window, document);