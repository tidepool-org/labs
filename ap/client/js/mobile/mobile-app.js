var app = {
	state: {
		glucagon: {
			value: true
		},
		carb: {
			value: 0
		}
	},
	graph: {
		options: {width: 722, height: 450, hours: 24, xPaddingLeft: 50, ticks: 0}
	}
};

app.cutReadings = function(patient) {
	patient.readings = patient.singleHormoneData.readings;
	patient.correctedMeals = patient.singleHormoneData.correctionMeals;

	if(app.state.glucagon) {
		patient.readings = patient.dualHormoneData.readings;
		patient.correctedMeals = patient.dualHormoneData.correctionMeals;
	};

	var pixelWidth = 12*app.patient.hours.wide;
	var _readings = app.data.cutReadings(patient.readings, patient.readingIndex, pixelWidth);

	if(typeof _readings.cgm[_readings.cgm.length-1] == 'undefined') {
		return;
	}

	return {
		cgm: _readings.cgm,
		carb: _readings.carb,
		bolus: _readings.bolus,
		correctedMeals: patient.correctedMeals
	};
};

app.graph.draw = function(patient) {
	patient.$overlaySection.find('.overlay-chart > svg').remove();
	
	var options = app.graph.options;
	
	options.state = app.state;

	return mobileGraph(patient.$overlaySection.find('.overlay-chart')[0], app.cutReadings(patient), options);
};