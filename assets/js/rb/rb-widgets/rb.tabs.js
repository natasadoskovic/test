// ----------------------------------------------------------------------------
// Tabs Widget
//
// Klassen-Hierarchie: (Alle Klassen koennen beliebig oft verwendet werden)
//
// .rb-tabs: Container
//     Optionen:
//     - animate (String, Standard: undefined):
//       Animation beim Wechsel anzeigen. Moeglich sind entweder "slide" oder
//       "fade". Achtung: Das CSS muss an die Animation angepasst werden.
//       Waehrend des Slidens wird ein Element relativ verschoben und bekommt
//       die Klasse "rb-tabs-sliding" und ein Element wird absolut positioniert
//       verschoben und bekommt die Klasse "rb-tabs-floating". Nach der
//       Animation werden die Klassen entfernt und die CSS-Aenderungen
//       rueckgaengig gemacht.
//     - duration (Integer, Standard: 500):
//       Die Dauer der Animationen in Millisekunden.
//     - auto (Integer, Standard: undefined):
//       Angabe der Zeit (in ms) nach der ein automatischer Wechsel zum naechsten
//       Inhalt erfolgt. Standardmaessig ist der auto-Modus deaktiviert.
//     - stop-on-hover (Boolean, Standard: false):
//       Wenn der Auto-Modus aktiv wird er beim Mouse-Over deaktiviert wenn diese
//       Option auf true gesetzt wird.
//     - active-class (String, Standard: rb-tabs-active):
//       Die Klasse mit der die offenen Tabs markiert werden.
//     - swipe (Boolean, Standard: true):
//       Aktiviert oder deaktiviert die Moeglichkeit mit einem Swipe den Tab
//       zu wechseln.
//     - update-on (String, Standard: undefined):
//       Optional eine Leerzeichen-getrennte Liste von Breakpoints bei denen
//       das Widget die offnen Tabs neu ermitteln soll.
//     - disabled-class (String, Standard: rb-tabs-disabled):
//       Die Klasse mit der deaktivierte Previous- und Next-Elemente Tabs
//       markiert werden.
//     - unused-class (String, Standard: rb-tabs-unused):
//       Die Klasse mit der unbenutzte Previous- und Next-Elemente Tabs
//       markiert werden (wenn bereits alle vorhandenen Elemente angezeigt
//       werden).
//     - modify-position (Boolean, Standard: false):
//       Statt dem Margin die Position beim Slide modifizieren.
// .rb-tabs-tab: Schaltfläche um ein Tab gezielt zu oeffnen.
//     Wenn das Tab aktiv ist bekommt es die Klasse "rb-tabs-active"
//     zugewiesen.
//     Optionen:
//     - open (String, Notwendig):
//       Name des Panes das geoeffnet werden soll.
// .rb-tabs-pane: Inhalt zum anzeigen
//     Optionen:
//     - name (String, Notwendig):
//       Der Name dieses Panes.
//     - group (String, Standard: undefined):
//       Gruppe dieses Panes. Panes werden grundsaetzlich automatisch in Gruppen
//       sortiert sobald ein Pane-Name beim Verarbeiten des DOM erneut vorkommt.
//       Mit dieser Option koennen Panes aber auch ausserhalb der DOM-Reihenfolge
//       in Gruppen sortiert werden.
// .rb-tabs-next: Schaltflaeche um zum naechsten Tab-Inhalt zu springen.
//     Die Reihenfolge ist entsprechend der Reihenfolge der ersten Pane-Gruppe
//     im HTML.
// .rb-tabs-prev: Schaltflaeche um zum vorherigen Tab-Inhalt zu springen.
//     Die Reihenfolge ist entsprechend der Reihenfolge der ersten Pane-Gruppe
//     im HTML.
// ----------------------------------------------------------------------------

