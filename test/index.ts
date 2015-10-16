import chai = require('chai');
import * as Types from '../index';
var KoCalendar = require('../src/ko-calendar');
var expect = chai.expect;
var cal: Types.Calendar = new KoCalendar();

var baseDate = new Date(2015, 0, 1); // Thu, 1 Jan 2015

describe('equivalence tests', () => {

    it('will find two dates equivalent', () => {
        var first = new Date(2015, 1, 1, 1, 1, 1);
        var second = new Date(2015, 1, 1, 23, 59, 59);
        expect(cal.isSameDate(first, second)).to.be.true;
    });

    it('will find two dates to not be equivalent', () => {
        var first = new Date(2015, 1, 1, 1, 1, 1);
        var second = new Date(2015, 1, 2, 0, 0, 1);
        expect(cal.isSameDate(first, second)).to.be.false;
    });

    it('will find two days are in the same week', () => {
        var first = new Date(2015, 8, 13, 0, 0, 0); // Sun 13 Sep 2015 00:00:00
        var second = new Date(2015, 8, 19, 23, 59, 59); // Sun 19 Sep 2015 23:59:59
        expect(cal.isSameWeek(first, second)).to.be.true;
    });

    it('will find two are are not in the same week', () => {
        var first = new Date(2015, 8, 13, 0, 0, 0); // Sun 13 Sep 2015
        var second = new Date(2015, 8, 20, 0, 0, 0); // Sun 20 Sep 2015 00:00:00
        expect(cal.isSameWeek(first, second)).to.be.false;
    });

    it('will find that a date is in range of a DateRange', () => {
        var range = {
            start: getDate(),
            end: getDate(3)
        };
        expect(cal.isInRange(getDate(), range)).to.be.true;
        expect(cal.isInRange(getDate(1), range)).to.be.true;
        expect(cal.isInRange(getDate(2), range)).to.be.true;
        expect(cal.isInRange(getDate(3), range)).to.be.true;
    });

    it('will find that a date is not in range of a DateRange', () => {
        var range = {
            start: getDate(),
            end: getDate(3)
        };
        range.end.setSeconds(range.end.getSeconds() - 1);

        var justBefore = new Date(getDate().setSeconds(getDate().getSeconds() - 1));
        var justAfter = new Date(getDate(3).setSeconds(getDate(3).getSeconds() + 1));
        expect(cal.isInRange(justBefore, range)).to.be.false;
        expect(cal.isInRange(justAfter, range)).to.be.false;
    });

});

describe('ordered days of week tests', () => {
    it('will calculate the ordered days of the week with no data provided', () => {
        var weekDays = cal.weekDays();
        expect(weekDays[0]).to.equal('Sun');
        expect(weekDays[6]).to.equal('Sat');
    });
    
    it('will calculate the ordered days of the week with an altered start day', () => {
       cal.startDay(4);
       var weekDays = cal.weekDays();
       expect(weekDays[0]).to.equal('Thu');
       expect(weekDays[6]).to.equal('Wed'); 
    });
});

describe('start/end day value tests', () => {
    it('will find endDay:6 when start:0', () => {
        cal.startDay(0);
        expect(cal.endDay()).to.equal(6);
    });

    it('will find endDay:0 when start:1', () => {
        cal.startDay(1);
        expect(cal.endDay()).to.equal(0);
    });

    it('will find endDay:1 when start:2', () => {
        cal.startDay(2);
        expect(cal.endDay()).to.equal(1);
    });

    it('will find endDay:2 when start:3', () => {
        cal.startDay(3);
        expect(cal.endDay()).to.equal(2);
    });

    it('will find endDay:3 when start:4', () => {
        cal.startDay(4);
        expect(cal.endDay()).to.equal(3);
    });

    it('will find endDay:4 when start:5', () => {
        cal.startDay(5);
        expect(cal.endDay()).to.equal(4);
    });

    it('will find endDay:5 when start:6', () => {
        cal.startDay(6);
        expect(cal.endDay()).to.equal(5);
    });

    it('will amend a value outside of 0-6 that is provided to startDay', () => {
        cal.startDay(7);
        expect(cal.startDay()).to.equal(0);
        expect(cal.endDay()).to.equal(6);
    });
})

