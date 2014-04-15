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
var Graph = function(element, options) {
  var svg = d3.select(element)
    .append("svg")
    .attr("width", options.width)
    .attr("height", options.height);

  var steps = 24;

  var xScale = d3.scale.linear()
    .domain([0, steps])
    .range([options.xPaddingLeft, options.width])
    .clamp(true);

  var xScale288 = d3.scale.linear()
    .domain([0, 288])
    .range([options.xPaddingLeft || 0, options.width])
    .clamp(true);

  var yScale = d3.scale.linear()
    .domain([options.bgMax, 0])
    .range([options.yPaddingTop, options.yPaddingTop + (options.height - options.yPaddingBottom || 0)])
    .clamp(true);

  var edges = function(readings, options) {
    if (!options) {
      options = {};
    }

    if (!options.xScale) {
      options.xScale = xScale;
    }
    
    return readings.map(function(d,i) {
      return {
        x: options.xScale(i),
        y: yScale(d)
      }
    });
  };

  var line = function(edges, options) {
    _.defaults(options, {
      'stroke': 'gray',
      'stroke-width': 2,
      'fill': 'none'
    });

    var lineFunction = d3.svg.line()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; })
      .interpolate("basis");
    
    
    var lineGraph = svg.append("path")
      .attr("d", lineFunction(edges));

    for(var o in options) {
      lineGraph.attr(o, options[o]);
    }

    return lineGraph;
  };

  var range = function(top, bottom, options) {
    var edges = [];

    if (!options.xScale) {
      options.xScale = xScale;
    }

    for(var i = 0; i < top.length; i++) {
      edges.push({
        x: options.xScale(i),
        y: yScale(top[i])
      });
    };

    edges.push({
      x: options.xScale(options.xScale.range()[1]),
      y: yScale(top[0])
    });

    edges.push({
      x: options.xScale(options.xScale.range()[1]),
      y: yScale(top[0])
    });

    edges.push({
      x: options.xScale(options.xScale.range()[1]),
      y: yScale(bottom[0])
    });

    edges.push({
      x: options.xScale(options.xScale.range()[1]),
      y: yScale(bottom[0])
    });

    for(var i = bottom.length - 1; i > -1; i--) {
      edges.push({
        x: options.xScale(i),
        y: yScale(bottom[i])
      });
    };
    
    return line(edges, options);
  };

  var labels = function() {
    var labels = [40,80,120,180,200,300,350];
    for(var i in labels) {
      var label = labels[i];
      var x = options.labelPadding;

      if (label < 100) {
        x = options.labelPadding + 7;
      }
      if (label < 10) {
        x = options.labelPadding + 13;
      }
      
      svg.append('text')
        .attr('class', 'chart-y-label')
        .attr('x', x)
        .attr('width', options.xPaddingLeft)
        .attr('y', yScale(label) + 5)
        .text(label);
    }

    var textLabels = ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'];

    for(var i in textLabels) {
      svg.append('text')
        .attr('class', 'chart-x-label')
        .attr('x', xScale(i*3) + 4)
        .attr('width', options.xPaddingLeft)
        .attr('y', 14)
        .text(textLabels[i]);
    }
  };

  var date = function(date) {
    svg.append('text')
      .attr('class', 'chart-label-date')
      .attr('x', 2)
      .attr('width', 20)
      .attr('y', 12)
      .text(date);
  };

  var noonLine = function() {
    svg.append("line")
      .attr("x1", xScale(4*3))
      .attr('class', 'chart-target-line-noon')
      .attr("y1", -10)
      .attr("x2", xScale(4*3))
      .attr("opacity", 0.7)
      .attr("y2", yScale(xScale.range()[0]));
  };

  var background = function() {
    var shades = [
      {i: 0, fill: '#DCE4E7'},
      {i: 1, fill: '#E3EAED'},
      {i: 2, fill: '#E9EFF1'},
      {i: 3, fill: '#F2F4F6'},
      {i: 4, fill: '#F8F9FA'},
      {i: 5, fill: '#E9EFF1'},
      {i: 6, fill: '#E3EAED'},
      {i: 7, fill: '#DCE4E7'},
    ];

    svg.selectAll()
      .data(shades)
      .enter()
      .append("rect")
      .attr('attr', function(d) {

        $(this).attr({
          x: xScale(d.i*3),
          y: 0,
          fill: d.fill,
          width: Math.ceil(xScale(3) - xScale(0)),
          height: yScale(xScale.domain()[0]),
        });
      });
  };

  var target = function() {
    svg.append("line")
      .attr("x1", options.xPaddingLeft)
      .attr('class', options.targetLineClass || 'chart-target-line')
      .attr("y1", yScale(80))
      //.attr("stroke-dasharray", ("5, 5"))
      .attr("x2", options.width)
      .attr("opacity", 0.7)
      .attr("y2", yScale(80));

    svg.append("line")
      .attr("x1", options.xPaddingLeft)
      .attr('class', options.targetLineClass || 'chart-target-line')
      .attr("y1", yScale(180))
      //.attr("stroke-dasharray", ("5, 5"))
      .attr("x2", options.width)
      .attr("opacity", 0.7)
      .attr("y2", yScale(180));
  };

  return {
    line: line,
    date: date,
    range: range,
    edges: edges,
    xScale288: xScale288,
    xScale24: xScale,
    target: target,
    labels: labels,
    background: background,
    xScale: xScale,
    yScale: yScale,
    noonLine: noonLine
  }
}