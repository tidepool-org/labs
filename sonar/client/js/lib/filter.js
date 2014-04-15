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
/* look at computing curve */

/* look at time of day query for carb and glucoseqwqaaZ+ZPOIUYZ^&S6SS6]\	 7 7     77*/
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

var chop = function(readings) {
	var chunckSizeHours = 3;
	var chuncks = [];
	var chunck = [];
	var last;

	for(var i in readings) {
		var reading = readings[i];

		if (!last) {
			last = reading.time;
		}

		if (reading.time - last > chunckSizeHours*1000*60*60) {
			if (chunck.length) {
				chuncks.push(chunck);

				chunck = [reading];
			}
		} else {
			chunck.push(reading);
		}

		last = reading.time;
	}

	chuncks.push(chunck);

	return chuncks;
};

var lowState = {
	condition: function(reading) {
		return reading.value < options.episode.low;
	},
	occurence: 2
};
var highState = {
	condition: function(reading) {
		return reading.value > options.episode.high;
	},
	occurence: 10
};
var veryhighState = {
	condition: function(reading) {
		return reading.value > options.episode.veryhigh;
	},
	occurence: 10
};

var trendState = {
	condition: function(reading) {
		for(var i in options.trend) {
			if(reading.trend != options.trend[i]) {
				return false;
			}
		}
		
		return true;
	},
	occurence: 15
};

var trend = function(readings, chuncks) {
	return episode(trendState.condition, trendState.occurence, readings, chuncks); 
};

var low = function(readings, chuncks) {
	return episode(lowState.condition, lowState.occurence, readings, chuncks);
};
var high = function(readings, chuncks) {
	return episode(highState.condition, highState.occurence, readings, chuncks);
};
var veryhigh = function(readings, chuncks) {
	return episode(veryhighState.condition, veryhighState.occurence, readings, chuncks);
};

var range = function(readings, chuncks) {
	var condition = function(value) {
		return value > options.episode.range[0] && value < options.episode.range[1];
	};
	
	var occurence = 'all';

	return all(condition, occurence, readings, chuncks);
};

/* special episode function for ranges */
var all = function(condition, occurence, readings, chuncks) {
	var start = 0;
	var end = 0;
	var results = [];
	var temp = [];
	for(var i in chuncks) {
		var chunck = chuncks[i];

		var first = null;
		var end = null;


		for(var j in chunck) {
			var reading = chunck[j];

			if(reading && !first && condition(reading)) {
				first = reading;
				endTime = reading.time + (1000*60*60*options.hours);
			}

			if(first && endTime && reading.time > endTime) {
				results.push({
					episode: {
						reading: first,
						start: first.time,
						end: endTime
					},
					readings: temp
				});

				temp = [];
				first = null;
				endTime = null;
			}

			if(first && !condition(reading)) {
				first = null;
				endTime = null;
				temp = [];
			} else {
				temp.push(reading);
			}
		}
	}

	return results;
};

var occurence = function(chunck, condition, occurence) {
	var hits = 0;

	for(var j in chunck) {
		var reading = chunck[j];

		if(condition(reading)) {
			hits++;
		} else {
			hits = 0;
		}

		if(hits == occurence) {
			return true;
		}
	}

	return false;
};

var episode = function(condition, occurence, readings, chuncks) {
	var hits = 0;
	var resuslts = [];
	var last = 0;

	for(var i in chuncks) {
		var chunck = chuncks[i];

		last = 0;
		for(var j in chunck) {
			var reading = chunck[j];

			if (last && reading.index < last) {
				continue;
			}

			if(condition(reading)) {
				hits++;
			} else {
				hits = 0;
			}

			var settings = {
					startOffset: (1000*60*60*options.hours/2),
					endOffset: (1000*60*60*options.hours/2)
			};

			if(hits == occurence || hits) {
				var find = cut(readings, reading, settings);

				last = find.readings[find.readings.length - 1].index;

				resuslts.push(find);
			}
		}
	}

	return resuslts;
};

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

var filterTimeofDayByHours = function(start, end, readings) {
	return filterTimeOfDay(start*1000*60*60, end*1000*60*60, readings);
};

var filterTimeOfDay = function(start, end, readings) {
	return _.filter(readings, function(reading) {
		if (reading.dayTime > start && reading.dayTime < end) {
			return true;
		}
		return false;
	});
};