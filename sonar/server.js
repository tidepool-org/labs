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
var express = require('express'),
	app = express(),
	less = require('less-middleware'),
	fs = require('fs'),
  es = require('event-stream');
var port = process.env.PORT || 8081;
var jf = require('jsonfile')
var host = 'https://staging-api.tidepool.io/';
var usr = {username:'howard@lookfamily.org', password:'2seed8a'};
var client = require('./lib/platform-client.js')(host);
var common = require('common');

app.get('/login', function(request, response) {

	client.login(request.query, function(err, data) {
		if(err) {
				response.status(500).send('error logging in: ' + err);
				return;
			}

			console.log(data);

			client.getUsersTeam(data.userid, data.token, function() {
				console.log(arguments);
				response.json(data);
			})
	   
	});
});

app.get('/teams', function(request, response) {
	var results = {};
	var members = [];

	common.step([
			function(next) {
				console.log('get /teams');
				client.findProfile(request.query.userid, request.query.token, next);
			},
			function(data, next) {
				results.user = data;
				results.user.userid = request.query.userid;

				console.log('found profile', data);
				client.getUsersPatients(request.query.userid, request.query.token, next);		
			},
			function(data, next) {
				console.log('found patients', data);
				if(!data.members.length) {
					response.json(results);		
				}

				members = data.members;

				for(var i in data.members) {
					console.log('member', data.members[i]);
					client.findProfile(data.members[i], request.query.token, next.parallel());
				}
			},
			function(data) {
				console.log('found members', data);
				results.members = data;
					
				for(var i in data) {
					var d = data[i];

					results.members[i].userid = members[i];
				}

				response.json(results);
			}
		], function(err) {
			response.status(500).send('error: ', JSON.stringify(err));
			return;
	});
});

app.get('/userData/:userId', function(request, response) {
	var userId = request.params.userId;

	client.userData(request.params.userId, request.query.token, function(err, readings) {
		if(err) {
			response.status(500).send('error', JSON.stringify(err));
			return;
		}

	  response.json(readings);
	})
});

app.get('/blipdata', function(request, response) {
	client.login(usr, function(err, loggedUser) {
		if(err) {
			response.status(500).send('error login ' + err);
			return;
		}

		client.getUsersPatients(loggedUser.userid, loggedUser.token, function(err, userPatients) {
			if(err) {
				response.status(500).send('error getUsersPatients ' + err);
				return;
			}

			client.findProfile(userPatients.members[0], loggedUser.token, function(err, userProfile) {
				if(err) {
					response.status(500).send('error findProfile ' + err);
					return;
				}

				client.userData(userPatients.members[0], loggedUser.token, function(err, data) {
					if(err) {
						response.status(500).send('error userData ' + err);
						return;
					}

					response.json(data);
				});
			});
		});
	});
});

app.use(less({ src: __dirname + '/client'}));
app.use(express.static(__dirname + '/client'));

app.listen(port);
console.log('Listening on port ' + port);