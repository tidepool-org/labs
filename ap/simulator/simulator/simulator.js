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
var exec = require('child_process').exec;
var _ = require('underscore');

var simulator = function() {
	var step = function(x0, u, d, callback) {
		var options = [
			'-u', u.toString().replace(/,/g,' '),
			'-d', d.toString().replace(/,/g,' '),
			'-x'
		];
		
		options = options.concat(x0);

		var cmd = options.reduce(function(previous, current) {
			return previous + ' ' + current;
		});

		exec(__dirname + '/TestHovorkaModelSimulationSingelStep ' + cmd, function(error, stdout, stderr) {
			if(error || stderr) {
				callback(error || stderr);
				return;
			}
			
			var stdout = stdout.split('\n');
			var glucose = [];
			var insulin = [];

			for(var i=0; i < u.length; i++) {
				glucose.push(parseFloat(stdout[i+1]))
				insulin.push(parseFloat(stdout[i+2+u.length]));
			}
						
			var x1 = stdout.splice(u.length*2+3).splice(0,10).map(function(x) {return parseFloat(x);});

			callback(error, x1, glucose, insulin);
		});
	};

	return {
		single: step,
		ss: {
			x: [0.0, 0.0, 367.4, 367.4, 55.9483, 23.3399, 5.7626, 0.0295, 0.0047, 0.2997],
			u: 6.68,
			d: 0.0
		} 
	};
};

module.exports = simulator;