(function(e, a) { for(var i in a) e[i] = a[i]; }(this, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var DE = __webpack_require__(1);
	if (typeof ko === 'undefined') {
	    if (typeof window !== 'undefined' && typeof window['require'] !== 'undefined')
	        ko = window['require']('knockout');
	}
	var Calendar = (function () {
	    function Calendar(parser) {
	        var _this = this;
	        this.eventsDate = ko.observable(new Date());
	        this.parser = function (userObject) {
	            // Default behaviour
	            // This should be overridden by the consumer
	            if (userObject.start instanceof Date && userObject.end instanceof Date)
	                return userObject;
	            var date;
	            if (userObject instanceof Date)
	                date = new Date(userObject.getTime());
	            if (typeof userObject === 'string' || typeof userObject === 'number') {
	                var returnDate = new Date(userObject);
	                if (!isNaN(returnDate.getTime()))
	                    date = returnDate;
	            }
	            if (userObject.date instanceof Date)
	                date = new Date(userObject.date.getTime());
	            if (typeof date === 'string' || typeof date === 'number') {
	                var returnDate = new Date(date);
	                if (!isNaN(returnDate.getTime()))
	                    date = returnDate;
	            }
	            if (date instanceof Date)
	                return { start: new Date(date.getTime()), end: date };
	            throw new Error("Invalid object parsed [" + JSON.stringify(userObject) + "]");
	        };
	        this.events = ko.observableArray([]);
	        this.parsedEvents = ko.computed(function () {
	            var parsedObjects = _this.events().map(function (userObject) {
	                var rawParsed = _this.parser(userObject);
	                var parsed = _this.parsedObjectToDateRange(rawParsed);
	                return {
	                    start: parsed.start,
	                    end: parsed.end,
	                    value: userObject
	                };
	            });
	            return _this.sortByDate(parsedObjects);
	        });
	        this.privateStartDay = ko.observable(0);
	        this.startDay = ko.pureComputed({
	            read: function () { return _this.privateStartDay(); },
	            write: function (dayOfWeek) {
	                _this.privateStartDay(DE.startDay(dayOfWeek));
	            },
	            owner: this
	        });
	        this.endDay = ko.computed(function () { return DE.endDay(_this.privateStartDay()); });
	        this.addEvent = function (userObject) {
	            _this.events.push(userObject);
	        };
	        this.addEvents = function (userObjects) {
	            var events = _this.events();
	            events = events.concat(userObjects);
	            _this.events(events);
	        };
	        this.eventsForDate = ko.computed(function () {
	            var forDate = _this.eventsDate();
	            var events = _this.parsedEvents().filter(function (event) { return DE.inRange(forDate, event); });
	            return {
	                date: DE.floorDay(forDate),
	                events: events
	            };
	        });
	        this.eventsByDay = ko.computed(function () {
	            var events = _this.parsedEvents();
	            var range = _this.getDateRange();
	            var dayEvents = [];
	            var iterator = new Date(range.start.getTime());
	            while (iterator < range.end) {
	                var currentEvents = events.filter(function (event) { return DE.inRange(iterator, event); });
	                dayEvents.push({
	                    date: new Date(iterator.getTime()),
	                    events: currentEvents
	                });
	                iterator.setDate(iterator.getDate() + 1);
	            }
	            return dayEvents;
	        });
	        this.eventsForWeek = function (date) {
	            var iterator = DE.floorWeek(date, _this.privateStartDay());
	            var end = DE.ceilWeek(date, _this.privateStartDay());
	            var events = _this.parsedEvents();
	            var weekEvent = {
	                start: DE.floorWeek(date, _this.privateStartDay()),
	                end: end,
	                days: []
	            };
	            while (iterator <= end) {
	                var dayEvents = events.filter(function (event) { return DE.inRange(iterator, event); });
	                weekEvent.days.push({
	                    date: new Date(iterator.getTime()),
	                    events: dayEvents
	                });
	                iterator.setDate(iterator.getDate() + 1);
	            }
	            return weekEvent;
	        };
	        this.eventsByWeek = ko.computed(function () {
	            var events = _this.parsedEvents();
	            var range = _this.getDateRange();
	            var weekEvents = [];
	            var iterator = new Date(range.start.getTime());
	            var canAddWeek = function () {
	                var ceil = DE.ceilWeek(iterator, _this.privateStartDay());
	                return ceil <= range.end;
	            };
	            var to = function (date) { return (date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()); };
	            while (canAddWeek()) {
	                var weekEvent = _this.eventsForWeek(iterator);
	                weekEvents.push(weekEvent);
	                iterator.setDate(iterator.getDate() + 7);
	            }
	            return weekEvents;
	        });
	        this.firstMonth = function () {
	            var firstEvent = _this.eventsByDay()[0];
	            if (!firstEvent)
	                return { year: new Date().getFullYear(), month: new Date().getMonth() };
	            return { year: firstEvent.date.getFullYear(), month: firstEvent.date.getMonth() };
	        };
	        this.firstEventAdded = false;
	        this.setFirstMonth = function (events) {
	            if (_this.firstEventAdded)
	                return;
	            _this.currentMonth(_this.firstMonth());
	            _this.firstEventAdded = true;
	        };
	        this.currentMonth = ko.observable({ year: 0, month: -1 });
	        this.eventsForMonth = ko.computed(function () {
	            var weeks = [];
	            var current = _this.currentMonth();
	            if (current.year === 0) {
	                _this.currentMonth(_this.firstMonth());
	                current = _this.currentMonth();
	            }
	            var iterator = new Date(current.year, current.month, 1);
	            var isThisMonth = function () {
	                var floor = DE.floorWeek(iterator, _this.privateStartDay());
	                var ceil = DE.ceilWeek(iterator, _this.privateStartDay());
	                return floor.getMonth() === current.month || ceil.getMonth() === current.month;
	            };
	            while (isThisMonth()) {
	                var weekEvent = _this.eventsForWeek(iterator);
	                weeks.push(weekEvent);
	                iterator.setDate(iterator.getDate() + 7);
	            }
	            var events = _this.parsedEvents();
	            var start = weeks[0].start;
	            var end = weeks[weeks.length - 1].end;
	            var eventsBefore = events.filter(function (event) { return event.end < start; }).length;
	            var eventsAfter = events.filter(function (event) { return event.start > end; }).length;
	            return {
	                weeks: weeks,
	                start: start,
	                end: end,
	                before: eventsBefore,
	                after: eventsAfter
	            };
	        });
	        this.previousMonth = function () {
	            var current = _this.currentMonth();
	            current.month--;
	            if (current.month < 0) {
	                current.month = 11;
	                current.year--;
	            }
	            _this.currentMonth(current);
	        };
	        this.nextMonth = function () {
	            var current = _this.currentMonth();
	            current.month++;
	            if (current.month > 11) {
	                current.month = 0;
	                current.year++;
	            }
	            _this.currentMonth(current);
	        };
	        this.weekDays = ko.computed(function () {
	            var days = _this.eventsByDay().slice(0, 7);
	            return days.map(function (day) { return day.date.toString().slice(0, 3); });
	        });
	        this.events.subscribe(this.setFirstMonth);
	        if (!parser)
	            return;
	        if (typeof parser !== 'function') {
	            console.warn('Parser function provided is not a function and has been ignored');
	            return;
	        }
	        this.parser = parser;
	    }
	    /**
	     * Handle the case where a user provided Parser returns a Date, not a DateRange
	     */
	    Calendar.prototype.parsedObjectToDateRange = function (parsedObject) {
	        if (parsedObject instanceof Date) {
	            return {
	                start: new Date(parsedObject.getTime()),
	                end: new Date(parsedObject.getTime())
	            };
	        }
	        return parsedObject;
	    };
	    Calendar.prototype.sortByDate = function (events) {
	        var newArray = events.slice();
	        return newArray.sort(function (left, right) { return left.start > right.start ? 1 : -1; });
	    };
	    Calendar.prototype.weeksInDateRange = function (start, end) {
	        var weeks = 0;
	        var iterator = new Date(start.getTime());
	        ;
	        while (iterator <= end) {
	            weeks++;
	            iterator.setDate(iterator.getDate() + 7);
	        }
	        return weeks;
	    };
	    Calendar.prototype.getDateRange = function () {
	        var events = this.parsedEvents();
	        var dates = [];
	        events.forEach(function (event) {
	            dates.push(event.start);
	            dates.push(event.end);
	        });
	        var range = DE.dateRange(dates);
	        return {
	            start: DE.floorWeek(range.start, this.privateStartDay()),
	            end: DE.ceilWeek(range.end, this.privateStartDay())
	        };
	    };
	    return Calendar;
	})();
	exports.Calendar = Calendar;
	if (false)
	    window['Calendar'] = Calendar;


/***/ },
/* 1 */
/***/ function(module, exports) {

	function startDay(dayNumber) {
	    if (dayNumber == null)
	        return 0;
	    return Math.abs(dayNumber) % 7;
	}
	exports.startDay = startDay;
	function endDay(dayNumber) {
	    if (dayNumber == null)
	        return 6;
	    return dayNumber === 0 ? 6 : dayNumber - 1;
	}
	exports.endDay = endDay;
	function sameDate(left, right) {
	    var sameYear = left.getFullYear() === right.getFullYear();
	    var sameMonth = left.getMonth() === right.getMonth();
	    var sameDay = left.getDate() === right.getDate();
	    return sameYear && sameMonth && sameDay;
	}
	exports.sameDate = sameDate;
	function sameWeek(left, right, startOfWeek) {
	    var sameYear = left.getFullYear() === right.getFullYear();
	    var sameMonth = left.getMonth() === right.getMonth();
	    if (!sameYear || !sameMonth)
	        return false;
	    var leftFloor = floorWeek(left, startOfWeek);
	    var leftCeil = ceilWeek(left, startOfWeek);
	    return right >= leftFloor && right <= leftCeil;
	}
	exports.sameWeek = sameWeek;
	function inRange(date, dateRange) {
	    return date >= dateRange.start && date <= dateRange.end;
	}
	exports.inRange = inRange;
	function sameDateTime(left, right) {
	    var sameHour = left.getHours() === right.getHours();
	    var sameMinutes = left.getMinutes() === right.getMinutes();
	    var sameSeconds = left.getSeconds() === right.getSeconds();
	    return sameDate(left, right) && sameHour && sameMinutes && sameSeconds;
	}
	exports.sameDateTime = sameDateTime;
	function floorDay(date) {
	    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
	}
	exports.floorDay = floorDay;
	function ceilDay(date) {
	    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
	}
	exports.ceilDay = ceilDay;
	function floorWeek(date, startOfWeek) {
	    var currentDay = date.getDay();
	    var toDay = startDay(startOfWeek);
	    var downDate = new Date(date.getTime());
	    if (currentDay > toDay)
	        downDate.setDate(downDate.getDate() - (currentDay - toDay));
	    if (currentDay < toDay)
	        downDate.setDate(downDate.getDate() - (currentDay + (7 - toDay)));
	    return floorDay(downDate);
	}
	exports.floorWeek = floorWeek;
	function ceilWeek(date, startOfWeek) {
	    var currentDay = date.getDay();
	    var toDay = endDay(startOfWeek);
	    var upDate = new Date(date.getTime());
	    if (currentDay > toDay)
	        upDate.setDate(upDate.getDate() + (7 - currentDay + toDay));
	    if (currentDay < toDay)
	        upDate.setDate(upDate.getDate() + (toDay - currentDay));
	    return ceilDay(upDate);
	}
	exports.ceilWeek = ceilWeek;
	function dateRange(dates) {
	    var start, end;
	    dates.forEach(function (date) {
	        if (start == null || date < start)
	            start = new Date(date.getTime());
	        if (end == null || date > end)
	            end = new Date(date.getTime());
	    });
	    if (start == null)
	        start = new Date();
	    if (end == null)
	        end = new Date(start.getTime());
	    start = floorDay(start);
	    end = ceilDay(end);
	    return { start: start, end: end };
	}
	exports.dateRange = dateRange;


/***/ }
/******/ ])));