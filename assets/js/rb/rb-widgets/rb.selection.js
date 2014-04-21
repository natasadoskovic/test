(function($, window, document, undefined) {

	RB.Widget.create('selection', ['value', 'item', 'list', 'reset', 'all'], function(scope) {
		scope.selection = {};
		scope.listTemplate = new RB.Template($.trim(scope.parts.list.html() || ''));
		scope.selectedClass = scope.config.classSelected || scope.clazz('selected');

		scope.items = {
			checkbox : $(),
			radio    : $(),
			slider   : $()
		};

		scope.parts.item.each(function() {
			this.label = getLabel(scope, this);

			if(this.nodeName.toLowerCase() === 'input') {
				if(this.type === 'checkbox') {
					scope.items.checkbox = scope.items.checkbox.add(this);
					checkbox(scope, this);
					$(this).on('change', function() { 
						checkbox(scope, this, true); 
						scope.root().trigger('changed.' + scope.clazz(), [this]);
					});
				} else if(this.type === 'radio') {
					scope.items.radio = scope.items.radio.add(this);
					radio(scope, this);
					$(this).on('change', function() { 
						radio(scope, this, true);
						scope.root().trigger('changed.' + scope.clazz(), [this]);
					});
				}
			} else {
				var config = $(this).data(scope.dataPrefix(true));

				this.value = config.value;
				this.checked = config.checked || false;

				if(!config.type || config.type === 'checkbox') {
					scope.items.checkbox = scope.items.checkbox.add(this);
					checkbox(scope, this);

					$(this).on('click', function() {
						this.checked = !this.checked;
						checkbox(scope, this, true);
						scope.root().trigger('changed.' + scope.clazz(), [this]);
					});
				} else if(config.type === 'radio') {
					scope.items.radio = scope.items.radio.add(this);
					radio(scope, this);

					$(this).on('click', function() {
						this.checked = !this.checked;
						radio(scope, this, true);
						scope.root().trigger('changed.' + scope.clazz(), [this]);
					});
				} else if(config.type === 'slider' && "name" in config) {
					// ein RB-Slider-Widget wird als Quelle des Wertes angenommen
					$(this).data('rbWidgetScope').slider.on('change', function(evt, value, label) {
						slider(scope, config.name, value, label, true);
						scope.root().trigger('changed.' + scope.clazz(), [this]);
					});

					scope.items.slider = scope.items.slider.add(this);
				}
			}
		});

		scope.parts.reset.on('click', function(evt) {
			resetSelection(scope);
		});

		scope.parts.all.on('click', function() {
			selectAll(scope);
		});

		if(scope.config.$dependsOn) {			
			scope.config.$dependsOn.on('reset.' + scope.clazz(), function() {
				resetSelection(scope);
			});
		}

		update(scope);
	});

	function getLabel(scope, input) {
		var $label = $(input).closest('label');

		if($label.length === 0) {
			$label = $('label[for="' + input.id + '"]');
		}

		if($label.length > 0) {
			return $label.html();
		} else {
			var config = $(this).data(scope.dataPrefix(true));

			if(config && "label" in config) {
				return config.label;
			} else {
				return null;
			}
		}
	}

	function radio(scope, input, doUpdate) {
		if(input.checked) {
			scope.selection[input.name] = [input.value, input.label];
		}

		if(doUpdate) update(scope);
	}

	function checkbox(scope, input, doUpdate) {
		if(input.name.match(/\[[^\]]*\]$/)) {
			if(!$.isArray(scope.selection[input.name])) {
				scope.selection[input.name] = [];
			}

			var value = [input.value, input.label], valueIndex = -1;

			for(var i = 0; i < scope.selection[input.name].length; i++) {
				if(scope.selection[input.name][i][0] === value[0] && scope.selection[input.name][i][1] === value[1]) {
					valueIndex = i;
					break;
				}
			}

			if(input.checked) {
				if(valueIndex === -1) {
					scope.selection[input.name].push(value);
				}
			} else {
				if(valueIndex >= 0) {
					scope.selection[input.name].splice(valueIndex, 1);
				}
			}
		} else {
			scope.selection[input.name] = [input.checked, input.label];
		}

		if(doUpdate) update(scope);
	}

	function slider(scope, name, value, label, doUpdate) {
		scope.selection[name] = [value, label];

		if(doUpdate) update(scope);
	}

	function resetSelection(scope) {
		scope.items.radio.each(function() {
			this.checked = false;
			scope.selection[this.name] = [];
			scope.root().trigger('reset.' + scope.clazz(), [this]);
		});

		scope.items.checkbox.each(function() {
			if(this.checked) $(this).click();
			scope.root().trigger('reset.' + scope.clazz(), [this]);
		});

		scope.items.slider.each(function() {
			$(this).trigger('reset');
			scope.selection[$(this).data(scope.dataPrefix(true)).name] = [];
			scope.root().trigger('reset.' + scope.clazz(), [this]);
		});

		update(scope);
	}

	function selectAll(scope) {
		update(scope);
	}

	function getListLabel(scope, selection) {
		value = selection[0];
		label = selection[1];

		if(value && value !== false) {
			return scope.listTemplate.render({ label: label });
		} else {
			return '';
		}
	}

	function update(scope) {
		var value, label, html = '', selected = Object.keys(scope.selection);

		for(var c = 0; c < selected.length; c++) {
			if($.isArray(scope.selection[selected[c]][0])) {
				for(var i = 0; i < scope.selection[selected[c]].length; i++) {
					html += getListLabel(scope, scope.selection[selected[c]][i]);
				}
			} else {
				html += getListLabel(scope, scope.selection[selected[c]]);
			}
		}

		scope.parts.list.html(html);

		if(html !== '') {
			scope.root().addClass(scope.selectedClass);
			scope.root().trigger('selected.' + scope.clazz());
		} else {
			scope.root().removeClass(scope.selectedClass);
			scope.root().trigger('cleared.' + scope.clazz());
		}
	}

})(jQuery, window, document);