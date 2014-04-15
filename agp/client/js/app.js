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
var load = function(readings) {
	var cgmReadings = readings.bg;
	var cgmDays = _.groupBy(cgmReadings, function(d,i) { return Math.round(i/288); });
	var maxDays = Math.round(cgmReadings.length/288);
	var days = 0;
	var shownDay = null;

	var drawDayProfile = function() {
		options = {
			width: 118,
			height: 60,
			xPaddingLeft: 0,
			yPaddingTop: 0,
			yPaddingBottom: 0,
			bgMax: 355,
			labelPadding: 0,
			targetLineClass: 'chart-target-line-day'
		};

		for(var i in cgmDays) {
			var c = '';
			
			if(i == 6 || i == 13 || i == 20 || i == 27) {
				c = 'day-profile-chart-li-last';
			}

			var li = $('<li class="day-profile-chart'+i+' '+ c +'"></li>');
			
			$('.day-profile-chart').append(li);

			var graph = Graph('.day-profile-chart'+i, options);
			
			_graph = graph;

			li.on('click', function(i) { return function() {

				$('.day-profile-chart > li').removeClass('day-profile-chart-active');

				if(i == shownDay) {
					shownDay = null;
					paint(null);
					return;
				}

				$(this).addClass('day-profile-chart-active');
				shownDay = i;
				paint(i);
			}}(i));

			graph.background();
			//graph.noonLine();
			graph.date(parseInt(i)+1);
			graph.target({'stroke': '#DCE4E7'});

			graph.line(graph.edges(cgmDays[i], {xScale: graph.xScale288}), {'class': 'chart-day', 'stroke': '#F8B26E', 'stroke-width': 2.5, xScale: graph.xScale288});
		}
	};

	var paintCarbs = function() {
		var data = agp(readings.carbs);
		
		console.log(data);

		options = {
			width: 800,
			height: 500,
			xPaddingLeft: 24,
			yPaddingTop: 13,
			yPaddingBottom: 10,
			bgMax: 20,
			labelPadding: 0
		};

		var graph = Graph('.agp-carb-chart', options);
		graph.background();
		graph.target();

		var outer = graph.range(data['10'], data['90'], {'title': '10th - 90th percentile', 'class': 'chart-outer', 'stroke': '#BBCDEB', 'fill': '#BBCDEB', 'stroke-width': 0, 'opacity': 0.8});
		var inner = graph.range(data['25'], data['75'], {'title': '25th - 75th percentile', 'class': 'chart-inner', 'stroke': '#7FA2D5', 'fill': '#7FA2D5', 'stroke-width': 0, 'opacity': 0.8});		
		data['50'].push(data['50'][0]);
		var median = graph.line(graph.edges(data['50']), {'title': 'Median', 'class': 'chart-median', 'stroke': '#243082', 'stroke-width': 4, 'opacity': 0.8});
	};

	var paint = function(days) {
		var data = agp(cgmReadings);
		
		options = {
			width: 930,
			height: 500,
			xPaddingLeft: 24,
			yPaddingTop: 13,
			yPaddingBottom: 10,
			bgMax: 355,
			labelPadding: 0
		};
		
		$('.agp-chart').html('');

		var graph = Graph('.agp-chart', options);
		graph.background();
		graph.target();

		_graph = graph;

		var outer = graph.range(data['10'], data['90'], {'title': '10th - 90th percentile', 'class': 'chart-outer', 'stroke': '#BBCDEB', 'fill': '#BBCDEB', 'stroke-width': 0, 'opacity': 0.8});
		var inner = graph.range(data['25'], data['75'], {'title': '25th - 75th percentile', 'class': 'chart-inner', 'stroke': '#7FA2D5', 'fill': '#7FA2D5', 'stroke-width': 0, 'opacity': 0.8});
		
		data['50'].push(data['50'][0]);

		var median = graph.line(graph.edges(data['50']), {'title': 'Median', 'class': 'chart-median', 'stroke': '#243082', 'stroke-width': 4, 'opacity': 0.8});

		if (days) {
			var day = graph.line(graph.edges(cgmDays[days], {xScale: graph.xScale288}), {'title': 'Day' + days, 'class': 'chart-day', 'stroke': '#F8B26E', 'stroke-width': 4, xScale: graph.xScale288});
			$('.chart-day').tipsy({gravity: 'n'});
		}

		graph.labels();

		$('.chart-outer').tipsy({gravity: 'n'});
		$('.chart-inner').tipsy({gravity: 'n'});
		$('.chart-median').tipsy({gravity: 'n'});
		
		median.on("mouseover", function() { 
			outer.style("opacity", "0.5");
			inner.style("opacity", "0.5");
			median.style("opacity", "0.5");
		});
		
		median.on("mouseout", function() {
			inner.style("opacity", "0.8");
			outer.style("opacity", "0.8");
			median.style("opacity", "0.8");
		});

		inner.on("mouseover", function() { 
			outer.style("opacity", "0.5");
			inner.style("opacity", "0.5");
		});

		inner.on("mouseout", function() {
			inner.style("opacity", "0.8");
			outer.style("opacity", "0.8");
		});

		outer.on("mouseover", function() { 
			outer.style("opacity", "0.5");
		});

		outer.on("mouseout", function() {
			outer.style("opacity", "0.8");
		});
	};

	paint();
	//paintCarbs();
	drawDayProfile();	
	loadStats(glucoseRanges(cgmReadings));
};

var glucoseRanges = function(cgmReadings) {
	return {
		'dangerouslyLow': percent([0,50], cgmReadings),
		'verLow': percent([50,60], cgmReadings),
		'low': percent([60,70], cgmReadings),
		'target': percent([70,180], cgmReadings),
		'high': percent([180,250], cgmReadings),
		'veryHigh': percent([250,400], cgmReadings),
		'dangerouslyHigh': percent([400,1000], cgmReadings),
	}
};

var loadStats = function(ranges) {
	var shown = false;

	$('.stats-handle').click(function() {
		shown = !shown;

		if (!!shown) {
			$('.stats-handle').html('Hide Stats');
			$('.stats > table').show();
		} else {
			$('.stats-handle').html('Show Stats');
			$('.stats > table').hide();
		}
	});

	for(var i in ranges) {
		$('.' + i).html((ranges[i] * 100).toFixed() + '%');
	}
};

$(function() {
	//load(cgmReadings);
	//return;

	$.getJSON('/data',function(data){
		readings = data;
		load(data);
	});
}); 