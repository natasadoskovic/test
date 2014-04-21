(function($, window, document, undefined) {

	var $selectContainer = $('.filter-group-holder.select-container');

	if($selectContainer.length > 0) {
		var $selectToggle = $selectContainer.parent().find('.search-section-button'),
			$filterContent = $('.search-filter-holder .quick-filter'),
			$filterSwitch = $('.search-filter-button'),
			update = false,
			filterSwitchActive;

		var positionOverlap = function($eUpper, $eLower) {
			var eUpperBottom = $eUpper.offset().top + $eUpper.outerHeight();

			return eUpperBottom - $eLower.offset().top;
		};

		var updateFilterSwitch = function() {
			filterSwitchActive = $filterContent.closest('.search-filter-holder').hasClass('rb-switch-active');

			$filterContent.css('top', '');

			if(!filterSwitchActive) {
				$filterContent.show();
			}

			$filterContent.css('top', positionOverlap($filterSwitch, $filterContent) + 
			                          parseFloat($filterContent.css('top')) );

			if(!filterSwitchActive) {
				$filterContent.css('display', '');
			}
		};

		var updateSelectContainer = function() {
			$selectContainer.css('top', positionOverlap($selectToggle, $selectContainer) +
			                            parseFloat($selectContainer.css('top')) );
		};

		RB.Breakpoint.enter('phone', function() {
			update = true;
			updateSelectContainer();
			updateFilterSwitch();
		});

		RB.Breakpoint.leave('phone', function() {
			update = false;
			$selectContainer.css('top', '');
			$filterContent.css('top', '');
		});

		$filterSwitch.on('click', function() {
			if(update) {
				updateFilterSwitch();
			}
		});

		$selectToggle.on('click', function() {
			if(update) {
				window.setTimeout(function() {
					updateSelectContainer();
				}, 10);
			}
		});
	}

})(jQuery, window, document);