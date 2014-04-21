// ----------------------------------------------------------------------------
// Switch Widget
//
// Klassen-Hierarchie: (Alle Klassen koennen beliebig oft verwendet werden)
//
// .rb-switch: Container
//     Optionen:
//     - active (Boolean, Standart: false):
//       Initialer Zustand des Switches.
//     - group (Boolean, Standard: undefined):
//       Gruppe zu der dieser Switch gehoert. Innerhalb einer Gruppe ist immer
//       nur ein Switch aktiv. Gruppen koennen optional in einem
//       Switches einer Gruppe innerhalb eines Elementes mit der Klasse
//       "rb-switch-NAME-DER-GRUPPE" sein. Dieses Element bekommt bei der
//       Aktivierung ebenfalls die Active-Klasse hinzugefuegt.
//     - class (String, Standard: rb-switch-active):
//       Klasse die dem aktiven Switch hinzugefuegt wird.
//     - overlay (String, Standard: undefined):
//       Wenn diese Option einen Inhalt hat wird beim Aktivieren des Switches
//       ein Overlay angezeigt. Dem Overlay wird der Inhalt der Option als
//       Aufruf-Typ uebergeben, d.h. der Overlay bekommt eine Klasse mit dem
//       Inhalt als Suffix, die z.B. fuer einen angepassten z-Index des Overlays
//       verwendet werden kann.
// .rb-switch-toggle: Wechselt zwischen dem Aktiv- und Inaktiv-Zustand. Bei
//     normalen Elementen geschieht dies beim Klick. Bei Checkboxen und
//     Radio-Buttons entspicht der Status des Switches dem Status des Elementes
//     (checked oder nicht). Bei Eingabe-Feldern entspricht der Status dem
//     Fokus-Zustand des Feldes (Fokus oder nicht).
//     Optionen:
//     - class (String, Standard: undefined):
//     Definiert eine optionale Aktiv-Klasse, die nur bei Aktivierung des
//     Switches durch dieses Element verwendet wird.
// .rb-switch-activate: Setzt bei Klick, Fokus oder Check/Select den aktiven
//     Zustand.
//     Optionen:
//     - class (String, Standard: undefined):
//     Definiert eine optionale Aktiv-Klasse, die nur bei Aktivierung des
//     Switches durch dieses Element verwendet wird.
// .rb-switch-disable: Entfernt bei Klick, Blur oder Uncheck/Deselect den
//     aktiven Zustand.
//     Optionen:
//     - class (String, Standard: undefined):
//     Definiert eine optionale Aktiv-Klasse, die nur bei Aktivierung des
//     Switches durch dieses Element verwendet wird.
// .rb-switch-offclick: Wenn der Benutzer ausserhalb von diesem Element klickt
//     wird der Switch deaktiviert. Wirkt natuerlich nur wenn ein solches
//     Element definiert wurde.
// ----------------------------------------------------------------------------

(function($, window, document, undefined) {

	RB.Widget.create('switch', ['toggle', 'activate', 'disable', 'offclick'], function(scope) {
		scope.enabled = true;
		scope.active = scope.config['active'] || false;
		scope.currentClass = scope.active && scope.config['class'] ? scope.config['class'] : '';
		scope.overlayActive = false;

		scope.parts.toggle.filter(':not(:input)').on('click', function(evt) {
			if(scope.enabled) {
				if(scope.active) {
					disable(scope, $(this));
				} else {
					activate(scope, $(this));
				}

				evt.preventDefault();
			}
		});

		scope.parts.toggle.filter(':text, :password').
			on('focus', function() {
				if(scope.enabled && !scope.active) activate(scope, $(this));
			}).
			on('blur', function() {
				if(scope.enabled && scope.active) disable(scope, $(this));
			});

		scope.parts.toggle.filter(':checkbox, :radio').
			on('change', function() {
				if(scope.enabled) {
					if(this.checked) {
						if(!scope.active) activate(scope, $(this));
					} else {
						if(scope.active) disable(scope, $(this));
					}
				}
			}).
			each(function() {
				if(scope.enabled && this.checked) {
					activate(scope, $(this));
				}
			});

		scope.parts.activate.filter(':not(:input)').on('click', function() {
			if(scope.enabled && !scope.active) activate(scope, $(this));
		});

		scope.parts.activate.filter(':input').on('focus', function() {
			if(scope.enabled && !scope.active) activate(scope, $(this));
		});

		scope.parts.disable.filter(':not(:input)').on('click', function() {
			if(scope.enabled && scope.active) disable(scope, $(this));
		});

		scope.parts.disable.filter(':input').on('blur', function() {
			if(scope.enabled && scope.active) disable(scope, $(this));
		});

		if(scope.parts.offclick.length > 0) {
			scope.parts.offclick.offclick(function(evt) {
				if(scope.enabled && scope.active && !scope.contains(evt.target)) {
					disable(scope, $(this));
				}
			});
		}

		scope.on('disable', function(evt, group, sourceScope) {
			if(group && group !== scope.config['group']) {
				return false;
			}

			if(sourceScope && sourceScope.root()[0] === scope.root()[0]) {
				return false;
			}

			disable(scope, null, group !== undefined);
		});

		scope.on('activate', function(evt) {
			activate(scope, $(evt.target));
		});
	});

	function activate(scope, $trigger) {
		var group       = scope.config['group'];
		var activeClass = scope.config['class'] || scope.clazz() + '-active';
		var triggerConf = $trigger.data(scope.dataKey());

		if(triggerConf && triggerConf['class']) {
			activeClass = triggerConf['class'];
		}

		if(group) {
			scope.trigger('disable', [group, scope]);
		}

		if(activeClass) {
			if(scope.currentClass) {
				scope.root().removeClass(scope.currentClass);
			}

			scope.root().addClass(activeClass);
			scope.currentClass = activeClass;
		}

		if(group) {
			scope.closestPart(group).addClass(activeClass);
		}

		if(scope.config['overlay'] && !scope.overlayActive) {
			$(window).trigger('show.rb-overlay', [scope.config['overlay']]);
			scope.overlayActive = true;
		}

		scope.active = true;
	}

	function disable(scope, $trigger, groupCloseEvent) {
		var group       = scope.config['group'];
		var triggerConf = $trigger ? $trigger.data(scope.dataKey()) : null;

		if(!triggerConf) triggerConf = {};

		scope.root().removeClass(triggerConf['class'] || scope.currentClass);

		if(group) {
			scope.closestPart(group).removeClass(triggerConf['class'] || scope.currentClass);
		}

		if(scope.overlayActive && !groupCloseEvent) {
			$(window).trigger('hide.rb-overlay', [scope.config['overlay']]);
			scope.overlayActive = false;
		}

		if(!triggerConf['class']) {
			scope.currentClass = null;
		}

		scope.active = false;
	}

})(jQuery, window, document, undefined);