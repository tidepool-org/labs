app.stats = function(readings) {
	var sum = function(arr) {
		return _.reduce(arr, function(memo, num) { return memo + num; }, 0);
	}
	var percentify = function(val) {
		return Math.round(val*100);
	};

	var values = _.pluck(readings.cgm, 'value');

	var ranges = _.groupBy(values, function(val) {
		if(val > 180) {
			return 'high';
		}
		if(val < 80) {
			return 'low';
		}
		return 'normal';
	});

	return {
		average: Math.round(sum(values)/values.length),
		inRange: ranges.normal ? percentify(ranges.normal.length/values.length) : 0,
		inHyper: ranges.high ? percentify(ranges.high.length/values.length) : 0,
		inHypo: ranges.low ? percentify(ranges.low.length/values.length) : 0
	}
};