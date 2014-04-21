(function($, window, document, undefined) {

	var targets = [];

	$(window).on('click', function(evt) {
		for(var i = 0; i < targets.length; i++) {
			if(!$.contains(targets[i][0], evt.target)) {
				targets[i][1].apply(targets[i][0], [evt]);
			}
		}
	});

	$.fn.offclick = function(func) {
		for(var i = 0; i < this.length; i++) {
			if($.inArray(this[i], targets) === -1 && $.isFunction(func)) {
				targets.push([ this[i], func ]);
			}
		}

		return this;
	};

})(jQuery, window, document);