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
var onFilterUpdate = function() {
	console.log('onFilterUpdate', arguments);
};

<<<<<<< HEAD
var singleRange = function(criteria, options) {
	$('.' + criteria).find('.search_panel_sections_filter_criteria_singleRange_range').ionRangeSlider(options);
};

var carbSingleRange = function(criteria, options) {
	$('.' + criteria).find('.search_panel_sections_filter_criteria_singleRange_range_carb').ionRangeSlider(options);
};

=======
>>>>>>> 9e6c36d8a47f316f79de43e6153351711b45d492
var range = function(criteria, settings, labels) {
	settings = _.defaults(settings || {}, {
		start: 0,
		end: 100,
		width: 350,
		prefix: '',
		postFix: '',
		maxPostfix: '',
		step: 5
	});

	labels = labels || [
		{start: 10, end: 20, title: 'Low'},
		{start: 20, end: 50, title: 'Middle'},
		{start: 50, end: 100, title: 'High'}
	];

	var widthScale = d3.scale.linear()
		.domain([settings.start, settings.end])
		.range([0, settings.width]);

	if(settings.values) {
		widthScale = d3.scale.linear()
		.domain([0, settings.values.length - 1])
		.range([0, settings.width]);		
	}

	var template = _.template("<div><ul class='search_panel_sections_filter_criteria_ranges_labels'>"+
															"<% _.each(labels, function(label) { %> <li style='width:<%= label.width %>px'><div id='<%= label.id %>'><%= label.title %></div></li> <% }); %>"+
														"</ul><div class='clear'></div>" +
														"<div class='range_holder'><div class='search_panel_sections_filter_criteria_ranges_range'></div></div></div>");

	for (var i in labels) {
		labels[i].width = widthScale(settings.start + labels[i].end - labels[i].start);
		labels[i].id = criteria + '_label_' + i;
	}

	var $html = $(template({labels: labels}));

	for (var i in labels) {
		var label = labels[i];

		var click = function(label) {
			return function() {
				$('.' + criteria).find('.search_panel_sections_filter_criteria_ranges_range').ionRangeSlider('update', {
					from: label.start,
					to: label.end
				});	
			}
		}(label);
		$html.find('#' + label.id).click(click);
	}

	$html.find('.search_panel_sections_filter_criteria_ranges_range').ionRangeSlider({
    min: settings.start,
    max: settings.end,
    type: 'double',
    step: settings.step,
    hasGrid: false,
    values: settings.values,
    prefix: settings.prefix,
    postfix: settings.postfix,
    maxPostfix: settings.maxPostfix,
    onChange: function(obj) {
    	//onFilterUpdate(criteria, obj);
    }
	});

	setTimeout(function() {
		var start = settings.start;

		if(settings.values) {
			start = 0; 
		}

		$html.find('.search_panel_sections_filter_criteria_ranges_range').ionRangeSlider('update', {
			from: start,
			to: start
		});
	}, 500);

	$('.' + criteria).find('.search_panel_sections_filter_criteria_ranges').html($html);
};