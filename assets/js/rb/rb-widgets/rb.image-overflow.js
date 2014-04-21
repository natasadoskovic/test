(function($, window, document, undefined) {

	RB.Widget.create('image-overflow', ['image'], function(scope) {
		scope.debug  = null;
		scope.offset = { top: 0, right: 0, bottom: 0, left: 0 };

		if(scope.config.offset) {
			var values = $.map(scope.config.offset.split(' '), parseFloat);

			switch(values.length) {
				case 1:
					scope.offset = { top: values[0], right: values[0], bottom: values[0], left: values[0] };
					break;
				case 2:
				case 3:
					scope.offset = { top: values[0], right: values[1], bottom: values[0], left: values[1] };
					break;
				case 4:
					scope.offset = { top: values[0], right: values[1], bottom: values[2], left: values[3] };
					break;
			}
		}

		if(scope.config.debug) {
			scope.debug = $('<div></div>').css({
				position        : 'absolute',
				bottom          : 5,
				right           : 5,
				padding         : 5,
				backgroundColor : 'white',
				opacity         : 0.7,
				color           : 'black'
			}).appendTo(scope.root());
		}

		updateScope(scope);

		// Mouse-Move beim Desktop

		if(!RB.support.touch) {
			scope.on('mousemove', function(evt) {
				var x  = evt.pageX - scope.data.left;
				var y  = evt.pageY - scope.data.top;
				var px = x / scope.data.widthP;
				var py = y / scope.data.heightP;

				if(x < 0) px = 0;
				if(x > scope.data.width) px = 100;

				if(y < 0) py = 0;
				if(y > scope.data.height) py = 100;

				if(scope.config.debug) {
					scope.debug.html(
						'X: ' + Math.round(x) + ' (' + Math.round(px) + '%)<br>' +
						'Y: ' + Math.round(y) + ' (' + Math.round(py) + '%)<br>' +
						'margin left: -' + scope.data.imageWP * px + '<br>' +
						'margin top: -' + scope.data.imageHP * py
					);
				}

				scope.parts.image.css({
					marginLeft: -(scope.data.imageWP * px),
					marginTop: -(scope.data.imageHP * py)
				});
			});

			scope.on('mouseenter', function() {
				if(scope.data.invalid) {
					updateScope(scope);

					if(scope.config.debug) {
						scope.debug.css({
							top    : scope.offset.top,
							left   : scope.offset.left,
							width  : scope.data.width - 10,
							height : scope.data.height - 10
						});
					}
				}
			});
		}

		$(window).on('resize', function() {
			scope.data.invalid = true;
		});

		scope.root().addClass(scope.clazz('initialized'));

	});

	function updateScope(scope) {
		var borderTop    = parseFloat(scope.root().css('border-top-width'));
		var borderRight  = parseFloat(scope.root().css('border-right-width'));
		var borderBottom = parseFloat(scope.root().css('border-bottom-width'));
		var borderLeft   = parseFloat(scope.root().css('border-left-width'));

		var paddingTop    = parseFloat(scope.root().css('padding-top'));
		var paddingRight  = parseFloat(scope.root().css('padding-right'));
		var paddingBottom = parseFloat(scope.root().css('padding-bottom'));
		var paddingLeft   = parseFloat(scope.root().css('padding-left'));

		var width = scope.root().innerWidth() - scope.offset.left - scope.offset.right - borderLeft - borderRight - paddingLeft - paddingRight;
		var height = scope.root().innerHeight() - scope.offset.top - scope.offset.bottom - borderTop - borderBottom - paddingTop - paddingBottom;

		scope.data = {
			invalid : false,
			left    : scope.root().offset().left + scope.offset.left + borderLeft + paddingLeft,
			top     : scope.root().offset().top + scope.offset.top + borderTop + paddingTop,
			width   : width,
			height  : height,
			widthP  : width/100,
			heightP : height/100,
			imageWP : (scope.parts.image.outerWidth() - width - scope.offset.left - scope.offset.right)/100,
			imageHP : (scope.parts.image.outerHeight() - height - scope.offset.top - scope.offset.bottom)/100
		};
	}

})(jQuery, window, document);