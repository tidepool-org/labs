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
var host = 'https://staging-api.tidepool.io/';
var usr = {username:'user@somefamily.org', password:'XXXXXXX'};
var client = require('./lib/platform-client')(host);

client.login(usr, function(err, loggedUser) {
	if(err) {
		console.log('error login', err);
		return;
	}

	client.getUsersPatients(loggedUser.userid, loggedUser.token, function(err, userPatients) {
		if(err) {
			console.log('error getUsersPatients', err);
			return;
		}

		client.findProfile(userPatients.members[0], loggedUser.token, function(err, userProfile) {
			if(err) {
				console.log('error findProfile', err);
				return;
			}

			client.userData(userPatients.members[0], loggedUser.token, function(err, data) {
				if(err) {
					console.log('error userData', err);
					return;
				}

				console.log('data', data);
			});
		});
	});
});
