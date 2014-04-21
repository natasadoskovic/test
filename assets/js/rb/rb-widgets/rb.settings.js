(function($, window, document, undefined) {

	RB.Widget.create('settings', function(scope) {
		scope.openClass = null;

		$(window).
			on('open.settings', function(evt, openClass) {
				if(scope.enabled && evt.namespace === "settings") {
					scope.root().show().addClass(openClass);
					scope.openClass = openClass;
				}
			}).
			on('close.settings', function(evt) {
				if(scope.enabled && evt.namespace === "settings") {
					scope.root().hide().removeClass(scope.openClass);
				}
			});

		scope.root().offclick(function(evt) {
			if(scope.enabled && !$(evt.target).hasClass(scope.openClass) && !$(evt.target).closest('.' + scope.openClass).length) {
				$(window).trigger('close.rb-mainmenu', ['settings', evt]);
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