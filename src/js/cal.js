(function ( $ ) {
 
    $.fn.cal = function(options) {
		
		$.fn.cal.defaults = {
			min: null,
			max: null
		};
		
		var settings = $.extend({}, $.fn.cal.defaults, options);
		
		moment.locale('ru');
		var today = moment().startOf('month');
		
		var _getDate = function(day) {
			var $day = $(day),
				$month = $day.parents('.cal-month');
			return moment([$month.data('year'), $month.data('month'), $day.text()]);
		}
		
		var _getDay = function(date) {
			var $month = $cal.find('.cal-month[data-month='+ date.months()+'][data-year='+date.year()+']');
			return $month.find('.cal-day[data-day='+date.date()+']')
		}
		
		var _clearSelection = function() {
			$cal.find('.cal-day.active').removeClass('active');
			$cal.find('.cal-day.selected').removeClass('selected');
			$cal.find('.cal-month.selected').removeClass('selected');
			$starts.val('');
			$ends.val('');
		}
		
		var _selectDate = function($day) {
			var date = _getDate($day);
			if ($cal.find('.cal-day.active').length == 1) {
				_hightlightDates($day);
				$day.addClass('active');
				$cal.find('.cal-day.hover').addClass('selected').removeClass('hover');
				$cal.find('.cal-month.hover').addClass('selected').removeClass('hover');
				if (date.isBefore(moment($starts.val(), 'DD-MM-YYYY'))) {
					$starts.val(date.format('DD-MM-YYYY'));
				} else {
					$ends.val(date.format('DD-MM-YYYY'));
				}
			} else {
				_clearSelection();
				$day.addClass('active');
				$starts.val(date.format('DD-MM-YYYY'));
				$ends.val(date.format('DD-MM-YYYY'));
			}
		}
		
		var _hightlightDates = function($day) {
			if ($day.hasClass('cal-day-disabled')) return
			
			var $firstDate = $cal.find('.cal-day.active');
			if ($firstDate.length != 1) return
			
			$cal.find('.cal-day.hover').removeClass('hover');
			$cal.find('.cal-month.hover').removeClass('hover');
			var thisDate = _getDate($day),
				firstDate = _getDate($firstDate),
				lastDate;
			if (thisDate.isBefore(firstDate)) {
				lastDate = moment(firstDate);
				firstDate = moment(thisDate);
			} else {
				lastDate = moment(thisDate);
			}

			var firstDateMonth, lastDateMonth;
			$day.parents('.cal-months').find('.cal-month').each(function(){
				var $this = $(this);
				firstDateMonth = moment([$this.data('year'), $this.data('month')]).startOf('month');
				lastDateMonth = moment([$this.data('year'), $this.data('month')]).endOf('month');
				if ( (firstDateMonth.isAfter(firstDate)) && (lastDateMonth.isBefore(lastDate)) ) {
					$this.addClass('hover');
				} else if ((firstDateMonth.isSame(firstDate, 'month')) || (lastDateMonth.isSame(lastDate, 'month'))) {
					$this.find('.cal-day').each(function(){
						if ((_getDate($(this)).isAfter(firstDate)) && (_getDate($(this)).isBefore(lastDate))) {
							$(this).addClass('hover');
						}
					});
				}
			});
		}
		
		var _scroll = function(offset) {
			var $firstMonth = $cal.find('.cal-month:last-child'),
				monthWidth = parseInt($firstMonth.css('width'), 10) + parseInt($firstMonth.css('margin-right'), 10),
				$wrap = $cal.find('.cal-months-wrap'),
				pos = $wrap.data('position');
			pos += offset;
			$cal.find('.cal-scroll-left').removeClass('disabled');	
			$cal.find('.cal-scroll-right').removeClass('disabled');	
			if (pos<=0) {
				pos = 0;
				$cal.find('.cal-scroll-left').addClass('disabled');	
			} else if (pos>=10) {
				pos = 10;
				$cal.find('.cal-scroll-right').addClass('disabled');	
			}
 			$wrap.data('position', pos)
				.css('margin-left', -(monthWidth*pos));
			$wrap.data('position', pos);
		}

		var _generateMonth = function(month){
			var html = '',
				date = moment(month).startOf('month');
			html += '<div class="cal-month" data-month="'+ date.month() +'" data-year="' + date.year() + '">';
			html += '<h4>' + date.format('MMMM YYYY').replace(/^[а-я]/g, function(letter) { return letter.toUpperCase(); }) + '</h4>';
			html += '<div class="cal-days">';
			
			var week = moment(date).startOf('isoWeek'),
				monthEnd = moment(date).endOf('month').endOf('isoWeek'),
				day, weekEnd;
			while (week.isBefore(monthEnd)) {
				html += '<div class="cal-week">';
				day = moment(week).startOf('isoWeek');
				weekEnd = moment(week).endOf('isoWeek');
				while (day.isBefore(weekEnd)){
					if (day.month() != date.month()) {
						html += '<span class="cal-day cal-day-extend">' + day.date() + '</span>';
					} else if ((settings.min && day.isBefore(settings.min)) || 
							   (settings.max && day.isAfter(settings.max))) {
						html += '<span class="cal-day cal-day-disabled" data-day="' + day.date() + '">' + day.date() + '</span>';
					} else if ((day.isoWeekday()==6) || (day.isoWeekday()==7)) {
						html += '<span class="cal-day cal-day-weekend" data-day="' + day.date() + '">' + day.date() + '</span>';
					} else {
						html += '<span class="cal-day" data-day="' + day.date() + '">' + day.date() + '</span>';
					}
					day.add(1, 'days')
				}
				week.add(1, 'weeks')
				html += '</div>';
			}
			html += '</div>';
			html += '</div>';
			return html
		}

		var _generateHtml = function(){
			var html = '<div class="cal">';
			html += '<div class="cal-controls"> \
						<div class="cal-scroll-left disabled"></div> \
						<div class="cal-scroll-right"></div> \
					 </div>';
			
			html += '<div class="cal-months"><div class="cal-months-wrap" data-position="0">';
			for (var i=0; i<12; i++) {
				html += _generateMonth(moment(today).add(i, 'months'));
			}
			html += '</div></div>';
			
			html += '</div>';
			return html
		}
		
		var $cal, $starts, $ends;

		return this.each(function(){
			var $this = $(this),
				$input = $(this);
			$cal = $(_generateHtml());
			$starts = $input.find('.date-starts');
			$ends = $input.find('.date-ends');
			$this.after($cal);
			$this.hide();
			
			var defaultStarts = $starts.val(),
				defaultEnds = $ends.val();
			if (defaultStarts) {
				var dateStarts = moment(defaultStarts, 'DD-MM-YYYY');
				_selectDate(_getDay(dateStarts));
				_scroll(dateStarts.diff(today, 'months'));
			};	
			if (defaultEnds) _selectDate(_getDay(moment(defaultEnds, 'DD-MM-YYYY')));
			
			$cal.find('.cal-scroll-right').click(function(){
				if ($(this).hasClass('disabled')) return
				_scroll(+1);
				/*if ($cal.find('.cal-month').length < (pos+2)) {
					$wrap.append(_generateMonth(today.month(lastMonth+1)))
				}*/
			});
			
			$cal.find('.cal-scroll-left').click(function(){
				if ($(this).hasClass('disabled')) return
				_scroll(-1);
			});
			
			$cal.on('click', '.cal-day', function(){
				var $this = $(this);
				if (!$this.hasClass('cal-day-disabled')) {
					_selectDate($this);
					$input.trigger(jQuery.Event('change'));
				}
			});
			
			$cal.on('hover', '.cal-day', function(){
				_hightlightDates($(this));
			});
			
			$cal.on('mouseout', '.cal-day', function(){
				$(this).parents('.cal-months').find('.cal-day.hover').removeClass('hover');
				$(this).parents('.cal-months').find('.cal-month.hover').removeClass('hover');
			});
		});
	}
 
}( jQuery ));
