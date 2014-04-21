(function(RB, $, window, document, undefined) {
	
	var $fontSizeTest = $('<div>').css({
		padding    : 0,
		lineHeight : 1,
		position   : 'absolute',
		visibility : 'hidden',
		fontSize   : '1em',
		display    : 'none'
	}).appendTo('body').append(document.createTextNode('M'));
	
	RB.Utils = {
		// http://stackoverflow.com/questions/1442542/how-can-i-get-default-font-size-in-pixels-by-using-javascript-or-jquery
		fontSize: function(parent) {
			if(parent) {
				$(parent).appendChild($fontSizeTest);
			}

			$fontSizeTest.css('display', 'inline-block');

			var fontSize = [ 
				$fontSizeTest[0].offsetWidth, 
				$fontSizeTest[0].offsetHeight
			];

			$fontSizeTest.css('display', 'none');

			if(parent) {
				$(document.body).appendChild($fontSizeTest);
			}

			return fontSize;
		},

		convert2px: function(value) {
			var unit = value[1];
			arguments[0] = value[0];

			if(unit === 'px') {
				return arguments[0];
			} else if(unit === 'rem') {
				return RB.Utils.rem2px.apply(null, arguments);
			} else if(unit === 'em') {
				return RB.Utils.em2px.apply(null, arguments);
			} else if(unit === '%') {
				return RB.Utils.percent2px.apply(null, arguments);
			} else {
				return false;
			}
		},

		rem2px: function(rem) {
			var fontSize = RB.Utils.fontSize();
			return fontSize[1] * rem;
		},

		em2px: function(em, element) {
			var fontSize = RB.Utils.fontSize($(element).parent());
			return fontSize[1] * em;
		},

		percent2px: function(percent, base, axis) {
			if(axis === 'x') {
				return $(base).innerWidth() * (percent / 100);
			} else if(axis === 'y') {
				return $(base).innerHeight() * (percent / 100);
			} else {
				return [ 
					$(base).innerWidth() * (percent / 100),
					$(base).innerHeight() * (percent / 100) 
				];
			}
		},

		calcPixelValue: function(values, container, axis) {
			if(values) {
				if($.isArray(values)) {
					var pixel = [];

					for(var i = 0; i < values.length; i++) {
						pixel[i] = RB.Utils.convert2px(values[i], container, axis);
					}

					return pixel;
				} else if(typeof values === "object") {
					var pixel = {};
					var keys = Object.keys(values);
					var inferredAxis;

					for(var i = 0; i < keys.length; i++) {
						inferredAxis = null;

						if(keys[i] === 'top' || keys[i] === 'up' || keys[i] === 'bottom' || keys === 'down') {
							inferredAxis = 'y';
						} else if(keys[i] === 'left' || keys === 'right') {
							inferredAxis = 'x';
						}

						pixel[keys[i]] = RB.Utils.convert2px(values[keys[i]], container, inferredAxis || axis);
					}

					return pixel;
				} else if(typeof values === "number") {
					return RB.Utils.convert2px(values, container, axis);
				}
			} else {
				return false;
			}
		}
	};

})(window.RB = window.RB || {}, jQuery, window, document);