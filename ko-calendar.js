var ko;
var requireExists = typeof window === 'undefined'
    ? typeof require === 'function'
    : typeof window['require'] === 'function';
if (typeof ko === 'undefined' && !requireExists)
    throw new Error("Unable to load knockout");
ko = ko || typeof window === 'undefined' ? require('knockout') : window['require']('knockout');
var Calendar = (function () {
    function Calendar(parser) {
        var _this = this;
        this.parser = function (userObject) {
            // Default behaviour
            // This should be overridden by the consumer
            if (userObject instanceof Date)
                return userObject;
            var date = userObject.date;
            if (date instanceof Date)
                return date;
            if (typeof date === 'string') {
                var returnDate = new Date(date);
                if (!isNaN(returnDate.getTime()))
                    return returnDate;
            }
            throw new Error("Invalid object parsed [" + JSON.stringify(userObject) + "]");
        };
        this.events = ko.observableArray([]);
        this.startDay = ko.observable(0);
        this.endDay = ko.computed(function () { return _this.startDay() + 6; });
        if (!parser)
            return;
        if (typeof parser !== 'function') {
            console.warn('Parser function provided is not a function and has been ignored');
            return;
        }
        this.parser = parser;
    }
    Calendar.prototype.addEvent = function (userObject) {
    };
    Calendar.prototype.getEventsForDate = function (date, dateDay) {
        return null;
    };
    Calendar.prototype.getEvents = function () {
        return null;
    };
    Calendar.prototype.getEventsByWeek = function () {
        return null;
    };
    Calendar.prototype.weeksInDateRange = function (start, end) {
        var weeks = 0;
        var iterator = start;
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
        return right >= leftFloor && right < leftCeil;
    };
    Calendar.prototype.floorToDay = function (date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };
    Calendar.prototype.ceilToDay = function (date) {
        var upDate = date;
        upDate.setDate(upDate.getDate() + 1);
        return new Date(upDate.getFullYear(), upDate.getMonth(), upDate.getDate());
    };
    Calendar.prototype.floorToWeekStart = function (date) {
        var currentDay = date.getDay();
        var toDay = this.startDay();
        var downDate = date;
        if (currentDay > toDay)
            downDate.setDate(downDate.getDate() - (currentDay - toDay));
        if (currentDay < toDay)
            downDate.setDate(downDate.getDate() - (currentDay + (7 - toDay)));
        return this.floorToDay(downDate);
    };
    Calendar.prototype.ceilToWeekEnd = function (date) {
        var currentDay = date.getDay();
        var toDay = this.endDay();
        var upDate = date;
        if (currentDay > toDay)
            upDate.setDate(upDate.getDate() + (7 - currentDay + toDay));
        if (currentDay < toDay)
            upDate.setDate(upDate.getDate() + (toDay - currentDay));
        return this.ceilToDay(upDate);
    };
    Calendar.prototype.getExtremities = function () {
        return null;
    };
    return Calendar;
})();
exports.Calendar = Calendar;
//# sourceMappingURL=ko-calendar.js.map