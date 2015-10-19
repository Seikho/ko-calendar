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
if (typeof ko === 'undefined')
    throw new Error('Knockout is required to use Ko-Calendar');

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
    currentMonth: KnockoutObservable<{ year: number, month: number }> = ko.observable({ year: 0, month: 0 });

    eventsForMonth: KnockoutComputed<MonthEvent> = ko.computed(() => {
        var weeks = this.eventsByWeek();
        var current = this.currentMonth();
        var isMonth = (date: Date) => date.getFullYear() === current.year && date.getMonth() === current.month;

        var weeks = weeks.filter(week => isMonth(week.start) || isMonth(week.end));

        return {
            weeks,
            start: null,
            end: null
        }
    });

    previousMonth = () => {

    }

    nextMonth = () => {

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
        return DE.sameDate(left, right);
    }

    isSameWeek(left: Date, right: Date): boolean {
        return DE.sameWeek(left, right, this.privateStartDay());
    }

    isInRange(date: Date, range: DateRange): boolean {
        return DE.inRange(date, range);
    }

    floorToDay(date: Date) {
        return DE.floorDay(date);
    }

    ceilToDay(date: Date) {
        return DE.ceilDay(date);
    }

    floorToWeekStart(date: Date) {
        return DE.floorWeek(date, this.privateStartDay());
    }

    ceilToWeekEnd(date: Date) {
        return DE.ceilWeek(date, this.privateStartDay());
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
            start: this.floorToWeekStart(range.start),
            end: this.ceilToWeekEnd(range.end)
        };
    }
}

if (typeof window !== 'undefined') window['Calendar'] = Calendar;