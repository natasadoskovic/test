(function($, window, document, undefined) {

	RB.Widget.create('accordion', ['item'], function(scope) {
		var current = null;
		var multiple = scope.config.multiple || false;

		scope.parts.item.each(function() {
			var $item    = $(this);
			var $toggle  = $(scope.clazz(true) + '-item-toggle', this);
			var $content = $(scope.clazz(true) + '-item-content', this);

			$toggle.on('click', function(evt) {
				if(scope.enabled) {
					if(multiple) {
						if($item.hasClass(scope.clazz() + '-item-open')) {
							close(scope, $item);
						} else {
							open(scope, $item);
						}
					} else {
						if(current) {
							close(scope, $(current));

							if(current !== $item[0]) {
								open(scope, $item);
								current = $item[0];
							} else {
								current = null;
							}
						} else {
							open(scope, $item);
							current = $item[0];
						}
					}

					evt.preventDefault();
				}
			});
		});

		return {
			setUp: function(name) {
				$invisible = null;

				if(!scope.root().is(':visible')) {
					$invisible = scope.root();

					while(!$invisible.parent().is(':visible')) {
						$invisible = $invisible.parent();
					}
				}

				currentDisplay = $invisible ? $invisible.css('display') : null;

				if($invisible) $invisible.css('display', 'block');

				scope.findPart('item-content').each(function() {
					var $item = $(this).closest(scope.clazz('item', true));

					if($item.hasClass(scope.clazz('item-open'))) {
						current = $item[0];
					} else {
						if(scope.config.animate) {
							$(this).show().css('margin-top', -$(this).outerHeight());
						} else {
							$(this).hide();
						}
					}
				});

				if($invisible) $invisible.css('display', currentDisplay);
			},
			tearDown: function(name) {
				if(scope.config.animate) {
					scope.findPart('item-content').css({ marginTop: '', display: '' });
				} else {
					scope.findPart('item-content').css('display', '');
				}
			}
		};
	});

	function getBool(misc, defaultValue) {
		return misc !== undefined ?
			$.inArray(misc, [true, 1, "true", "yes"]) >= 0 : defaultValue;
	}

	function open(scope, $item) {
		$item.addClass(scope.clazz() + '-item-open');

		if(scope.config.animate) {
			$item.
				find(scope.clazz(true) + '-item-content').
					animate({ marginTop: 0 }, 300, 'linear');
		} else {
			$item.
				find(scope.clazz(true) + '-item-content').
					show();
		}
	}

	function close(scope, $item) {
		var $content = $item.find(scope.clazz(true) + '-item-content');

		$item.removeClass(scope.clazz() + '-item-open');
        $('.rb-tabs-active',$item).removeClass('rb-tabs-active');

		if(scope.config.animate) {
			$content.animate({ marginTop: -$content.outerHeight() }, 300, 'linear');
		} else {
			$content.hide();
		}
	}

})(jQuery, window, document, undefined);