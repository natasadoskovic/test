(function($, window, document, undefined) {

	var globalIndex = 1;
	var imageExtensions = [ 'jpg', 'png', 'gif', 'svg' ];
	var websiteExtensions = [ 'html', 'htm', 'php', 'php5', 'asp', 'aspx', 'pl', 'py' ];

	RB.Widget.create('lightbox', function(scope) {
		scope.index = globalIndex++;
		scope.template = new RB.Template(scope.config.template);

		scope.on('click', function(evt) {
			open(scope);
			evt.preventDefault();
		});
	});

	function load(scope) {
		if(!scope.root().hasClass(scope.clazz('loading'))) {
			scope.root().addClass(scope.clazz('loading'));

			var href = scope.root().attr('href');
			var ext = href.split('.').pop().toLowerCase();

			if(ext.indexOf('?') > 0) {
				ext = ext.substr(0, ext.indexOf('?'));
			}

			if($.inArray(ext, imageExtensions) >= 0) {
				var image = new Image();
					image.onload = function() {
						loaded(scope, $('<img src="' + href + '" border="0" width="' + image.width + '" height="' + image.height + '">')[0]);
					};
					image.src = href;
			} else if($.inArray(ext, websiteExtensions)) {
				$.get(href, function(html) {
					loaded(scope, html);
				});
			} else {
				throw new Error(scope.clazz() + ": unsupported remote file extension: " + ext);
			}
		}
	}

	function loaded(scope, content) {
		scope.root().
			removeClass(scope.clazz('loading')).
			addClass(scope.clazz('loaded'));

		var href      = scope.root().attr('href');
		var maxWidth  = (scope.config.maxWidth || 100) / 100;
		var maxHeight = (scope.config.maxHeight || 0) / 100;
		var params    = { href: href, content: content };
		var html      = scope.template.render(params);

		$(window).trigger('show.rb-overlay', ['lightbox']);

		var $container = $(html).
			css({
				position : 'absolute',
				top      : $(window).scrollTop(),
				left     : 0,
				zIndex   : 10000,
				opacity  : 0
			}).
			appendTo('body');

		if(!$container.attr('id')) {
			$container.attr('id', scope.clazz(scope.index));
		}

		var width = $container.outerWidth();

		if(width > $(window).width() * maxWidth) {
			$container.css({
				width: $(window).width() * maxWidth,
				oveflowX: 'hidden'
			});
		}

		$container.css('left', ($(window).width() - $container.outerWidth()) / 2);

		var height = $container.outerHeight();

		if(maxHeight > 0 && height > $(window).height() * maxHeight) {
			$container.css({
				height: $(window).height() * maxHeight,
				oveflowY: 'hidden'
			});

			height = $container.outerHeight();
		}

		if(height < $(window).height()) {
			$container.css(
				'top',
				(($(window).height() - $container.outerHeight()) / 2) + $(window).scrollTop()
			);
		}

		$container.find(scope.clazz('close', true)).on('click', function(evt) {
			hide(scope, $container);
			evt.preventDefault();
		});

		$(window).on('click.rb-overlay', function(evt) {
			if(evt.namespace === "rb-overlay") {
				hide(scope, $container);
				evt.preventDefault();
			}
		});

		show(scope, $container);
	}

	function show(scope, $container) {
		if(scope.config.contentScroll && RB.support.touch) {
			$('body').css('overflow', 'hidden');
		}

		$container.fadeTo(300, 1.0, function() {
			$(document).trigger('dom-added', [ $container ]);
		});
	}

	function hide(scope, $container) {
		$container.fadeTo(300, 0, function() {
			$container.remove();
		});

		$(window).trigger('hide.rb-overlay', ['lightbox']);

		if(scope.config.contentScroll && RB.support.touch) {
			$('body').css('overflow', '');
		}
	}

	function open(scope) {
		var href = scope.root().attr('href');

		if(href && href !== '' && href !== '#') {
			if(
				href.substr(0,11) !== 'javascript:' &&
				!scope.root().hasClass(scope.clazz('loaded'))
			) {
				load(scope);
			} else {
				loaded(scope);
			}
		}
	}

})(jQuery, window, document);