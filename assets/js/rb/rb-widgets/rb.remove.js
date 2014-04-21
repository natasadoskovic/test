(function($, window, document, undefined) {

	RB.Widget.create('remove', ['trigger'], function(scope) {

		scope.parts.trigger.on('click', function() {
			var $parent = scope.root().parent();
			var $removed = scope.root().remove();

			$(document).trigger('dom-removed', [$removed, $parent]);
			scope.destroy();

			return false;
		});

	});

})(jQuery, window, document);