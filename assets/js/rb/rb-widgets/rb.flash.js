(function($, window, document, undefined) {

	RB.Widget.create('flash', function(scope) {

		scope.duration = scope.config.duration || 500;
		scope.amount   = scope.config.amount   || 0.3;

		if(scope.config.click) {
			scope.on('click', function() {
				if(scope.enabled) {
					if(scope.config.click === 'fade') {
						fade(scope);
					} else if(scope.config.click === 'jump') {
						jump(scope);
					}

					flash(scope);
				}
			});
		}

	});

	function fade(scope) {
		scope.root().
			fadeTo(scope.duration/2, 0).
			fadeTo(scope.duration/2, 1, function() {
				$(this).css('opacity', '');
			});
	}

	function jump(scope) {
		scope.root().css('position', 'relative');

		var currentTop = parseFloat(scope.root().css('top'));
		var targetTop = currentTop - (scope.root().outerHeight() * scope.amount);

		scope.root().
			animate({ top: targetTop }, scope.duration/2, 'linear').
			animate({ top: currentTop }, scope.duration/2, 'linear', function() {
				$(this).css({ position: '', top: '' });
			});
	}

	function flash(scope) {
		scope.root().addClass(scope.clazz('flash'));

		window.setTimeout(function() {
			scope.root().removeClass(scope.clazz('flash'));
		}, scope.duration/2);
	}

})(jQuery, window, document);