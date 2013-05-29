/*
 *  jQuery Boilerplate - v3.3.1
 *  A jump-start for jQuery plugins development.
 *  http://jqueryboilerplate.com
 *
 *  Made by Zeno Rocha
 *  Under MIT License
 */
// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

	// undefined is used here as the undefined global variable in ECMAScript 3 is
	// mutable (ie. it can be changed by someone else). undefined isn't really being
	// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
	// can no longer be modified.

	// window and document are passed through as local variable rather than global
	// as this (slightly) quickens the resolution process and can be more efficiently
	// minified (especially when both are regularly referenced in your plugin).

	// Create the defaults once
	var pluginName = "schedule",
		defaults = {
		tasks: [],
		firstDate: null,
		lastDate: null,
		size: 22,
	};

	// The actual plugin constructor
	function Plugin ( element, options ) {
		this.element = element;
		// jQuery has an extend method which merges the contents of two or
		// more objects, storing the result in the first object. The first object
		// is generally empty as we don't want to alter the default options for
		// future instances of the plugin
		this.settings = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	Plugin.prototype = {
		init: function () {
			// Place initialization logic here
			// You already have access to the DOM element and
			// the options via the instance, e.g. this.element
			// and this.settings
			// you can add more functions like the one below and
			// call them like so: this.yourOtherFunction(this.element, this.settings).
			this.findFirstLastDate(this.settings.tasks);

			this.render(this.settings.tasks);
		},

		findFirstLastDate: function ( tasks ) {
			for (x in tasks) {
				var task = tasks[x],
					from = this.stringToDate(task.from),
					to   = this.stringToDate(task.to);

				// if the date is null, set the first date it founds
				if (this.settings.firstDate === null) {
					this.settings.firstDate = from;
				}

				if (this.settings.lastDate === null) {
					this.settings.lastDate = to;
				}

				// sets the first and last dates
				if (this.settings.firstDate instanceof Date && this.settings.firstDate > from) {
					this.settings.firstDate = from;
				}

				if (this.settings.lastDate instanceof Date && this.settings.lastDate < to) {
					this.settings.lastDate = to;
				}

				// if there is subtasks, check them too
				if (task.tasks !== undefined && task.tasks.length > 0) {
					this.findFirstLastDate(task.tasks);
				}
			}
		},

		render: function () {
			var header  = this.renderHeader($('<div class="header" />'), this.settings.tasks),
				tasks   = this.renderTasks($('<div class="tasks" />'), this.settings.tasks, 0),
				days    = this.getNumberOfDays(this.settings.firstDate, this.settings.lastDate),
				size    = this.settings.size + 1,
				element = $('<div class="content" />');

			element.append(header).append(tasks);
			element.css('width', (days + 1) * size + 162);

			$(this.element).append(element);
			$(this.element).find('.task').on('click', function() {
				if ($(this).is('.opened')) {
					$('.task-' + $(this).data('id')).slideUp('fast');
					$(this).removeClass('opened').addClass('closed');
				} else {
					$('.task-' + $(this).data('id')).slideDown('fast');
					$(this).removeClass('closed').addClass('opened');
				}
			});
		},

		renderHeader: function ( element, tasks ) {
			var months = this.renderMonths(tasks);

			element.append(months);

			return element;
		},

		renderYears: function () {
			
		},

		renderMonths: function ( tasks ) {
			var day        = new Date(this.settings.firstDate.getTime()),
				monthDay   = new Date(this.settings.firstDate.getFullYear(), this.settings.firstDate.getMonth()+1, 0),
				lastDate   = new Date(this.settings.lastDate.getFullYear(), this.settings.lastDate.getMonth()+1, 0),
				firstDay   = null,
				lastDay    = null,
				montDays   = 0,
				size       = this.settings.size + 1,
				element    = $('<div class="months" />');


			while (lastDate >= monthDay)  {
				var _element = $('<div class="month">'+ (monthDay.getMonth()+1) +'</div>');

				if (this.settings.firstDate.getMonth() === monthDay.getMonth()) {
					firstDay = this.settings.firstDate.getDate();
				} else {
					firstDay = 1;
				}

				if (this.settings.lastDate.getMonth() === monthDay.getMonth()) {
					lastDay = this.settings.lastDate.getDate();
				} else {
					lastDay = monthDay.getDate();
				}

				montDays = lastDay - firstDay + 1;
				element.append(_element.css('width', montDays * size - 1));

				monthDay.setDate(1);
				monthDay.setMonth(monthDay.getMonth() + 2);
				monthDay.setDate(0);
			
			}


			return element;
		},

		renderWeeks: function () {
			
		},

		renderTasks: function ( element, tasks, level, tree ) {
			for (x in tasks) {
				var task     = tasks[x],
					_tree    = tree == undefined ? x : tree + '-' + x,
					_element = $('<div class="task' + (tree ? ' task-' + tree : '') + ' opened" data-id="' + _tree + '" />');

				_element.append($('<div class="name">' + task.name + '</div>').css('textIndent', level * 10));
				_element.append(this.renderDays(task));

				element.append(_element);

				// go subtasks
				if (task.tasks !== undefined && task.tasks.length > 0) {
					this.renderTasks(element, task.tasks, level + 1, _tree);
				}
			}

			return element;
		},

		renderDays: function ( task ) {
			var day     = new Date(this.settings.firstDate.getTime()),
				days    = this.getNumberOfDays(this.settings.firstDate, this.settings.lastDate),
				start   = this.getNumberOfDays(this.settings.firstDate, this.stringToDate(task.from)),
				end     = this.getNumberOfDays(this.settings.firstDate, this.stringToDate(task.to)),
				size    = this.settings.size + 1,
				element = $('<div class="days" />');

			for (i = 0; i <= days; i++) {
				element.append($('<div class="day day-' + i + '"></div>'));

				day.setDate(day.getDate() + 2);
			}

			if (end > 0) {
				var _element = $('<div class="bar"></div>')
					.css('left', (start * size) + 2)
					.css('width', ((end - start + 1) * size) - 3);

				element.prepend(_element);
			}

			return element;
		},

		getNumberOfDays: function ( start, end ) {
			if (!start || !end) return 0;
			return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
		},

		stringToDate: function ( date ) {
			if ( !date ) return null;

			date = date.split('-');
			return (new Date(date[0], parseInt(date[1]) - 1, date[2]));
		},

		dateToString: function ( date ) {
			if ( !date ) return null;

			var y = (date.getFullYear()).toString();
			var m = (date.getMonth() + 1).toString();
			var d = (date.getDate()).toString();

			if (m.length == 1) m = '0' + m;
			if (d.length == 1) d = '0' + d;

			return (y + '-' + m + '-' + d);
		}
	};

	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[ pluginName ] = function ( options ) {
		return this.each(function() {
			if ( !$.data( this, "plugin_" + pluginName ) ) {
				$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
			}
		});
	};

})( jQuery, window, document );
