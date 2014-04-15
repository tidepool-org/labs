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
var normalizeBlip = function(readings) {
	readings = normalize(readings);

	return _.sortBy(readings, function(reading) { return reading.time});
};

var normalize = function(readings) {
	var previous = readings[0].value;

	Date.prototype.addHours = function(h) {    
   this.setTime(this.getTime() + (h*60*60*1000)); 
   return this;   
	}

	readings.map(function(reading, i) {
		reading.date = new Date(reading.deviceTime).addHours(8);
		reading.time = reading.date.getTime();
		reading.dayTime = reading.date.getMilliseconds() + (reading.date.getSeconds() * 1000) + (reading.date.getMinutes() * 1000 * 60) + (reading.date.getHours() * 1000 * 60 * 60);
		reading.index = i;
		//reading.trend = bgTrend(reading, previous);

		previous = reading;

		return reading;
	});

	return readings;
};

var merge = function(pump, dexcom) {
	pump = normalize(pump);
	dexcom = normalize(dexcom);

	pump = _.reject(pump, function(reading){ return reading.type === 'cbg'; });

	var data = pump.concat(dexcom);

	return _.sortBy(data, function(reading) { return reading.time});
};

var createPools = function(readings) {
	var pools = [];
	var first = readings[0];
	var pool = [];

	for(var i in readings) {
		var reading = readings[i];

		pool.push(reading);

		if(reading.time - first.time > 1000*60*60*6) {
			pools.push({
				start: first,
				end: reading,
				readings: pool
			});

			pool = [];
			first = reading;
		}
	}

	return pools;
};

var basicFilter = {
	glucoseOnly: function(readings, range, occurence) {
		var lastReading = readings[0];
		var hits = 0;
		for(var i in readings) {
			var reading = readings[i];

 			if(reading.type == 'cbg' && reading.value >= range[0] && reading.value <= range[1] && ((hits > 0 && (reading.time - lastReading.time) < 1000*60*10) || hits == 0)) {
				lastReading = reading;
				hits++;
			} else {
				hits = 0;
			}

			if(hits == occurence) {
				return true;
			}
		}

		return false;
	}
};

var filterOne = {
	carbsAndGlucose: function(readings, options) {
		var carbPools = filterOne.carbsOnly(readings, options.carbRange, options.days, options.timeOfDayRange);

		//console.log('carbsAndGlucose');
		//console.log('carbPools', carbPools.readings, carbPools.length, options);

		return _.filter(carbPools, function(carbPool) {
			return basicFilter.glucoseOnly(carbPool.readings, options.glucoseRange, options.glucoseOccurence);
		});
	},
	glucoseOnly: function(readings, range, occurence, days, timeOfDayRange) {
		//console.log('range', range,'occurence' , occurence, 'days', days, 'timeOfDayRange', timeOfDayRange);
		var pools = [];
		var pool = null;
		var first;
		var lastReading = readings[0];
		var hits = 0;
		var start;

		for(var i = 0; i < readings.length; i++) {
			var reading = readings[i];

			if(reading.type == 'cbg') {
				if(reading.value >= range[0] && reading.value <= range[1] && ((hits > 0 && (reading.time - lastReading.time) < 1000*60*10) || hits == 0)) {
					if(hits == 0) {
						first = reading;
						start = i;
					}
					
					hits++;

					if(days && !_.contains(days, reading.date.getDay())) {
						hits = 0;
					}
					if(timeOfDayRange && !(reading.dayTime > timeOfDayRange[0] &&  reading.dayTime < timeOfDayRange[1])) {
						hits = 0;
					}

					lastReading = reading;
				} else {
					hits = 0;
				}
			}

			if(hits == occurence) {
				pool = [];
				console.log('start', start);

				for(var j = start; j < readings.length; j++) {
					var _reading = readings[j];

					pool.push(_reading);
					
					if(_reading.time - first.time > 1000*60*60*6) {
						pools.push({
							start: first,
							end: _reading,
							readings: pool
						});

						pool = null;
						break;
					}
				}
			}
		}

		glucoseOnlyPools = pools;
		console.log('pools', pools);

		return pools;
	},
	bolusOnly: function(readings, type, days, timeOfDayRange) {
		/*
		activeInsulin: 0
		bgInput: 310
		bgUnits: "mg dl"
		carbInput: 0
		carbRatio: 10
		carbUnits: "grams"
		correctionEstimate: 4.4
		estimate: 4.4
		foodEstimate: 0
		insulinSensitivity: 45
		targetHigh: 110
		targetLow: 90
		*/
		var pools = [];
		var pool = null;
		var first;

		for(var i in readings) {
			var reading = readings[i];

			var createPool = function(first) {
				var pool = [];

				for(var j = i; j < readings.length; j++) {
					var reading = readings[j];
					
					pool.push(reading);

					if(reading.time - first.time > 1000*60*60*6) {
						return {
							start: first,
							end: reading,
							readings: pool
						};
					}
				}

				return;
			};

			if (reading.type == 'wizard') {
				if(days && !_.contains(days, reading.date.getDay())) {
					continue;	
				}

				if(timeOfDayRange && !(reading.dayTime > timeOfDayRange[0] &&  reading.dayTime < timeOfDayRange[1])) {
					continue;
				}

				var ok = false;

				/*correctionEstimate: 4.4
				estimate: 4.4
				foodEstimate: 0*/

				if (_.contains(type, 'any') && parseInt(reading.payload.estimate) && parseInt(reading.payload.estimate) > 0) {
					ok = true;
				}
				if(_.contains(type, 'correction') && parseInt(reading.payload.correctionEstimate) && parseInt(reading.payload.correctionEstimate) > 0) {
					ok = true;
				}
				if(_.contains(type, 'override') && parseInt(reading.recommended) > parseInt(reading.value)) {
					ok = true;
				}
				if(_.contains(type, 'underride') && parseInt(reading.recommended) < parseInt(reading.value)) {
					ok = true;
				}

				if(!ok) {
					continue;
				}

				//console.log(ok, reading.correction, parseInt(reading.recommended) - parseInt(reading.value));

				var pool = createPool(reading);
				if (pool) pools.push(pool);
			}
		}
		return pools;
	},
	carbsOnly: function(readings, range, days, timeOfDayRange) {
		console.log(range,days)
		var pools = [];
		var pool = null;
		var first;

		range = range.map(function(r) { return parseInt(r); })

		if (range[1] === 150) {
			range[1] === 1000;
		}

		for(var i in readings) {
			var reading = readings[i];

			if (reading.type == 'wizard' && reading.payload.carbInput >= range[0] && reading.payload.carbInput <= range[1]) {
				if(days && !_.contains(days, reading.date.getDay())) {
					continue;	
				}
				if(timeOfDayRange && !(reading.dayTime > timeOfDayRange[0] &&  reading.dayTime < timeOfDayRange[1])) {
					continue;
				}

				first = reading;
				pool = [];


				for(var j = i; j < readings.length; j++) {
					var reading = readings[j];
					
					pool.push(reading);

					if(reading.time - first.time > 1000*60*60*6) {
						pools.push({
							i: i,
							start: first,
							end: reading,
							readings: pool
						});

						pool = null;
						break;
					}
				}
			}
		}
		return pools;
	}
};