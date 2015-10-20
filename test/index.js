var chai = require('chai');
var ko = require('knockout');
global['ko'] = ko;
var Cal = require('../ko-calendar');
var expect = chai.expect;
var cal = new Cal.Calendar();
var baseDate = new Date(2015, 0, 1); // Thu, 1 Jan 2015
describe('ordered days of week tests', function () {
    it('will calculate the ordered days of the week with no data provided', function () {
        var weekDays = cal.weekDays();
        expect(weekDays[0]).to.equal('Sun');
        expect(weekDays[6]).to.equal('Sat');
    });
    it('will calculate the ordered days of the week with an altered start day', function () {
        cal.startDay(4);
        var weekDays = cal.weekDays();
        expect(weekDays[0]).to.equal('Thu');
        expect(weekDays[6]).to.equal('Wed');
    });
});
describe('start/end day value tests', function () {
    it('will find endDay:6 when start:0', function () {
        cal.startDay(0);
        expect(cal.endDay()).to.equal(6);
    });
    it('will find endDay:0 when start:1', function () {
        cal.startDay(1);
        expect(cal.endDay()).to.equal(0);
    });
    it('will find endDay:1 when start:2', function () {
        cal.startDay(2);
        expect(cal.endDay()).to.equal(1);
    });
    it('will find endDay:2 when start:3', function () {
        cal.startDay(3);
        expect(cal.endDay()).to.equal(2);
    });
    it('will find endDay:3 when start:4', function () {
        cal.startDay(4);
        expect(cal.endDay()).to.equal(3);
    });
    it('will find endDay:4 when start:5', function () {
        cal.startDay(5);
        expect(cal.endDay()).to.equal(4);
    });
    it('will find endDay:5 when start:6', function () {
        cal.startDay(6);
        expect(cal.endDay()).to.equal(5);
    });
    it('will amend a value outside of 0-6 that is provided to startDay', function () {
        cal.startDay(7);
        expect(cal.startDay()).to.equal(0);
        expect(cal.endDay()).to.equal(6);
    });
});
describe('get events tests', function () {
    addRange(0); // Thu 1 Jan
    addRange(1); // Fri 2 Jan
    addRange(-1, 2);
    it('will find the date range', function () {
        var extremes = cal.getDateRange();
        var start = extremes.start;
        var end = extremes.end;
        expect(start.getDay()).to.equal(cal.startDay());
        expect(end.getDay()).to.equal(cal.endDay());
    });
    it('will allocate events to their corresponding DayEvent', function () {
        var events = cal.eventsByDay();
        expect(events[0].events.length).to.equal(0);
        expect(events[1].events.length).to.equal(0);
        expect(events[2].events.length).to.equal(0);
        expect(events[3].events.length).to.equal(1);
        expect(events[4].events.length).to.equal(2);
        expect(events[5].events.length).to.equal(2);
        expect(events[6].events.length).to.equal(1);
    });
    it('will allocate the correct number of weeks', function () {
        var events = cal.eventsByWeek();
        expect(events.length).to.equal(1);
    });
    it('will allocate the correct week span', function () {
        var events = cal.eventsByWeek();
        expect(events[0].start.toUTCString()).to.be.equal(new Date(2014, 11, 28).toUTCString());
        expect(events[0].end.toUTCString()).to.be.equal(new Date(2015, 0, 3, 23, 59, 59, 999).toUTCString());
    });
    it('will add an additional week after adding more events', function () {
        addDate(7);
        var events = cal.eventsByWeek();
        expect(events[0].start.toUTCString()).to.be.equal(new Date(2014, 11, 28).toUTCString());
        expect(events[1].end.toUTCString()).to.be.equal(new Date(2015, 0, 10, 23, 59, 59, 999).toUTCString());
        expect(events.length).to.equal(2);
        expect(events[1].days[4].events.length).to.equal(1);
    });
    it('will allocate the correct week span for events across two weeks', function () {
        var events = cal.eventsByDay();
        expect(events[0].date.toUTCString()).to.equal(new Date(2014, 11, 28, 0, 0, 0).toUTCString());
        expect(events.slice(-1)[0].date.toUTCString()).to.equal(new Date(2015, 0, 10, 0, 0, 0).toUTCString());
    });
    it('will implicitly have "currentMonth" values', function () {
        var current = cal['currentMonth']();
        expect(current.month).to.equal(11);
        expect(current.year).to.equal(2014);
    });
    it('will allocate correct number of weeks to MonthEvent', function () {
        var month = cal.eventsForMonth();
        expect(month.weeks.length).to.equal(5);
    });
    it('will change the month', function () {
        cal.nextMonth();
        var current = cal['currentMonth']();
        expect(current.year).to.equal(2015);
        expect(current.month).to.equal(0);
    });
});
function addDate(daysFromNow) {
    cal.addEvent(getDate(daysFromNow));
}
function addRange(startDaysFromNow, endDaysFromNow) {
    endDaysFromNow = endDaysFromNow || startDaysFromNow;
    var start = getDate(startDaysFromNow);
    var end = getDate(endDaysFromNow);
    cal.addEvent({ start: start, end: end });
}
function getDate(daysFromNow) {
    daysFromNow = daysFromNow || 0;
    var date = new Date(baseDate.getTime());
    date.setDate(date.getDate() + daysFromNow);
    return date;
}
