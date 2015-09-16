var ko;
var requireExists = typeof window === 'undefined'
    ? typeof require === 'function'
    : typeof window['require'] === 'function';

if (typeof ko === 'undefined' && !requireExists)
    throw new Error("Unable to load knockout");

ko = ko || typeof window === 'undefined' ? require('knockout') : window['require']('knockout');

export class Calendar {

    events: KnockoutObservableArray<any> = ko.observableArray([]);
    startDay = ko.observable(0);
    endDay = ko.computed(() => this.startDay() + 6);

    addEvent(date: Date, object: any): void {

    }

    getEventsForDate(date: Date | number, dateDay?: number): any[] {
        return null;
    }

    getEvents(): any[] {
        return null;
    }

    getEventsByWeek(): WeekEvents {
        return null;
    }

    weeksInDateRange(start: Date, end: Date) {
        var weeks = 0;
        var iterator = start;

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
        var leftCeil = this.ceilingToWeekEnd(left);
        
        return right >= leftFloor && right < leftCeil;  
    }

    floorToDay(date: Date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    ceilToDay(date: Date) {
        var upDate = date;
        upDate.setDate(upDate.getDate() + 1);
        return new Date(upDate.getFullYear(), upDate.getMonth(), upDate.getDate());
    }

    floorToWeekStart(date: Date) {
        var currentDay = date.getDay();
        var toDay = this.startDay();
        var downDate = date;

        if (currentDay > toDay)
            downDate.setDate(downDate.getDate() - (currentDay - toDay));

        if (currentDay < toDay)
            downDate.setDate(downDate.getDate() - (currentDay + (7 - toDay)));

        return this.floorToDay(downDate);
    }

    ceilingToWeekEnd(date: Date) {
        var currentDay = date.getDay();
        var toDay = this.endDay();
        var upDate = date;

        if (currentDay > toDay)
            upDate.setDate(upDate.getDate() + (7 - currentDay + toDay));

        if (currentDay < toDay)
            upDate.setDate(upDate.getDate() + (toDay - currentDay));

        return this.ceilToDay(upDate);
    }
}

interface WeekEvents {
    [weekNumber: number]: { [dayNumber: number]: any[] }
}

