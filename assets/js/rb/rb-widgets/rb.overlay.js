(function($, window, document, undefined) {
	var typeRegex = new RegExp(RB.classPrefix + 'overlay-');

	RB.Widget.create('overlay', function(scope) {
		var initClasses = scope.root()[0].className.match(typeRegex);

		if(initClasses && initClasses.length > 0) {
			scope.root().show().css('opacity', scope.config.opacity || 0.5);
		} else {
			scope.root().css('opacity', 0).hide();
		}

		scope.on('show', window, function(evt, type) {
			var typeClass = null;

			if(type) {
				typeClass = scope.clazz(type.replace(/[^a-z0-9_-]/i, ''));
			}

			if(!typeClass || !scope.root().hasClass(typeClass)) {
				scope.root().
					show().
					addClass(typeClass).
					stop(true);

				$(window).trigger('showing.' + scope.clazz());

				scope.root().animate({ opacity: scope.config.opacity || 0.5 }, scope.config.durationIn || 0, 'linear', function() {
					$(window).trigger('visible.' + scope.clazz());
				});
			}
		});

		scope.on('hide', window, function(evt, type) {
			var typeClass = null;

			if(type) {
				typeClass = scope.clazz(type.replace(/[^a-z0-9_-]/i, ''));
			}

			// Wenn das Overlay nicht sichtbar ist ODER das zu schliessende Overlay
			// gar nicht offen ist (erkennbar daran dass die Typen-Klasse fehlt)
			// wird auch nichts geschlossen.
			if(!scope.root().is(':visible') || (typeClass && !scope.root().hasClass(typeClass))) {
				return;
			}

			// Ueberpruefen ob ausser der aktuellen Typen-Klasse noch weitere
			// Typen-Klassen vorhanden sind. Falls ja dann das Overlay nicht ausblenden
			// und nur die Klasse entfernen.
			var matchesClasses = scope.root()[0].className.replace(typeClass, '').match(typeRegex);

			if(matchesClasses !== null && matchesClasses.length > 0) {
				scope.root().removeClass(typeClass);
			} else {
				scope.root().stop(true);

				$(window).trigger('hiding.' + scope.clazz());

				scope.root().animate({ opacity: 0 }, scope.config.durationOut || 0, 'linear', function() {
					$(this).hide().removeClass(typeClass);
					$(window).trigger('hidden.' + scope.clazz());
				});
			}
		});

		scope.on('click', function() {
			$(window).trigger('click.' + scope.clazz(), [scope.root()[0]]);
		});
	});

})(jQuery, window, document);