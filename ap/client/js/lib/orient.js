var orient = (function() {
	var callback = {};
	
	$(window).bind('orientationchange', function() {
		if (window.orientation) {
			callback.portrait && callback.portrait(); 
			return;
		}
		callback.landscape && callback.landscape(); 
	});

	return {
		landscape: function(cb) {
			callback.landscape = cb;
		},
		portrait: function(cb) {
			callback.portrait = cb;
		}
	}
})();