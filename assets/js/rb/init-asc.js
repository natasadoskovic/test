(function($, document, window, undefined) {

	$('.login-layer .input-holder').click(function(){
		$('.login-layer .input-holder').removeClass('active');
		$(this).addClass('active');
	});

})(jQuery, document, window);

$(document).ready(function() {

	$('.image-popup').magnificPopup({
		type: 'image',
		closeOnContentClick: true,
		mainClass: 'mfp-img-mobile',
		image: {
			verticalFit: true
		}
		
	});
	$('.gallery-image-popup').magnificPopup({
		delegate: 'a',
		type: 'image',
		tLoading: 'Loading image #%curr%...',
		mainClass: 'mfp-img-mobile',
		gallery: {
			enabled: true,
			navigateByImgClick: true,
			preload: [0,1] // Will preload 0 - before current, and 1 after the current image
		},
		image: {
			tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
			titleSrc: function(item) {
				return item.el.attr('title');
			}
		}
	});
	// Add to Watchlist Phone

	$('.link-modal-popup').on('click', function() {
		if($.inArray('phone', RB.Breakpoint.current()) >= 0) {
			$.magnificPopup.open({
				items: { 
					// Wenn der Element-Switch aktiv ist dann das data-href-remove-Poup anzeigen.
					// Ansonsten das href-Popup.
					src: $(this).hasClass('rb-switch-active') ? $(this).data('hrefRemove') : $(this).attr('href')
				},
				type: 'inline',
				preloader: false,
				focus: '#name',	
				alignTop:true,
				showCloseBtn: false,	
				// When elemened is focused, some mobile browsers in some cases zoom in
				// It looks not nice, so we disable it:
				callbacks: {
					beforeOpen: function() {							
						if($(window).width() < 700) {
							this.st.focus = false;
						} else {
							this.st.focus = '#name';
						}
					},
					open: function() {
						setTimeout(function() {
							$.magnificPopup.instance.close()
						}, 2500);
					}		
				}  
			});
		}
	});	
	$('.searchrowitem .doctype').on('click', function() {
		if($.inArray('desktop', RB.Breakpoint.current()) >= 0) {
			$.magnificPopup.open({
				items: { 
					// Wenn der Element-Switch aktiv ist dann das data-href-remove-Poup anzeigen.
					// Ansonsten das href-Popup.
					src: $(this).children('img')
				},
				type: 'inline',
				  inline: {
				    // Define markup. Class names should match key names.
				    markup: '<div class="white-popup"><div class="mfp-close"></div>'+
				              '<a class="mfp-userWebsite">'+
				                '<div class="mfp-userAvatarUrl"></div>'+
				                '<h2 class="mfp-username"></h2>'+
				              '</a>'+
				              '<div class="mfp-userLocation"></div>'+
				            '</div>'
				  },
				
				

	
				// When elemened is focused, some mobile browsers in some cases zoom in
				// It looks not nice, so we disable it:
				callbacks: {
					beforeOpen: function() {							
						if($(window).width() < 700) {
							this.st.focus = false;
						} else {
							this.st.focus = '#name';
						}
					},
					open: function() {
						/*
						setTimeout(function() {
							$.magnificPopup.instance.close()
						}, 2500);
						*/
					}		
				}  
			});
		}
	});	
	
	$(document).on('click', '.close-modal-popup', function (e) {
	  e.preventDefault();
	  $.magnificPopup.close();
	});
});