(function($, window, document, undefined) {

	RB.Widget.create('tabs', ['tab', 'pane', 'next', 'prev'], function(scope) {
		scope.activeClass   = scope.config.activeClass   || scope.clazz('active');
		scope.unusedClass   = scope.config.unusedClass   || scope.clazz('unused');
		scope.disabledClass = scope.config.disabledClass || scope.clazz('disabled');
		scope.duration      = scope.config.duration      || 300;

		scope.on('refresh', function() {
			updateScope(scope);
			removeEvents(scope);
			setupEvents(scope);
		});

		// TODO: Fuer einen echten refresh braucht es die Moeglichkeit
		// neue parts zu erkennen und mit Events zu versehen.

		if(scope.config['auto']) {
			scope.autoNextInterval = window.setInterval(function() {
				if(scope.enabled && scope.autoNextEnabled) {
					openAdjacentPane(scope, 'next');
				}
			}, scope.config['auto']);
		}

		if(scope.config.updateOn) {
			RB.Breakpoint.enter(scope.config.updateOn, function(breakpoint) {
				updateScope(scope);
			});
		}

		return {
			setUp: function(breakpoint) {
				updateScope(scope);
				setupEvents(scope);

				// Aktiven Tab setzen
				var $openPane = scope.parts.pane.filter(scope.selector('open'));

				if($openPane.length > 0) {
					var openPane = $openPane.data(scope.dataPrefix(true)).name;

					scope.tabs[openPane].addClass(scope.activeClass);
				}
			},

			tearDown: function(breakpoint) {
				scope.parts.tab.removeClass(scope.activeClass);
				scope.parts.prev.
					add(scope.parts.next).
						removeClass(scope.disabledClass).
						removeClass(scope.unusedClass);
				scope.parts.pane.css('display', '');
				removeEvents(scope);
			}
		};
	});

	function setupEvents(scope) {
		scope.on('click', scope.parts.tab, function(evt) {
			if(scope.enabled) {
				var name = $(this).data(scope.dataPrefix(true))['open'];

				dispatchOpenPane(scope, name);
				scope.autoNextEnabled = false;
				evt.preventDefault();
			}
		});

		scope.on('click', scope.parts.next, function(evt) {
			if(scope.enabled && scope.allowNext) {
				openAdjacentPane(scope, 'next');
				scope.autoNextEnabled = false;
				evt.preventDefault();
			}
		});

		scope.on('click', scope.parts.prev, function(evt) {
			if(scope.enabled && scope.allowPrev) {
				openAdjacentPane(scope, 'previous');
				scope.autoNextEnabled = false;
				evt.preventDefault();
			}
		});

		if(RB.support.touch && scope.config['swipe'] !== false) {
			scope.on('swipeleft swiperight', scope.root(), function(evt) {
				if(scope.enabled) {
					if(evt.type === 'swipeleft' && scope.allowNext) {
						openAdjacentPane(scope, 'next');
						scope.autoNextEnabled = false;
					} else if(evt.type === 'swiperight' && scope.allowPrev) {
						openAdjacentPane(scope, 'previous');
						scope.autoNextEnabled = false;
					} else {
						return;
					}

					evt.preventDefault();
					evt.stopPropagation();
				}
			});
		}

		if(scope.config['auto'] && scope.config.stopOnHover) {
			scope.on('mouseenter', scope.parts.pane, function(evt) {
				scope.autoNextEnabled = false;
			});

			scope.on('mouseleave', scope.parts.pane, function(evt) {
				scope.autoNextEnabled = true;
			});
		}
	}

	function removeEvents(scope) {
		scope.off('click', scope.parts.tab);
		scope.off('click', scope.parts.prev);
		scope.off('click', scope.parts.next);

		if(RB.support.touchEvents && scope.config['swipe'] !== false) {
			scope.off('swipeleft', scope.parts.pane);
			scope.off('swiperight', scope.parts.pane);
		}

		if(scope.config['auto'] && scope.config.stopOnHover) {
			scope.off('mouseenter', scope.parts.pane);
			scope.off('mouseleave', scope.parts.pane);
		}
	}

	function updateScope(scope) {
		scope.autoNextEnabled  = true;
		scope.autoNextInterval = null;

		// Flag ob gerade ein Pane geoffnet wird.
		scope.openingPane = false;

		// Struktur der Tab-Inhalte ermitteln.
		//
		// Ist keine Gruppe definiert werden aufeinander folgende Panes
		// in generische Gruppen einsortiert. Sobald ein Element erneut vorkommt
		// wird eine neue generische Gruppe fuer alle folgenden Panes erzeugt,
		// so dass am Ende moeglichst alle zusammengehoerenden Inhalte gruppiert
		// sind.

		scope.groups    = {};
		scope.panes     = [];
		scope.allowNext = true;
		scope.allowPrev = true;

		// CSS-Aenderungen an der Sichtbarkeit bei den panes zurucksetzen

		scope.parts.pane.css('display', '');

		var config, group, pane, groupIndex = 1, firstGroup;

		for(var i = 0; i < scope.parts.pane.length; i++) {
			config = scope.parts.pane.eq(i).data(scope.dataPrefix(true));
			group = config['group'] || 'generic-pane-group-' + groupIndex;
			pane = config['name'];

			if($.inArray(pane, scope.panes) === -1) {
				scope.panes.push(pane);
			}

			if(!(group in scope.groups)) {
				scope.groups[group] = {};
			} else if(pane in scope.groups[group]) {
				groupIndex++;
				group = 'generic-pane-group-' + groupIndex;
				scope.groups[group] = {};
			}

			scope.groups[group][pane] = scope.parts.pane.eq(i);

			if(!firstGroup) {
				firstGroup = group;
			}
		}

		// Checken ob das erste pane der ersten Gruppe sichtbar ist:
		// TODO: ist es nicht. sichtbarkeit muss ohne sichtbarkeit erkannt werden...

		var firstGroupPanes = scope.groups[Object.keys(scope.groups)[0]];
		var $openPanes      = $();

		Object.keys(firstGroupPanes).forEach(function(pane) {
			if(firstGroupPanes[pane].css('display') !== 'none') {
				$openPanes = $openPanes.add(firstGroupPanes[pane]);
			}
		});

		if($openPanes.length > 1) {
			if($openPanes.first().data(scope.dataPrefix(true)).name === scope.panes[0]) {
				scope.parts.prev.addClass(scope.disabledClass);
				scope.allowPrev = false;
			} else {
				scope.parts.prev.removeClass(scope.disabledClass);
				scope.allowPrev = true;
			}

			if(scope.panes.length === $openPanes.length) {
				scope.parts.next.addClass(scope.disabledClass);
				scope.allowNext = false;
			} else {
				scope.parts.next.removeClass(scope.disabledClass);
				scope.allowNext = true;
			}
		} else {
			scope.allowPrev = true;
			scope.allowNext = true;
		}

		if(!scope.allowPrev && !scope.allowNext) {
			scope.parts.prev.addClass(scope.unusedClass);
			scope.parts.next.addClass(scope.unusedClass);
		} else {
			scope.parts.prev.removeClass(scope.unusedClass);
			scope.parts.next.removeClass(scope.unusedClass);
		}

		scope.tabs = {};

		for(var i = 0; i < scope.parts.tab.length; i++) {
			pane = scope.parts.tab.eq(i).data(scope.dataPrefix(true))['open'];

			if(pane in scope.tabs) {
				scope.tabs[pane] = scope.tabs[pane].add(scope.parts.tab.eq(i));
			} else {
				scope.tabs[pane] = scope.parts.tab.eq(i);
			}
		}
	}

	function dispatchOpenPane(scope, nextPane, direction) {
		// Abbruch wenn derzeit noch ein Oeffne-Vorgang laeuft
		if(scope.openingPane) {
			return;
		}

		// Beginn des Oeffne-Vorgangs signalisieren
		scope.openingPane = true;

		$.when.apply($, $.map(scope.groups, function(group) {
			return openPane(scope, group, nextPane, direction);
		})).done(function() {
			scope.openingPane = false;
		});
	}

	function openPane(scope, panes, nextPane, direction) {
		var deferred     = $.Deferred();
		var $nextPane    = panes[nextPane];
		var currentPane  = getCurrentPane(panes, direction === "next");
		var $currentPane = panes[currentPane];

		// Kein Wechsel auf einen bereits offenen Tab!
		if($nextPane.is(':visible')) {
			return;
		}

		// Fuer Animationen muss die Richtung in die gewechselt wird ermittelt
		// werden. Beim Sprung vom letzten auf den ersten und dem ersten auf
		// den letzten - was nur bei sequentiellem Wechsel moeglich ist - muss
		// die aus der aufrufenden Funktion uebergebene Richtung reversiert
		// werden.

		var currentIndex = $.inArray(currentPane, scope.panes);
		var nextIndex = $.inArray(nextPane, scope.panes);

		if(nextIndex < currentIndex && direction !== "next") {
			direction = "previous";
		} else if(nextIndex > currentIndex && direction !== "previous") {
			direction = "next";
		}

		var callback = function() {
			deferred.resolve();
		};

		$currentPane.find('video').each(function() {
			if("pause" in this) {
				this.pause();
			}
		});

		if($.inArray(scope.config['animate'], ['slide', 'fade']) >= 0) {
			if(scope.config['animate'] === 'slide') {
				openTabSlide(scope, $currentPane, $nextPane, direction, callback);
			} if(scope.config['animate'] === 'fade') {
				openTabFade(scope, $currentPane, $nextPane, callback);
			}
		} else {
			openTabInstant(scope, $currentPane, $nextPane, callback);
		}

		if(Object.keys(scope.tabs).length > 0) {
			scope.tabs[currentPane].removeClass(scope.activeClass);
			scope.tabs[nextPane].addClass(scope.activeClass);
		}

		return deferred.promise();
	}

	function openTabInstant(scope, $currentPane, $nextPane, callback) {
		$currentPane.hide();
		$nextPane.show();

		callback.apply();
	}

	function openTabSlide(scope, $currentPane, $nextPane, direction, callback) {
		var cssReset = {
			position   : '',
			marginLeft : '',
			marinRight : '',
			left       : '',
			right      : '',
			top        : '',
			width      : ''
		};

		$nextPane.stop(true, true);
		$currentPane.stop(true, true);

		$nextPane.hide();
		$currentPane.show();

		var currentPosition = $currentPane.position();

		$currentPane.hide();
		$nextPane.show();

		var nextPosition = $nextPane.position();

		$currentPane.show();

		var onFinish = function() {
			$currentPane.hide().css(cssReset);
			$nextPane.css(cssReset);

			$nextPane.
				removeClass(scope.clazz('floating')).
				removeClass(scope.clazz('sliding'));

			$currentPane.
				removeClass(scope.clazz('sliding')).
				removeClass(scope.clazz('floating'));

			callback.apply();
		};

		// Bewegung nach Rechts raus
		if(direction === "previous") {
			$currentPane.stop(true, true).css({
				position : 'absolute',
				top      : currentPosition.top,
				width    : $currentPane.outerWidth(),
				left     : currentPosition.left
			});

			$nextPane.css('position', 'relative');

			$nextPane.addClass(scope.clazz('sliding'));
			$currentPane.addClass(scope.clazz('floating'));

			if(scope.config.modifyPosition) {
				$nextPane.css({				
					left: -$nextPane.outerWidth()
				});

				$.when(
					$currentPane.animate({ left: currentPosition.left + $currentPane.outerWidth() }, scope.duration, 'easeOutCubic').promise(),
					$nextPane.animate({ left: 0 }, scope.duration, 'easeOutCubic').promise()
				).done(onFinish);
			} else {
				$nextPane.css({
					marginLeft: -$nextPane.outerWidth()
				});

				$.when(
					$currentPane.animate({ left: currentPosition.left + $currentPane.outerWidth() }, scope.duration, 'easeOutCubic').promise(),
					$nextPane.animate({ marginLeft: 0 }, scope.duration, 'easeOutCubic').promise()
				).done(onFinish);
			}
		// Bewegung nach Links raus
		} else if(direction === "next") {
			$currentPane.stop(true, true).css({
				position: 'relative',
				left: 0
			});

			$nextPane.css({
				position : 'absolute',
				top      : currentPosition.top,
				width    : $nextPane.outerWidth(),
				left     : nextPosition.left + $nextPane.outerWidth()
			});

			$nextPane.addClass(scope.clazz('floating'));
			$currentPane.addClass(scope.clazz('sliding'));

			if(scope.config.modifyPosition) {
				$.when(
					$currentPane.animate({ left: -$currentPane.outerWidth() }, scope.duration, 'easeOutCubic').promise(),
					$nextPane.animate({ left: nextPosition.left }, scope.duration, 'easeOutCubic').promise()
				).done(onFinish);
			} else {
				$.when(
					$currentPane.animate({ marginLeft: -$currentPane.outerWidth() }, scope.duration, 'easeOutCubic').promise(),
					$nextPane.animate({ left: nextPosition.left }, scope.duration, 'easeOutCubic').promise()
				).done(onFinish);
			}
		}
	}

	function openTabFade(scope, $currentPane, $nextPane, callback) {
		$nextPane.css({
			position : 'absolute',
			left     : $currentPane.position().left,
			top      : $currentPane.position().top,
			zIndex   : 100,
			opacity  : 0
		}).show().animate({ opacity: 1 }, scope.duration, 'easeOutCubic', function() {
			$currentPane.hide();

			$nextPane.css({
				position : '',
				left     : '',
				top      : '',
				zIndex   : '',
				opacity  : ''
			});

			callback.apply();
		});
	}

	function openAdjacentPane(scope, direction) {
		// Wenn derzeit bereits ein Pane geoeffnet wird brechen wir hier ab
		if(scope.openingPane === true) {
			return;
		}

		direction = direction.toLowerCase();

		var firstGroupPanes = scope.groups[Object.keys(scope.groups)[0]];
		var currentPane     = getCurrentPane(firstGroupPanes, direction === "previous");
		var nextPaneIndex   = $.inArray(currentPane, scope.panes) + (direction === 'next' ? 1 : -1);
		var openCount       = 0;

		Object.keys(firstGroupPanes).forEach(function(pane) {
			if(firstGroupPanes[pane].is(':visible')) {
				openCount++;
			}
		});

		// Bei mehr als einem angezeigten Pane muessen der Weiter- und Zurueck-
		// Button rechtzeitig deaktiviert werden, da nahtloses weiterblaettern
		// nicht ohne DOM-Manipulationen moeglich ist und derzeit nicht
		// umgesetzt wurde.
		if(openCount > 1) {
			if(nextPaneIndex === scope.panes.length - 1) {
				scope.allowNext = false;
				scope.parts.next.addClass(scope.disabledClass);
			} else {
				scope.allowNext = true;
				scope.parts.next.removeClass(scope.disabledClass);
			}

			if(nextPaneIndex === 0) {
				scope.allowPrev = false;
				scope.parts.prev.addClass(scope.disabledClass);
			} else {
				scope.allowPrev = true;
				scope.parts.prev.removeClass(scope.disabledClass);
			}
		}

		if(direction === 'next' && nextPaneIndex === scope.panes.length) {
			nextPaneIndex = 0;
		} else if(direction === 'previous' && nextPaneIndex < 0) {
			nextPaneIndex = scope.panes.length-1;
		}

		var nextPane = scope.panes[nextPaneIndex];

		dispatchOpenPane(scope, nextPane, direction);
	}

	function getCurrentPane(panes, getFirst) {
		var currentPane;

		Object.keys(panes).some(function(pane) {
			if(panes[pane].is(':visible')) {
				$currentPane = panes[pane];
				currentPane = pane;

				if(getFirst) return true;
			}

			return false;
		});

		return currentPane;
	}

})(jQuery, window, document);