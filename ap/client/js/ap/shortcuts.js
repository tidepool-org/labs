app.shortcuts = {
	alertShown:false,
	alert: function($patient) {
		$patient.$item.find('.patient-content-bg').hide();
		$patient.$item.find('.patient-content-bg-trend').hide();
		$patient.$item.find('.patient-warning').fadeIn();

		$patient.$overlaySection.find('.overlay-stats-bg').hide();
		$($patient.$overlaySection.find('.overlay-stats-label')[0]).hide();
		$patient.$overlaySection.find('.overlay-warning').fadeIn();

		var $img = $patient.$item.find('.patient-content-image').find('img');
		app.patient.toggleImage($img, false);

		$patient.$item.css('background-color', '#4D4D4D');
	},
	hideAlert: function($patient) {
		$patient.$item.find('.patient-warning').hide();
		$patient.$item.find('.patient-content-bg').fadeIn();
		$patient.$item.find('.patient-content-bg-trend').fadeIn();
		
		$patient.$overlaySection.find('.overlay-warning').hide();
		$patient.$overlaySection.find('.overlay-stats-bg').fadeIn();
		$($patient.$overlaySection.find('.overlay-stats-label')[0]).fadeIn();

		var $img = $patient.$item.find('.patient-content-image').find('img');
		app.patient.toggleImage($img, true);

		if(!$patient.alert) {
			$patient.$item.css('background-color', '#EAEAEA');
		}
	},
	toggleUsage: function() {
		$('.usage').toggle();
		$('.help').toggle();
		window.scrollTo(0,document.body.scrollHeight);
	},
	bind: function(e) {
		console.log('keyCode', e.keyCode);
		//a
		if (e.keyCode == 65) {
			if(app.shortcuts.alertShown) {
				app.$patients[2].alertIcon = false;
				app.shortcuts.hideAlert(app.$patients[2]);
			} else {
				app.$patients[2].alertIcon = true;
				app.shortcuts.alert(app.$patients[2]);
			}
			
			app.shortcuts.alertShown = !app.shortcuts.alertShown;
		}
		//esc
		if (e.keyCode == 27) {
			app.overlay.hide();
		}
		//f
		if (e.keyCode == 70) {
			app.patient.toggleProfileView();
		}
		//h
		if (e.keyCode == 72) {
			app.shortcuts.toggleUsage();
		}
		//g 
		if (e.keyCode == 71) {
			app.patient.state.glucagon.toogle();
			app.patient.updateAllPatients();
		}
		//c
		if (e.keyCode == 67) {
			app.patient.state.carb.toogle();
			app.patient.updateAllPatients();
		}
		//l
		if (e.keyCode == 76) {
			app.patient.updateStatusTips();
			app.patient.updateAllPatients();
		}
		// 1
		if (e.keyCode == 49) {
			app.updateSpeed = 100;
		}
		// 2
		if (e.keyCode == 50) {
			app.updateSpeed = 500;
		}
		// 3
		if (e.keyCode == 51) {
			app.updateSpeed = 1000;
		}
		// 4
		if (e.keyCode == 52) {
			app.updateSpeed = 3000;
		}
	}
};