(function($, window, document, undefined) {

	RB.Widget.create('slide-out', ['layer', 'toggle', 'open', 'close'], function(scope) {
        scope.openingOnRequest = false;
        scope.defaultDuration = 300;
        scope.opened = false;
        scope.firstSetup = true;

        if(!scope.config.name) {
        	scope.config.name = scope.clazz(scope.ID + "");
        }

        if(!scope.config.direction) {
        	scope.config.direction = "up";
        }

		if(scope.config.modify === 'position') {
			if(scope.config.direction === 'up')    scope.property = 'top';
			if(scope.config.direction === 'down')  scope.property = 'bottom';
			if(scope.config.direction === 'left')  scope.property = 'left';
			if(scope.config.direction === 'right') scope.property = 'right';
		} else {
			if(scope.config.direction === 'up')    scope.property = 'margin-top';
			if(scope.config.direction === 'down')  scope.property = 'margin-bottom';
			if(scope.config.direction === 'left')  scope.property = 'margin-left';
			if(scope.config.direction === 'right') scope.property = 'margin-right';
		}

		scope.on('click', scope.parts.toggle, function(evt) {
			if(scope.enabled) {
				if(scope.opened) {
					$(window).trigger('closing.' + scope.clazz(), [this, scope.config.name]);

					close(scope, function() {
						$(window).trigger('closed.' + scope.clazz(), [this, scope.config.name]);
					});
				} else {
					$(window).trigger('opening.' + scope.clazz(), [this, scope.config.name]);

					open(scope, function() {
						$(window).trigger('opened.' + scope.clazz(), [this, scope.config.name]);
					});
				}

				evt.preventDefault();
			}
		});

		scope.on('click', scope.parts.open, function(evt) {
			if(scope.enabled) {
				if(!scope.opened) {
					$(window).trigger('opening.' + scope.clazz(), [this, scope.config.name]);

					open(scope, function() {
						$(window).trigger('opened.' + scope.clazz(), [this, scope.config.name]);
					});
				}

				evt.preventDefault();
			}
		});

		scope.on('click', scope.parts.close, function(evt) {
			if(scope.enabled) {
				if(scope.opened) {
					$(window).trigger('closing.' + scope.clazz(), [this, scope.config.name]);

					close(scope, function() {
						$(window).trigger('closed.' + scope.clazz(), [this, scope.config.name]);
					});
				}

				evt.preventDefault();
			}
		});

		if(scope.config.offclick) {
			scope.root().offclick(function(evt) {
				if(scope.enabled && scope.opened && !scope.openingOnRequest) {
					$(window).trigger('closing.' + scope.clazz(), [evt.target, scope.config.name]);

					close(scope, function() {
						$(window).trigger('closed.' + scope.clazz(), [evt.target, scope.config.name]);
					});
				}
			});
		}

		scope.on('open', window, function(evt, which, trigger) {
			if(scope.enabled && which === scope.config.name && !scope.opened) {
				scope.openingOnRequest = true;

				$(window).trigger('opening.' + scope.clazz(), [trigger, scope.config.name]);

				open(scope, function() {
					scope.openingOnRequest = false;
					$(window).trigger('opened.' + scope.clazz(), [trigger, scope.config.name]);
				});
			}
		});

		scope.on('close', window, function(evt, which, trigger) {
			if(scope.enabled && which === scope.config.name) {
				$(window).trigger('closing.' + scope.clazz(), [trigger, scope.config.name]);

				close(scope, function() {
					$(window).trigger('closed.' + scope.clazz(), [trigger, scope.config.name]);
				});
			}
		});

		return {
			setUp: function(breakpoint) {
				if(scope.firstSetup) {
					scope.opened = scope.parts.layer.css('display') !== 'none' && parseFloat(scope.parts.layer.css(scope.property)) === 0;

					if(scope.config.autohide) {
						scope.parts.layer.hide();
						scope.opened = false;
					} else if(scope.config.overlay) {
						$(window).trigger('show.rb-overlay', [scope.config.name]);
					}

					scope.firstSetup = false;
				} else {
					if(scope.opened) {
						scope.parts.layer.show().css(scope.property, 0);
						scope.root().addClass(scope.clazz('open'));
					} else {
						scope.parts.layer.hide();
					}
				}
			},
			tearDown: function(breakpoint) {
				scope.parts.layer.css('display', '').css(scope.property, '');
				scope.root().removeClass(scope.clazz('open'));
			}
		};
	});

	function open(scope, callback) {
		if(scope.config.overlay) {
			$(window).trigger('show.rb-overlay', [scope.config.name]);
		}

		var initValue = $.inArray(scope.config.direction, ["left", "right"]) >= 0 ?
			-scope.parts.layer.outerWidth() :
			-scope.parts.layer.outerHeight();

		scope.parts.layer.show().css(scope.property, initValue);

		if(scope.config.animate) {
			var props = {};

			props[scope.property] = 0;

			scope.parts.layer.show().stop(true).animate(props, scope.config.duration || scope.defaultDuration, 'linear', function() {
				scope.root().addClass(scope.clazz('open'));
				scope.opened = true;
				callback.apply();
			});
		} else {
			scope.parts.layer.show().css(scope.property, 0);
			scope.root().addClass(scope.clazz('open'));
			scope.opened = true;
			callback.apply();
		}
	}

	function close(scope, callback) {
		if(scope.config.overlay) {
			$(window).trigger('hide.rb-overlay', [scope.config.name]);
		}

		var targetValue = $.inArray(scope.config.direction, ["left", "right"]) >= 0 ?
			-scope.parts.layer.outerWidth() :
			-scope.parts.layer.outerHeight();

		if(scope.config.animate) {
			var props = {};

			props[scope.property] = targetValue;

			scope.parts.layer.stop(true).animate(props, scope.config.duration || scope.defaultDuration, 'linear', function() {
				$(this).hide();
				scope.root().removeClass(scope.clazz('open'));
				scope.opened = false;
				callback.apply();
			});
		} else {
			scope.parts.layer.css(scope.property, targetValue).hide();
			scope.root().removeClass(scope.clazz('open'));
			scope.opened = true;
			callback.apply();
		}
	}

})(jQuery, window, document);