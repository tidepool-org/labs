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

var _ = require('underscore');

var levels = require('./lib/levels.js');
var simulator = require('./simulator/simulator')();
var bolus = require('./lib/bolus.js')(simulator.ss);

var run = function(days, options, callback) {
	if(!callback) {
		callback = options;
		options = {};
	}

	options = _.defaults(options, {
		levels: levels
	});

	var data = bolus.randomDayGenerator(levels)(days);

	simulator.single(simulator.ss.x, _.pluck(data, 'u'), _.pluck(data, 'd'), function(error, x, bg, insulin) {
		callback(error, {
			x: x,
			carbs: _.pluck(data, 'd'),
			bg: bg.map(function(d) { return d*18}),
			insulin: insulin
		});
	});
};

var generate = function(readings, boluses, callback) {
	var data = bolus.steadyState(readings);

	for(var i in boluses) {
		data[parseInt(i)] = boluses[i];
	}

	simulator.single(simulator.ss.x, _.pluck(data, 'u'), _.pluck(data, 'd'), function(error, x, bg, insulin) {
		callback(error, {
			x: x,
			carbs: _.pluck(data, 'd'),
			bolus: _.pluck(data, 'u'),
			bg: bg.map(function(d) { return d*18}),
			iob: insulin
		});
	});
};

module.exports = {
	run: run,
	generate: generate
};


var days = 30;
run(days, function(err, data) {
	console.log(data);
});
