var queryString = function() {
	var parseQueryString = function(queryString) {
		if (!queryString || !queryString.length)	{
			return {};
		}

	  queryString = queryString.substring(1);
	  var params = {}, queries, temp, i, l;

	  // Split into key/value pairs
	  queries = queryString.split("&");

	  // Convert the array of strings into an object
	  for ( i = 0, l = queries.length; i < l; i++ ) {
	      temp = queries[i].split('=');
	      params[temp[0]] = temp[1];
	  }

	  return params || {};
	};

	return parseQueryString(window.location.search);
};
