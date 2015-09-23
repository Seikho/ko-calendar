import * as Types from './index';
import Parser = Types.Parser;
import WeekEvent = Types.WeekEvent;
import DayEvent = Types.DayEvent;
import BaseCalendar = Types.Calendar;
import CalendarEvent = Types.CalendarEvent;
import DateRange = Types.DateRange;

declare var ko;
var requireExists = typeof window === 'undefined'
    ? typeof require === 'function'
    : typeof window['require'] === 'function';



if (typeof ko === 'undefined') {
    if (!requireExists) {
        throw new Error("Unable to load knockout");
    }

    ko = typeof window === 'undefined' ? require('knockout') : window['require']('knockout');
}

class Calendar implements BaseCalendar {

    constructor(parser?: Parser) {
        if (!parser) return;

        if (typeof parser !== 'function') {
            console.warn('Parser function provided is not a function and has been ignored');
            return;
        }

        this.parser = parser;
    }

    eventsDate = ko.observable(new Date());

    parser: Parser = (userObject: any) => {
        // Default behaviour
        // This should be overridden by the consumer
        
        if (userObject.start instanceof Date && userObject.end instanceof Date)
            return userObject;

        var date: Date;

        if (userObject instanceof Date)
            date = new Date(userObject.getTime());


        if (typeof userObject === 'string' || typeof userObject === 'number') {
            var returnDate = new Date(<any>userObject);
            if (!isNaN(returnDate.getTime())) date = returnDate;
        }

        if (userObject.date instanceof Date) date = new Date(userObject.date.getTime());

        if (typeof date === 'string' || typeof date === 'number') {
            var returnDate = new Date(<any>date);
            if (!isNaN(returnDate.getTime())) date = returnDate;
        }

        if (date instanceof Date)
            return { start: new Date(date.getTime()), end: date };

        throw new Error(`Invalid object parsed [${JSON.stringify(userObject) }]`);
    }
    
    /**
     * Handle the case where a user provided Parser returns a Date, not a DateRange
     */
    parsedObjectToDateRange(parsedObject: Date|DateRange): DateRange {
        if (parsedObject instanceof Date) {
            return {
                start: new Date(parsedObject.getTime()),
                end: new Date(parsedObject.getTime())
            };
        }
        return <DateRange>parsedObject;
    }

    events: KnockoutObservableArray<any> = ko.observableArray([]);

    parsedEvents: KnockoutComputed<Array<CalendarEvent>> = ko.computed((): Array<CalendarEvent> => {
        var parsedObjects: CalendarEvent[] = this.events().map(userObject => {
            var rawParsed = this.parser(userObject);
            var parsed = this.parsedObjectToDateRange(rawParsed);
            
            return {
                start: parsed.start,
                end: parsed.end,
                value: userObject
            };
        });

        return this.sortByDate(parsedObjects);
    });

    privateStartDay = ko.observable(0);

    startDay = ko.pureComputed({
        read: () => this.privateStartDay(),
        write: (dayOfWeek: number) => this.privateStartDay(Math.abs(dayOfWeek) % 7),
        owner: this
    });

    endDay = ko.computed(() => this.startDay() === 0 ? 6 : this.startDay() - 1);

    addEvent(userObject: any): void {
        this.events.push(userObject);
    }

    addEvents(userObjects: any[]): void {
        var events = this.events();
        events = events.concat(userObjects);
        this.events(events);
    }

    eventsForDate: KnockoutComputed<DayEvent> = ko.computed((): DayEvent => {
        var forDate = this.eventsDate();
        var events = this.parsedEvents().filter(event => this.isInRange(forDate, event));

        return {
            date: this.floorToDay(forDate),
            events
        };
    });

    eventsByDay: KnockoutComputed<Array<DayEvent>> = ko.computed((): Array<DayEvent> => {
        var events = this.parsedEvents();
        var range = this.getDateRange();
        var dayEvents: DayEvent[] = [];

        var iterator = new Date(range.start.getTime());
        while (iterator < range.end) {
            var currentEvents = events.filter(event => this.isInRange(iterator, event));
            dayEvents.push({
                date: new Date(iterator.getTime()),
                events: currentEvents
            });
            iterator.setDate(iterator.getDate() + 1);
        }

        return dayEvents;
    });

