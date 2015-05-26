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
var graph = function(svg, data, options) {
	
	
	var dot = function(readings) {
		readings = readings.map(function(d, i) {
			d.index = i;
			return d;
		});
		
		var colors = {
			highRange: '#B99BEA',
			normalRange: '#98CB64',
			lowRange: '#FF8D79',
		};

		var xScale = d3.scale.linear()
			.domain([0, 288])
			.range([options.xPaddingLeft || 0, options.width])
			.clamp(true);
			xXScale = xScale;

		var yScale = d3.scale.linear()
			.domain([0, 450])
			.range([options.height, 0])
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
			.attr('r', 4)
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
};