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
$(function() {
	draw();
});

var draw = function() {
	var svg = d3.select("body").append("svg");

	var carbInput = function(position, carb) {
		var drag = d3.behavior.drag()
		.on("drag", function(d,i) {

			var r = Math.abs(circle.attr('cx')-d3.event.x);

			if(r < scale.range()[0] || r > scale.range()[1]) {
				return;
			}

		  d3.select(this).attr("cx", d3.event.x);
		  circle.attr('r', r);

		  var textValue = scale.invert(r).toFixed(0);

		  if (textValue < 10) {
		  	value.attr('x', position.x - 5);
		  } else {
		  	value.attr('x', position.x - 8);
		  }

		  value.text(textValue + 'g');
		});

		var scale = d3.scale.linear()
	    .domain([5, 80])
	    .range([30, 100])
	    .clamp(true);

		var circle = svg.append("circle")
			.attr("cx", position.x)
			.attr("cy", position.y)
			.attr("r", scale(carb))
			.attr('class', 'svg-carb-circle');

		var handle = svg.append("circle")
			.attr("cx", position.x + scale(carb))
			.attr("cy", position.y)
			.attr("r", 5)
			.attr('class', 'svg-carb-handle')
			.call(drag);

		var value = svg.append('text')
        .attr('class', 'svg-carb-value')
        .attr('x', position.x - 8)
        .attr('y', position.y + 4)
        .text(carb + 'g');

		handle.on("click", function() {
		  if (d3.event.defaultPrevented) return; // click suppressed
		  console.log("clicked!");
		});
	};

	carbInput({x:200,y:200}, 20);
};
