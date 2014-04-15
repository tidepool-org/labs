app.data.cutReadings = function(readings, start, amount) {
	var _readings = {
		cgm: readings.cgm.slice(0).splice(start, amount),
		bolus: readings.bolus.slice(0).splice(start, amount),
		carb: readings.carb.slice(0).splice(start, amount)
	};

	var reIndex = function(data) {
		for(var i in data) {
			data[i]._index = i;
		}

		return data;
	};

	_readings.cgm = reIndex(_readings.cgm);
	_readings.bolus = reIndex(_readings.bolus);
	_readings.carb = reIndex(_readings.carb);

	return _readings;
};