/// <reference path="../knockout/knockout.d.ts" />

declare module "ko-calendar" {

    class Calendar {
        constructor(parser?: Parser);

        parser: Parser;

        eventsDate: KnockoutObservable<Date>;

        events: KnockoutObservableArray<any>;

        startDay: KnockoutObservable<number>;

        endDay: KnockoutComputed<number>;

        addEvent(userObject: any): void;

        eventsByDay: KnockoutComputed<Array<DayEvent>>;

        eventsByWeek: KnockoutComputed<Array<WeekEvent>>;

        eventsForDate: KnockoutComputed<DayEvent>;

        weeksInDateRange(start: Date, end: Date): number;

        isSameDate(left: Date, right: Date): boolean;

        isSameWeek(left: Date, right: Date): boolean;

        floorToDay(date: Date): Date;

        ceilToDay(date: Date): Date;

        floorToWeekStart(date: Date): Date;

        ceilToWeekEnd(date: Date): Date;

        getDateRange(): DateRange;
    }

    interface Parser {
        (userObject: any): DateRange;
    }

    interface WeekEvent extends DateRange {
        weekNumber: number;
        days: Array<DayEvent>;
        start: Date;
        end: Date;
    }

    interface DayEvent {
        date: Date;
        events: Event[];
    }

    interface Event {
        date: Date;
        value: any;
    }

    interface DateRange {
        start: Date;
        end: Date;
    }
}