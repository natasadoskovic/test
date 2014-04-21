(function($, window, document, undefined) {

	var instances = [];

	RB.Widget.create('relocate', ['on-wrap', 'target'], function(scope) {

		instances.push(scope);

		scope.placeholderKey = scope.dataPrefix('placeholder', true),
		scope.cls = {
			relocated : scope.clazz('relocated'),
			filled    : scope.clazz('filled')
		};

		scope.parts.onWrap.each(function() {
			$(this).data(
				scope.placeholderKey, 
				$('<span/>').insertAfter(this).addClass(scope.clazz('placeholder'))
			);
		});

		return {
			setUp: function(breakpoint) {
				update(scope, true);
			},
			tearDown: function(breakpoint) {
				scope.parts.onWrap.each(function() {
					restore(scope, $(this));
				});
			}
		};

	});

	function update(scope, invertAttachment) {
		var relocated = 0;

		scope.parts.onWrap.each(function() {
			if(!$(this).hasClass(scope.cls.relocated) && $(this).position().top > (scope.config.tolerance || 0)) {
				relocate(scope, $(this), invertAttachment);
				relocated++;
			}
		});

		if(relocated === 0) {
			scope.parts.onWrap.each(function() {
				if($(this).hasClass(scope.cls.relocated)) {
					restore(scope, $(this));

					if($(this).position().top > (scope.config.tolerance || 0)) {
						relocate(scope, $(this));
						return false;
					}
				}
			});
		}

		var targetConfig = scope.parts.target.data(scope.dataPrefix(true));
		var $classTarget = scope.parts.target;

		if(targetConfig.classTarget) {
			$classTarget = $classTarget.closest(targetConfig.classTarget);
		}

		if(scope.parts.onWrap.filter('.' + scope.cls.relocated).length > 0) {
			$classTarget.addClass(scope.cls.filled);
		} else {
			$classTarget.removeClass(scope.cls.filled);
		}
	}

	function relocate(scope, $item, invertAttachment) {
		if(!$item.hasClass(scope.cls.relocated)) {
			var attachment = scope.config.prepend ? 'prependTo':'appendTo';

			if(invertAttachment && attachment === 'prependTo') {
				attachment = 'appendTo';
			} else {
				attachment = 'prependTo';
			}

			$item[attachment](scope.parts.target);
			$item.addClass(scope.cls.relocated);
		}
	}

	function restore(scope, $item) {
		if($item.hasClass(scope.cls.relocated)) {
			$item.insertBefore($item.data(scope.placeholderKey));
			$item.removeClass(scope.cls.relocated);
		}
	}

	$(window).on('resize', function() {
		for(var i = 0; i < instances.length; i++) {
			update(instances[i]);
		}
	});

})(jQuery, window, document);