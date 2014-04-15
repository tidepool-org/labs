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
var chunck = function(x) {
	var y = [];

	for(var i = 0; i < x.length; i++) {
		var z = [];

		for(var j = 0; j < 12; j++) {
			z[j] = x[i];
			i++;
		}

		y.push(z);
	}

	//console.log(x.length, y.length, x.length/12);

	var bins = _.groupBy(y, function(xi, i) { return i%24});

	var arr = Object.keys(bins).map(function (key) {return bins[key]}); // convert to array

	arr.push(arr.shift()); // fix zero index

	//console.log('bins',arr,bins);

	return arr;
};