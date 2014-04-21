(function($, window, document, undefined) {

	RB.Widget.create('flip', ['back', 'front', 'flip', 'show-front', 'show-back'], function(scope) {
		scope.parts.back.hide();
		scope.parts.showFront.hide();
		scope.parts.showBack.show();
		scope.openSide = "front";

		scope.parts.flip.on('click', function() {
			flip(scope);
		});

		scope.parts.showFront.on('click', function() {
			flip(scope, 'front');
		});

		scope.parts.showBack.on('click', function() {
			flip(scope, 'back');
		});
	});

	function flip(scope, targetSide) {
		var duration = scope.config['duration'] || 400;

		if(targetSide === undefined) {
			targetSide = scope.openSide === "front" ? "back":"front";
		}

		var $current = scope.parts[scope.openSide];
		var $target = scope.parts[targetSide];

		scope.openSide = targetSide;

		$target.css('rotate-y', '90deg');

		$current.stop(true).animate({ rotateY: '90deg' }, duration/2, 'easeInOutCubic', function() {
			$current.hide();
			$target.show().stop(true).animate({ rotateY: '0deg' }, duration/2, 'easeInOutCubic');

			if(targetSide === "front") {
				scope.parts.showFront.hide();
				scope.parts.showBack.show();
			} else {
				scope.parts.showFront.show();
				scope.parts.showBack.hide();
			}
		});
	}

})(jQuery, window, document);