import * as Types from '../index.d.ts';
import Parser = Types.Parser;
import WeekEvent = Types.WeekEvent;
import DayEvent = Types.DayEvent;
import BaseCalendar = Types.Calendar;
import CalendarEvent = Types.CalendarEvent;
import DateRange = Types.DateRange;
import MonthEvent = Types.MonthEvent;
import DE = require('date-equality');

export = Calendar;

declare var ko: any;


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
    parsedObjectToDateRange(parsedObject: Date | DateRange): DateRange {
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
        write: (dayOfWeek: number) => {
            this.privateStartDay(DE.startDay(dayOfWeek))
        },
        owner: this
    });

    endDay = ko.computed(() => DE.endDay(this.privateStartDay()));

    addEvent = (userObject: any): void => {
        this.events.push(userObject);
    }

    addEvents = (userObjects: any[]): void => {
        var events = this.events();
        events = events.concat(userObjects);
        this.events(events);
    }

    eventsForDate: KnockoutComputed<DayEvent> = ko.computed((): DayEvent => {
        var forDate = this.eventsDate();
        var events = this.parsedEvents().filter(event => DE.inRange(forDate, event));

        return {
            date: DE.floorDay(forDate),
            events
        };
    });

    eventsByDay: KnockoutComputed<Array<DayEvent>> = ko.computed((): Array<DayEvent> => {
        var events = this.parsedEvents();
        var range = this.getDateRange();
        var dayEvents: DayEvent[] = [];

        var iterator = new Date(range.start.getTime());
        while (iterator < range.end) {
            var currentEvents = events.filter(event => DE.inRange(iterator, event));
            dayEvents.push({
                date: new Date(iterator.getTime()),
                events: currentEvents
            });
            iterator.setDate(iterator.getDate() + 1);
        }

        return dayEvents;
    });

    eventsForWeek = (date: Date): WeekEvent => {
        var iterator = DE.floorWeek(date, this.privateStartDay());
        var end = DE.ceilWeek(date, this.privateStartDay());
        var events = this.parsedEvents();

        var weekEvent: WeekEvent = {
            start: DE.floorWeek(date, this.privateStartDay()),
            end,
            days: []
        };

        while (iterator <= end) {
            var dayEvents = events.filter(event => DE.inRange(iterator, event));
            weekEvent.days.push({
                date: new Date(iterator.getTime()),
                events: dayEvents
            });

            iterator.setDate(iterator.getDate() + 1);
        }

        return weekEvent;
    }

    eventsByWeek: KnockoutComputed<Array<WeekEvent>> = ko.computed(() => {
        var events = this.parsedEvents();
        var range = this.getDateRange();
        var weekEvents: WeekEvent[] = [];

        var iterator = new Date(range.start.getTime());
        
        var canAddWeek = () => {
            var ceil = DE.ceilWeek(iterator, this.privateStartDay());
            return ceil <= range.end;
        }
        
        var to = (date: Date) => `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;

        while (canAddWeek()) {
            var weekEvent = this.eventsForWeek(iterator);
            weekEvents.push(weekEvent);
            iterator.setDate(iterator.getDate() + 7);
        }

        return weekEvents;
    });


    currentMonth: KnockoutObservable<{ year: number, month: number }> = ko.observable({ year: 0, month: 0 });

    eventsForMonth: KnockoutComputed<MonthEvent> = ko.computed(() => {
        var weeks: Array<WeekEvent> = [];
        var current = this.currentMonth();

        var iterator = new Date(current.year, current.month, 1);
        var isThisMonth = () => {
            var floor = DE.floorWeek(iterator, this.privateStartDay());
            var ceil = DE.ceilWeek(iterator, this.privateStartDay());
            return floor.getMonth() === current.month || ceil.getMonth() === current.month;
        }

        while (isThisMonth()) {
            var weekEvent = this.eventsForWeek(iterator);
            weeks.push(weekEvent);
            iterator.setDate(iterator.getDate() + 7);
        }

        var events = this.parsedEvents();
        var start = weeks[0].start;
        var end = weeks[weeks.length - 1].end;
        var eventsBefore = events.filter(event => event.end < start).length;
        var eventsAfter = events.filter(event => event.start > end).length;

        return {
            weeks,
            start,
            end,
            before: eventsBefore,
            after: eventsAfter
        }
    });

    previousMonth = () => {
        var current = this.currentMonth();
        current.month--;

        if (current.month < 0) {
            current.month = 11;
            current.year--;
        }

        this.currentMonth(current);
    }

    nextMonth = () => {
        var current = this.currentMonth();
        current.month++;

        if (current.month > 11) {
            current.month = 0;
            current.year++;
        }

        this.currentMonth(current);
    }

    firstMonth = () => {
        var firstEvent = this.eventsByDay()[0];
        if (!firstEvent) return { year: new Date().getFullYear(), month: new Date().getMonth() };
        return { year: firstEvent.date.getFullYear(), month: firstEvent.date.getMonth() };
    }


    weekDays = ko.computed(() => {
        var days = this.eventsByDay().slice(0, 7);
        return days.map(day => day.date.toString().slice(0, 3));
    });
    
    sortByDate(events: Array<CalendarEvent>) {
        var newArray = events.slice();

        return newArray.sort((left, right) => left.start > right.start ? 1 : -1);
    }

    weeksInDateRange (start: Date, end: Date) {
        var weeks = 0;
        var iterator = new Date(start.getTime());;

        while (iterator <= end) {
            weeks++;
            iterator.setDate(iterator.getDate() + 7);
        }

        return weeks;
    }
    
    getDateRange(): DateRange {
        var events = this.parsedEvents();
        var dates = [];

        events.forEach(event => {
            dates.push(event.start);
            dates.push(event.end);
        });

        var range = DE.dateRange(dates);

        return {
            start: DE.floorWeek(range.start, this.privateStartDay()),
            end: DE.ceilWeek(range.end, this.privateStartDay())
        };
    }
}

if (typeof require === 'undefined' && typeof window !== 'undefined') window['Calendar'] = Calendar;