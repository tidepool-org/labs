/*
== BSD2 LICENSE ==
Copyright (c) 2014, Tidepool Project

This program is free software; you can redistribute it and/or modify it under
the terms of the associated License, which is identical to the BSD 2-Clause
License as published by the Open Source Initiative at opensource.org.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the License for more details.

You should have received a copy of the License along with this program; if
not, you can obtain one from Tidepool Project at tidepool.org.
== BSD2 LICENSE ==
*/
var filter = {};

filter.carb = function() {
	var clean = function(readings) {
		return _.filter(readings, function(reading) {
			if (reading.type === 'carbs') {
				return true;
			}
			return false;
		});	
	};

	var normalize = function(readings) {
		return readings.map(function(reading, i) {
			reading = JSON.parse(reading);

			reading.date = new Date(reading.deviceTime);
			reading.time = reading.date.getTime();
			reading.dayTime = reading.date.getMilliseconds() + (reading.date.getSeconds() * 1000) + (reading.date.getMinutes() * 1000 * 60) + (reading.date.getHours() * 1000 * 60 * 60);
			reading.index = i;

			return reading;
		});
	};

	var fastingPeriods = function(carbs) {
		//return periods of time where no food was given;
		var settings = {
			fastingPeriodHours: 5,
			timeFromLastMeal: 4
		};
		var last = carbs[0];
		var results = [];

		for(var i in carbs) {
			var carb = carbs[i];
			var last = carbs[i-1];
			console.log(i);

			if((carb.time - last.time) > (settings.timeFromLastMeal + settings.fastingPeriodHours) * 1000 * 60 * 60) {
				results.push({
					endReading: carb,
					start: last.time + (settings.timeFromLastMeal * (1000 * 60 * 60)),
					end: carb.time
				});
			}
		}

		return results;
	};

	var fastingEpisodes = function(fastingPeriods, glucoseReadings) {
		var results = [];

		for(var i in fastingPeriods) {
			//for(var i in glucoseReadings) {
				/* do settings and cutting */
			var period = fastingPeriods[i];
			var piece = cut(glucoseReadings, period.endReading, {
				start: period.start,
				end: period.end
			});

			console.log(piece.readings.length);
			//}
		}

		return  results;
	};

	var episode = function(carbs) {
		var resuslts = [];
		var settings = {
				startOffset: (1000*60*60*options.hours*0.1),
				endOffset: (1000*60*60*options.hours*0.9)
		};

		for(var i in carbs) {
			var carb = carbs[i];
			var result = cut(data.glucose, carb, settings);
			var start = carb.time - settings.startOffset; 
			var end = carb.time + settings.endOffset;
			
			result.sectionCarbReadings = _.filter(carbs, function(reading) {
				if (reading.time > start && reading.time < end) {
					return true;
				}
				return false;

			});

			console.log(result.sectionCarbReadings);

			resuslts.push(result);
		}

		return resuslts;
	};

	return {
		fasting: function(carbs, glucose) {
			return fastingEpisodes(fastingPeriods(carbs), glucose);
		},
		clean: clean,
		normalize: normalize,
		episode: episode
	}
}();