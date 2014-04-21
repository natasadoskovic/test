(function($, window, document, undefined) {

	var $window = $(window);

	RB.Widget.create('mainmenu', ['item'], function(scope) {
		scope.active = {};
		scope.opened = [];

		scope.parts.item.each(function() {
			var config = scope.data('', this);

			if(!$.isArray(config.open)) {
				config.open = [config.open];
			}

			for(var i = 0; i < config.open; i++) {
				scope.active[config.open] = false;
			}
		});

		scope.parts.item.on('click' + scope.clazz(true), function() {
			var item = this;

			clicked(scope, item);
		});

		$(window).on('close' + scope.clazz(true), function(evt, which, originalEvt) {
			if(evt.namespace === scope.clazz() &&
			   scope.active[which] &&
			   !$(originalEvt.target).is(scope.selector()) &&
			   $(originalEvt.target).closest(scope.selector()).length === 0
			) {
				close(scope, which);
			}
		});

	});

	function clicked(scope, item) {
		var config = scope.data('', item);

		if(!$.isArray(config.open)) {
			config.open = [config.open];
		}

		var activeScopes = Object.keys(scope.active);

		for(var i = 0; i < activeScopes.length; i++) {
			if(scope.active[activeScopes[i]] === true && $.inArray(activeScopes[i], config.open) === -1) {
				close(scope, activeScopes[i], true);
			}
		}

		var preserveOverlay = false;

		for(var i = 0; i < config.open.length; i++) {
			if(scope.active[config.open[i]] === false) {
				preserveOverlay = true;
				break;
			}
		}

		for(var i = 0; i < config.open.length; i++) {
			if(!scope.active[config.open[i]]) {
				open(scope, config.open[i]);
			} else {
				close(scope, config.open[i]);
			}
		}
	}

	function open(scope, which, preserveOverlay) {
		$window.trigger('open.' + which, [scope.clazz('open')]);

		if(!preserveOverlay) {
			$window.trigger('show.rb-overlay', ['mainmenu']);
		}

		setState(scope, which, true);

		scope.opened.push(which);

		scope.active[which] = true;
	}

	function close(scope, which, preserveOverlay) {
		scope.opened.splice($.inArray(scope.opened, which), 1);

		if(!preserveOverlay) {
			$window.trigger('hide.rb-overlay', ['mainmenu']);
		}

		$window.trigger('close.' + which);

		setState(scope, which, false);

		scope.active[which] = false;
	}

	function setState(scope, which, active) {
		var $container = scope.findByAttributes(['item', '*=', which], scope.parts.item);

		$container[active ? "addClass" : "removeClass"](scope.clazz('active'));
	}

})(jQuery, window, document);