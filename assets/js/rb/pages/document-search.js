(function($, window, document, undefined) {

	// Alle Dokumente durch eine Checkbox markieren
	var $checkAll = $('#checkall');

	if($checkAll.length > 0) {
		$checkAll.on('change', function() {
			$checkAll.
				closest('.document-search').
					find('input[type="checkbox"]:not(#checkall)').
						prop('checked', this.checked);
		});
	}

	// Reset-Funktion fuer den Filter. 
	var $filterContent = $('.filter-tab-cont');

	$filterContent.each(function() {
		var $filter = $(this);

		$filter.find('.button-reset').on('click', function() {
			$filter.find('input').val('').filter('[type="checkbox"]').prop('checked', false);
			$filter.find('select,textarea').val('');
			$filter.find('.rb-widget-root').trigger('reset');
		});
	});

	// Toggling der Sortierung
	var $sortIcons = $('.document-search').find('.icon-sortup,.icon-sortdown');

	$sortIcons.closest('.sortable').on('click', function() {
		var $up = $(this).find('.icon-sortup');
		var $down = $(this).find('.icon-sortdown');

		if($up.hasClass('active')) {
			$up.removeClass('active');
			$down.addClass('active');
		} else if($down.hasClass('active')) {
			$down.removeClass('active');
			$up.addClass('active');
		} else {
			$sortIcons.removeClass('active');
			$up.addClass('active');
		}
	});

})(jQuery, window, document);