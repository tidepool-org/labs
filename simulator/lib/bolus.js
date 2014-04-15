/*
The MIT License (MIT)

Copyright (c) 2013 Diacon Group

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
var _ = require('underscore');

module.exports = function(ss) {
	return {
		eat: function(carbs) {
			return {
				u: 0,
				d: carbs,
			};
		},
		bouls: function(dose) {
			if (dose === 0) {
				return {
					u: dose,
					d: 0,
				};	
			}
			return {
				u: dose || ss.u,
				d: 0,
			};
		},
		single: function(steady) {
			if(steady) {
				return {
					u: ss.u,
					d: ss.d,
				};
			}
			
			if(Math.random() < 0.05) {
				var factor = Math.random();
				return {
					u: ss.u+600*factor,
					d: ss.d+20*factor
				};
			} else {
				return {
					u: ss.u,
					d: ss.d,
				};
			}
		},
		steadyState: function(readings) {
			var data = [];

			for(var j = 0; j < readings; j++) {
				data.push({
					u: ss.u,
					d: 0,
				});
			}

			return data;
		},
		randomDayGenerator:  function(levels) {
			var sum = 0;
			var randomRange = function(start, stop) {
				return start + Math.round(Math.random() * (stop-start));
			};
			
			for (var i = 0; i < levels.length; i++) {
				sum += levels[i].probability;
				levels[i].probabilitySum = sum;
			}
			
			var bolus = function(carbs, correctBolusFactor) {
				var ic = 30;
				carbs = carbs/5; // break into 1 minute interval unit

				return {
					u: ss.u+ carbs*ic*(correctBolusFactor||1),
					d: ss.d + carbs
				}
			};

			var orderMeal = function(size) {
				if (size == 'meal') {
					return randomRange(30, 70);
				}
				return randomRange(6,20);
			};

			var day = function(dayIndex) {
				var results = steadyDay(dayIndex);
				var hits = [];
				var numberOfMeals = randomRange(7,13);

				for (var j = 0; j < numberOfMeals; j++) {
					var lastSum = 0;
					for (var i = 0; i < levels.length; i++) {
						var level = levels[i];

						var r = Math.random();

						if(r > lastSum && r <= level.probabilitySum) {
							hits.push(i);
							break;
						}

						lastSum = level.probabilitySum;
					}
				}

				var counts = _.countBy(hits, function(num) {
				  return num;
				});

				for(var i in levels) {
					for(var j = 0; j < counts[i]; j++) {

						var index = randomRange(levels[i].range[0] * 12, levels[i].range[1] * 12);
						var mealSizeCarb = orderMeal(levels[i].mealSize);

						// no more than one big meal per time period
						if(levels[i].mealSize == 'meal' && j>0) {
							mealSizeCarb = orderMeal('snack');					
						}
						
						results[index] = bolus(mealSizeCarb, 0.6 + Math.random()* 0.7);
					}
				};

				return results;
			};

			var steadyDay = function(dayIndex) {
				var results = [];
				
				for (var i = 0; i < 288; i++) {
					results.push({
						u: ss.u,
						d: ss.d,
						index: i + (288 * dayIndex)
					});
				}

				return results;
			};

			return function(numberOfDays) {
				var results = [];

				for(var i = 0; i < numberOfDays; i++) {
					results = results.concat(day());
				}
				
				return results;
			}
		}
	}
};