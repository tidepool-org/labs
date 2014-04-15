var shifted = false;
var dataset = [];
var stopcalling = false;

$(function() {
	var faye = new Faye.Client('/faye', {timeout: 20});

	$(document).on('touchmove',function(e){
  	e.preventDefault();
	});

 	$(document).bind('keyup keydown', function(e) {
    shifted = (e.keyCode === 16);
 	});

	$(document).keyup(function(e) {
		shifted = false;
	});
	/* Routes */
	router.add('#static', function() {
		$('#container').html('');
		
		var interval;
		var id = (Math.random() + '').substring(2);
		var wide = document.width > 800;
		var hours = 12;
		var _chart = chart(500, hours);
		var _simulator = newSimulator();
		var start = 1376488271718;

		var call = function() {
			var data = _simulator.windowStart(start, hours, readings);
			dataSetStart = data.data;

			_chart.clear();
			
			start = data.start + 60000 * 10;

			_chart.draw(new Date(start), data.data);
		};

		setInterval(call, 200);
	});

	router.add('#client', function() {
		$('#container').html('');
		
		var interval;
		var id = (Math.random() + '').substring(2);
		var wide = document.width > 1000;
		var hours = wide ? 12 : 7;
		var _chart = chart(960, hours);
		sim = simulator();

		var call = function() {
			var meals = [];
			for(var i = 0; i < 1; i++) {
				meals.push(meal());
			}

			sim.get(meals, false, function(error, x, values) {
				if(error) {
					console.log('error: ', error);
				}

				faye.publish('/simulator', {id: id, data: values});
				//dataset = dataset.concat(values);

				var data = sim.window(hours);
				var start = new Date(data.start);

				_chart.clear();
				_chart.draw(start, data.data);	

				if(!stopcalling) {
				//	call();	
				}
			});	
		};

		interval = setInterval(function() {
			call();
		}, 3000);

		$('#container').on('click', function() {
			//clearInterval(interval);
			stopcalling = true;
		});
	});

	router.add('#list', function() {
		var clients = {};

		$('#container').html('');

		faye.subscribe('/simulator', function(message) {
			var client = {};

			if(!clients[message.id]) {
				client.chart = chart(960, 12);
				client.data = [];
			} else {
				client = clients[message.id];
			}
			
			message.data = message.data.map(function(m) {
				m.date = new Date(m.ticks);
				return m;
			});

			client.data = client.data.concat(message.data);

			clients[message.id] = client;

			client.chart.clear();

			var data = client.data;
			if(client.data.length > 420) {
				data = _.last(data, 420);	
			}
			
			client.chart.draw(data[0].date, data);	

			clients[message.id] = client;
		});
	});
	
	router.add('#edit', function() {
		$('#container').html('');
		
		var hours = 12;
		var meals = [];
		var _chart = chart(960, hours);
		var sim = simulator();
		var start = new Date();

		for(var i = 0; i < hours*12; i++) {
			var m = meal(true);
			m.index = i;

			meals.push(m);
		}

		$(document).on('chart-edit', function(event, data) {
			meals[data.index][data.type] = data.value;
		});

		$(document).bind('keyup keydown', function(e) {
    	if (e.keyCode === 13) {
    		draw(meals);
    	}
 		});

		var draw = function(meals) {
			$('body').css('cursor', 'wait'); 

			sim.get(meals, true, function(error, x, values) {
				if(error) {
					console.log('error: ', error);
				}

				_chart.clear();
				_chart.draw(new Date(values[0].ticks), values, true);	
				$('body').css('cursor', 'default'); 
			});	
		};
		
		draw(meals);

	});

	//<script src="js/apSimulator.js"></script>
	//<script src="js/meal.js"></script>
  
	var generatePatientData = function(readings, callback) {
		var meals = function(count) {
			var meals = [];

			for(var i = 0; i < count; i++) {
				var m = meal(true);
				m.index = i;
				meals.push(m);
			}

			return meals;
		};

		var build = function(meals, callback) {
			var sim = simulator();
			
			sim.get(meals, true, function(error, x, values) {
				callback(error, values);
			});	
		};
		build(meals(readings), callback);
	};

	router.add('#dataset', function() {
		$('#container').html('Data Set');
		
		dataset = [];

		for(var i = 0; i < 16; i++) {
			generatePatientData(144, function(error, values) {
				if(error) {
					console.log('error building dataset entry: ', error);
					return;
				}

				console.log('Got new dataset entry!');
				$('#container').append('<br>Got new dataset entry!');
				dataset.push(values);
			});
		}
	});	
	//window.location.hash = 'edit';
	
	$(window).trigger("hashchange");
});