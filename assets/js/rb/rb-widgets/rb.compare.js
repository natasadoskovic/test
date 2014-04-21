(function($, window, document, undefined) {

	RB.Widget.create('compare', ['item', 'remove'], function(scope) {

		scope.itemPartsByName = {};
		scope.itemCount = 0;

		scope.parts.item.each(function() {
			var config = $(this).data(scope.dataPrefix('', true));

			if(!(config.name in scope.itemPartsByName))  {
				scope.itemPartsByName[config.name] = $();
				scope.itemCount++;
			}

			scope.itemPartsByName[config.name] = scope.itemPartsByName[config.name].add(this);
		});

		scope.on('click', scope.parts.remove, function() {
			if(scope.enabled) {
				if(scope.itemCount > scope.config.minimum || 0) {
					var config = $(this).data(scope.dataPrefix('', true));

					scope.itemPartsByName[config.item].fadeTo(300, 0).promise().done(function() {
						$(this).remove();

						scope.itemCount--;

						for(var i = 0; i < scope.config.class.length; i++) {
							scope.root().removeClass(scope.config.class[i]);
						}

						if(scope.config.class.length >= scope.itemCount) {
							scope.root().addClass(scope.config.class[scope.itemCount-1]);
						}
					});
				}
			}
		});
	});

})(jQuery, window, document);