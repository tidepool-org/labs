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
var express = require('express');
var app = express();
var port = process.env.PORT || 8083;
var less = require('less-middleware');
var sim = require('./../simulator/index.js');

//app.use(express.logger());

app.get('/data', function(request, response) {
	sim.generate(request.query.readings, JSON.parse(request.query.bolus) || {}, function(err, data) {
		if(err) {
			response.status(500).send('error running simulator');
			return;
		}

		response.json(data);
	});
});

app.use(less({ src: __dirname + '/client', compress: true }));
app.use(express.static(__dirname + '/client'));

app.listen(port);
console.log('Listening on port ' + port);