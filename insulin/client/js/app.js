/*
The MIT License (MIT)

Copyright (c) 2014 Line Healthcare Design

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
//todo: stop using group translation use paddings instead also for carbs

var doseCarb = true;
$(function() {
	draw({
	//	0: {u:0,d:0}
	});
	$('body').keypress(function(event) {
		if (event.which == 99) {
			doseCarb = true;
		}
		if (event.which == 120) {
			doseCarb = false;
		}
	});

});

// structure and build into an svg group. make customizable add constrints, units to insulin

var draw = function(boluses) {
	var position = {x:100,y:200};
	var hours = 8;
	var readings = 12*hours;
	var dragging = false;
	var options = {
		height: 200,
		width: 720,
		svgWidth: 1000,
		svgHeight: 1000,
		readings: readings,
	};
	options.offset = {
		y: position.y - options.height + 40,
		x: position.x
	};
	var svg = d3.select('body').append('svg')
		.attr('width', options.svgWidth)
		.attr('height', options.svgHeight);
	var xScale = d3.scale.linear()
		.domain([0, options.readings])
		.range([options.offset.x, options.width + options.offset.x])
		.clamp(true);
	var yScale = d3.scale.linear()
		.domain([0, 450])
		.range([options.height + options.offset.y, options.offset.y])
		.clamp(true);
	var colors = {
		highRange: '#646464',
		normalRange: '#75c550',
		lowRange: '#FF8D79'
	};

	var mouseOverBackground = function() {
		$('#svg-glucose-value-circle').remove();

		var glucoseCircle = svg.append('circle')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('class', 'svg-glucose-value-circle')
			.attr('display', 'none')
			.attr('r', 2)
			.on('click', function() {
				//console.log(arguments);
			});

		svg.append("rect")
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', options.svgWidth)
			.attr('height', options.svgHeight)
			.attr('class', 'svg-background')
			.on('click', function(event) {
				if(dragging) {
					return;
				}

				var i = Math.round(xScale.invert(d3.event.x)).toFixed(0);

				if(boluses[i]) {
					return;
				}

				boluses[i] = {
					u: doseCarb ? 0 : 150,
					d: doseCarb ? 1 : 0
				};

				glucoseCircle
					.attr('display', 'none');

				carbWidget(bgs[i], boluses[i].u, boluses[i].d*5);
				refresh(boluses);
			})
			.on('mousemove', function() {
				if(dragging) {
					return;
				}

				var i = Math.round(xScale.invert(d3.event.x)).toFixed(0);
				var color = colors.normalRange;
				var reading = bgs[i];

				glucoseCircle
					.attr('cx', xScale(reading.index))
					.attr('cy', yScale(reading.value))
					.attr('fill', 'gray')
					.attr('display', 'block');

				if (reading.value < 80) {
					color = colors.lowRange;
				}

				if (reading.value > 180) {
					color = colors.highRange;
				}

				/*glucoseCircle
					.attr('cx', xScale(reading.index))
					.attr('cy', yScale(reading.value))
					.attr('fill', 'color')
					.attr('display', 'block')*/
			});
	};

	var carbWidget = function(reading, insulin, carb) {
		insulin = insulin/10;

		$('#carbWidget-'+reading.index).remove();

		var position = {
			x: xScale(reading.index),
			y: yScale(reading.value)
		};

		var widget = svg.append('g')
			.attr('class','carbWidget')
			.attr('id','carbWidget-'+ reading.index);

		var textValue = carb;

		var xCarbScale = d3.scale.linear()
	    .domain([0, 120], 5)
	    .range([15, 60])
	    .clamp(true);

	  var r = xCarbScale(carb);

		var circle = widget.append('circle')
			.attr('cx', position.x)
			.attr('cy', position.y)
			.attr('r', r)
			.attr('class', function() {
				if(boluses[reading.index].d === 0) {
					return 'svg-none-circle';
				}
				return 'svg-carb-circle';
			})
			.on('click', function() {
				//console.log('carb click');
				//console.log(boluses, reading, boluses[reading.index]);
				delete boluses[reading.index];
				$('#carbWidget-'+ reading.index).remove();
				$('.svg-glucose-value-circle').hide();

				refresh(boluses);
			});

		var count = 0;
		var carbDx = r;
		var bgs = [];

		var circleHandle = widget.append('circle')
			.attr('cx', position.x + r)
			.attr('cy', position.y)
			.attr('r', 5)
			.attr('class', 'svg-carb-handle')
			.call(d3.behavior.drag()
				.on('dragend', function() {
					dragging = false;
				})
				.on('drag', function(d,i) {
					$('.svg-glucose-value-circle').attr('display', 'none');

					dragging = true;

					carbDx += d3.event.dx;

					var r = Math.abs(carbDx);
					var y = parseInt(circle.attr('cy')) + (d3.event.x - circle.attr('cx'));
					var y2 = parseInt(circle.attr('cy')) + r + insulin;

					textValue = xCarbScale.invert(r).toFixed(0);

					//console.log('d3.event',d3.event, carbDx, textValue);

					/*if(textValue < xCarbScale.domain()[0] || textValue > xCarbScale.domain()[1]) {
						return;
					}*/

					d3.select(this).attr('cx', d3.event.x);

				  //handle.attr("cy", parseInt(circle.attr('cy')) + r);
				  circle.attr('r', r);

				  line.attr('x1', parseInt(circle.attr('cy')));
				  line.attr('y1', parseInt(circle.attr('cy')) + r);
				  line.attr('x2', parseInt(circle.attr('cy')));
				  line.attr('y2', y2);
				 	handle.attr('cy', y2);

				 	boluses[reading.index] = {u:insulin*10, d:textValue/5};
					refresh(boluses);
				})
			);

		var insulinHandleR = 15;

		if(insulin < 10) {
			insulin = 0;
			insulinHandleR = 5;
		}

		var handle = widget.append('circle')
			.attr('cx', position.x)
			.attr('cy', position.y + r + insulin)
			.attr('r', insulinHandleR)
			.attr('class', 'svg-insulin-handle')
			.call(d3.behavior.drag()
				.on('dragend', function() {
					dragging = false;
				})
				.on('drag', function(d,i) {
					$('.svg-glucose-value-circle').attr('display', 'none');

					dragging = true;

					var dy = 0;
					if (d3.event.dy > 10) {
						dy = 1;
					} else if (d3.event.dy < -10) {
						dy = -1;
					} else {
						dy = d3.event.dy;
					}

					insulin += dy;

					var y2 = parseInt(circle.attr('cy')) + parseInt(circle.attr('r')) + insulin;

					if (y2 < parseInt(circle.attr('cy')) + parseInt(circle.attr('r'))) {
						return;
					}

					if (insulin > 150) {
						return;
					}

					handle.attr('cy', y2);
					line.attr('y2', y2);

					boluses[reading.index] = {u:insulin*10, d:textValue/5};
					refresh(boluses);
				})
			);

		if (insulin > 10) {
			var insulinValue = widget.append('text')
	      .attr('class', 'svg-insulin-value')
	      .attr('x', position.x)
	      .attr('y', position.y + r + insulin + 4)
	      .attr('width', insulinHandleR)
				.text('i');
	      //.text((insulin/15).toFixed(1) + 'u');
		}

		if (textValue > 0) {
			var value = widget.append('text')
				.attr('class', 'svg-carb-value')
				.attr('x', position.x)
				.attr('y', position.y + 4)
				.attr('width', r*2)
				.text('g');
		}

    var line = widget.append('line')
      .attr('x1', position.x)
      .attr('y1', position.y + r)
      .attr('x2', position.x)
      .attr('y2', position.y + r + insulin - insulinHandleR) 
      .attr('class', 'svg-insulin-line');

		handle.on('click', function() {
		  if (d3.event.defaultPrevented) return; // click suppressed
		  console.log("clicked!");
		});
	};

	var glucose = function(data) {
		data.push(data[data.length-1]);
		svg.selectAll('g.dots').remove();

		var dots = svg.append('g')
			.attr('class','dots');

		data = data.map(function(d, i) {
			var el = {};
			el.index = i;
			el.value = parseInt(d.toFixed(0));
			return el;
		});

		var background = function() {
			for (var i = 1; i < data.length/12; i++) {
				var line = dots.append('line')
		      .attr('x1', xScale(i*12))
		      .attr('y1', yScale(data[i*12].value - 50))
		      .attr('x2', xScale(i*12))
		      .attr('y2', yScale(data[i*12].value + 50)) 
		      .attr('class', 'svg-dots-line');

		    dots.append('text')
	        .attr('class', 'svg-dots-label')
	        .attr('x', xScale(i*12) - 7)
	        .attr('y', yScale(data[i*12].value + 60))
	        .text('~' + i + 'h');
			}
		}();

		dots.selectAll('circle')
			.data(data)
			.enter()
			.append('circle')
			.attr('cx', function(reading) {
				return xScale(reading.index);
			})
			.attr('cy', function(reading) {
				return yScale(reading.value);
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
	}

	var refresh = function(boluses) {
		this.boluses = boluses;

		$.getJSON('/data?readings='+readings+'&bolus=' + JSON.stringify(boluses),function(data){
			glucose(data.bg, options);

			mouseOverBackground();

			bgs = data.bg.map(function(d, i) {
				var el = {};
				el.index = i;
				el.value = parseInt(d.toFixed(0));
				return el;
			});

			for (var i in boluses) {
				carbWidget(bgs[i], boluses[i].u, boluses[i].d*5);
			}
		});
	};

	refresh(boluses);
};
