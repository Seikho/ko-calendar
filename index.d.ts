export class Calendar {
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

    isInRange(date: Date, range: DateRange): boolean;

    floorToDay(date: Date): Date;

    ceilToDay(date: Date): Date;

    floorToWeekStart(date: Date): Date;

    ceilToWeekEnd(date: Date): Date;

    getDateRange(): DateRange;
}

export interface Parser {
    (userObject: any): DateRange;
}

export interface WeekEvent extends DateRange {
    weekNumber: number;
    days: Array<DayEvent>;
    start: Date;
    end: Date;
}

export interface DayEvent {
    date: Date;
    events: CalendarEvent[];
}

export interface CalendarEvent {
    start: Date;
    end: Date;
    value: any;
}

export interface DateRange {
    start: Date;
    end: Date;
}