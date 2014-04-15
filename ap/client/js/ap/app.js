var app = {
	updateSpeed: 1000,
	$patients: [],
	readings: {},
	liveChartList: true,
	qs: _.defaults(queryString(), {glucagon: false, carbs: 0, speed: 500, fullscreen: false}),
	start: function() {
		if(app.qs.speed >= 100 && app.qs.speed <= 100000) {
			app.updateSpeed = app.qs.speed;	

			if (app.updateSpeed > 10000) {
				app.updateSpeed = 10000;
			}
		}

		app.patient.init(function() {
			var userCount = dualHormoneReadings.length - 1;

			if (app.qs.users && app.qs.users < userCount) {
				userCount = app.qs.users;
			}
			if(userCount < 1) {
				userCount = 1;
			}

			common.step([
				function(next) {
					for(var i = 0; i < userCount; i++) {
						var meals = meal.randomDayGenerator(app.data.mealLevels)(2);

						app.patient.add(users[i], next.parallel(), 2, meals);
					}
				},
				function(data) {
					for(var i in data) {
						app.animatePatient(null, data[i])
					}

					if(!app.patient.state.glucagon.value) {
						$('.overlay-stats-glucagon').hide();
						$('.patient-content-hormone-glucagon').hide();
					}
					
					app.patient.updateStatusTips();
					$(document).keyup(app.shortcuts.bind);
					app.overlay.init();
					app.resize();

					if(app.qs.fullscreen) {
						app.patient.toggleProfileView();	
					}
						
				}],
				function() {
					console.log('error adding patients');
				}
			)
		});
	},
	animatePatient: function(err, $patient) {
		$(app.patient.$listItem).append($patient.$item);

		$patient.$item.click(function() {
			app.overlay.show($patient);
			app.patient.updateAllPatients();
		});

		app.patient.makeSortable();
		app.$patients.push($patient);
		app.readings[$patient.profile.id] = $patient.readings;
		var index = app.$patients.length - 1;
		var update = function(index) {
			return function() {
				var go = function() {
					app.$patients[index] = app.patient.update(app.$patients[index]);
					app.$patients[index].ticks++;
					
					setTimeout(go, app.updateSpeed);
					//manipulate speed and keep randomness.
				};
				go();
			}
			//setTimeout(update, Math.round(Math.random() * 5000));
		}(index);

		if(app.patient.state.glucagon.value) {
			app.patient.state.glucagon.show();	
		} else {
			app.patient.state.glucagon.hide();	
		}
		update();
	},
	resize: function(event) {
	  var width = 1000;
	  if (document.body && document.body.offsetWidth) {
	    width = document.body.offsetWidth;
	  }
	  if (document.compatMode=='CSS1Compat' && document.documentElement && document.documentElement.offsetWidth ) {
	    width = document.documentElement.offsetWidth;
	  }
	  if(width < 481) {
	  	app.liveChartList = false;
	  	app.mobile = true;
			$('.header-profile').hide();

	  } else {
	  	app.liveChartList = true;
	  	app.mobile = false;
	  	$('.header-profile').show();
	  }
	},
	mobile: false
};

var dummyOrient = {
	landscape: function() {
		if(app.qs.fullscreen) {
			app.patient.toggleProfileView();
		}
		if(app.mobile.false) {
			return;
		}

		$('.container').show();
		$('.portrait-chart').hide();
		$(document).unbind('touchmove');
	},
	portrait: function() {
		if(app.qs.fullscreen) {
			app.patient.toggleProfileView();	
		}
		if(app.mobile.false) {
			return;
		}
		
		$('.container').hide();
		$('.portrait-chart').show();
		$(document).bind('touchmove', false);
	}
}
$(function() {
	orient.landscape(dummyOrient.landscape);
	orient.portrait(dummyOrient.portrait);

	app.start();
});
window.onresize = app.resize;