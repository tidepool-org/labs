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
var graph = function(id, data, options) {
	var svg = d3.select('#' + id).append('svg')
		.attr('width', options.width)
		.attr('height', options.height);
	var yStart = 15;
	var xStart = 30;

	var xScale = d3.time.scale()
    .domain([new Date(data[0].time), new Date(data[data.length-1].time)])
    .range([xStart, options.width]);

  var xAxis = d3.svg.axis().scale(xScale)
    .orient("bottom").ticks(6)
    .tickFormat(d3.time.format("%I %p"));

  svg.append("rect")
    .attr("x", 0)
    .attr("y", 0)
		.attr('class', 'xAxisLabelBackground')
		.attr('width', options.width)
		.attr('height', yStart);

	var xAxisNodes = svg.append("g")
  	.attr('class', 'xAxis')
  	.call(xAxis);

	xAxisNodes.selectAll('text')
		.attr('dy', 0)
		.attr('class', 'xAxisText');

	var glucoseClass = function(reading) {
		if (reading.value < 80) {
			return 'bolus_lowRange';
		}
		
		if (reading.value > 180) {
			return 'bolus_highRange';
		}
		
		return 'bolus_normalRange';
	};

	var yGlucoseScale = d3.scale.linear()
				.domain([0, 300])
				.range([options.sectionHeight, 10 + yStart])
				.clamp(true)

	var draw = {
		smbg: function(data) {
			for(var i in data) {
				var reading = data[i];
				var x = xScale(reading.date);
				var y = yGlucoseScale(reading.value);
				var _class = glucoseClass(reading);
				//smbg text
				/*svg.append('text')
	        .attr('class', 'bolus_smbg_label')
	        .attr('x', x)
	        .attr('y', y - 12)
	        .text(reading.value);*/
	      //smbg circle
	      svg.append("circle")
	      	.attr('cx', x)
	      	.attr('cy', y)
	      	.attr('r', 10)
	      	.attr('title', reading.value)
	      	.attr('class', _class + ' tipsyTitle');
			}
		},
		timeLabels: function(readings) {
			var first = readings[0];
			var last = readings[readings.length-1];

			//todo: add time labels every 2 hours
		},
		glucoseLabels: function() {
			var labels = [50, 100, 200, 300];

			for(var i in labels) {
				var label = labels[i];

				//smbg text
				svg.append('text')
	        .attr('class', 'pool_glucose_label')
	        .attr('x', 5)
	        .attr('y', yGlucoseScale(label)+5)
	        .text(label);
			}

	    svg.append("line")
	      .attr("x1", xStart)
	      .attr('class', 'pool_target_line')
	      .attr("y1", yGlucoseScale(80))
	      .attr("x2", options.width)
	      .attr("y2", yGlucoseScale(80));

	    svg.append("line")
	      .attr("x1", xStart)
	      .attr('class', 'pool_target_line')
	      .attr("y1", yGlucoseScale(180))
	      .attr("x2", options.width)
	      .attr("y2", yGlucoseScale(180));
		},
		cbg: function(data) {
			svg.selectAll("circle")
				.data(data)
				.enter()
				.append("circle")
				.attr("cx", function(reading) {
					return xScale(reading.date);
				})
				.attr("cy", function(reading) {
					return yGlucoseScale(reading.value);
				})
				.attr('title', function(reading) {
					return reading.value;
				})
	      .attr('class', function(reading) {
	      	var _class = glucoseClass(reading);
	      	return _class + ' tipsyTitle';
	      })
				.attr('r', 2);
		},
		wizard: function(data) {
			var yScale = d3.scale.linear()
				.domain([0, 10])
				.range([0, 100])
				.clamp(true);

			var xCarbScale = d3.scale.linear()
				.domain([0, 100])
				.range([0, 20])
				.clamp(true);
			
			//bolus
			svg.selectAll()	
				.data(data)
				.enter()
				.append("rect")
		    .attr("x", function(reading) {
		    	return xScale(reading.date);
				})
				.attr('title', function(reading) {
					var s = '<div class="bolus_tip"><ul>';

					if(reading.payload.estimate) s += '<li>Value: '+ reading.payload.estimate +'</li>';
					if(reading.payload.correctionEstimate) s += '<li>Correction Estimate: '+ reading.payload.correctionEstimate +'</li>';
					if(reading.payload.foodEstimate) s += '<li>Food Estimate: '+ reading.payload.foodEstimate +'</li>';
					if(reading.payload.bgInput) s += '<li>SMBG Input: '+ reading.payload.bgInput +'</li>';
					if(reading.payload.activeInsulin) s += '<li>Active Insulin: '+ reading.payload.activeInsulin +'</li>';
					if(reading.payload.foodEstimate) s += '<li>Carb Ratio: '+ reading.payload.carbRatio +'</li>';
					if(reading.payload.correctionEstimate) s += '<li>Insulin Sensitivity: '+ reading.payload.insulinSensitivity +'</li>';
					s += '</ul></div>';

					return s;
				})
				.attr('class', 'graph_bolus tipsyTitleBolus')
				.attr('width', 10)
				.attr('attr', function(reading) {
					var length = yScale(reading.payload.estimate);
					
					$(this).attr("height", length);
					$(this).attr("y", options.height - length);
				});

			/*for(var i in data) {
				var reading = data[i];
				var x = xScale(reading.date);
				var y = options.height - yScale(reading.payload.estimate) - 12;
				
				//carb text
				svg.append('text')
	        .attr('class', 'bolus_label')
	        .attr('x', x + 14)
	        .attr('y', y + 27)
	        .text(reading.payload.estimate+'u');
	    }*/
			//correciton bolus
			/*svg.selectAll()	
				.data(data)
				.enter()
				.append("rect")
		    .attr("x", function(reading) {
		    	return xScale(reading.date);
				})
				.attr('class', 'graph-bolus-correction')
				.attr('attr', function(reading) {
					var length = yScale(reading.correction);
					
					$(this).attr("height", length);
					$(this).attr("y", options.height - length);
				});*/

			//carb
			for(var i in data) {
				var reading = data[i];
				var x = xScale(reading.date);
				var y = options.height - yScale(reading.payload.estimate);
				var carbCircleR = 15;//xCarbScale(reading.carbs);
				
				if(reading.payload.carbInput == 0) {
					continue;
				}

				//carb text
				
	      //carb circle
	      svg.append("circle")
	      	.attr('cx', x + carbCircleR/2)
	      	.attr('cy', y - carbCircleR - 2)
	      	.attr('r', carbCircleR)
	      	.attr('class', 'bolus_carbs');

	      svg.append('text')
	        .attr('class', 'bolus_carbs_label')
	        .attr('x', x + 1)
	        .attr('y', y - 12)
	        .text(reading.payload.carbInput);	
			}
		}
	}
	
	draw.glucoseLabels();
	draw.cbg(_.filter(data, function(reading) { return reading.type == 'cbg'}));
	draw.smbg(_.filter(data, function(reading) { return reading.type == 'smbg'}));
	draw.wizard(_.filter(data, function(reading) { return reading.type == 'wizard'}))
	$('.tipsyTitle').tipsy({gravity: 's'});
	$('.tipsyTitleBolus').tipsy({html: true, gravity: 'w'});
};