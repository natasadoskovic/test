(function(RB, $, window, document, undefined) {

	var filters = {};
	var compiledCache = {};

	function regexEscape(s) {
		return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	}

	function resolvePath(object, path) {
		path = path.split('.');

		var property, getter, context = object;

		while(path.length > 0) {
			property = path.shift();
			getter = "get" + property.charAt(0).toUpperCase() + property.substr(1);

			if(property in context) {
				if(path.length === 0) {
					return context[property];
				} else {
					context = context[property];
				}
			} else if(getter in context && typeof property[getter] === "function") {
				if(path.length === 0) {
					return context[property]();
				} else {
					context = context[property]();
				}
			} else {
				return path;
			}
		}
	}

	function compileExpression(expr) {
		expr = $.map(expr.split('|'), $.trim);

		return function(params) {
			var value = resolvePath(params, expr[0]);

			for(var i = 1; i < expr.length; i++) {
				if(expr[i] in filters) {
					value = filters[expr[i]].apply(null, value);
				}
			}

			return value;
		}
	}

	RB.Template = function(html, start, end) {
		this.setDelimiter(
			start || RB.Template.defaults.markerStart,
			end   || RB.Template.defaults.markerEnd
		);

		if(html !== undefined) {
			if(html in compiledCache) {
				this.compiled = compiledCache[html];
			} else {
				var $tplElement = null;

				if(html[0] === '#') {
					$tplElement = $('script[type="text/' + RB.Template.subtype + '"]' + html);
				} else {
					$tplElement = $('script[type="text/' + RB.Template.subtype + '"][data-name="' + html + '"]');
				}

				if($tplElement && $tplElement.length > 0) {
					var customStart = null;
					var customEnd = null;

					if($tplElement.data('markerStart')) {
						customStart = $tplElement.data('markerStart');
					}

					if($tplElement.data('markerEnd')) {
						customEnd = $tplElement.data('markerEnd');
					}

					if(customStart || customEnd) {
						this.setDelimiter(customStart, customEnd);
					}

					this.compile($tplElement.text());
					compiledCache[html] = this.compiled;
				} else {
					this.compile(html);
				}
			}
		}
	};

	RB.Template.prototype.setDelimiter = function(start, end) {
		if(!start) start = RB.Template.defaults.markerStart;
		if(!end)   end   = RB.Template.defaults.markerEnd;

		this.delimiters = [start, end];
		this.regex = new RegExp(regexEscape(start) + '(.*?)' + regexEscape(end), "gim");
	};

	RB.Template.prototype.compile = function(html) {
		this.compiled = [];

		var match, expr, matchEnd = 0;

		while((match = this.regex.exec(html))) {
			if(match.index > matchEnd) {
				this.compiled.push(html.substring(matchEnd, match.index));
			}

			this.compiled.push(compileExpression($.trim(match[1])));
			matchEnd = match.index + match[0].length;
		}

		if(matchEnd < html.length - 1) {
			this.compiled.push(html.substr(matchEnd));
		}
	};

	RB.Template.prototype.render = function(params) {
		if(this.compiled) {
			var html = '';

			for(var i = 0; i < this.compiled.length; i++) {
				if(typeof this.compiled[i] === "string") {
					html += this.compiled[i];
				} else {
					html += this.compiled[i].apply(this, [params]);
				}
			}

			return html;
		} else {
			return null;
		}
	};

	RB.Template.addFilter = function(name, funct) {
		filters[name] = func;
	};

	RB.Template.defaults = {
		markerStart : '{%',
		markerEnd   : '%}',
	};

	RB.Template.subtype = 'rb-template';

})(window.RB = window.RB || {}, jQuery, window, document);