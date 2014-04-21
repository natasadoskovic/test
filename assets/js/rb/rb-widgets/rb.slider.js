(function($, window, document, undefined) {

	RB.Widget.create('slider', ['item', 'marker', 'bar', 'handle', 'value', 'item-select', 'current'], function(scope) {
		scope.itemDistance = 100 / (scope.parts.item.length - 1);
		scope.activeItem   = scope.config.activeItem || 1;
		scope.activeClass  = scope.config.activeClass || scope.clazz('active');
		scope.direction    = scope.config.direction === 'vertical' ? 'vertical' : 'horizontal';
		scope.selected     = scope.parts.item.filter("." + scope.activeClass);
		scope.defaultItem  = scope.selected;
		scope.dragging     = false;
		scope.currentLeft  = 0;

		var config, values;

		scope.markersByValue = {};

		scope.parts.marker.each(function() {
			values = $(this).data(scope.dataPrefix(true)).on;

			if(typeof values === "string") {
				values = [values];
			}

			if($.isArray(values)) {
				for(var i = 0; i < values.length; i++) {
					if(!scope.markersByValue[values[i]]) {
						scope.markersByValue[values[i]] = $();
					}

					scope.markersByValue[values[i]] = scope.markersByValue[values[i]].add(this);
				}
			}
		});

		scope.values  = [];

		scope.parts.item.each(function() {
			scope.values.push( $(this).data(scope.dataPrefix(true)).value );
		});

		scope.on('click', scope.parts.itemSelect, function(evt) {
			if(!scope.dragging) {
				var $item = $(this);

				if(!$item.hasClass(scope.clazz('item'))) {
					$item = $item.closest(scope.selector('item'));
				}

				markItem(scope, $item);
				selectItem(scope, $item, true);

				evt.preventDefault();

				return false;
			}
		});

		var updates = 0;

		scope.on('dragstart', scope.parts.bar, function(evt) {
			if("gesture" in evt) {
				scope.dragging = true;
				scope.root().css('user-select', 'none');
				updates = 0;
				evt.preventDefault();
				return false;
			}
		}, {
			drag: true,
			drag_block_horizontal: true,
		    drag_lock_min_distance: 20
		});

		scope.on('drag', function(evt) {
			if(scope.dragging && "gesture" in evt) {
				updates++;

				var handlePos = (
					scope.direction === 'horizontal' ?
						evt.gesture.center.pageX - scope.parts.bar.offset().left :
						evt.gesture.center.pageY - scope.parts.bar.offset().top
				) / scope.parts.bar.innerWidth();

				if(handlePos < 0) handlePos = 0;
				if(handlePos > 1) handlePos = 1;

				handlePos *= 100;

				scope.parts.handle.css('left', handlePos + '%');

				scope.currentLeft = handlePos;

				var nearest = Math.round(handlePos / scope.itemDistance);

				scope.selected = scope.parts.item.eq(nearest);

				markItem(scope, scope.selected);

				evt.preventDefault();
				return false;
			}
		}, {
			drag: true,
			drag_block_horizontal: true,
		    drag_lock_min_distance: 20
		});

		scope.on('dragend', function(evt) {
			if(scope.dragging && "gesture" in evt) {
				scope.dragging = false;

				evt.preventDefault();

				selectItem(scope, scope.selected);

				scope.root().css('user-select', '');

				evt.preventDefault();
				return false;
			}
		}, {
			drag: true,
		    drag_block_horizontal: true,
		    drag_lock_min_distance: 20
		});

		scope.on('reset', function(evt, value) {
			scope.selected = scope.defaultItem;

			markItem(scope, scope.selected);
			selectItem(scope, scope.selected, true);
		});

		scope.on('select', function(evt, value) {
			var valueIndex = $.inArray(value, scope.values);

			if(valueIndex >= 0) {
				scope.selected = scope.parts.item.eq(valueIndex);

				markItem(scope, scope.selected);
				selectItem(scope, scope.selected, true);
			}
		});

		selectItem(scope, scope.selected);
	});

	function markItem(scope, $item) {
		scope.parts.item.removeClass(scope.activeClass);
		$item.addClass(scope.activeClass);
	}

	function selectItem(scope, $item, moveTo) {
		var config = $item.data(scope.dataPrefix(true));

		scope.parts.value.val(config.value).trigger('change');
		scope.parts.marker.removeClass(scope.activeClass);

		if(config.value in scope.markersByValue) {
			scope.markersByValue[config.value].addClass(scope.activeClass);
		}

		scope.parts.current.html(config.label);

		if(moveTo === undefined || moveTo === true) {
			var left = scope.parts.item.index($item) * scope.itemDistance;

			scope.parts.handle.stop().animate({ left: left + "%" }, 300, 'linear');
		}

		scope.trigger('change', [config.value, config.label]);
	}

})(jQuery, window, document);