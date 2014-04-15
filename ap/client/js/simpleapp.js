var shifted = false;
var dataset = [];
var stopcalling = false;

$(function() {
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
	router.add('#client', function() {
		$('#container').html('');
		
		var interval;
		var id = (Math.random() + '').substring(2);
		var wide = document.width > 1000;
		var hours = wide ? 12 : 7;
		var _chart = chart(wide ? 1000 : 475, hours);
		sim = simulator();

		//interval = setInterval(function() {

			var call = function() {
				var meals = [];
				for(var i = 0; i < 2; i++) {
					meals.push(meal());
				}

				console.log(meals);

				sim.get(meals, false, function(error, x, values) {
					if(error) {
						console.log('error: ', error);
					}

					//dataset = dataset.concat(values);

					var data = sim.window(hours);
					var start = new Date(data.start);

					_chart.clear();
					_chart.draw(start.getTime(), data.data);	

					if(!stopcalling) {
						call();	
					}
				});	
			};
			call();

		//}, 1000);

		$('#container').on('click', function() {
			//clearInterval(interval);
			stopcalling = true;
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
					return;
				}

				console.log(values);
				
				_chart.clear();
				_chart.draw(new Date(values[0].ticks), values, true);	
				$('body').css('cursor', 'default'); 
			});	
		};
		
		draw(meals);

	});

	$(window).trigger("hashchange");
});