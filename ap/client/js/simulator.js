var simulator = function() {
	var data = [];
	var ticks = Date.now();
	var begin = Date.now();
	var start = Date.now();
	var x = ss.x;

	var get = function(meals, once, callback) {
		if(!callback) {
			callback = once; 
		}

		var query = 'u=' + meals.map(function(m){return m.u}).toString() + '&d=' + meals.map(function(m){return m.d}).toString() + '&x=' + x.toString();

		$.getJSON('/simulator?' + query, function(step) {
			if(!once) {
				x = step.x;	
			}

			var values = [];

			for(var i in step.glucose) {
				ticks += 300000;

				var meal = meals[i];
				var date = new Date(ticks);
				
				values.push({
					group: 'hormone',
					type: 'insulin',
					value: meal.u,
					index: meal.index,
					ticks: ticks,
					date: date
				});
				values.push({
					group: 'hormone',
					type: 'glucagon',
					value: -meal.d,
					index: meal.index,
					ticks: ticks,
					date: date
				});
				values.push({
					group: 'sugar',
					type: 'cgm',
					value: step.glucose[i],
					ticks: ticks,
					date: date
				});

				data = data.concat(values);
			}

			callback(null, x, values);
		});
	};

	var window = function(hours, newData) {
		var _data = newData || data;
		var end = _data[_data.length-1].ticks;
		
		/*end.setHours(end.getHours() + hours -1);
		end.setMinutes(end.getMinutes() + 40);
		end = end.getTime();*/
		start = end - ((hours - 0.2) * 3600000);

		if(start < begin) {
			start = begin;
		}

		// make the filter go backwards
		if(ticks >= end) {
			_data = _.filter(_data, function(item) {
				if(item.ticks >= start && item.ticks <= end) {
					return true;
				}
				return false;
			});
		}

		return {
			start: start,
			data: _data
		};
	};

	var window = function(hours, newData) {
		var _data = newData || data;
		var end = _data[_data.length-1].ticks;

		/*end.setHours(end.getHours() + hours -1);
		end.setMinutes(end.getMinutes() + 40);
		end = end.getTime();*/
		start = end - ((hours - 0.2) * 3600000);

		if(start < begin) {
			start = begin;
		}

		// make the filter go backwards
		if(ticks >= end) {
			_data = _.filter(_data, function(item) {
				if(item.ticks >= start && item.ticks <= end) {
					return true;
				}
				return false;
			});
		}

		return {
			start: start,
			data: _data
		};
	};

	return {
		get: get,
		data: function() {
			return data;
		},
		window: window
	}
};