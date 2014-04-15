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
	Calculating Percentiles 

	http://www.stanford.edu/class/archive/anthsci/anthsci192/anthsci192.1064/handouts/calculating%20percentiles.pdf

	i = n*pi/100 + 0.5
	
	let k = the integer part of i 
	let f = the fractional part of i 
	(i.e., if k = 10.375, then k = 10 and f = 0.375) 
	let xint = the value we want to interpolate between xk and xk+1: 
	
	xint = (1 - f)*x[k] + f*x[k+1];
*/
var percentile = function(pi, x) {
	x = _.sortBy(x, function(num){ return num });
	x = _.filter(x, function(num){ return !!num; });	

	var n = x.length;
	var i = n*pi/100 + 0.5;
	var k = parseInt(i);
	var f = i - k;
	var xint = (1 - f)*x[k] + f*x[k+1];

	return xint || 0;
};

var test = function() {
	var x = [5,1,9,3,14,9,7];

	//return agp(x);
	return percentile(50,x);	
}

console.log(test());