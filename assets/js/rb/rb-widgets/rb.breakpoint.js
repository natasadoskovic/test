(function(RB, $, window, document, undefined) {

	var breakpoints = {};
	var listeners = {};
	var widgets = {};
	var currentBreakpoints = [];
	var initialUpdate = true;

	RB.Breakpoint = {
		updateOnReady: false,

		add: function(name, query, update) {
			if(name in breakpoints) {
				return false;
			}

			breakpoints[name] = query;
			listeners[name] = { enter: [], leave: [] };

			if(update) {
				RB.Breakpoint.update();
			}
			return true;
		},
		enter: function(names, callback) {
			if(callback !== undefined) {
				names = RB.Breakpoint.getNames(names);

				for(var i = 0; i < names.length; i++) {
					listeners[names[i]].enter.push(callback);
				}
			} else {
				for(var i = 0; i < listeners[names].enter.length; i++) {
					listeners[names].enter[i].apply(window, [names]);
				}

				currentBreakpoints.push(names);
			}
		},
		leave: function(names, callback) {
			if(callback) {
				names = RB.Breakpoint.getNames(names);

				for(var i = 0; i < names.length; i++) {
					listeners[names[i]].leave.push(callback);
				}
			} else {
				for(var i = 0; i < listeners[names].leave.length; i++) {
					listeners[names].leave[i].apply(window, [names]);
				}

				currentBreakpoints.splice($.inArray(names, currentBreakpoints), 1);
			}
		},
		current: function() {
			return currentBreakpoints;
		},
		update: function() {
			var entering = [];
			var names = Object.keys(breakpoints);

			for(var i = 0; i < names.length; i++) {
				if(window.matchMedia(breakpoints[names[i]]).matches) {
					entering.push(names[i]);
				}
			}

			for(var i = 0; i < currentBreakpoints.length; i++) {
				if($.inArray(currentBreakpoints[i], entering) === -1) {
					RB.Breakpoint.leave(currentBreakpoints[i]);
				}
			}

			for(var i = 0; i < entering.length; i++) {
				if($.inArray(entering[i], currentBreakpoints) === -1) {
					RB.Breakpoint.enter(entering[i]);
				}
			}

			if(initialUpdate) {
				initialUpdate = false;
			}
		},
		getNames: function(nameList) {
			if(nameList === '*') {
				return Object.keys(breakpoints);
			} else {
				var names = [];
				var split = $.trim(nameList).split(' ');

				for(var i = 0; i < split.length; i++) {
					split[i] = $.trim(split[i]);

					if(split[i] in breakpoints) {
						names.push(split[i]);
					}
				}

				return names;
			}
		}
	};

	$(document).on('ready', function(evt) {
		if(RB.Breakpoint.updateOnReady) {
			RB.Breakpoint.update();
		}
	});

	$(window).on('resize', function(evt) {
		if(!initialUpdate) {
			RB.Breakpoint.update();
		}
	});
  
})(window.RB = window.RB || {}, jQuery, window, document);