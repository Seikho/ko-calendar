### ko-calendar
An opinionated Knockout Calendar ViewModel in TypeScript

[![NPM version](http://img.shields.io/npm/v/ko-calendar.svg?style=flat)](https://www.npmjs.org/package/ko-calendar)
[![Travis build status](http://img.shields.io/travis/Seikho/ko-calendar/master.svg?style=flat)](https://travis-ci.org/Seikho/ko-calendar)

### Requirements
`Knockout` (`ko` object) should be globally available or accessible via `require('knockout')`

### Installation

##### Browser:
Make `ko-calendar.js` available to the client
```html
<script src='https://rawgit.com/seikho/ko-calendar/master/ko-calendar.js'></script>
<script>
    var calendar = new Calender();
</script>
    
```
 
##### TypeScript:
Type definitions are available in `src/typings/ko-calendar/ko-calendar.d.ts`.  
TypeScript ^1.6.0 will resolve the type definitions automatically if the package is a `node_module`.    
```
npm install ko-calendar --save
```
 
##### Usage

**Examples**  
[Without RequireJS/Cajon](http://rawgit.com/seikho/ko-calendar/master/example/index.html)  
[With RequireJS/Cajon](http://rawgit.com/seikho/ko-calendar/master/example/require.html)  
  
*Basic usage:*  
If your objects are [DateRange](#daterange) object, `Date`, `string` that are valid date string, or `number` that are valid date values:  
then the default parser will correctly parse these objects.
  
```javascript
var Calendar = require('ko-calendar').Calendar;
var calendar = new Calendar();
```


*Better usage:*  
If you have more complex objects that might resemble something like `{ date: ..., id: ..., eventName: ... }`
You will need to provide a function to `ko-calendar` to tell it how to extract the `Date` or [DateRange](#daterange) from your custom objects.  

```javascript
var Calendar = require('ko-calendar').Calendar;
//or
import { Calendar } from 'ko-calendar';

// Return a single date
var calParser = function(myObject) {
    return myObject.date;
}

//Return a date range
var calParser = function(myObject) {
    return {
        start: new Date(myObject.startDate),
        end: new Date(myObject.endDate)
    }
}
var calendar = new KoCal.Calendar(calParser);
```

### API
All examples assume an instantiated `Calendar` object called `calendar` is available 

#### startDay(dayOfWeek: number)
The day of week to use when performing week calculations.  
This is based on JavaScript's dayOfWeek. This is zero-based where 0 is Sunday and 6 is Saturday.

#### addEvent
**Also: addEvents**  
*Usage:* `calendar.addEvent(object: any)` or `calendar.addEvents(object: any[])`  
*Returns `void*  
Add an event to the collection. These objects must be parseable by the parser function  
```javascript
calendar.addEvent({ date: new Date() });
calendar.addEvents([{ date: new Date() }, { date: new Date(2015, 1, 1) }]);
```

#### eventsForDate
*Usage:* `calendar.eventsForDate(date: Date)`  
*Returns [DayEvent](#dayevent) object*  
Returns an ordered array of events that *fall on the same day* as the date provided.
```javascript
var events = calender.eventsForDate(new Date(2015, 8, 18)); // Sep 18 2015
```

#### eventsByDay
*Usage:* `calendar.eventsByDay()`
*Returns Array<[DayEvent](#dayevent)> object*  
Returns an ordered array of [DayEvent](#dayevent) objects derived from the `events` collection.  
The first `DayEvent` will always be start of week of the first Date in the `events` collection.  
The last `DayEvent` will always be end of the week of the last Date in the `events` collection.
```javascript
var events = calendar.eventsByDay();
```

### eventsByWeek
*Usage:* `calendar.eventsByWeek()`  
*Returns Array<[WeekEvent](#weekevent)> object*
```javascript
var events = calendar.eventsByWeek();
```
#### DateRange
```javascript
interface {
    start: Date;
    end: Date;
}
```

#### Event
```javascript
interface Event {
    date: Date;
    value: any; // User object
}
```

#### DayEvent
```javascript
interface DayEvent {
    date: Date;
    events: Event[]
}
```

#### WeekEvent
```javascript
interface {
    start: Date;
    end: Date;
    weekNumber: number;
    days: Array<DayEvent>;
}
```

### Internal API functions

#### isSameDate
*Usage:* `calander.isSameDate(left: Date, right: Date)`  
*Returns `boolean`*  
Determines whether two dates fall on the same day

#### isSameWeek
*Usage:* `calander.isSameWeek(left: Date, right: Date)`  
*Returns `boolean`*  
Determines whether two dates fall in the same week

#### floorToDay
*Usage:* `calander.floorToDay(date: Date)`  
*Returns `Date`*  
Returns a new `Date` object that is the start of the provided day (00h00m00s)

#### ceilToDay
*Usage:* `calander.ceilToDay(date: Date)`  
*Returns `Date`*  
Returns a new `Date` object that is the end of the provided day (23h59m59m999ms)

#### floorToWeekStart
*Usage:* `calander.floorToWeekStart(date: Date)`  
*Returns `Date`*  
Returns a new `Date` object that is the beginning of the week of the provided date (00h00m00s)

#### ceilToWeekEnd
*Usage:* `calander.floorToWeekStart(date: Date)`  
*Returns `Date`*  
Returns a new `Date` object that is the end of the week of the provided date (23h59m59s999ms)

#### getDateRange
*Usage:* `calander.getDateRange()`  
*Returns `{ start: Date, end: Date }`*  
Returns an object containing the date range of events in the current collection.  
The `start` and `end` dates have `floorToWeekStart` and `ceilToWeekEnd` applied to them

### License
MIT