describe('floor and ceiling tests', () => {

    it('will floor a given date', () => {
        var now = new Date();
        var floor = cal.floorToDay(now);
        var expected = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

        expect(floor.toUTCString()).to.equal(expected.toUTCString());
    });

    it('will ceil a given date', () => {
        var now = new Date();
        var ceil = cal.ceilToDay(now);
        var expected = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        expect(ceil.toUTCString()).to.equal(expected.toUTCString());
    });

    it('will ceil a date that has 00:00:00 time to 23:59:59.999 the same day', () => {
        cal.startDay(0);
        var testDate = new Date(2015, 1, 1, 0, 0, 0);
        var ceil = cal.ceilToDay(testDate);
        var expected = new Date(testDate.getFullYear(), testDate.getMonth(), testDate.getDate(), 23, 59, 59, 999);

        expect(ceil.toUTCString()).to.equal(expected.toUTCString());
    });

    it('will floor a date to start of week', () => {
        var now = new Date(2015, 8, 16); // Wed 16 Sep 2015
        var floor = cal.floorToWeekStart(now);
        var expected = new Date(2015, 8, 13, 0, 0, 0); // Sun 13 Sep 2015
        
        expect(floor.toUTCString()).to.equal(expected.toUTCString());
    });

    it('will ceil a date to end of week', () => {
        var now = new Date(2015, 8, 16); // Wed 16 Sep 2015 00:00:00
        var ceil = cal.ceilToWeekEnd(now);
        var expected = new Date(2015, 8, 19); // Sun 19 Sep 2015 23:59:59.000
        expect(cal.isSameDate(ceil, expected)).to.be.true;
        expect(ceil.getHours()).to.equal(23);
        expect(ceil.getMinutes()).to.equal(59);
        expect(ceil.getSeconds()).to.equal(59);
        expect(ceil.getMilliseconds()).to.equal(999);
    });
});

describe('get events tests', () => {
    addRange(0); // Thu 1 Jan
    addRange(1); // Fri 2 Jan
    addRange(-1, 2);

    it('will find the date range', () => {
        var extremes = cal.getDateRange();
        var start = extremes.start;
        var end = extremes.end;
        expect(start.getDay()).to.equal(cal.startDay());
        expect(end.getDay()).to.equal(cal.endDay());
    });

    it('will allocate events to their corresponding DayEvent', () => {
        var events = cal.eventsByDay();

        expect(events[0].events.length).to.equal(0);
        expect(events[1].events.length).to.equal(0);
        expect(events[2].events.length).to.equal(0);
        expect(events[3].events.length).to.equal(1);
        expect(events[4].events.length).to.equal(2);
        expect(events[5].events.length).to.equal(2);
        expect(events[6].events.length).to.equal(1);
    });

    it('will allocate the correct number of weeks', () => {
        var events = cal.eventsByWeek();
        expect(events.length).to.equal(1);
    });

    it('will allocate the correct week span', () => {
        var events = cal.eventsByWeek();
        expect(events[0].start.toUTCString()).to.be.equal(new Date(2014, 11, 28).toUTCString());
        expect(events[0].end.toUTCString()).to.be.equal(new Date(2015, 0, 3, 23, 59, 59, 999).toUTCString());
    });

    it('will add an additional week after adding more events', () => {
        addDate(7);
        var events = cal.eventsByWeek();
        expect(events[0].start.toUTCString()).to.be.equal(new Date(2014, 11, 28).toUTCString());
        expect(events[1].end.toUTCString()).to.be.equal(new Date(2015, 0, 10, 23, 59, 59, 999).toUTCString());
        expect(events.length).to.equal(2);
        expect(events[1].days[4].events.length).to.equal(1);
    });

    it('will allocate the correct week span for events across two weeks', () => {
        var events = cal.eventsByDay();
        expect(events[0].date.toUTCString()).to.equal(new Date(2014, 11, 28, 0, 0, 0).toUTCString());
        expect(events.slice(-1)[0].date.toUTCString()).to.equal(new Date(2015, 0, 10, 0, 0, 0).toUTCString());
    });
});

function addDate(daysFromNow?: number) {
    cal.addEvent(getDate(daysFromNow));
}

function addRange(startDaysFromNow: number, endDaysFromNow?: number) {
    endDaysFromNow = endDaysFromNow || startDaysFromNow;
    var start = getDate(startDaysFromNow);
    var end = getDate(endDaysFromNow);

    cal.addEvent({ start, end });
}

function getDate(daysFromNow?: number) {
    daysFromNow = daysFromNow || 0;
    var date = new Date(baseDate.getTime());

    date.setDate(date.getDate() + daysFromNow);
    return date;
}