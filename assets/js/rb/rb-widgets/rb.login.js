(function($, window, document, undefined) {

	RB.Widget.create('login', function(scope) {
		scope.openClass = null;

		$(window).
			on('open.login', function(evt, openClass) {
				if(scope.enabled && evt.namespace === "login") {
					scope.root().show().addClass(openClass);
					scope.openClass = openClass;
				}
			}).
			on('close.login', function(evt) {
				if(scope.enabled && evt.namespace === "login") {
					scope.root().hide().removeClass(scope.openClass);
				}
			});

		scope.root().offclick(function(evt) {
			if(scope.enabled && !$(evt.target).hasClass(scope.openClass) && !$(evt.target).closest('.' + scope.openClass).length) {
				$(window).trigger('close.rb-mainmenu', ['login', evt]);
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