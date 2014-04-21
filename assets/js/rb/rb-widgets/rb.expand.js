(function($, window, document, undefined) {

	RB.Widget.create('expand', ['width', 'height'], function(scope) {

		scope.on('update', window, function(evt, selector) {
			if(selector && !scope.root().is(selector)) {
				return;
			}

			update(scope);
		});

		return {
			setUp: function() {
				update(scope);
			},

			tearDown: function() {
				scope.parts.width.css('width', '');
				scope.parts.height.css('height', '');
			}
		};
	
	});

	function update(scope) {
		if(scope.enabled) {
			scope.parts.width.css('width', getWidth(scope));
			scope.parts.height.css('height', getHeight(scope));
			
			$(window).trigger('finished.' + scope.clazz(), [scope.parts.height, scope.parts.height]);
		}
	}

	function getHeight(scope) {
		var height = $(window).height();

		if(scope.config.$removeHeight) {
			for(var i = 0; i < scope.config.$removeHeight.length; i++) {
				if(scope.config.$removeHeight.eq(i).is(':visible')) {
					height -= scope.config.$removeHeight.eq(i).outerHeight();
				}
			}
		}

		return height;
	}

	function getWidth(scope) {
		var width = $(window).width();

		if(scope.config.$removeWidth) {
			for(var i = 0; i < scope.config.$removeWidth.length; i++) {
				if(scope.config.$removeWidth.eq(i).is(':visible')) {
					width -= scope.config.$removeWidth.eq(i).outerHeight();
				}
			}
		}

		return width;
	}

})(jQuery, window, document);