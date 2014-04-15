var meal = {
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
					
					results[index] = bolus(mealSizeCarb, 1.2);
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
};