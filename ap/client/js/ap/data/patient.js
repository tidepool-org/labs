if(typeof app == 'undefined') app = {};
if(typeof app.data == 'undefined') app.data = {};

app.data.patient = {
	getRandomProfile: function() {
		var profile = {
			value: Math.round(Math.random() * 220) || 50,
			age: 15 + Math.round(Math.random() * 10)
		};

		if(Math.random() > 0.5) {
			//male
			profile.name = names.male[(Math.round(Math.random() * (names.male.length-1)) || 0)];
			profile.img = faces.male[(Math.round(Math.random() * (faces.male.length-1)) || 0)];
		} else {
			//female
			profile.name = names.female[(Math.round(Math.random() * (names.female.length-1)) || 0)];
			profile.img = faces.female[(Math.round(Math.random() * (faces.female.length-1)) || 0)]
		}

		return profile;
	},
	generateSingleAndDualHormoneReadings: function(meals, callback) {
		var self = this;

		this.getReadings(meals, function(error, readings) {
			if(error) {
				callback(error);
				return;
			}

			var correctedMeals = app.data.patient.avoidHighs(readings, meals);

			self.getReadings(correctedMeals.meals, function(err, readings2) {
				if(error) {
					callback(error);
					return;
				} 

				var secondCorrectedMeals = self.cleanCorrectionMealIfBgIsGood(readings2, correctedMeals.meals);

				app.data.patient.getReadings(secondCorrectedMeals.meals, function(error, readings3) {
					callback(error, {
						singleHormoneData: {readings: readings, correctionMeals:[]},
						dualHormoneData: {readings: readings3, correctionMeals: secondCorrectedMeals.correctionMeals}
					});
				});	
			});
		});
	},
	avoidHighs: function(readings, meals) {
		//loop through all cgm readings 

		var _meals = meals.slice(0);
		var correctionMeals = new Array(meals.length);

		//console.log('corecting highs');
		
		var skip = 5;
		for(var i = 0; i < readings.cgm.length-1;i++) {
			var reading = readings.cgm[i];

			if (reading.value < 80) {
			//	console.log('correcting a meal');
				var m = meal.eat(0.5);

				_meals[i] = m;
				correctionMeals[i] = m;

				for(var j = 1; j < skip;j++) {
				//	meals[i+j] = meal.bouls();
				}

				i += skip;
			}
		}

		//console.log('new meal plan calculated to correct highs');

		return {
			meals: _meals,
			correctionMeals: correctionMeals
		};
		
	},
	cleanCorrectionMealIfBgIsGood: function(readings, meals) {
		//loop through all cgm readings 
		var _meals = meals.slice(0);
		var correctionMeals = new Array(meals.length);

//		console.log('clean Correction Meal If Bg Is Good');
		
		for(var i = 0; i < readings.cgm.length-1;i++) {
			var reading = readings.cgm[i];

			if(_meals[i].d < 1  && _meals[i].d > 0) {
				//console.log(reading.value, meals[i], _meals[i], _meals[i].d);	
			}
			
			if (reading.value > 95 && _meals[i].d < 1 && _meals[i].d > 0) {
	//			console.log('double correct for this meal', _meals[i]);

				var m = meal.bouls();
				_meals[i] = m;
			}

			if (reading.value < 95 && _meals[i].d < 1 && _meals[i].d > 0) {
				correctionMeals[i] = meal.bouls();	
				//console.log('this is a corrections', _meals[i], correctionMeals, correctionMeals[i]);
			}
		}

		return {
			meals: _meals,
			correctionMeals: correctionMeals
		};
	},
	getReadings: function(meals, callback) {
		//console.log('getting readings for given meals');
		var build = function(meals, callback) {
			var sim = apSimulator();
			
			sim.get(meals, false, function(error, x, values) {
				//callback(error, values, x);
				callback(error, values);
			});
		};
		

		build(meals, function(error, readings, x) {
			var cgmReadings = _.filter(readings, function(r) { return r.type == 'cgm'});
			var bolusReadings = _.filter(readings, function(r) { return r.type == 'insulin'});
			var carbReadings = _.filter(readings, function(r) { return r.type == 'glucagon'});

			carbReadings.map(function(reading) {
				reading.value = Math.abs(reading.value);
				return reading;
			});

			callback(null, {
				cgm: cgmReadings,
				bolus: bolusReadings,
				carb: carbReadings
			}, x);
		});
	}
};