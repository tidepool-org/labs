var request = function() {
	return {
		get : function(url, callback) {
			$.getJSON(url, function(data) {
				callback(null, data)
			}).error(function(response, status, error) {
				callback(common.format('error: {0} \n response: {1}', response.responseText, status));
    	});
		}
	}
}();