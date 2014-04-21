(function($, window, document, undefined) {

	RB.Widget.create('floater', [], function(scope) {

		scope.attached = scope.root().css('position') !== 'fixed';
		scope.attachedTop = scope.attached;

		scope.on('scroll', window, function() {
			update(scope);
		});
	});

	function update(scope) {
		var scrollTop  = $(window).scrollTop();
		var offset     = RB.Utils.calcPixelValue(scope.config.offset, scope.config.$container) || { top: 0, bottom: 0 };
		var viewOffset = RB.Utils.calcPixelValue(scope.config.viewOffset) || offset;

		var minTop = scope.config.$container.offset().top;
		var maxTop = minTop + scope.config.$container.innerHeight() - scope.root().outerHeight();

		minTop += offset.top || 0;
		maxTop -= offset.bottom || 0;

		scrollTop += viewOffset.top || 0;

		if(scope.attached) {
			if(scrollTop > minTop && scrollTop < maxTop) {
				detach(scope, viewOffset.top);
				scope.attached = false;
				scope.attachedTop = false;
			} else if(scrollTop < minTop && !scope.attachedTop) {
				attach(scope, minTop);
				scope.attachedTop = true;
			} else if(scrollTop > maxTop && scope.attachedTop) {
				attach(scope, maxTop);
				scope.attachedTop = false;
			}
		} else {
			if(scrollTop <= minTop) {
				attach(scope, minTop);
				scope.attached = true;
				scope.attachedTop = true;
			} else if(scrollTop > maxTop) {
				attach(scope, maxTop);
				scope.attached = true;
				scope.attachedTop = false;
			}
		}
		
	}

	function attach(scope, position) {
		scope.root().
			removeClass(scope.clazz('detached')).
			addClass(scope.clazz('attached')).
			css({
				position: 'absolute',
				top: position
			});
	}

	function detach(scope, position) {
		scope.root().
			removeClass(scope.clazz('attached')).
			addClass(scope.clazz('detached')).
			css({
				position : 'fixed',
				top      : position
			});
	}

})(jQuery, window, document);