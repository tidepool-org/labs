var pattern = function() {
	var store = {};

	var get = function(x, d, u) {
		var key = x.toString()+'-'+d.toString()+'-'+u.toString();
		
		if(store[key]) {
			return store[key];
		}

		var query = 'u=' + u.toString() + '&d=' + d.toString() + '&x=' + x.toString();
		
		$.getJSON('/simulator?' + query, function(step) {
			store[key] = step;
			
			return store[key];
		};
	};
	
	return {
		get: get
	}
};
