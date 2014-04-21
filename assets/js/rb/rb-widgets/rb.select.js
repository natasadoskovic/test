(function($, window, document, undefined) {

	RB.Widget.create('select', ['toggle', 'container', 'item', 'chosen'], function(scope) {

		scope.open = false;
		scope.selected = null;
		scope.defaultText = scope.parts.chosen.eq(0).html();
		scope.select = null;
		scope.inlineStyle = '';

		if(scope.config.name && scope.root().closest('form').length > 0) {
			scope.select = scope.root().closest('form').find('[name="' + scope.config.name + '"]');
		}

		scope.default = scope.parts.toggle.html();

		scope.parts.toggle.on('click', function(evt) {
			if(scope.enabled) {
				toggle(scope);
				evt.preventDefault();
			}
		});

		scope.parts.item.on('click', function(evt) {
			if(scope.enabled) {
				scope.parts.item.removeClass(scope.clazz('selected'));
				$(this).addClass(scope.clazz('selected'));
				select(scope, this);
				evt.preventDefault();
			}
		});

		scope.root().offclick(function() {
			if(scope.enabled) {
				close(scope);
			}
		});

		scope.on('reset', function() {
			scope.parts.item.filter('.' + scope.clazz('selected')).removeClass(scope.clazz('selected'));
			scope.parts.chosen.html(scope.defaultText);
		});

		scope.originalPrevious = scope.parts.container.prev();

		return {
			setUp: function() {
				scope.parts.container.hide();
			},
			tearDown: function() {
				scope.parts.container.show();
			}
		};

	});

	function toggle(scope) {
		if(scope.open) {
			close(scope);
		} else {
			open(scope);
		}
	}

	function open(scope) {
		scope.inlineStyle = scope.parts.container.attr('style');
		
		var $container        = scope.parts.container.show();
		var containerOffset   = $container.offset();
		var parentOffset      = { top: 0, left: 0 };
		var $attachmentTarget = null;

		if(scope.config.attachTo && scope.config.attachTo !== 'body') {
			$attachmentTarget = $(scope.config.attachTo);
		} else {
			$attachmentTarget = $(document.body);
		}

		if($attachmentTarget.css('position') === 'static') {
			$attachmentTarget.parents().each(function() {
				if($(this).css('position') !== 'static') {
					parentOffset = $(this).offset();
					return false;
				}
			});
		} else {
			parentOffset = $attachmentTarget.offset();
		}

		$container.appendTo(scope.config.attachTo || 'body').css({
			position : 'absolute',
			top      : containerOffset.top - parentOffset.top,
			left     : containerOffset.left - parentOffset.left,
		});

		var width           = $container.width();
		var height          = $container.height();
		var containerBottom = containerOffset.top + height + (scope.config.windowMargin || 40);
		var windowBottom    = $(window).height() + $(window).scrollTop();
		var delta           = windowBottom - containerBottom;

		if(width < scope.root().width()) {
			$container.css('width', scope.root().width());
		}

		if(delta < 0) {
			$container.css('height', height + delta);
		}

		scope.open = true;
	}

	function close(scope) {
		scope.parts.container.attr('style', scope.inlineStyle).hide();

		scope.originalPrevious.after(scope.parts.container);

		scope.open = false;
	}

	function select(scope, item) {
		var config = $(item).data(scope.dataPrefix(true));

		scope.selected = config.value;

		if(scope.select) {
			scope.select.val(scope.selected);
		}

		if(scope.parts.chosen.length > 0) {
			scope.parts.chosen.html(config.label || $(item).html());
		}

		close(scope);
	}

})(jQuery, window, document);