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
var express = require('express');
var app = express();
var port = process.env.PORT || 8082;
var less = require('less-middleware');
var sim = require('./../simulator/index.js');

//app.use(express.logger());

app.get('/data', function(request, response) {
	sim.run(14, function(err, data) {
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