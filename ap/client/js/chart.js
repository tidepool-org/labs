var chart = function(width, hours) {
	var labelColor = '#666666';
	var redColor = '#FD6262';
	var hour = 1000 * 60 * 60;
	var hours = hours;
	var chart;
	var dimension = {
		height: 300,
		width: width
	};

	var position = {
	 	xLabel: 13,
		bg: {
			max: 19,
			x: 25,
			y: 135,
			xScale: dimension.width/(hour*hours),
			height: 90
		},
		hormone: {
			x: 25,
			paddingTop: 10,
			max: 20,
			min: -20,
			xScale: dimension.width/(hour*hours),
			height: 90
		}
	};
	
	position.bg.yScale = position.bg.height/position.bg.max;
	position.hormone.yScale = position.hormone.height/40;
	position.hormone.y = position.bg.y + position.bg.height + position.hormone.paddingTop;
	position.hormone.step = position.hormone.height/8;
	position.hormone.yCenter = (position.hormone.y - position.hormone.height/2);

	var holder = $(
			"<div id='holder'>"+
			"<div id='stats'>"+
        "<div id='bg'>"+
          "<h2>7.8</h2>"+
          "<div id='statLabel'>"+
            "<div id='unit'>mmol/L</div>"+
            "<div class='detail' id='rng'><div class='detail-label'>Rng:</div><div class='detail-value'>10</div><div class='clear'></div></div>"+
            "<div class='detail' id='max'><div class='detail-label'>Max:</div><div class='detail-value'>10</div><div class='clear'></div></div>"+
            "<div class='detail' id='avg'><div class='detail-label'>Avg:</div><div class='detail-value'>10</div><div class='clear'></div></div>"+
            "<div class='detail' id='min'><div class='detail-label'>Min:</div><div class='detail-value'>10</div><div class='clear'></div></div>"+            
            "<div></div>"+
          "</div>"+
        "</div></div>"+
        "<div id='chart'></div>"+
      "</div>"
  );
	$('#container').append(holder);

	var background = function(paper) {
		var a = {'stroke':'gainsboro'};
		//bg x line
		//paper.path(common.format("M{0},{1}L{2},{3}", position.bg.x, position.bg.y - position.bg.height,  position.bg.x, position.bg.y)).attr(a);
		//bg y line
		//paper.path(common.format("M{0},{1}L{2},{3}", position.bg.x, position.bg.y + 90,  dimension.width, position.bg.y + 90)).attr(a);
		
		//hormone x line
		//paper.path(common.format("M{0},{1}L{2},{3}", position.hormone.x, position.hormone.y - position.hormone.height,  position.hormone.x, position.hormone.y)).attr(a);
		//hormone y line
		paper.path(common.format("M{0},{1}L{2},{3}", position.hormone.x, position.hormone.yCenter,  dimension.width, position.hormone.yCenter)).attr(a);
	};
	
	var hormone = function() {
		var yRange = 	function(value) {
			if (value > position.hormone.max) {
				value = position.hormone.max;
			}

			return position.hormone.yCenter - (value * position.hormone.yScale);
		};
		
		var insulinYRange = function(value) {
			if (value > 600) {
				value = 600;
			}

			return position.hormone.yCenter - (value * position.hormone.height/1200);
		};

		var xRange = function(start, date) {
			start = start.getTime();

			if(date < start || date > date) {
				console.log('return');
				return;
			}

			return position.bg.x + 1 + ((date - start) * position.bg.xScale);
		};

		var draw = function(paper, start, date, value, index, editable) {
			var y = yRange(Math.abs(value));
			var x = xRange(start, date);
			
			if(editable) {
				var a = {fill: 'rgb(245, 245, 245)', 'stroke-width': '0px'};
				var bolusBlock = paper.rect(x, insulinYRange(600), 4, position.hormone.yCenter - insulinYRange(600)).attr(a);

				bolusBlock.mouseover(function() {
					this.attr('fill', 'rgb(205, 205, 205)');
				});
				bolusBlock.mouseout(function() {
					this.attr('fill', 'rgb(245, 245, 245)');
				});
				bolusBlock.toBack();

				var carbBlock = paper.rect(x, position.hormone.yCenter, 4, position.hormone.yCenter - yRange(position.hormone.max)).attr(a);				

				carbBlock.mouseover(function() {
					this.attr('fill', 'rgb(205, 205, 205)');
				});
				carbBlock.mouseout(function() {
					this.attr('fill', 'rgb(245, 245, 245)');
				});
			}

			if(value > 0) {
				var a = {'fill': 'blue', 'stroke-width': '0px' , 'id': date};
				y = insulinYRange(value);

				var r = paper.rect(x, y, 4, position.hormone.yCenter - y).attr(a);
				r.node.id = 'i' + date;
				r.value = value;
				r.index = index;

				if(editable) {
					bolusBlock.mousedown(function(r) {
						return function() {
							r.value += shifted ? 100 : 50;
							var y = insulinYRange(r.value);

							r.attr({
								'height': position.hormone.yCenter - y,
								'y': y
							});

							$(document).trigger('chart-edit', {
								type: 'u',
								value: r.value,
								index: r.index
							});
						}
					}(r));

					r.mousedown(function(r) {
						return function() {
							r.value -= 50;

							if(r.value < ss.u || shifted) {
								r.value = ss.u;
							}
							var y = insulinYRange(r.value);

							r.attr({
								'height': position.hormone.yCenter - y,
								'y': y
							});

							$(document).trigger('chart-edit', {
								type: 'u',
								value: r.value,
								index: r.index
							});
						}
					}(r));
				}

				r.toFront();
				$('#i' + date).tipsy({gravity: 's',fallback: Math.abs(value.toFixed(1)) + 'u'});

				/*if(value >= 20) {
					paper.text(x+1.5, y - 3, '+').attr(a);
				}*/		
			} else {
				var a = {'fill': 'purple', 'color': '#4F4FFF', 'stroke-width': '0px', 'value': value};

				var r = paper.rect(x, position.hormone.yCenter, 4, position.hormone.yCenter - y).attr(a);
				r.node.id = 'c' + date;
				r.value = value;
				r.index = index;

				if(editable) {
					carbBlock.mousedown(function(r) {
						return function() {
							r.value = -(Math.abs(r.value) + (shifted ? 3 : 1));
							var y = yRange(Math.abs(r.value));

							r.attr({
								'height': position.hormone.yCenter - y,
							});

							$(document).trigger('chart-edit', {
								type: 'd',
								value: Math.abs(r.value),
								index: r.index
							});
						}
					}(r));
					
					r.mousedown(function(r) {
						return function() {
							r.value += 1;

							var y = yRange(Math.abs(r.value));

							if(r.value >= ss.d || shifted) {
								r.value = ss.d;
							}

							var y = yRange(Math.abs(r.value));

							r.attr({
								'height': position.hormone.yCenter - y
							});

							$(document).trigger('chart-edit', {
								type: 'd',
								value: Math.abs(r.value),
								index: r.index
							});
						}
					}(r));
				}

				$('#c' + date).tipsy({fallback: Math.abs(value.toFixed(1) * 4) + 'g'});

				/*if(value <= -3) {
					paper.text(x+1.5, 2*position.hormone.yCenter - y + 3, '+').attr(a);
				}*/
			}
		};

		var range = function(paper) {
			return;
			var x = position.xLabel + 2;
			var ylabels = [-19, -14, -7, 0, 7, 14, 19];

			for(var i=0; i < ylabels.length; i++) {
				var y = yRange(Math.abs(ylabels[i]));

				var label;
				if(ylabels[i] > 0) {
					label = paper.text(x, y, Math.abs(ylabels[i]));	
				}
				if(ylabels[i] === 0) {
					label = paper.text(x, position.hormone.yCenter, Math.abs(ylabels[i]));	
				}
				if(ylabels[i] < 0) {
					label = paper.text(x-1, yRange(Math.abs(ylabels[2-i])) + position.hormone.step*5, Math.abs(ylabels[i]));	
				}

				label.attr({'fill': labelColor})
			}
		};

		return {
			draw: function(paper, start, data, editable) {
				for(var item in data) {
					draw(paper, start, data[item].ticks, data[item].value, data[item].index, editable); 	
				}
				
				range(paper);
			}
		}
	}();

	var bg = function() {
		var yRange = 	function(value) {
			if (value > position.bg.max) {
				value = position.bg.max;
			}

			return position.bg.y - value * position.bg.yScale;
		};

		var xRange = 	function(start, date) {

			if(date < start || date > date) {
				console.log('return', start, date);
				//return;
			}

			return position.bg.x + 1 + ((date - start) * position.bg.xScale);
		};

		var draw = function(paper, start, date, value, red) {
			var a = {};
			if(red) {
				a = {'fill': redColor, 'stroke': redColor , 'stroke-width': '2px'};
			} else {
				if(value > 10) {
					a = {'fill': 'rgb(248, 183, 63)', 'stroke': 'rgb(248, 183, 63)'}	
				}
				if(value < 10 && value >= 4) {
					a = {'fill': 'rgb(94, 170, 94)', 'stroke': 'rgb(94, 170, 94)'}	
				}
				if(value < 4) {
					a = {'fill': 'rgb(223, 69, 39)', 'stroke': 'rgb(223, 69, 39)'}	
				}
			}
			holder.find('#bg h2').css('color', a.fill);
			a['stroke-width'] = '0px';

			var c = paper.circle(xRange(start, date), yRange(value), 2).attr(a);		

			c.node.id = 'g' + date;

			$('#g' + date).tipsy({gravity: 's',fallback: Math.abs(value.toFixed(1))});
		};

		var bg = function(paper, start, data) {
			for(var item in data) {
				draw(paper, start, data[item].ticks, data[item].value, true);
			}
		};

		var cgm = function(paper, start, data) {
			for(var item in data) {
				draw(paper, start, data[item].ticks, data[item].value);
			}
		};
	
		var range = function(paper, start) {
			var hourStart = new Date(start);

			hourStart.setMinutes(hourStart.getMinutes() + (60 - hourStart.getMinutes()));		

			var offset = (1000 * 60 * (60 - hourStart.getMinutes())) * position.bg.xScale;
			var a = {'stroke':'gainsboro'};
			
			for(var i=0; i < hours; i++) {
				var date = new Date(start.getTime() + hour*i + (offset*60*1000));
				
				//paper.text(xRange(start.getTime(), date.getTime()),100, 'hello world');
				paper.text(xRange(start.getTime(), date.getTime()) - 6, position.bg.y + 108 + position.hormone.paddingTop, moment(date).format("hh:00")).rotate(300).attr({'fill': labelColor});

			//	paper.path(common.format("M{0},{1}L{2},{3}", xRange(start, date), position.bg.y + 90 + position.hormone.paddingTop,  xRange(start, date), position.bg.y - position.bg.height)).attr({'stroke':'lightgray'}).toFront();
			}
			
			var xlabels = [4, 7, 10, 15];

			for(var i=0; i < xlabels.length; i++) {
				paper.text(position.xLabel + 5, yRange(xlabels[i]), xlabels[i]).attr({'fill': labelColor});
			}

			paper.rect(position.bg.x + 1, yRange(7), dimension.width - position.bg.x, yRange(4) - yRange(7)).attr({fill: "rgb(252, 252, 252)", "stroke-width": 0}).toBack();
			paper.rect(position.bg.x + 1, yRange(10), dimension.width - position.bg.x, yRange(7) - yRange(10)).attr({fill: "rgb(250, 250, 250)", "stroke-width": 0}).toBack();
		};

		return {
			draw: function(paper, start, data) {
				range(chart, start);
				bg(chart, start, _.where(data, {type: 'bg'}));
				cgm(chart, start, _.where(data, {type: 'cgm'}));		
			},
			range: range,
			cgm: cgm,
			bg: bg,
			xRange: xRange,
			yRange: yRange
		}
	}();

	var draw = function(start, data, editable) {
		holder.find('svg').remove();
		
		chart = Raphael(holder.find('#chart')[0], dimension.width, dimension.height);

		background(chart);

		bg.draw(chart, start, _.where(data, {group: 'sugar'}));

		hormone.draw(chart, start, _.where(data, {group: 'hormone'}), editable);
		
		dataSetStart2 = data;
		var cgmData = _.where(data, {type: 'cgm'});

		var cgmSum = _.reduce(cgmData, function(item, num){ return item + num.value; }, 0);
		var range = _.countBy(cgmData, function(num) {
			if(num.value > 10) {
				return 'high';
			}
			if(num.value <= 10 & num.value >= 4) {
				return 'good';
			}
			if(num.value < 4) {
				return 'low';
			}
		});

		holder.find('#bg h2').text((cgmData[cgmData.length-1].value).toFixed(1));
		holder.find('#rng .detail-value').text(((range.good * 100)/cgmData.length).toFixed(0) + '%');
		holder.find('#max .detail-value').text(_.max(cgmData, function(item){ return item.value }).value.toFixed(1));
		holder.find('#min .detail-value').text(_.min(cgmData, function(item){ return item.value }).value.toFixed(1));
		holder.find('#avg .detail-value').text((cgmSum/cgmData.length).toFixed(1));
		/*
		var insulinData = _.where(data, {type: 'insulin'});
		//var insulinSum = _.reduce(insulinData, function(item, num){ return item + Math.abs(num.value); }, 0);
		var insulinVal = insulinData[insulinData.length-1].value;//(insulinSum * (24 / 7))/80;

		$('#insulin h2').text(insulinVal.toFixed(1));

		var glucagonData = _.where(data, {type: 'glucagon'});
		//var glucagonSum = _.reduce(glucagonData, function(item, num){ return item + Math.abs(num.value); }, 0);
		var glucagonVal = Math.abs(glucagonData[glucagonData.length-1].value);//(glucagonSum * (24 / 7));

		$('#glucagon h2').text(glucagonVal.toFixed(1));*/
	};

	return {
		draw: draw,
		clear: function() {
			if(chart) {
				chart.clear();	
			}
		}
	}
};