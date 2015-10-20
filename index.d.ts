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
    
    eventsForMonth: KnockoutComputed<MonthEvent>;
    
    previousMonth: () => void;
    
    nextMonth: () => void;

    eventsForDate: KnockoutComputed<DayEvent>;
    
    weekDays: KnockoutComputed<string[]>;

    weeksInDateRange(start: Date, end: Date): number;

    getDateRange(): DateRange;    
}

export interface Parser {
    (userObject: any): DateRange;
}

export interface MonthEvent extends DateRange {
    weeks: Array<WeekEvent>;
}

export interface WeekEvent extends DateRange {
    days: Array<DayEvent>;
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

export { Calendar as default } 