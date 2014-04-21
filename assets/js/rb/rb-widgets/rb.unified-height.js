(function($, window, document, undefined) {

	var groups  = {},
		groupID = 1;

	RB.Widget.create('unified-height', function(scope) {
		var groupName = scope.config.group || 'group-' + groupID++;

		if(!(groupName in groups)) {
			groups[groupName] = $();
		}

		scope.root().addClass(scope.clazz(groupName));

		groups[groupName] = groups[groupName].add(scope.root());

		return {
			setUp: function(breakpoint) {

			},
			tearDown: function(breakpoint) {
				scope.root().css({
					display: '',
					height: ''
				});
			}
		};
	});

	function updateColumns() {
		var groupHeight;
		var $enabledWidgets = $();
		var names = Object.keys(groups);

		for(var i = 0; i < names.length; i++) {
			groupHeight = 0;

			groups[names[i]].each(function() {
				var $root = $(this);
				var scope = $root.data('rbWidgetScope').unifiedHeight;

				if(scope.enabled) {
					var hidden = $root.css('display') === 'none';

					if(hidden) $root.show();

					var columnHeight = $root.css('height', '').height();

					if(hidden) $root.hide();

					if(columnHeight > groupHeight) {
						groupHeight = columnHeight;
					}

					$enabledWidgets = $enabledWidgets.add(this);
				}
			});

			$enabledWidgets.css('height', groupHeight);
		}
	}

	$(window).on('load resize', function() {
		updateColumns();
	});

})(jQuery, window, document);