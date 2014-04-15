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
/*
Compute APG profile data.

x: array of cgm readings starting at 5 minute intervals starting at 00:00

return: array[288]
array 288 values for each 5 minute segment of the day with the an object with percentile and their values for the given array x 
{
	median: value,
	10: value,
	25: value,
	75: value,
	90: value
}
*/
var agp = function(x, chuncks) {
	/*var bins = _.groupBy(x, function(xi, i) { return i%288});
	var arr = Object.keys(bins).map(function (key) {return bins[key]}); // convert to array
	arr.push(arr.shift()); // fix zero index */
	var bins = chunck(x, chuncks);

	for(var i in bins) {
		var bi = [];

		for(var j in bins[i]) {
			bi = bi.concat(bins[i][j]);
		}

		bins[i] = bi;
	}

	var data = bins.map(function(item) {
		return {
			'10': percentile(10, item),
			'25': percentile(25, item),
			'50': percentile(50, item),
			'75': percentile(75, item),
			'90': percentile(90, item)
		};
	});
 
	return {
		10: _.pluck(data, '10'),
		25: _.pluck(data, '25'),
		50: _.pluck(data, '50'),
		75: _.pluck(data, '75'),
		90: _.pluck(data, '90')
	}
};