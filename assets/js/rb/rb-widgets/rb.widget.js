/**
 * Alle benoetigten Objekte (auch undefined ist ein Objekt) in eine
 * anonyme Funktion uebergebenum zu verhindern dass spaeter Schabernack
 * damit getrieben wird.
 *
 * @param  {Object}    RB        RB-Namespace
 * @param  {jQuery}    $         jQuery-Objekt
 * @param  {Window}    window    HTML Window Objekt
 * @param  {Document}  document  HTML Document Objekt
 * @param  {undefined} undefined Undefined-Wert
 */
(function(RB, $, window, document, undefined) {

	// Praefix fuer HTML-Klassen der Widgets
	RB.classPrefix = 'rb-';
	// Klasse die jedem Widget-Root-Element hinzugefuegt wird
	RB.widgetRootClass = RB.classPrefix + 'widget-root';
	// Praefix fuer HTML5-Data-Attribute der Widgets
	RB.dataPrefix = 'data-rb-';
	// ID fuer die naechste erzeugte Widget-Instanz
	RB.nextWidgetID = 1;
	// Liste der (von Hammer.js) unterstuetzten Touch-Events
	RB.SUPPORTED_TOUCH_EVENTS = [
		'hold',
		'tap', 'doubletap',
		'drag', 'dragstart', 'dragend', 'dragup', 'dragdown', 'dragleft', 'dragright',
		'swipe', 'swipeup', 'swipedown', 'swipeleft', 'swiperight',
		'transform', 'transformstart', 'transformend',
		'rotate',
		'pinch', 'pinchin', 'pinchout',
		'touch',
		'release'
	];
	// Flags fuer unterstuetzte Techniken
	RB.support = {
		/**
		 * Flag ob Touchscreen-Support vorhanden ist
		 * @type {Boolean}
		 */
		touch       : $('html').hasClass('touch'),
		/**
		 * Flag ob jQuery-Mobile (und damit Touch-Events) geladen wurde.
		 * @type {Boolean}
		 */
		touchEvents : "hammer" in jQuery.fn || "mobile" in jQuery.fn
	};

	/**
	 * Container-Element fuer alle hinzugefuegten Widgets.
	 *
	 * Aufbau:
	 *
	 * {
	 *     Widget-Name (CamelCase): {
	 *         name: Widget-Name (Original),
	 *         parts: Array der Teilkomponenten,
	 *         init: Initialisierungs Funktion fuer Instanzen,
	 *         instances: [
	 *             { Instanz, Scope },
	 *             { Instanz, Scope },
	 *             ...
	 *         ]
	 *     },
	 *     ...
	 * }
	 *
	 * @type {Object}
	 */
	var widgets = {};

	/**
	 * Widget-Objekt mit Funktionen zur Erzeugung und Steuerung von RB-Widgets.
	 * @type {Object}
	 */
	RB.Widget = {
		/**
		 * Erzeugt ein neues Widget.
		 *
		 * @param  {String}   name  Name des Widgets (und Teil der Basis-Klasse).
		 * @param  {String[]} parts Teilkomponenten innerhalb des Widgets.
		 * @param  {Function} init  Funktion zur initialisierung einer
		 *                               Widget-Instanz.
		 */
		create: function(name, parts, init) {
			widgets[RB.Widget.camelize(name)] = {
				name      : name,
				parts     : init === undefined ? [] : parts,
				init      : init === undefined ? parts : init,
				instances : []
			};
		},

		/**
		 * Initialisiert alle Instanzen der geladenen Widgets innerhalb des
		 * uebergebenen DOM-Elementes.
		 *
		 * @param  {Object} where Container-Element in welchem die Widgets
		 *                        initialisiert werden sollen.
		 */
		init: function(where) {
			var clazz, selector, widget;

			// Die verschiedenen Widgets durchgehen, die Container-Klasse
			// erzeugen und dann innerhalb des uebergebenen Containers
			// suchen.
			var name, names = Object.keys(widgets), setUpCalls = [];

			for(var i = 0; i < names.length; i++) {
				name = names[i];
				widget = widgets[name];
				clazz = "." + RB.classPrefix + widget.name;
				selector = clazz + ",[" + RB.dataPrefix + widget.name + "]";

				// Mit allen gefundenen vorkommen einer Widget-Klasse ein
				// neues Widget instanzieren.
				$(selector, where).each(function() {
					// Container die Widget-Basis-Klasse hinzufuegen
					$(this).addClass(RB.widgetRootClass);

					// Einen Scope fuer die Widget-Instanz erstellen.
					var scope = RB.Widget.scope(widget.name, this, clazz, widgets[name].parts);

					// Den Scope dem Objekt hinzufuegen um von aussen darauf reagieren zu koennen
					var scopeDataObject = $(this).data('rbWidgetScope');

					if(!scopeDataObject) scopeDataObject = {};

					scopeDataObject[name] = scope;

					$(this).data('rbWidgetScope', scopeDataObject);

					// Begrenzung der Aktivitaet auf bestimmte Breakpoints erfassen
					// um spaeter entsprechend den Status zu aendern und
					// ggf. die setUp und tearDown Funktion ausfuehren.
					var limitToBreakpoints = $(this).attr(RB.dataPrefix + widget.name + '-limit-to') || scope.config.limitTo;

					// Das Widget mit dem Scope und dem aktuellen Element als
					// "this" initialisieren.
					var instance = widgets[name].init.apply(this, [scope]);

					widgets[name].instances.push([instance, scope]);

					// Falls Breakpoints verwendet werden um das Widget zu aktivieren
					// und zu deaktivieren wird der RB.Breakpoint-Service dafuer
					// verwendet.
					if(limitToBreakpoints) {
						scope.enabled = false;

						RB.Breakpoint.enter(limitToBreakpoints, function(breakpoint) {
							scope.enabled = true;

							if(instance && "setUp" in instance) {
								instance.setUp(breakpoint);
							}
						});

						RB.Breakpoint.leave(limitToBreakpoints, function(breakpoint) {
							scope.enabled = false;
							
							if(instance && "tearDown" in instance) {
								instance.tearDown(breakpoint);
							}
						});
					// Falls keine Breakpoints verwendet werden wird
					// die setUp-Funktion direkt ausgefuehrt.
					} else if(instance && "setUp" in instance) {
						scope.enabled = true;
						setUpCalls.push(function() {
							instance.setUp(scope, RB.Breakpoint.current());
						});
					}
				});
			}

			for(var i = 0; i < setUpCalls.length; i++) {
				setUpCalls[i].apply();
			}

			RB.Breakpoint.update();
		},

		/**
		 * Erzeugt ein Scope-Objekt fuer eine Widget-Instanz, das einige
		 * Kontext-spezifische Funktionen und Eigenschaften zur Verfuegung
		 * stellt.
		 *
		 * @param  {String}   name  Name des Widgets fuer den der Scope
		 *                          erzeugt wird.
		 * @param  {Object}   root  Basis-Element des Widgets.
		 * @param  {String}   clazz Klassenname des Widgets.
		 * @param  {String[]} parts Liste der einzelnen Bestandteile des
		 *                          Widgets (z.B. Panes beim Tabs-Widget)
		 * @return {Object}         Ein neu angelegtes Scope-Objekt fuer dieses
		 *                          Widget.
		 */
		scope: function(name, root, clazz, parts) {
			// jQuery-Wrapper fuer den Container erzeugen.
			var $root      = $(root);
			var dataPrefix = RB.dataPrefix + name;
			var dataKey    = RB.Widget.camelize(RB.dataPrefix.substr(5) + name);

			// Scope-Objekt fuer weitere Modifikationen in einer Variable speichern.
			var scope = {
				/**
				 * Die ID dieser Widget-Instanz.
				 *
				 * @type {Integer}
				 */
				ID: RB.nextWidgetID++,
				/**
				 * Flag ob das Widget sich innerhalb der zulaessigen Breakpoints
				 * befindet.
				 *
				 * @type {Boolean}
				 */
				enabled: true,

				/**
				 * Objekt mit den optional im data-rb-[WIDGET]-Attribut
				 * gefundenen Einstellungen.
				 *
				 * @type {Object}
				 */
				config: null,

				/**
				 * Gibt das Wurzel-Element des Widgets zurueck.
				 *
				 * @return {jQuery}
				 */
				root: function() {
					return $root;
				},

				/**
				 * Gibt die Klasse des Widgets zurueck.
				 *
				 * @param  {String} suffix      [Optional] Suffix an die Klasse
				 *                              anhaengen.
				 * @param  {Boolean} asSelector [Optional] Klasse als Selektor
				 *                              zurueckgeben (mit "." vor dem Namen).
				 *                              Standard ist "false";
				 * @return {String}
				 */
				clazz: function(suffix, asSelector) {
					if(typeof suffix === "boolean") {
						asSelector = suffix;
						suffix = "";
					}

					return (asSelector ? clazz : clazz.substr(1)) + (suffix ? '-' + suffix : '');
				},

				/**
				 * Gibt den passenden Selektor fuer das Widget oder eine
				 * Komponente zurueck inklusive Data-Attribut.
				 *
				 * @param  {String} suffix [Optional] Komponenten-Suffix
				 * @return {String}        Klassen- und Attribut-Selektor
				 */
				selector: function(suffix) {
					var className = clazz + (suffix ? "-" + suffix : "");

					return className + ",[data-" + className.substr(1) + "]";
				},

				dataKey: function() {
					return dataKey;
				},

				/**
				 * Wrapper fuer jQuery.find, welcher nur Elemente mit demselben
				 * Widget-Wurzelelement findet, d.h. keine Elemente die in einem
				 * verschachtelten Widget desselben Typs liegen.
				 *
				 * @param  {String} selector CSS-Selektor (wie bei jQuery)
				 * @return {jQuery}          Liste der gefundenen und gefilterten
				 *                           Objekte.
				 */
				find: function(selector) {
					return $root.find(selector).filter(function() {
						return $(this).closest(clazz + ',[' + dataPrefix + ']')[0] === root;
					});
				},

				/**
				 * Findet Element innerhalb des Scopes anhand einer oder mehrerer
				 * Attribute.
				 *
				 * @param  {Array}  attributes Eine Array von Attributen, wobei
				 *                             jedes Element entweder ein Attribut-
				 *                             Name oder ein Array bestehend aus
				 *                             [ Attribut, Operator, Wert ] ist.
				 * @param  {Object} elements   Optional eine Sammlung von Elementen
				 *                             die nach den Attributen gefiltert
				 *                             werden. Standardmaessig wird das
				 *                             Wurzelelement des Scopes durchsucht.
				 * @return {jQuery}            Liste der passenden Elemente.
				 */
				findByAttributes: function(attributes, elements) {
					var selector = '', attribute, operator, value;

					if(!$.isArray(attributes[0])) {
						attributes = [attributes];
					}

					for(var i = 0; i < attributes.length; i++) {
						operator = '=';
						value = null;

						if($.isArray(attributes[i])) {
							attribute = attributes[i][0];
							operator  = attributes[i][1];
							value     = '"' + attributes[i][2] + '"';
						} else {
							attribute = attributes[i];
						}

						selector += '[' + this.dataPrefix(attribute) + operator + value + ']';
					}

					if(elements) {
						return $(elements).filter(selector);
					} else {
						return this.find(selector);
					}
				},

				/**
				 * Helfer-Funktion fuer das finden eines Widget-Bestandteils ueber
				 * seinen Namen. Diese sollten ihre Klasse nach der Konvention
				 * » Widget-Klasse + "-" + Bestandteil-Name « bilden.
				 *
				 * @param  {String} suffix Name (Klassen-Suffix) des Bestandteils.
				 * @return {jQuery}
				 */
				findPart: function(suffix) {
					return this.find(clazz + '-' + suffix + ",[" + RB.dataPrefix + name + "-" + suffix + "]");
				},

				/**
				 * Gleiches Prinzip wie bei "findPart", nur innerhalb des DOM nach
				 * oben statt nach unten (jQuery.closest).
				 *
				 * @param  {String} name Name (Klassen-Suffix) des Bestandteils.
				 * @return {jQuery}
				 */
				closestPart: function(name, origin) {
					if(origin === undefined) origin = $root;

					return $(origin).closest(scope.selector(name));
				},

				/**
				 * Methode zum ueberpruefen ob eine Menge von DOM-Elemten
				 * einem bestimmten Element oder Selektor entspricht oder
				 * diesen enthaelt.
				 *
				 * @param  {Mixed}   what    Selector oder DOM-Element nach dem
				 *                           gesucht werden soll.
				 * @param  {Mixed}   wherein Optional Selector oder DOM-
				 *                           Element(e) in denen gesucht werden
				 *                           soll. Standard ist das aktuelle
				 *                           Widget und all seine Komponenten.
				 * @return {Boolean}
				 */
				contains: function(what, wherein) {
					if(wherein === undefined) {
						wherein = $root;

						var partNames = Object.keys(scope.parts);

						for(var i = 0; i < partNames.length; i++) {
							wherein = wherein.add(scope.parts[partNames[i]]);
						}
					} else {
						wherein = $(wherein);
					}

					var contained = false;

					if(typeof what === "string") {
						wherein.each(function() {
							if($(this).is(what) || scope.find(what).length > 0) {
								contained = true;
								return false;
							}
						});
					} else {
						wherein.each(function() {
							if(this === what || scope.find(what).length > 0) {
								contained = true;
								return false;
							}
						});
					}

					return contained;
				},

				/**
				 * Ein jQuery.data-Wrapper, der den Data-Attribut-Praefix des
				 * Widgets beruecksichtigt. Dieser sollte aus RB-Attribut-Basis
				 * + "-" + Widget-Name + "-" + Attribut bestehen, z.B.
				 * "data-rb-switch-limit-to".
				 *
				 * @param  {String} attr         [Optional] Name des Data-Attributes
				 *                               - genau so wie er im HTML steht
				 *                               ohne den Widget-Praefix.
				 * @param  {Mixed}  defaultValue [Optional] Standard-Wert falls
				 *                               das Data-Attribut nicht existiert.
				 *                               Standard ist "null";
				 * @param  {jQuery} element      [Optional] Element bei welchem das
				 *                               data-Attribut definiert wurde.
				 *                               Standard ist "root".
				 * @return {Mixed}               Entweder der uebergebene Standard-Wert,
				 *                               undefined, ein String oder im Falle von
				 *                               JSON ein Objekt.
				 */
				data: function(attr, defaultValue, element) {
					// Falls kein Element zum Suchen uebergeben wurde wird das
					// Root-Element des Widgets verwendet.
					if(element === undefined) {
						element = $root;

						// Da der Standard-Wert optional ist kann auch dieses
						// Argument das Basis-Element mit den Attributen sein
						// und sollte entsprechend ueberprueft werden.
						if(defaultValue && typeof defaultValue === "object") {
							// jQuery-Check
							if("fadeTo" in defaultValue) {
								element = defaultValue;
								defaultValue = undefined;
							// DOM-Node-Check
							} else if("nodeType" in defaultValue) {
								element = $(defaultValue);
								defaultValue = undefined;
							}
						// Dasselbe gilt fuer den Namen des Attributes. Wenn dieser
						// allerdings nicht vorhanden ist macht es keinen Sinn einen
						// Standard-Wert zu setzen (da ja ein Objekt mit Attributen
						// zurück kommt).
						} else if(attr && typeof attr === "object") {
							if("fadeTo" in attr) {
								element = attr;
								attr = undefined;
							} else if("nodeType" in attr) {
								element = attr;
								attr = undefined;
							}
						}
					}

					// Falls kein Attribut uebergeben wurde werden alle Attribute
					// mit dem passenden Praefix zurueck gegeben.
					if(attr === undefined) {
						var search = RB.Widget.camelize(RB.dataPrefix.substr(5) + name);
						var filtered = {};
						var data = $(element).data();
						var attributes = Object.keys(data);

						for(var i = 0; i < attributes.length; i++) {
							if(attributes[i].indexOf(search) === 0) {
								if(attributes[i] in filtered) {
									if(!$.isArray(data[attributes[i]])) {
										filtered[attributes[i]] = [filtered[attributes[i]]];
									}

									filtered[attributes[i]].push(data[attributes[i]]);
								}
							}
						}
					// Falls der Name eines Attributes uebergeben wurde wird
					// der Name innerhalb des Data-Storage von jQuery aus
					// dem globalen Data-Praefix, dem Namen des Widgets und
					// dem Namen des Attributes gebildet. Aus den Bindestrichen
					// macht jQuery fuer das Objekt automatisch Camel-Case-Namen,
					// also muessen wir das hier auch machen.
					} else {
						var key = RB.dataPrefix.substr(5) + name + (attr.length > 0 ? '-' + attr : '');
						var value = $(element).data(RB.Widget.camelize(key));

						// Falls es keinen Standard-Wert gibt muss der Wert
						// des Attributes auch nicht ueberprueft werden.
						if(defaultValue === undefined) {
							return value;
						} else {
							return value === undefined ? defaultValue : value;
						}
					}
				},

				/**
				 * Ein Wrapper um die data-Funktion der das Ergebnis in einen
				 * Booleschen Wert konvertiert. Undefinierte Werte und "false",
				 * "0" und "no" werden als Unwahr interpretiert, alle anderen als
				 * Wahr.
				 *
				 * @param  {String} attr         [Optional] Name des Data-Attributes
				 *                               - genau so wie er im HTML steht
				 *                               ohne den Widget-Praefix.
				 * @param  {Mixed}  defaultValue [Optional] Standard-Wert, entweder
				 *                               true oder false;
				 * @param  {jQuery} $element     [Optional] Element bei welchem das
				 *                               data-Attribut definiert wurde.
				 *                               Standard ist "root".
				 * @return {Mixed}               Entweder der uebergebene Standard-Wert,
				 *                               undefined, ein String oder im Falle von
				 *                               JSON ein Objekt.
				 */
				dataBool: function(attr, defaultValue, $element) {
					var value = this.data(attr, defaultValue === true, $element);

					if($.inArray(value, [false, "false", "0", "no"])) {
						return false;
					} else {
						return true;
					}
				},

				/**
				 * Gibt den Praefix fuer Widget-spezifische HTML5-Data-Attribute
				 * zurueck. Das kann z.B. bei der Filterung nach bestimmten
				 * Attribut-Werten innerhalb des Widgets praktisch sein.
				 *
				 * @return {String} Praefix der Widget-Data-Attribute
				 */
				dataPrefix: function(append, camelize) {
					if(camelize === undefined) {
						camelize = false;
					}

					if(typeof append === "boolean") {
						camelize = append;
						append = null;
					}

					var attr = dataPrefix;

					if(append) {
						attr += '-' + append;
					}

					return camelize ? RB.Widget.camelize(attr.substr(5)) : attr;
				},

				/**
				 * Wrapper fuer die jQuery.on-Funktion zum setzen eines Widget-
				 * spezifischen Event-Handlers der die Event-Namespace-Moeglichkeit
				 * von jQuery nutzt und automatisch nach dem Widget-spezifischen
				 * Namespace filtert.
				 *
				 * @param  {String}   event    Name des spezifischen Widget-Events.
				 * @param  {Object}   element  Element auf dem das Event ausgeloest.
				 *                             werden soll.
				 * @param  {Function} callback Callback-Funktion wenn das Evnet mit
				 *                             dem Widget-Namespace aufgerufen wird.
				 */
				on: function(events, element, callback, options) {
					if($.isFunction(element)) {
						callback = element;
						element = null;
					}

					var eventList = '';
					var touchEventList = '';

					events = $.trim(events).split(' ');

					for(var i = 0; i < events.length; i++) {
						if($.inArray(events[i], RB.SUPPORTED_TOUCH_EVENTS) >= 0) {
							if(RB.support.touchEvents) {
								if(touchEventList !== '') touchEventList += ' ';
								// Achtung: Kein Support fuer Namespaces!
								touchEventList += events[i];
							}
						} else {
							if(eventList !== '') eventList += ' ';
							eventList += events[i] + clazz;
						}
					}

					var $element = element ? $(element) : $root;

					if(eventList !== '') {
						$element.on(eventList, function(evt) {
							if(!evt.namespace || evt.namespace === clazz.substr(1)) {
								return callback.apply(this, arguments);
							}
						});
					}

					if(touchEventList !== '') {
						if($('html').hasClass('android-browser') && "mobile" in jQuery.fn) {
							$element.on(touchEventList, callback);
						} else {
							options = $.extend({
								// Fix fuer Chrome on Android
								drag_min_distance: 1,
								swipe_velocity: 0.1
							}, options || {});

							$element.hammer(options).on(touchEventList, callback);
						}
					}
				},

				/**
				 * Wrapper fuer die jQuery.off-Funktion zum entfernen eines Widget-
				 * spezifischen Event-Handlers der die Event-Namespace-Moeglichkeit
				 * von jQuery nutzt und damit keine anderen Events mit dem gleichen
				 * Namen entfernt.
				 *
				 * @param  {String} event   Name des spezifischen Widget-Events.
				 * @param  {Object} element Element auf dem das Event ueberwacht wurde.
				 */
				off: function(event, element) {
					(element ? $(element) : $root).off(event + clazz);
				},

				/**
				 * Loest bei allen Widget-Instanzen desselben oder eine spezifischen
				 * Widgets ein bestimmtes Ereignis aus.
				 *
				 * @param  {String} event      Name des Ereignis (ohne Namepsace!)
				 * @param  {String} widgetName [Optional] Name Widgets bei dessen
				 *                             Instanzen das Ereignis ausgeloest
				 *                             werden soll. Standard ist das Widget
				 *                             zu dem dieser Scope gehoehrt.
				 * @param  {Array}  params     [Optional] Parameter die der Event-
				 *                             Listener zusaetzlich zum Event erhalten
				 *                             soll.
				 */
				trigger: function(event, widgetName, params) {
					// Falls das zweite Argument bereits die Parameter sind
					// werden als Ziel alle Instanzen des aktuellen Widgets
					// angesteuert.
					if(params === undefined && $.isArray(widgetName)) {
						params = widgetName;
						widgetName = name;
					} else if(widgetName === undefined) {
						params = [];
						widgetName = name;
					}

					widgetName = RB.Widget.camelize(widgetName);

					var scope;

					// Alle Instanzen des Widgets durchgehen und den Scope holen.
					// Auf dem Wurzelelement der Instanz dann das Event inklusive
					// dem Namespace des Scopes ausloesen.
					if(widgetName in widgets) {
						for(var i = 0; i < widgets[widgetName].instances.length; i++) {
							scope = widgets[widgetName].instances[i][1];
							scope.root().trigger(event + scope.clazz(true), params);
						}
					} else {
						// Falls das Widget nicht gefunden/definiert wurde an
						// dieser Stelle eine hilfreiche Fehlermeldung ausgeben.
						throw new Error(
							"Cannot trigger event", event, "on widget", widgetName,
							": widget does not exist!"
						);
					}
				},

				/**
				 * Versctecken eines Elementes mit reversibler inline-CSS-Modifikation.
				 *
				 * @param  {Object} element Optional ein HTML-Element oder eine
				 *                          jQuery-Collection die versteckt
				 *                          werden soll.
				 */
				hide: function(element) {
					if(!element) element = root;

					$(element).css('display', 'none');
				},

				/**
				 * Anzeigen eines Elementes ueber zuruecksetzen der Anzeige im
				 * inline-CSS.
				 *
				 * @param  {Object} element Optional ein HTML-Element oder eine
				 *                          jQuery-Collection die angezeigt
				 *                          werden soll.
				 */
				unhide: function(element) {
					if(!element) element = root;

					$(element).css('display', '');
				},

				/**
				 * Shortcut um die Konfiguration einer Komponente zu erhalten.
				 *
				 * @param  {DOMElement} element Komponente des aktuellen Widgets
				 * @return {Object} Die Konfiguration der Komponente oder null.
				 */
				getConfig: function(element) {
					if($(element).data(scope.dataPrefix(true))) {
						return $(element).data(scope.dataPrefix(true));
					} else {
						return null;
					}
				},

				/**
				 * Wirft einen JavaScript-Fehler mit dem Widget-Namen und dem
				 * Namen der verursachenden Funktion und dazu dem uebergebenen
				 * Text.
				 *
				 * @param  {String} funcName  Name der Funktion die den Fehler wirft.
				 * @param  {String} msg       Fehlermeldung.
				 */
				error: function(funcName, msg) {
					throw new Error('[' + name + (funcName ? ':' + funcName : '') + ']' + msg);
				},

				/**
				 * Die Konfiguration und alle Komponenten und deren Konfiguration erneut laden.
				 * @return {[type]} [description]
				 */
				refresh: function(refresh) {
					// Falls ein passendes Widget-Options-Attribut vorhanden ist dieses
					// auswerten und die Optionen dem Scope hinzufuegen.
					// Falls die Config bereits vorhanden ist und der Wert des
					// Attributes sich geandert hat wird dieser neu geparst.
					if(!scope.config || scope.config.__source !== $root.attr(scope.dataPrefix())) {
						$root.data(
							dataKey,
							RB.Widget.parseOptions($root.attr(scope.dataPrefix()))
						);

						scope.config = $root.data(dataKey);
					}

					// Falls eine Liste von Widget-Bestandteilen uebergeben wurde
					// diese mit der gefilterten Find-Funktion innerhalb des Root suchen.
					// Die gefundenen Elemente als jQuery-Wrapper unter dem Namen des
					// Bestandteils in Camel-Case speichern.
					if("length" in parts && parts.length > 0) {
						scope.parts = {};

						var partData, partAttr, $parts;

						for(var i = 0; i < parts.length; i++) {
							// Alle Komponenten des Widgets INNERHALB des Widgets suchen
							$parts = scope.findPart(parts[i]);

							// Auch der Widget-Container kann zugleich eine Komponente sein
							if($root.is(clazz + '-' + parts[i] + ",[" + RB.dataPrefix + name + "-" + parts[i] + "]")) {
								$parts = $parts.add($root);
							}

							$parts.each(function() {
								partData = $(this).data(scope.dataPrefix(parts[i], true));
								partAttr = $(this).attr(scope.dataPrefix(parts[i]));

								// Falls der Widget-Bestandteil eigene Optionen enthaelt
								// diese in ein Objekt umwandeln oder mit dem
								// zuvor geparsten String vergleichen und ggf. erneut
								// verarbeiten.
								if(
									partData && (
										typeof partData === 'string' ||
										partData.__source !== partAttr
									)
								) {
									$(this).data(
										dataKey,
										RB.Widget.parseOptions(partAttr)
									);
								}
							});

							scope.parts[RB.Widget.camelize(parts[i])] = $parts;
						}
					}

					if(refresh) scope.trigger('refresh');
				},

				destroy: function() {
					delete scope;
				}
			};

			scope.refresh();

			return scope;
		},

		// Tools

		/**
		 * Wandelt einen mit bindestrichen separierten Text in Camel-Case um.
		 *
		 * @param  {String}  str   Text mit Bindestrichen, z.B. der Name eines
		 *                         Data-Attributs.
		 * @param  {Boolean} first [Optional] Den ersten Buchstaben gross
		 *                         schreiben.
		 * @return {String}        CamelCase-Text.
		 */
		camelize: function(str, first) {
			str = str.replace(/[_-][a-z0-9]/g, function(c) {
				return c.substr(1).toUpperCase();
			});

			if(first) {
				return str.substr(0,1).toUpperCase() + str.substr(1);
			} else {
				return str;
			}
		},

		/**
		 * Verarbeitet die Angabe von Widget-Optionen im CSS-Format:
		 *
		 * "option1: value; option2; option3: value"
		 *
		 * Hat eine Option keinen Wert wird das als Boolescher Flag betrachtet
		 * und die Option bekommt den Wert True. Zudem werden die Werte "true"
		 * und "yes" als Boolesches True und die Werte "false" und "no" als
		 * Boolesches False bewertet.
		 *
		 * @param  {String} optionsString Optionen im CSS-Format.
		 * @return {Object}
		 */
		parseOptions: function(optionsString) {
			var options = {};

			if(optionsString) {
				var nvPairs = $.grep(
					$.map(optionsString.split(';'), $.trim),
					function(v) {
						return v.length > 0;
					}
				);

				var split;

				for(var i = 0; i < nvPairs.length; i++) {
					split = $.map(nvPairs[i].split(':'), $.trim);

					if(split.length > 2) {
						split = [ split.shift(), split.join(':') ];
					}

					if(split.length === 1) {
						if(split[0][0] === '!') {
							options[RB.Widget.camelize(split[0].substr(1))] = false;
						} else {
							options[RB.Widget.camelize(split[0])] = true;
						}
					} else if(split.length === 2) {
						if(split[0][0] === '$') {
							split[1] = $(split[1]);
						} else if(split[0][0].match(/^(?:\d{1,}(?:px|em|rem|%)\s*){1,4}$/)) {
							split[1] = RB.Widget.parseShorthandOption(split[1]);
						} else {
							if($.inArray(split[1].toLowerCase(), ["true", "yes"]) !== -1) {
								split[1] = true;
							} else if($.inArray(split[1].toLowerCase(), ["false", "no"]) !== -1) {
								split[1] = false;
							} else if($.isNumeric(split[1])) {
								split[1] = parseFloat(split[1]);
							} else if(split[1].indexOf(',') > 0) {
								split[1] = $.map(split[1].split(','), $.trim);
							}
						}

						options[RB.Widget.camelize(split[0])] = split[1];
					}
				}
			}

			options.__source = optionsString;

			return options;
		},
		parseShorthandOption: function(distanceString) {
			var parsedShorthand = {};

			var split = $.map(
				$.trim(offset).split(' '), 
				function(v) {
					var match = v.match(/^([0-9.]+)(px|%|em|rem)?$/);

					return [[
						parseFloat(match[1]), 
						match.length === 3 && match[2] !== "" ? match[2] : "px"
					]];
				}
			);

			if(split.length === 4) {
				parsedShorthand.top    = split[0];
				parsedShorthand.right  = split[1];
				parsedShorthand.bottom = split[2];
				parsedShorthand.left   = split[3];			
			} else if(split.length === 3) {
				parsedShorthand.top    = split[0];
				parsedShorthand.left   = split[1];
				parsedShorthand.right  = split[1];
				parsedShorthand.bottom = split[2];
			} else if(split.length === 2) {
				parsedShorthand.top    = split[0];
				parsedShorthand.bottom = split[0];
				parsedShorthand.left   = split[1];
				parsedShorthand.right  = split[1];
			} else if(split.length === 1) {
				parsedShorthand.top    = split[0];
				parsedShorthand.right  = split[0];
				parsedShorthand.bottom = split[0];
				parsedShorthand.left   = split[0];
			}

			return parsedShorthand;
		}
	};

	function refreshWidget($parent, changed) {
		// Falls ein uebergeordnetes Widget gefunden wird wird eine Klassen-
		// Liste fuer die Komponenten des Widgets erstellt. Werden innerhalb
		// des geaenderten Elementes Komponenten gefunden oder ist das
		// geaenderte Element selber eine Komponente wird das Widget aktualsiert.
		var widgetScopes = $parent.data('rbWidgetScope');

		if(widgetScopes && typeof widgetScopes === "object") {
			var widgets = Object.keys(widgetScopes);

			for(var i = 0; i < widgets.length; i++) {
				if(widgetScopes[widgets[i]].parts && typeof widgetScopes[widgets[i]].parts === "object") {
					var classList = [];
					var scopeParts = Object.keys(widgetScopes[widgets[i]].parts);

					for(var c = 0; c < scopeParts.length; c++) {
						classList.push(widgetScopes[widgets[i]].clazz(scopeParts[c], true));
					}

					if($(classList.join(','), changed).length > 0 || $(changed).is(classList.join(','))) {
						widgetScopes[widgets[i]].refresh(true);
					}
				}
			}
		}
	}

	// Nach Laden der Seite alle Widgets im Document initialisieren.
	// Zusaetzlich kann ueber das "dom-added"-Ereignis mit uebergebenem
	// neuen Element die Initialisierung auf dieses Element beschraenkt werden.
	$(document).
		on('ready', function() {
			RB.Widget.init(document);
		}).
		on('dom-added', function(evt, $added) {
			RB.Widget.init($added);
			refreshWidget($added.closest('.' + RB.widgetRootClass));
		}).
		on('dom-removed', function(evt, $removed, $parent) {
			refreshWidget(
				$parent.is('.' + RB.widgetRootClass) ?
					$parent :
					$parent.closest('.' + RB.widgetRootClass)
			);
		});

})(window.RB = window.RB || {}, jQuery, window, document);