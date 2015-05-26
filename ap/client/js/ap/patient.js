var globalData = [];
app.patient = (function() {
	return {
		init: function(callback) {
			var self = this;

			this.$listItem = $('.patient-list');
			this.hover.$item = $('.patient-detail-hover');

			this.hover.$item.click(this.hover.click);

			$.ajax({url: '/template/small.html'}).done(function(content) {
      	self.template.small = _.template(content);

      	$.ajax({url: '/template/big.html'}).done(function(content) {
	      	self.template.big = _.template(content);

	      	$.ajax({url: '/template/clientTip.html'}).done(function(content) {
		      	self.template.tip = _.template(content);
		      	callback();
			    });
		    });
	    });
		},
		ticks: 0,
		state: {
			glucagon: {
				value: app.qs.glucagon,
				hide: function() {
					$('.overlay-stats-glucagon').hide();
					$('.overlay-patient-header-glucagon').hide();
				},
				show: function () {
					$('.overlay-stats-glucagon').show();
					$('.overlay-patient-header-glucagon').show();
				},
				toogle: function() {
					app.patient.state.glucagon.value = !app.patient.state.glucagon.value;
					app.patient.updateStatusTips();

					// udate view items
					for(var i in app.$patients) {
						var $patient = app.$patients[i];
						var $gob = $patient.$item.find('.patient-content-hormone-glucagon');
						var $iob = $patient.$item.find('.patient-content-hormone-insulin');
						var $overlayTobBar = $patient.$overlaySection;

						if(app.patient.state.glucagon.value) {
							$gob.show();
							$iob.css('padding-top','0');
							app.patient.state.glucagon.show();
						} else {
							$gob.hide();
							$iob.css('padding-top','10px');
							app.patient.state.glucagon.hide();
						}
					}
				}
			},
			carb: {
				keys: ['hidden', 'announcement', 'full'],
				value: app.qs.carbs,
				toogle: function() {
					app.patient.state.carb.value++;

					if (app.patient.state.carb.value > app.patient.state.carb.keys.length - 1) {
						app.patient.state.carb.value = 0;
					}
				}
			}
		},
		template: {},
		hover: {
			hide: function() {
				app.patient.hover.$item.hide();
			},
			isVisible: function() {
				return app.patient.hover.$item.is(':visible');
			}
		},
		hours: {
			wide: 24,
			small: 3
		},
		makeSortable: function() {
			$('.patient-list').sortable({
				placeholder: "ui-state-highlight"
			});
  		$('.patient-list').disableSelection();
		},
		toggleImage: function($img, turnBlack) {
			var src = $img.attr('src');
			if(!src) {
				return;
			}

			if (turnBlack) {
				src = src.replace('profiles','problack');
			} else {
				src = src.replace('problack','profiles');
			}

			$img.attr('src', src);
		},
		styleValue: function(value, $overlaySection, $item, patient) {
			this.clearStyle($overlaySection, $item);

			var $img = $item.find('.patient-content-image').find('img');

			if(patient.alert || patient.alertIcon) {
				$item.css('background-color', '#4D4D4D');
			} else {
				$item.css('background-color', '#EAEAEA');
			}
			if (value < 80) {
				$overlaySection.find('.overlay-stats-bg-value').addClass('color-range-low-color');
				$item.find('.patient-content-bg-value').addClass('color-range-low-color');
				app.patient.toggleImage($img, false);
				$item.css('opacity',1);
				return;
			}
			else if (value > 180) {
				$overlaySection.find('.overlay-stats-bg-value').addClass('color-range-high-color');
				$item.find('.patient-content-bg-value').addClass('color-range-high-color');
				app.patient.toggleImage($img, false);
				$item.css('opacity',1);
			}
			else {
				$overlaySection.find('.overlay-stats-bg-value').addClass('color-range-normal-color');
				$item.find('.patient-content-bg-value').addClass('color-range-normal-color');

				if (patient.alertIcon) {
					app.patient.toggleImage($img, false);
				} else {
					app.patient.toggleImage($img, !patient.alert);
				}
				$item.css('opacity',0.9);
			}
		},
		clearStyle: function($overlaySection, $item) {
			var $overlayBG = $overlaySection.find('.overlay-stats-bg');
			var $itemBG = $item.find('.patient-content-bg-value');

			$itemBG.removeClass('color-range-low-color');
			$overlayBG.removeClass('color-range-low-color');
			$itemBG.removeClass('color-range-high-color');
			$overlayBG.removeClass('color-range-high-color');
			$itemBG.removeClass('color-range-normal-color');
			$overlayBG.removeClass('color-range-normal-color');
		},
		rotate: function($item, currentValue, previousValue) {
			var singleArrow = '/img/icon-arrow.png'
				, doubleArrow = '/img/icon-double-arrow.png'
				, deltaValue = currentValue - previousValue
				, srcArrow = ''
				, dirrection = ''
				, angle = 0
				, $arrowHolder = $item;

			//doubleDown

			var levels = {
				noChange: 2,
				slowChange: 5,
				fastChange: 10
			};

			if(deltaValue > -levels.fastChange && deltaValue < -levels.slowChange) {
				//singleDown
				dirrection = 'falling';
				srcArrow = singleArrow;
				angle = 180;
			} else if(deltaValue >= -levels.slowChange && deltaValue < -levels.noChange) {
				//straight
				dirrection = 'slow falling';
				srcArrow = singleArrow;
				angle = 135;
			} else if(deltaValue >= -levels.noChange && deltaValue <= levels.noChange) {
				//straight
				dirrection = 'constant';
				srcArrow = singleArrow;
				angle = 90;
			} else if(deltaValue > levels.noChange && deltaValue <= levels.slowChange) {
				//straight
				dirrection = 'slow rising';
				srcArrow = singleArrow;
				angle = 45;
			}
			 else if(deltaValue > levels.slowChange && deltaValue <= levels.fastChange) {
				//singleUp
				dirrection = 'rising';
				srcArrow = singleArrow;
				angle = 0;
			} else if(deltaValue > levels.fastChange) {
				//doubleUp
				dirrection = 'rising rapidly';
				srcArrow = doubleArrow;
				angle = 0;
			} else {
				//doubleDown
				dirrection = 'falling rapidly';
				srcArrow = doubleArrow;
				angle = 180;
			}

			$arrowHolder.attr('src', srcArrow);
			$arrowHolder.rotate(angle);
		},
		updateAllPatients: function() {
			for(var i in app.$patients) {
				app.$patients[i] = app.patient.update(app.$patients[i], true);
			}
		},
		update: function(patient, stopTick) {
			if(!patient) {
				return;
			}

			patient.readings = patient.singleHormoneData.readings;
			patient.correctedMeals = patient.singleHormoneData.correctionMeals;

			if(app.patient.state.glucagon.value) {
				patient.readings = patient.dualHormoneData.readings;
				patient.correctedMeals = patient.dualHormoneData.correctionMeals;
			};

			if (!stopTick)
				patient.readingIndex++;

			var pixelWidth = 12*app.patient.hours.wide;

			if(patient.readingIndex > patient.readings.cgm.length - pixelWidth) {
				patient.readingIndex = 0;
			}

			var _readings = app.data.cutReadings(patient.readings, patient.readingIndex, pixelWidth);

			if(typeof _readings.cgm[_readings.cgm.length-1] == 'undefined') {
				return;
			}

			var currentValue = parseInt(_readings.cgm[_readings.cgm.length-1].value);
			var previousValue = parseInt(_readings.cgm[_readings.cgm.length-2].value);

			patient.profile.value = currentValue;

			var sumInsulin = Math.round(_.reduce(patient.readings.bolus, function(memo, bolus){ return memo + bolus.value; }, 0)/200);

			patient.$item.find('.patient-content-hormone-insulin').find('.value').html(sumInsulin);
			patient.$overlaySection.find('.overlay-stats-hormone-insulin').html(sumInsulin);


			patient.$item.find('.patient-graph-small > svg').remove();

			var graphData = {
				cgm: _readings.cgm,
				carb: _readings.carb,
				bolus: _readings.bolus,
				correctedMeals: patient.correctedMeals
			};


			globalData.push(graphData);

			if(app.liveChartList) {
				patient.ticks = app.patient.updateListViewGraph(patient.$item.find('.patient-graph-small')[0], graphData, patient.ticks);
			}

			if(patient.shown) {
				if(app.mobile) {
					$('.portrait-chart > svg').remove();
					patient.ticks = app.patient.updateMobilePortraitGraph($('.portrait-chart')[0], graphData, patient.ticks);
				} else {
					patient.$overlaySection.find('.overlay-chart > svg').remove();
					patient.ticks = app.patient.updateOverlayGraph(patient.$overlaySection.find('.overlay-chart')[0], graphData, patient.ticks);
				}

				var stats = app.stats(_readings);

				app.overlay.updateStats(patient, stats);
			}


			//graph(patient.$overlaySection.find('.overlay-chart')[0], _readings.cgm, _readings.carb, _readings.bolus, patient.correctedMeals, {width: 722, height: 450, hours: app.patient.hours.wide, xPaddingLeft: 50, ticks: app.patient.ticks});
			//patient.$item.find('.patient-graph-big > svg').remove();

			//640px; height: 300px;
			//graph(patient.$item.find('.patient-graph-big')[0], _readings.cgm, _readings.carb, _readings.bolus, {width: 590, height: 200, hours: app.patient.hours.wide});

			patient.$item.find('.patient-content-bg-value').html(patient.profile.value);
			patient.$overlaySection.find('.overlay-stats-bg-value').html(patient.profile.value);

			app.patient.styleValue(patient.profile.value, patient.$overlaySection, patient.$item, patient);

			app.patient.rotate(patient.$item.find('.patient-content-bg-trend > img'), currentValue, previousValue);

			app.patient.rotate(patient.$overlaySection.find('.overlay-stats-bg-trend > img'), currentValue, previousValue);

			return patient;
		},
		updateStatusTips: function(keepState) {
			for(var i in app.$patients) {
				var $patient = app.$patients[i];

				if(!keepState) {
					app.$patients[i].tipState = app.patient.generateRandomStatusTip();
				}

				app.$patients[i].alert = app.patient.setStatusTip($patient.$item, app.$patients[i].tipState);
			}
		},
		statusBar: {
			randomSignal: function() {
				var index = Math.random() > 0.98	 ? 0:1;

				return { index: index, value: index == 0 ? '/img/signal/signal-off.png' : '/img/signal/signal-on.png', alert: index == 0};
			},
			randomPumpLevel: function() {
				var index = 1 + Math.ceil(Math.random() * 7);

				if(Math.random() > 0.98) {
					index = 1;
				}

				return {index: index, value: '/img/pump/pump' + index + '.png', alert: index == 1};
			},
			randomBatteryLevel: function() {
				var index = 2 + Math.ceil(Math.random() * 7);

				if(Math.random() > 0.98) {
					index = Math.ceil(Math.random() * 2);
				}

				return {index: index, value: '/img/bat/bat' + index + '.png' , alert: index < 3};
			}
		},
		generateRandomStatusTip: function() {
			var signals = function() {
				var levels = [
					app.patient.statusBar.randomSignal(),
					app.patient.statusBar.randomSignal(),
					app.patient.statusBar.randomSignal()
				];

				if(app.patient.state.glucagon.value) {
					levels.push(app.patient.statusBar.randomSignal());
				}

				var items = {
					insulin: {
						img: levels[0].value,
						name: 'Insulin Pump'
					},
					controller: {
						img: levels[2].value,
						name: 'Controller'
					},
					cgm: {
						img: levels[1].value,
						name: 'CGM Reciever'
					}
				};

				if(app.patient.state.glucagon.value) {
					items.glucagon = {
						img: levels[3].value,
						name: 'Glucagon pump'
					};
				}

				return {
					items: items,
					first: _.sortBy(levels, function(v) {return v.index})[0]
				};
			};
			var hormones = function() {
				var levels = [
					app.patient.statusBar.randomPumpLevel(),
					app.patient.statusBar.randomPumpLevel()
				];
				var first = levels[0];
				var items = {
					insulin: {
						img: levels[0].value,
						name: 'Insulin Pump'
					}
				};

				if(app.patient.state.glucagon.value) {
					first = _.sortBy(levels,function(v) {return v.index})[0];
					items.glucagon = {
						img: levels[1].value,
						name: 'Glucagon pump'
					};
				}

				return {
					items: items,
					first: first
				};
			};
			var batteries = function() {
				var levels = [
					app.patient.statusBar.randomBatteryLevel(),
					app.patient.statusBar.randomBatteryLevel(),
					app.patient.statusBar.randomBatteryLevel()
				];

				if(app.patient.state.glucagon.value) {
					levels.push(app.patient.statusBar.randomBatteryLevel());
				}

				var items = {
					insulin: {
						img: levels[0].value,
						name: 'Insulin Pump'
					},
					cgm: {
						img: levels[1].value,
						name: 'CGM Reciever'
					},
					controller: {
						img: levels[2].value,
						name: 'Controller'
					}
				};

				if(app.patient.state.glucagon.value) {
					items.glucagon = {
						img: levels[3].value,
						name: 'Glucagon pump'
					};
				}

				return {
					items: items,
					first: _.sortBy(levels, function(v) {return v.index})[0]
				};
			};

			return {
				signal: signals(),
				hormone: hormones(),
				battery: batteries()
			};
		},
		setStatusTip: function($item, state) {
			var updateOverlayStats = function(imageClass, images) {
				var overlayClasses = {
					insulin: '.overlay-patient-header-insulin',
					glucagon: '.overlay-patient-header-glucagon',
					cgm: '.overlay-patient-header-cgm',
					controller: '.overlay-patient-header-controller'
				};

				for(var i in images) {
					var str = overlayClasses[i] + ' > ' + imageClass + ' img';
					var $el = $(str);
					//console.log($el.length, i, images[i], state);
					//console.log(str, i, images, images[i]);

					if($el.length) {
						$el.attr('src',images[i]);
					}
				}
			};

			var signals = function(state) {
				var $icon = $item.find('.patient-header-status-icon-signal');

				// set overlay signals
				updateOverlayStats('.overlay-patient-header-signal', {
					insulin: state.items.insulin.img,
					glucagon: !!state.items.glucagon ? state.items.glucagon.img : '',
					cgm: state.items.cgm.img,
					controller: state.items.controller.img
				});

				var html = app.patient.template.tip({items: state.items});

				$icon.html('<img src="' + state.first.value +'">');
				$icon.attr('title', html);
				$icon.tipsy({gravity: 's', html: true, opacity: 1, left: 10});

				return state.first.alert;
			};
			var hormones = function(state) {
				var $icon = $item.find('.patient-header-status-icon-pump');
				var html = app.patient.template.tip({ items: state.items});

				updateOverlayStats('.overlay-patient-header-pump', {
					insulin: state.items.insulin.img,
					glucagon: !!state.items.glucagon ? state.items.glucagon.img : ''
				});

				$icon.html('<img src="' + state.first.value +'">');
				$icon.attr('title', html);
				$icon.tipsy({gravity: 's',html: true,opacity: 1,left: 10});

				return state.first.alert;
			};
			var batteries = function(state) {
				var $icon = $item.find('.patient-header-status-icon-battery');

				updateOverlayStats('.overlay-patient-header-battery', {
					insulin: state.items.insulin.img,
					glucagon: !!state.items.glucagon ? state.items.glucagon.img : '',
					cgm: state.items.cgm.img,
					controller: state.items.controller.img
				});

				var html = app.patient.template.tip({ items: state.items});

				$icon.html('<img src="' + state.first.value +'">');
				$icon.attr('title', html);
				$icon.tipsy({gravity: 's', html: true, opacity: 1, left: 10});

				return state.first.alert;
			};

			var a1 = signals(state.signal);
			var a2 = hormones(state.hormone);
			var a3 = batteries(state.battery);

			if (app.patient.state.glucagon.value) {
				app.patient.state.glucagon.show();
			} else {
				app.patient.state.glucagon.hide();
			}

			if (a1 || a2 || a3) {
				return true;
			}
			return false;
		},
		updateListViewGraph: function($item, data, ticks) {
			if(app.mobile) {
				return;
			}

			var options = {width: 591, height: 210, hours: app.patient.hours.wide, size:'small', xPaddingLeft: 30,labelPadding:0, ticks: ticks, background: '#ECECEC'};

			console.log('options',options);

			return graph($item, data.cgm, data.carb, data.bolus, data.correctedMeals, options);
		},
		updateMobilePortraitGraph: function($overlay, data, ticks) {
			var options = {width: 460, height: 280, hours: app.patient.hours.wide, xPaddingLeft: 30, labelPadding:0, ticks: ticks};

			return graph($overlay, data.cgm, data.carb, data.bolus, data.correctedMeals, options);
		},
		updateOverlayGraph: function($overlay, data, ticks) {
			if(app.mobile) {
				return;
			}
			var options = {width: 722, height: 450, hours: app.patient.hours.wide, xPaddingLeft: 50, labelPadding:20, ticks: ticks};
			//var options = {width: 590, height: 200, hours: app.patient.hours.wide, xPaddingLeft: 50, ticks: ticks};
			//var options = {width: 590, height: 200, hours: app.patient.hours.wide, xPaddingLeft: 50, ticks: ticks, size: 'small'};

			return graph($overlay, data.cgm, data.carb, data.bolus, data.correctedMeals, options);
		},
		add: function(profile, callback, correctForLows, meals) {
			var self = this;
			var addReading = function(err, singleHormoneData, dualHormoneData) {
				var readings = singleHormoneData.readings;
				var correctedMeals = singleHormoneData.correctionMeals;

				if(app.patient.state.glucagon.value) {
					readings = dualHormoneData.readings;
					correctedMeals = dualHormoneData.correctionMeals;
				};

				if(!correctedMeals) {
					correctedMeals = [];
				}

				var _readings = app.data.cutReadings(readings, 0, 12* app.patient.hours.wide);
				var currentValue = parseInt(_readings.cgm[_readings.cgm.length-1].value);
				var previousValue = parseInt(_readings.cgm[_readings.cgm.length-2].value);

				profile.value = currentValue;
				profile.sumInsulin = Math.round(_.reduce(_readings.bolus, function(memo, bolus){ return memo + bolus.value; }, 0)/200);
				profile.sumCarbs = Math.round(_.reduce(_readings.carb, function(memo, carb){ return memo + carb.value; }, 0));

				profile.hormone = {
					insulin: profile.sumInsulin,
					glucagon: profile.sumCarbs
				};

				var $item = $(app.patient.template.small(profile));
				var $overlaySection = $(app.patient.template.big(profile));

				//graph($overlaySection.find('.overlay-chart')[0], _readings.cgm, _readings.carb, _readings.bolus, correctedMeals, {width: 722, height: 458, hours: app.patient.hours.wide, xPaddingLeft: 50});

				var graphData = {
					cgm: _readings.cgm,
					carb: _readings.carb,
					bolus: _readings.bolus,
					correctedMeals: correctedMeals
				};

				app.patient.updateListViewGraph($item.find('.patient-graph-small')[0], graphData, 0);
				app.patient.updateOverlayGraph($overlaySection.find('.overlay-chart')[0], graphData, 0);

				app.patient.styleValue(profile.value, $overlaySection, $item, {});
				app.patient.rotate($item.find('.patient-content-bg-trend > img'), currentValue, previousValue);

				var state = app.patient.generateRandomStatusTip();
				app.patient.setStatusTip($item, state);

				callback(null, {
					profile: profile,
					readings: readings,
					tipState: state,
					correctedMeals: correctedMeals,
					singleHormoneData: singleHormoneData,
					dualHormoneData: dualHormoneData,
					ticks: 0,
					readingIndex: 0,
					$item: $item,
					$overlaySection: $overlaySection
				});
			};

			addReading(null, dualHormoneReadings[profile.id].singleHormoneData,dualHormoneReadings[profile.id].dualHormoneData);

			//app.data.patient.generateSingleAndDualHormoneReadings(meals, function(error, data) { addReading(error, data.singleHormoneData, data.dualHormoneData); });

			/*if(correctForLows == 2) {
				app.data.patient.getReadings(meals, function(err, readings) {
					var correctedMeals = app.data.patient.avoidHighs(readings, meals);

					app.data.patient.getReadings(correctedMeals.meals, function(err, readings2) {
						var secondCorrectedMeals = app.data.patient.cleanCorrectionMealIfBgIsGood(readings2, correctedMeals.meals);

						//console.log('secondCorrectedMeals',secondCorrectedMeals);
						app.data.patient.getReadings(secondCorrectedMeals.meals, function(error, readings3) {
							//addReading(error, readings3, secondCorrectedMeals.correctionMeals);
							globalSingleDualHormoneReading = {
								singleHormoneData: {readings: readings, correctionMeals:[]},
								dualHormoneData: {readings: readings3, correctionMeals: secondCorrectedMeals.correctionMeals}
							};

							addReading(error, {readings: readings, correctionMeals:[]}, {readings: readings3, correctionMeals: secondCorrectedMeals.correctionMeals});
						});
					});
				});
			}*/
		},
		styler: {
			big: function(e, el) {
				if (!el) {
					el = this;
				}

				$(el).find('.patient-content').addClass('patient-content-small');
				$(el).find('.patient-content-bg-value').addClass('patient-content-bg-value-small');
				$(el).find('.patient-content-image').addClass('patient-content-image-small');
				$(el).find('.patient-content-hormone').addClass('patient-content-hormone-small');

				//$(el).addClass('patient-small');

				$(el).find('.patient-graph-small').show();

			},
			normal: function(e, el) {
				if (!el) {
					el = this;
				}

				$(el).find('.patient-content').removeClass('patient-content-small');
				$(el).find('.patient-content-bg-value').removeClass('patient-content-bg-value-small');
				$(el).find('.patient-content-image').removeClass('patient-content-image-small');
				$(el).find('.patient-content-hormone').removeClass('patient-content-hormone-small');
				//$(el).removeClass('patient-small');
				$(el).find('.patient-graph-small').hide();
			}
		},
		isBig: false,
		big: {'width': '592px', 'height': '300px'},
		small: {'width': '276px', 'height': '130px'},
		grow: function() {
			this.isBig = true;
			$('.patient').animate(this.big);
			this.styler.big(null, '.patient');
		},
		shrink: function() {
			this.isBig = false;
			$('.patient').animate(this.small);
			this.styler.normal(null, '.patient');
		},
		toggleProfileView: function() {
			this.isBig ? this.shrink() : this.grow();
		},
	}
}());
