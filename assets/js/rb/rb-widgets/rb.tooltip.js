(function($, window, document, undefined) {

	RB.Widget.create('tooltip', ['trigger', 'content'], function(scope) {

		scope.visible = false;
		scope.hideTimeout = null;

		if(RB.support.touch) {
			scope.on('click', scope.parts.trigger, function() {
				if(scope.visible) {
					hide(scope);
				} else {
					show(scope);
				}
			});

			scope.parts.content.offclick(function(evt) {
				if(scope.visible && !scope.parts.trigger.is(evt.target) && !$.contains(scope.parts.trigger, evt.target)) {
					hide(scope);
				}
			});
		} else {
			scope.on('mouseenter', scope.parts.trigger, function() {
				window.clearTimeout(scope.hideTimeout);

				show(scope);
			});

			scope.on('mouseleave', scope.parts.trigger, function() {
				window.clearTimeout(scope.hideTimeout);

				scope.hideTimeout = window.setTimeout(function() {
					hide(scope);
				}, scope.config.hideDelay || 300);
			});

			scope.on('mouseenter', scope.parts.content, function() {
				window.clearTimeout(scope.hideTimeout);
			});

			scope.on('mouseleave', scope.parts.content, function() {
				window.clearTimeout(scope.hideTimeout);

				scope.hideTimeout = window.setTimeout(function() {
					hide(scope);
				}, scope.config.hideDelay || 300);
			});
		}

		scope.parts.content.hide();
	});

	function show(scope) {
		var offset = scope.root().offset();
		var size = { width: scope.parts.content.width(), height: scope.parts.content.height() };
		var scrollTop = $(window).scrollTop();
		var windowBottom = scrollTop + $(window).height();

		// Kollision mit Bildschirmkanten fuer alle Positionen (im Uhrzeigersinn)
		// ueberpruefen
		var position = { above: true , right: true , left: true , below: true };

		if(offset.top - size.height < $(window).scrollTop()) {
			position.above = false;
		} 

		if(offset.top - size.height/2 < $(window).scrollTop()) {
			position.right = false;
			position.left = false;
		}

		if(offset.top + size.height/2 > windowBottom) {
			position.below = false;
		}

		if(offset.left - size.width < 0) {
			position.left = false;
		} 

		if(offset.left - size.width/2 < 0) {
			position.above = false;
			position.below = false;
		}

		if(offset.left + scope.root().width() + size.width > $(window).width()) {
			position.right = false;
		} 

		if(offset.left + scope.root().width() + size.width/2 > $(window).width()) {
			position.above = false;
			position.below = false;
		} 

		scope.parts.content.show();

		if(position.above) {
			scope.root().addClass(scope.clazz('above'));
			scope.root().addClass(scope.clazz('visible'));
			scope.visible = true;
		} else if(position.right) {
			scope.root().addClass(scope.clazz('right'));
			scope.root().addClass(scope.clazz('visible'));
			scope.visible = true;
		} else if(position.below) {
			scope.root().addClass(scope.clazz('below'));
			scope.root().addClass(scope.clazz('visible'));
			scope.visible = true;
		} else if(position.left) {
			scope.root().addClass(scope.clazz('left'));
			scope.root().addClass(scope.clazz('visible'));
			scope.visible = true;
		} else {
			scope.root().addClass(scope.clazz('right'));
			scope.root().addClass(scope.clazz('visible'));
			scope.visible = true;
		}
	}

	function hide(scope) {
		scope.root().removeClass(scope.clazz('visible'));
		scope.root().removeClass(scope.clazz('above'));
		scope.root().removeClass(scope.clazz('right'));
		scope.root().removeClass(scope.clazz('left'));
		scope.root().removeClass(scope.clazz('below'));
		scope.visible = false;

		scope.parts.content.hide();
	}

})(jQuery, window, document);