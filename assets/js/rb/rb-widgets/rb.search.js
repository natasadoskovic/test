(function($, window, document, undefined) {

	RB.Widget.create('search', function(scope) {
		scope.openClass = null;

		$(window).
			on('open.search', function(evt, openClass) {
				if(scope.enabled && evt.namespace === "search") {
					scope.root().show().addClass(openClass);
					scope.openClass = openClass;
				}
			}).
			on('close.search', function(evt) {
				if(scope.enabled && evt.namespace === "search") {
					scope.root().hide().removeClass(scope.openClass);
				}
			});

		scope.root().offclick(function(evt) {
			if(scope.enabled && !$(evt.target).hasClass(scope.openClass) && !$(evt.target).closest('.' + scope.openClass).length) {
				$(window).trigger('close.rb-mainmenu', ['search', evt]);
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