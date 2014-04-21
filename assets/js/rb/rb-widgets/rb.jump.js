(function($, window, document, undefined) {

	var $scrollElement = $('html,body');

	var currentlyScrolling = false;
	var scrollMonitoringAttached = false;

	var checkVisibility = [];
	var groups = {};

	var ios5 = navigator.userAgent.match(/i(Pad|Phone).*?OS\s+5/) ? true : false;

	// iOS5-Safari-Bug:
	// Elemente die mittels "position:fixed" positioniert sind werden 
	// "unklickbar" sobald das Scrollen zum Ziel mittels JavaScript bzw.
	// der Modifikation von "scrollTop" durchgefuehrt wird.
	// Als Workaround kann nach dem Scrollen ein Reflow durch eine 
	// veraenderte Hoehe des Inhaltes des Body-Elementes mittels eines
	// vor und nach dem Scrollen modifizierten Elementes ausgeloest werden.
	// 
	// Siehe auch:
	// http://stackoverflow.com/questions/7826868/fixed-position-navbar-only-clickable-once-in-mobile-safari-on-ios5
	var $io5ScrollJumpDiv = ios5 ? $('<div></div>').appendTo('body') : null;

	RB.Widget.create('jump', function(scope) {

		if(!scrollMonitoringAttached) {
			$(window).on('scrolling-to.' + scope.clazz(), function() {
				currentlyScrolling = true;
			});

			$(window).on('scrolled-to.' + scope.clazz(), function() {
				currentlyScrolling = false;
				updateVisibility();
			});

			scrollMonitoringAttached = true;
		}

		scope.duration = scope.config.animate ? scope.config.duration || 500 : 0;

		scope.root().on('click', function() {
			if(scope.enabled && !currentlyScrolling) {
				scroll(scope);
			}
		});

		if(scope.config.markVisibility) {
			scope.visibilityClass = typeof scope.config.markVisibility === 'string' ?
			                        scope.config.markVisibility :
			                        scope.clazz('visible');

			checkVisibility.push(scope);
		}

		if(scope.config.group) {
			if(!(scope.config.group in groups)) {
				groups[scope.config.group] = $();
			}

			groups[scope.config.group] = groups[scope.config.group].add(scope.root());
		}

		return {
			setUp: function(breakpoint) {
				updateVisibility();
			},
			tearDown: function(breakpoint) {

			}
		}

	});

	function scroll(scope) {
		var targetTop = getTargetTop(scope);

		$(window).trigger('scrolling-to.' + scope.clazz(), [targetTop]);

		// iOS5-Safari-Bug: Hoehe des Elementes vor dem Scrollen setzen.
		if(ios5) $io5ScrollJumpDiv.css('height', 1);

		// Markierung entfernen, da wir jetzt woanders hinspringen
		if(scope.config.markVisibility && scope.config.group) {
			groups[scope.config.group].removeClass(scope.visibilityClass);
			scope.root().addClass(scope.visibilityClass);
		}

		$scrollElement.stop().animateJS({ scrollTop: targetTop }, scope.duration, 'swing', function() {
			// Falls sich beim Scrollen Elemente auf der Seite aendern die die
			// Hoehe der Seite beeinflussen kann optional angegeben werden dass
			// die angescrollte Position nach dem animierten Sprung oder einem
			// in ms angegebenen zeitlichen Versatz noch ein Mal validiert und
			// ggf. korrigiert wird.
			if(
				// Begingung fuer eine direkte Validierung nach dem Sprung ist
				// dass der Sprung animiert wurde.
				( scope.config.verify === true && scope.config.animate ) || 
				// Alternativ sollte die Validierung mit einem Versatz 
				// konfiguriert werden.
				( $.isNumeric(scope.config.verify) && scope.config.verify > 0 )
			) {
				window.setTimeout(function() {
					var verifiedTargetTop = getTargetTop(scope);

					if(verifiedTargetTop != targetTop) {
						$scrollElement.stop().animateJS(
							{ scrollTop: verifiedTargetTop }, 
							scope.duration, 'swing', function() {
								finish(scope, verifiedTargetTop);
							}
						);
					} else {
						finish(scope, targetTop);
					}
				}, $.isNumeric(scope.config.verify) ? scope.config.verify : 0);
			} else {
				finish(scope, targetTop);
			}
		});
	}

	function finish(scope, newScrollTop) {
		// iOS5-Safari-Bug: Hoehe des Elementes wieder auf 0 setzen und den 
		// Reflow ausloesen.
		if(ios5) $io5ScrollJumpDiv.css('height', 0);

		$(window).trigger('scrolled-to.' + scope.clazz(), [newScrollTop]);
	}

	function getTargetTop(scope) {
		var targetTop;

		if(scope.config.target === 'top') {
			targetTop = 0;
		} else if(scope.config.target === 'bottom') {
			targetTop = $(document).height() - $(window).height();
		} else {
			targetTop = $(scope.config.target).offset().top;
		}

		if(scope.config.$without) {
			for(var i = 0; i < scope.config.$without.length; i++) {
				if(scope.config.$without.eq(i).is(':visible')) {
					targetTop -= scope.config.$without.eq(i).outerHeight();
				}
			}
		}

		return targetTop;
	}

	function updateVisibility() {
		if(!currentlyScrolling) {
			var scope, $target, targetTop, targetHeight;

			for(var i = 0; i < checkVisibility.length; i++) {
				scope        = checkVisibility[i];
				$target      = $(scope.config.target);
				targetTop    = getTargetTop(scope) - $target.outerHeight() * 0.5;
				targetBottom = targetTop + $target.outerHeight();

				if($(window).scrollTop() > targetTop && $(window).scrollTop() < targetBottom) {
					scope.root().addClass(scope.visibilityClass);
				} else {
					scope.root().removeClass(scope.visibilityClass);
				}
			}
		}
	}

	$(window).on('scroll', updateVisibility);

})(jQuery, window, document);