var livegraph = function(element, bgReadings, carbReadings, bolusReadings, options){
	options.colors = {
		highRange: '#B99BEA',
		normalRange: '#98CB64',
		lowRange: '#FF8D79',
		bolus: '#B99BEA',
		carbs: '#FF8D79',
		shades: [
			'#DAE4E9',
			'#E2E9ED',
			'#E9EFF2',
			'#F5F7F7',
			'#F5F7F7',
			'#E9EFF2',
			'#E2E9ED',
			'#DAE4E9',
		]
	};
	options.hours = 
	options.dotWidth = 6;
	options.ratio = 0.6;
	options.padding = 0.05;

	var svg = d3.select(element)
		.append("svg")
		.attr("width", options.width)
		.attr("height", options.height);
		
	var xScale = d3.scale.linear()
		.domain([0, 12*options.hours])
		.range([options.xPaddingLeft || 0, options.width])
		.clamp(true);

	var setup = function() {		
		xScale.domain()[1]
	};

	var dot = function(readings, options) {
		var yScale = d3.scale.linear()
			.domain([0, 350])
			.range([options.height - options.dotWidth - 10, options.dotWidth])
			.clamp(true)

		svg.selectAll("circle")
			.data(readings)
			.enter()
			.append("circle")
			.attr("cx", function(reading) {
				return xScale(reading._index);
			})
			.attr("cy", function(reading) {
				return yScale(reading.value);
			})
			.attr('r', options.dotWidth/2)
			.attr('fill', function(reading) {
				if (reading.value < 80) {
					return options.colors.lowRange;
				}
				
				if (reading.value > 180) {
					return options.colors.highRange;
				}
				
				return options.colors.normalRange;
			});
	};	

	var rectangle = function(readings, options) {
		var yScale = {
			carbs: d3.scale.linear()
				.domain([0, 50])
				.range([0, options.height/2])
				.clamp(true),
			bolus: d3.scale.linear()
				.domain([0, 1000])
				.range([0, options.height/2])
				.clamp(true),
		};

		svg.selectAll()	
			.data(readings)
			.enter()
			.append("rect")
	    .attr("x", function(reading) {
	    	return xScale(reading._index);
			})
			.attr('attr', function(reading) {
				if(reading.type === 'insulin') {
					var length = yScale.bolus(reading.value);

					$(this).attr('fill', options.colors.bolus);	
					$(this).attr("height", length);
					$(this).attr("width", options.dotWidth);
					$(this).attr("y",  (options.paddingTop + options.height/2) - length);

					return;
				}

				var length = yScale.carbs(reading.value);

				$(this).attr('fill', options.colors.carbs);	
				$(this).attr("height", length);
				$(this).attr("width", options.dotWidth);
				$(this).attr("y", options.paddingTop + options.height/2);
			});
	};

	var background = function(options) {
		var data = [];
		for (var i = 0; i < 8; i++) { 
			data.push({
    		x: (options.overview ? options.axisWidth : 0) + Math.round(xScale(options.domain[0] + (milliDay*i) + milliHour*j)),
    		y: options.timeline ? options.heights.label : 0,
    		fill: options.colors.shades[i],
    		width: Math.round(xScale(options.domain[0] + milliHour)),
    		height: options.height - (options.timeline ? options.heights.label*2 : 0)
			});
		}

		svg.selectAll("rect")
			.data(data)
			.enter()
			.append("rect")
	    .attr('attr', function(d) {
	    	$(this).attr({
	    		x: d.x,
	    		y: d.y,
	    		fill: d.fill,
	    		width: d.width,
	    		height: d.height
	    	});
	    });
	};

	var bgOptions = _.defaults({
		height: options.height * options.ratio
	}, options);
	
	var rOptions = _.defaults({
		paddingTop: options.height * (options.ratio + options.padding),
		height: options.height * (1 - options.ratio - options.padding)
	}, options);

	if (options.small) {
		dot(bgReadings, options);
		return;
	}

	dot(bgReadings, bgOptions);
	rectangle(carbReadings, rOptions);
	rectangle(bolusReadings, rOptions);
};