    eventsByWeek: KnockoutComputed<Array<WeekEvent>> = ko.computed((): Array<WeekEvent> => {
        var events = this.parsedEvents();
        var range = this.getDateRange();
        var weekEvents: WeekEvent[] = [];

        var iterator = new Date(range.start.getTime());
        var weekNumber = 1;
        while (iterator < range.end) {
            var currentDay = iterator;
            var endOfWeek = this.ceilToWeekEnd(iterator)
            var week: WeekEvent = {
                start: new Date(iterator.getTime()),
                end: endOfWeek,
                weekNumber,
                days: []
            };

            while (currentDay < endOfWeek) {
                var dayEvents = events.filter(event => this.isInRange(currentDay, event));
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

    sortByDate(events: Array<CalendarEvent>) {
        var newArray = events.slice();

        return newArray.sort((left, right) => left.start > right.start ? 1 : -1);
    }

    weeksInDateRange(start: Date, end: Date) {
        var weeks = 0;
        var iterator = new Date(start.getTime());;

        while (iterator <= end) {
            weeks++;
            iterator.setDate(iterator.getDate() + 7);
        }

        return weeks;
    }

    isSameDate(left: Date, right: Date): boolean {
        var sameYear = left.getFullYear() === right.getFullYear();
        var sameMonth = left.getMonth() === right.getMonth();
        var sameDay = left.getDate() === right.getDate();

        return sameYear && sameMonth && sameDay;
    }

    isSameWeek(left: Date, right: Date): boolean {
        var sameYear = left.getFullYear() === right.getFullYear();
        var sameMonth = left.getMonth() === right.getMonth();
        if (!sameYear || !sameMonth) return false;

        var leftFloor = this.floorToWeekStart(left);
        var leftCeil = this.ceilToWeekEnd(left);

        return right >= leftFloor && right <= leftCeil;
    }
    
    isInRange(date: Date, range: DateRange): boolean {
        var sameAsStart = this.isSameDate(date, range.start);
        var sameAsEnd = this.isSameDate(date, range.end);
        var isInRange = date >= range.start && date <= range.end;
        
        return sameAsStart || sameAsEnd || isInRange;
    }

    floorToDay(date: Date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    ceilToDay(date: Date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
    }

    floorToWeekStart(date: Date) {
        var currentDay = date.getDay();
        var toDay = this.startDay();
        var downDate = new Date(date.getTime());

        if (currentDay > toDay)
            downDate.setDate(downDate.getDate() - (currentDay - toDay));

        if (currentDay < toDay)
            downDate.setDate(downDate.getDate() - (currentDay + (7 - toDay)));

        return this.floorToDay(downDate);
    }

    ceilToWeekEnd(date: Date) {
        var currentDay = date.getDay();
        var toDay = this.endDay();
        var upDate = new Date(date.getTime());

        if (currentDay > toDay)
            upDate.setDate(upDate.getDate() + (7 - currentDay + toDay));

        if (currentDay < toDay)
            upDate.setDate(upDate.getDate() + (toDay - currentDay));

        return this.ceilToDay(upDate);
    }

    getDateRange(): DateRange {
        var events = this.parsedEvents();
        var start, end;

        events.forEach(event => {
            if (start == null || event.start < start) start = new Date(event.start.getTime());
            if (end == null || event.end > end) end = new Date(event.end.getTime());
        });

        if (start == null) start = new Date();
        if (end == null) end = new Date(start.getTime());
        
        // We get a little bit opinionated here...
        start = this.floorToWeekStart(start);
        end = this.ceilToWeekEnd(end);

        return { start, end };
    }
}

if (typeof exports !== 'undefined') {
    module.exports = Calendar;
    module.exports.default = Calendar;
}