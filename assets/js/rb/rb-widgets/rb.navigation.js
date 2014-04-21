(function($, window, document, undefined) {

	RB.Widget.create('navigation', function(scope) {
		scope.openClass = null;

		$(window).
			on('open.navigation', function(evt, openClass) {
				if(scope.enabled && evt.namespace === "navigation") {
					scope.root().show().addClass(openClass);
					scope.openClass = openClass;
				}
			}).
			on('close.navigation', function(evt) {
				if(scope.enabled && evt.namespace === "navigation") {
					scope.root().hide().removeClass(scope.openClass);
				}
			});

		scope.root().offclick(function(evt) {
			if(scope.enabled && !$(evt.target).hasClass(scope.openClass) && !$(evt.target).closest('.' + scope.openClass).length) {
				$(window).trigger('close.rb-mainmenu', ['navigation', evt]);
			}
		});

		return {
			setUp: function(breakpoint) {
				scope.root().hide();
			},

			tearDown: function(breakpoint) {
				scope.root().css('display', '');
			}
		}
	});

})(jQuery, window, document);