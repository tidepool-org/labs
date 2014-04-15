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
var data = {
};

$(function() {
	$.getJSON('/data',function(readings) {

		readings = normalize(readings);
		data.glucose = readings;
		
		load(readings);

		//data.glucose = filterTimeofDayByHours(0,9, readings);
		//load(filterTimeofDayByHours(0,9, data.glucose));
		//pumpData = filterTimeofDayByHours(0, 9, pumpData);
		//loadCarbs();
		//loadFasting(readings);
		//$('.graph-tooltip').tipsy({gravity: 's'});
	});
}); 

var options = {
	hours: 6,
	episode: {
		low: 80,
		high: 180,
		veryhigh: 250,
		range: [80, 180],
		trend: [0],
	}
};

var loadFasting = function(glucose) {
	var episodes = filter.carb.fasting(filter.carb.clean(filter.carb.normalize(pumpData)), glucose);

	console.log(episodes);

	for(var i in episodes) {
		var data = episodes[i];
		var id = 'chart-' + i;

		if(!occurence(data.readings, highState.condition, highState.occurence)) {
			//continue;
		}
		if (!data.readings.length || data.episode.reading.value == 0) {
			continue;
		}
		
		$('#main').append('<li id="'+ id + '""></li>');
		$('#' + id).append('<div class="graph-day">' + data.episode.reading.value + 'g ' + data.episode.reading.date.toDateString() + ' ' + data.episode.reading.date.toLocaleTimeString() + '</div>')		
		$('#' + id).append('<div class="graph-readings">Glucose Readings: ' + data.readings.length + '</div>');

		glucoseGraph(id, data, {height: 150, width: 500});
		$('#' + id).append('<br>');
		carbs(id, data, {height: 80, width: 500});
	}
};

var loadCarbs = function(range) {
	var episodes = filter.carb.episode(filter.carb.clean(filter.carb.normalize(pumpData)));
	var count = 0;

	for(var i = 0; i < episodes.length; i++) {
		var data = episodes[i];
		var id = 'chart-' + i;

		if(!occurence(data.readings, lowState.condition, highState.occurence)) {
			continue;
		}
		console.log(data.readings.length);
		
		if (!data.readings.length || data.episode.reading.value == 0 || data.readings.length < 10 ) {
			continue;
		}
		if (range && range.length) {
			if (!(data.episode.reading.value > range[0] && data.episode.reading.value < range[1])) {
				continue;
			}
		}

		$('#main ul').append('<li id="'+ id + '""></li>');
		$('#' + id).append('<div class="graph-day">' + data.episode.reading.value + 'g ' + data.episode.reading.date.toDateString() + ' ' + data.episode.reading.date.toLocaleTimeString() + '</div>')		
		$('#' + id).append('<div class="graph-readings">Glucose Readings: ' + data.readings.length + '</div>');

		glucoseGraph(id, data, {height: 150, width: 500});
		$('#' + id).append('<br>');
		carbs(id, data, {height: 80, width: 500});

		if(count++ == 30) {
			return;
		}
	}
};

var load = function(readings) {
	var chuncks = chop(readings);	
	var lows = trend(readings, chuncks);

	console.log('episode done', lows);

	for(var i in lows) {
		var data = lows[i];

		var id = 'chart-' + i;

		//$('#main').append('<li id="'+ id + '""></li>');
		//$('#' + id).append('<div class="graph-day">' + data.episode.reading.date.toDateString() + ' ' + data.episode.reading.date.toLocaleTimeString() + '</div>')

		glucoseGraph(id, data, {height: 150, width: 500});
	}

	/*console.log('low',low(readings, chuncks).length);
	console.log('high',high(readings, chuncks).length);
	console.log('veryhigh',veryhigh(readings, chuncks));*/
};