(function($, window, document, undefined) {

	RB.Widget.create('switchbox', ['page', 'open', 'toggle'], function(scope) {
		scope.collapsed   = false;
		scope.boxMode     = false;
		scope.duration    = scope.config.duration || 1000;
		scope.defaultPage = scope.config.defaultPage ||
		                    scope.parts.page.eq(0).data(scope.dataPrefix(true)).name;

		scope.pageComponents = {};

		scope.parts.page.each(function() {
			var config = $(this).data(scope.dataPrefix(true));

			if(!(config.name in scope.pageComponents)) {
				scope.pageComponents[config.name] = { pages: $(), openers: $() };
			}

			scope.pageComponents[config.name].pages = scope.pageComponents[config.name].pages.add(this);
		});

		scope.parts.open.each(function() {
			var config = $(this).data(scope.dataPrefix(true));

			scope.on('click', this, function() {
				showPage(scope, config.open);
			});

			if(!(config.open in scope.pageComponents)) {
				scope.pageComponents[config.open] = { pages: $(), openers: $() };
			}

			scope.pageComponents[config.open].openers = scope.pageComponents[config.open].openers.add(this);
		});

		scope.on('click', scope.parts.toggle, function() {
			if(scope.boxMode) {
				if(scope.collapsed) {
					openBox(scope);
					scope.collapsed = false;
				} else {
					hideBox(scope);
					scope.collapsed = true;
				}
			}
		});

		if(scope.config.collapseOn) {
			RB.Breakpoint.enter(scope.config.collapseOn, function(breakpoint) {
				showPage(scope);
				scope.collapsed = true;
				scope.boxMode = true;
			});

			RB.Breakpoint.leave(scope.config.collapseOn, function(breakpoint) {
				scope.parts.page.
					css({ opacity: '', display: '' }).
						children().
							css({ opacity: '', display: '' });

				scope.root().removeClass(scope.clazz('open'));
				scope.boxMode = false;
			});

			scope.on('hide', window, function(evt, $sourceBox) {
				if(scope.boxMode && scope.root()[0] !== $sourceBox[0]) {
					var current = Object.keys(RB.Breakpoint.current());

					for(var i = 0; i < current.length; i++) {
						if($.inArray(current[i], scope.config.collapseOn.split(' ')) >= 0) {
							hideBox(scope);
							break;
						}
					}
				}
			});
		}
	});

	function showPage(scope, pageName) {
		if(pageName === undefined) pageName = scope.defaultPage;

        scope.parts.open.css('display', 'inline-block');
        scope.pageComponents[pageName].openers.hide();

		scope.parts.page.hide();
		scope.pageComponents[pageName].pages.
			show().
			children().
				css('opacity', 0).
				animate({ opacity: 1 }, scope.duration, 'easeOutCubic');
    }

	function openBox(scope) {
		scope.root().addClass(scope.clazz('open'));

		scope.parts.page.
			show().
			children().
				filter(':not(' + scope.selector('toggle') + ')').
				filter(':not(' + scope.selector('ignore') + ')').
					show();
	}

	function hideBox(scope) {
		scope.root().removeClass(scope.clazz('open'));

		scope.parts.page.
			children().
				filter(':not(' + scope.selector('toggle') + ')').
					hide();
	}

})(jQuery, window, document);