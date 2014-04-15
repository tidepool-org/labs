data = function() {
		var start = new Date();
		var data = [];	

		// hormone
		for(var i = 0; i < 500; i++) {
			var date = new Date(start.getTime() + i*5*60*1000);
			var value;
			var type;

			if(Math.random() * 2 > 1) {
				if(Math.random() < 0.1) {
					value = (Math.random() * 4) - 4;	
				} else {
					value = (Math.random() * 2) - 2;	
				}
				
				type = 'insulin';
			} else {
				value = Math.random() * 1;	
				type = 'glucagon';
			}

			data.push({
				type: type,
				group: 'hormone',
				date: date,
				value: value
			});

			data.push({
				type: 'cgm',
				group: 'sugar',
				date: date,
				value: 4 + Math.random() * 7
			});

			if(Math.random() < .05) {
				data.push({
					type: 'bg',
					group: 'sugar',
					date: date,
					value: 4 + Math.random() * 7
				});
			}
		}

		return data;
	}();

	data.map(function(item) {
		item.date = new Date(item.date);
		return item;
	});

	data = _.sortBy(data, function(item) { return item.date.getTime(); });

	var hormoneData = _.where(data, {group: 'hormone'});
	var i = 0;

	var input = function() {
		var values = [];

		for(var i=0; i<300; i++) {
			values.push({
				u: ss.u,
				d: ss.d,
			});
		}
		
		var ubolus = 600;
		var dmeal  = 20;

		values[2] = {
			u: ss.u+ubolus,
			d: ss.d+dmeal
		};

		values[10] = {
			u: ss.u+ubolus/4,
			d: ss.d+dmeal/4
		};

		values[22] = {
			u: ss.u+ubolus/5,
			d: ss.d+dmeal
		};

		values[72] = {
			u: ss.u+ubolus,
			d: ss.d+dmeal
		};
		values[144] = {
			u: ss.u+ubolus,
			d: ss.d+dmeal
		};
		values[216] = {
			u: ss.u+ubolus,
			d: ss.d+dmeal
		};
	
		return values;
	}();