app.overlay = {
	init: function() {
		$('.overlay-content').click(function(){return false;});
		$('.overlay-outer').click(app.overlay.hide);
	},
	show: function(patient) {
		$('.overlay-content').html(patient.$overlaySection);
		$('.overlay-stats-levels').html($('.overlay-patient-header').html());
		app.patient.setStatusTip(patient.$item, patient.tipState);
		patient.$overlaySection.find('.overlay-patient-header-close').click(app.overlay.hide);
		$('.overlay-outer').fadeIn();

		$('.overlay-content').fadeIn();
		patient.shown = true;
	},
	updateStats: function(patient, stats) {
		patient.$overlaySection.find('.overlay-stats-average').text(stats.average);
		patient.$overlaySection.find('.overlay-stats-inRange').text(stats.inRange);
 		patient.$overlaySection.find('.overlay-stats-inHyper').text(stats.inHyper);
		patient.$overlaySection.find('.overlay-stats-inHypo').text(stats.inHypo);
	},
	hide: function() {
		//$('.overlay').fadeOut();
		$('.overlay-outer').fadeOut();
		$('.overlay-content').fadeOut();

		for(var i in app.$patients) {
			app.$patients[i].shown = false;
		}
	}
};