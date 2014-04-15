/*
The MIT License (MIT)

Copyright (c) 2013 Diacon Group

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
var simulator = require('./simulator')();


var u = [6.68, 6.68, 6.68, 160.68, 160.68, 160.68, 160.68, 6.68, 6.68, 6.68, 6.68, 6.68, 6.68, 6.68, 6.68, 6.68];
var d = [0.1, 0.1, 0.1, 10.2, 10.2, 10.2, 10.2, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1];

simulator.single(simulator.ss.x, u, d, function(error, x1, glucose, insulin) {
	console.log(arguments);
});

/*
var u = 6.680000;
var d = 0.000000;
var x = [12736.839721, 708.789439, 367.400000, 367.400000, 79.530690, 23.937331, 5.762595, 0.029504, 0.004725, 0.299655];

var simulator = require('./simulator')(x);

simulator.step(u, d, function(error, glucose, insulin) {
	console.log('step', glucose, insulin);
});

var start = new Date().getTime();

simulator.single(x, u, d, function(error, x1, glucose, insulin) {
	console.log('single', x1, glucose, insulin);
	console.log('time',new Date().getTime() - start);
});

var input = function() {
	var values = [];

	for(var i=0; i<300; i++) {
		values.push({
			u: simulator.ss.u,
			d: simulator.ss.d,
		});
	}
		
	var ubolus = 600;
	var dmeal  = 20;

	values[72] = {
		u: simulator.ss.u+ubolus,
		d: simulator.ss.d+dmeal,
	};
	values[144] = {
		u: simulator.ss.u+ubolus,
		d: simulator.ss.d+dmeal,
	};
	values[216] = {
		u: simulator.ss.u+ubolus,
		d: simulator.ss.d+dmeal,
	};
	
	return values;
}();

var i = 0;
var x = simulator.ss.x

var interval = setInterval(function() {
	simulator.single(x, input[i].u, input[i].d, function(error, x1, glucose, insulin) {
		x = x1;
		console.log(glucose, insulin);
	});
	
	i++;

	if(i == 140) {
		clearInterval(interval);	
	}
}, 15);*/