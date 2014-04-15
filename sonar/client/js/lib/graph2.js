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
var graph = function(id, settings) {
	var svg = d3.select('#' + id).append('svg')
		.attr('width', options.width)
		.attr('height', options.height);
	
	var xScale = d3.time.scale()
    .domain([new Date(data.episode.start), new Date(data.episode.end)])
    .range([0, options.width]);

	var glucoseClass = function(reading) {
		if (reading.value < 80) {
			return 'bolus-lowRange';
		}
		
		if (reading.value > 180) {
			return 'bolus-highRange';
		}
		
		return 'bolus-normalRange';
	};

	return {
		smbg: function(data) {
			var yScale = d3.scale.linear()
				.domain([0, 450])
				.range([options.height, 0])
				.clamp(true)
		
			for(var i in data) {
				var reading = data[i];
				var x = xScale(reading.date);
				var y = yScale(reading.value);
				var _class = glucoseClass(reading);
				//smbg text
				svg.append('text')
	        .attr('class', 'bolus-smbg-label')
	        .attr('x', x)
	        .attr('width', options.xPaddingLeft)
	        .attr('y', y)
	        .text(reading.carbs);
	      //smbg circle
	      svg.append("circle")
	      	.attr('cx', x)
	      	.attr('cy', y)
	      	.attr('r', 5)
	      	.attr('class', _class);
			}
		},
		cbg: function(data) {
			var yScale = d3.scale.linear()
				.domain([0, 450])
				.range([options.height, 0])
				.clamp(true)

			svg.selectAll("circle")
				.data(data)
				.enter()
				.append("circle")
				.attr("cx", function(reading) {
					return xScale(reading.date);
				})
				.attr("cy", function(reading) {
					return yScale(reading.value);
				})
				.attr('class', glucoseClass)
				.attr('r', 2);
		},
		bolusWizard: function(data) {
			var yBolusScale = d3.scale.linear()
				.domain([0, 100])
				.range([0, options.height])
				.clamp(true);

			var xCarbScale = d3.scale.linear()
				.domain([0, 100])
				.range([0, options.height])
				.clamp(true);

			//food bolus
			svg.selectAll()	
				.data(data)
				.enter()
				.append("rect")
		    .attr("x", function(reading) {
		    	return xScale(reading.date);
				})
				.attr('class', 'graph-bolus-food')
				.attr('attr', function(reading) {
					var length = yScale(reading.food) + yScale(reading.correction);
					
					$(this).attr("height", length);
					$(this).attr("y", options.height - length);
				});

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
				var y = yBolusScale(reading.correction) + yScale(reading.food) + 10;
				var carbCircleR = xCarbScale(reading.carbs);
				
				//carb text
				svg.append('text')
	        .attr('class', 'bolus-carbs-label')
	        .attr('x', x)
	        .attr('width', options.xPaddingLeft)
	        .attr('y', y)
	        .text(reading.carbs);
	      //carb circle
	      svg.append("circle")
	      	.attr('cx', x)
	      	.attr('cy', y)
	      	.attr('r', carbCircleR)
	      	.attr('class', 'bolus-carbs');
			}
		}
	},
}

"{\"value\":\"2.5\",
\"smbg\":\"0\",
\"carbs\":\"25\",
\"carb_units\":\"grams\",
\"carb_ratio\":\"10\",
\"sensitivity\":\"45\",
\"recommended\":\"2.5\",
\"correction\":\"0\",
\"food\":\"2.5\",
\"joinKey\":\"bba337cc0f\",
\"type\":\"wizard\",
\"deviceTime\":\"2013-11-06T07:54:25\"}\n",

var carbs = function(id, data, options) {
	var svg = d3.select('#' + id).append('svg')
		.attr('width', options.width)
		.attr('height', options.height);

	var xScale = d3.time.scale()
    .domain([new Date(data.episode.start), new Date(data.episode.end)])
    .range([0, options.width]);

	var yScale = d3.scale.linear()
		.domain([0, 100])
		.range([0, options.height])
		.clamp(true);

	svg.selectAll()	
		.data(data.sectionCarbReadings)
		.enter()
		.append("rect")
    .attr("x", function(reading) {
    	return xScale(reading.date);
		})
		.attr('title', function(reading) {
			return reading.value + 'g' + reading.date;
		})
		.attr('class', 'graph-tooltip graph-carb')
		.attr('attr', function(reading) {
			var length = yScale(reading.value);
			
			$(this).attr('fill', 'lightblue');	
			$(this).attr("height", length);
			$(this).attr("width", 5);
			$(this).attr("y", options.height - length);
		});
};

var glucoseGraph = function(id, data, options) {
	var svg = d3.select('#' + id).append('svg')
		.attr('width', options.width)
		.attr('height', options.height);

	var colors = {
		highRange: '#B99BEA',
		normalRange: '#98CB64',
		lowRange: '#FF8D79',
	};

	var xScale = d3.time.scale()
    .domain([new Date(data.episode.start), new Date(data.episode.end)])
    .range([0, options.width]);

	var yScale = d3.scale.linear()
		.domain([0, 450])
		.range([options.height, 0])
		.clamp(true)

	svg.selectAll("circle")
		.data(data.readings)
		.enter()
		.append("circle")
		.attr("cx", function(reading) {
			return xScale(reading.date);
		})
		.attr("cy", function(reading) {
			return yScale(reading.value);
		})
		.attr('class', 'graph-tooltip')
		.attr('title', function(reading) {
			return reading.value + ' mg/dl' + reading.date;
		})
		.attr('r', 2)
		.attr('fill', function(reading) {
			if (reading.value < 80) {
				return colors.lowRange;
			}
			
			if (reading.value > 180) {
				return colors.highRange;
			}
			
			return colors.normalRange;
		});
};