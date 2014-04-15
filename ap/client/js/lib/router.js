var router = function() {
	var routes = [];

	$(window).bind('hashchange', function(e) {
		var hash = window.location.hash;

		for(var i = 0; i < routes.length; i++) {
			var route = routes[i];

			if(route.route == hash) {
				route.callback();
				break;
			}
		}
	});
	var add = function(route, callback) {
		routes.push({
			route: route,
			callback: callback
		});
	};

	return {
		add : add
	}
}();