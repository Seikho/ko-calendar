var requireExists = typeof window === 'undefined'
    ? typeof require === 'function'
    : typeof window['require'] === 'function';
if (typeof ko === 'undefined') {
    if (!requireExists) {
        throw new Error("Unable to load knockout");
    }
    ko = typeof window === 'undefined' ? require('knockout') : window['require']('knockout');
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
                date = userObject;
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
                var parsed = _this.parser(userObject);
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
            write: function (dayOfWeek) { return _this.privateStartDay(Math.abs(dayOfWeek) % 7); },
            owner: this
        });
        this.endDay = ko.computed(function () { return _this.startDay() === 0 ? 6 : _this.startDay() - 1; });
        this.eventsForDate = ko.computed(function () {
            var forDate = _this.eventsDate();
            var events = _this.parsedEvents().filter(function (event) { return _this.isInRange(forDate, event); });
            return {
                date: _this.floorToDay(forDate),
                events: events
            };
        });
        this.eventsByDay = ko.computed(function () {
            var events = _this.parsedEvents();
            var range = _this.getDateRange();
            var dayEvents = [];
            var iterator = new Date(range.start.getTime());
            while (iterator < range.end) {
                var currentEvents = events.filter(function (event) { return _this.isInRange(iterator, event); });
                dayEvents.push({
                    date: new Date(iterator.getTime()),
                    events: currentEvents
                });
                iterator.setDate(iterator.getDate() + 1);
            }
            return dayEvents;
        });
        this.eventsByWeek = ko.computed(function () {
            var events = _this.parsedEvents();
            var range = _this.getDateRange();
            var weekEvents = [];
            var iterator = new Date(range.start.getTime());
            var weekNumber = 1;
            while (iterator < range.end) {
                var currentDay = iterator;
                var endOfWeek = _this.ceilToWeekEnd(iterator);
                var week = {
                    start: new Date(iterator.getTime()),
                    end: endOfWeek,
                    weekNumber: weekNumber,
                    days: []
                };
                while (currentDay < endOfWeek) {
                    var dayEvents = events.filter(function (event) { return _this.isInRange(currentDay, event); });
                    week.days.push({
                        date: currentDay,
                        events: dayEvents
                    });
                    currentDay.setDate(currentDay.getDate() + 1);
                }
                weekEvents.push(week);
            }
            return weekEvents;
        });
        if (!parser)
            return;
        if (typeof parser !== 'function') {
            console.warn('Parser function provided is not a function and has been ignored');
            return;
        }
        this.parser = parser;
    }
    Calendar.prototype.addEvent = function (userObject) {
        this.events.push(userObject);
    };
    Calendar.prototype.addEvents = function (userObjects) {
        var events = this.events();
        events = events.concat(userObjects);
        this.events(events);
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
    Calendar.prototype.isSameDate = function (left, right) {
        var sameYear = left.getFullYear() === right.getFullYear();
        var sameMonth = left.getMonth() === right.getMonth();
        var sameDay = left.getDate() === right.getDate();
        return sameYear && sameMonth && sameDay;
    };
    Calendar.prototype.isSameWeek = function (left, right) {
        var sameYear = left.getFullYear() === right.getFullYear();
        var sameMonth = left.getMonth() === right.getMonth();
        if (!sameYear || !sameMonth)
            return false;
        var leftFloor = this.floorToWeekStart(left);
        var leftCeil = this.ceilToWeekEnd(left);
        return right >= leftFloor && right <= leftCeil;
    };
    Calendar.prototype.isInRange = function (date, range) {
        var sameAsStart = this.isSameDate(date, range.start);
        var sameAsEnd = this.isSameDate(date, range.end);
        var isInRange = date >= range.start && date <= range.end;
        return sameAsStart || sameAsEnd || isInRange;
    };
    Calendar.prototype.floorToDay = function (date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };
    Calendar.prototype.ceilToDay = function (date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
    };
    Calendar.prototype.floorToWeekStart = function (date) {
        var currentDay = date.getDay();
        var toDay = this.startDay();
        var downDate = new Date(date.getTime());
        if (currentDay > toDay)
            downDate.setDate(downDate.getDate() - (currentDay - toDay));
        if (currentDay < toDay)
            downDate.setDate(downDate.getDate() - (currentDay + (7 - toDay)));
        return this.floorToDay(downDate);
    };
    Calendar.prototype.ceilToWeekEnd = function (date) {
        var currentDay = date.getDay();
        var toDay = this.endDay();
        var upDate = new Date(date.getTime());
        if (currentDay > toDay)
            upDate.setDate(upDate.getDate() + (7 - currentDay + toDay));
        if (currentDay < toDay)
            upDate.setDate(upDate.getDate() + (toDay - currentDay));
        return this.ceilToDay(upDate);
    };
    Calendar.prototype.getDateRange = function () {
        var events = this.parsedEvents();
        var start, end;
        events.forEach(function (event) {
            if (start == null || event.start < start)
                start = new Date(event.start.getTime());
            if (end == null || event.end > end)
                end = new Date(event.end.getTime());
        });
        if (start == null)
            start = new Date();
        if (end == null)
            end = new Date(start.getTime());
        // We get a little bit opinionated here...
        start = this.floorToWeekStart(start);
        end = this.ceilToWeekEnd(end);
        return { start: start, end: end };
    };
    return Calendar;
})();
if (typeof exports !== 'undefined')
    module.exports.Calendar = Calendar;
