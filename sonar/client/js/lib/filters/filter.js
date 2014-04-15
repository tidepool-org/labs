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
/*
Algorithm:

find readings

find intervals

find uniqueIntervals

clean readings based on uniqueIntervals

readings: return readings
*/

//var _ = require('underscore');
//var pumpData = require('../../../json/pump.json');

/* finds and joins overlapping ranges e.g. [1,3][2,5][5,8] becomes [1,5][5,8]*/
var overlaps = function(sections) {
	var overlaps = [];
	var overlap = [];
	var isLong = false;

	for(var i = 0; i < sections.length; i++) {
		var section = sections[i];
		var nextSection = i < (sections.length - 1) ? sections[i+1] : null;

		if(!isLong) {
			overlap[0] = section[0];
		}

		if(!nextSection) {
			overlap[1] = section[1];
			overlaps.push(overlap);
			return overlaps;
		}

		if(section[1] > nextSection[0]) {
			isLong = true;
		} else {
			isLong = false;
			overlap[1] = section[1];
			overlaps.push(overlap);
			overlap = [];
		}
	}
};

var normalize = function(readings) {
	var previous = readings[0].value;

	readings.map(function(reading, i) {
		reading.date = new Date(reading.deviceTime);
		reading.time = reading.date.getTime();
		reading.dayTime = reading.date.getMilliseconds() + (reading.date.getSeconds() * 1000) + (reading.date.getMinutes() * 1000 * 60) + (reading.date.getHours() * 1000 * 60 * 60);
		reading.index = i;
		reading.trend = bgTrend(reading, previous);

		previous = reading;

		return reading;
	});

	return readings;
};

var bgTrend = function(current, previous) {
	var currentValue = current.value;
	var previousValue = previous.value;
	var deltaValue = currentValue - previousValue;

	if(current.time - previous.time > 1000*60*10) {
		return 0;
	}

	var levels = {
		noChange: 2,
		slowChange: 5,
		fastChange: 10
	};

	if(deltaValue > -levels.fastChange && deltaValue < -levels.slowChange) {
		//singleDown
		return -2;
	} else if(deltaValue >= -levels.slowChange && deltaValue < -levels.noChange) {
		//straight
		return -1;
	} else if(deltaValue >= -levels.noChange && deltaValue <= levels.noChange) {
		//straight
		return 0;
	} else if(deltaValue > levels.noChange && deltaValue <= levels.slowChange) {
		//straight
		return 1;
	}
	 else if(deltaValue > levels.slowChange && deltaValue <= levels.fastChange) {
		//singleUp
		return 2;
	} else if(deltaValue > levels.fastChange) {
		//doubleUp
		return 3;
	} else {
		//doubleDown
		return -3;
	}
};

var filterBy = function(filterOptions) {
	filterOptions = _.defaults({
		hours: 4
	}, filterOptions);

	return {
		carbSize: function(readings, sizeRange) {
			var cut = function(readings, range) {
				var results = [];

				for(var j in readings) {
					var reading = readings[j];

					if(reading.time >= range[0] && reading.time <= range[1]) {
						results.push(reading);
					}
					
					if(reading.time >= range[1]) {
						break;
					}
				}

				return results;
			};
			var carbs = _.filter(readings, function(reading) {
				if(reading.type === 'carbs' && reading.value >= sizeRange[0] && reading.value <= sizeRange[1]) {
					return true;
				}
				return false;
			});
			var intervals = carbs.map(function(carb) {
				return [
					carb.time,
					carb.time + filterOptions.hours * 60 * 60 * 1000
				]
			});
			var uniqueIntervals = overlaps(intervals);
			var results = [];

			// now remove un neccsary readings based on intervals
			for(var i in uniqueIntervals) {
				var interval = uniqueIntervals[i];

				for(var j in readings) {
					var reading = readings[j];

					if(reading.time >= interval[0] && reading.time <= interval[1]) {
						results.push(reading);
					}
					
					if(reading.time >= interval[1]) {
						break;
					}
				}
			}

			return {
				readings: function() {
					return results;
				},
				pools: function() {
					var pools = [];

					for(var i in intervals) {
						var interval = intervals[i];
						var piece = cut(results, interval);
						var pool = {
							cbg: _.where(piece, {type:'cbg'}),
							carbs: _.where(piece, {type:'carbs'})
						};

						pools.push(pool);
					}

					return pools;
				}
			}
		},
		glucoseRange: function(readings, range, options) {
			var cut = function(readings, reading, settings) {
				var start = reading.time - settings.startOffset; 
				var end = reading.time + settings.endOffset;
				var result = {
					episode: {
						reading:reading,
						start: settings.start || start,
						end: settings.end || end
					},
					readings: []
				};

				for(var i in readings) {
					var r = readings[i];

					if (r.time > settings.start || start && r.time < settings.end || end) {
						result.readings.push(r);
					}
				}

				return result;
			};

			options = _.defaults({
				startOffset: (1000*60*60*filterOptions.hours/2),
				endOffset: (1000*60*60*filterOptions.hours/2),
				occurence: 4
			}, options);

			/*
			find readings

			find intervals

			find uniqueIntervals

			clean readings based on uniqueIntervals

			readings: return readings
			*/
			var hits = 0;
			var results = [];
			var lastReading = readings[0];
			var intervals = [];

			for(var i in readings) {
				var reading = readings[i];
				
				if(reading.type !== 'cbg') {
					continue;
				}

				if(reading.value >= range[0] && reading.value <= range[1] && (reading.time - lastReading.time) < 1000*60*10) {
					hits++;
				} else {
					hits = 0;
				}

				if(hits == options.occurence) {
					intervals.push([
						reading.time - options.startOffset,
						reading.time - options.endOffset
					]);
				}

				lastReading = reading;
			}

			var uniqueIntervals = overlaps(intervals);
			var results = [];
			
			return {
				readings: function() {
					return results;
				},
				pool: function() {

				}
			}
		}
	}
};

//var readings = normalize(pumpData.pumpData);

//var carbSize = filterBy().carbSize(readings, [1, 50]);

//var g = filterBy().glucoseRange(readings, [0, 60]);
//console.log('glucoseRange',g.readings().length);

//console.log('readings', carbSize.readings().length);
//console.log(carbSize.pools().length);
//console.log(carbSize.readings());
