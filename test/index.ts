import chai = require('chai');
import Types = require("ko-calendar");
var KoCal = require('../ko-calendar');
console.log(KoCal);
var expect = chai.expect;

var cal: Types.Calendar = new KoCal.Calendar();

describe('equivalence tests', () => {

    it('will correctly find two dates equivalent', () => {
        var first = new Date(2015, 1, 1, 1, 1, 1);
        var second = new Date(2015, 1, 1, 23, 59, 59);
        expect(cal.isSameDate(first, second)).to.be.true;
    });

    it('will correctly find two dates to not be equivalent', () => {
        var first = new Date(2015, 1, 1, 1, 1, 1);
        var second = new Date(2015, 1, 2, 0, 0, 1);
        expect(cal.isSameDate(first, second)).to.be.false;
    });

    it('will correctly find two days are in the same week', () => {
        var first = new Date(2015, 8, 13, 0, 0, 0); // Sun 13 Sep 2015 00:00:00
        var second = new Date(2015, 8, 19, 23, 59, 59); // Sun 19 Sep 2015 23:59:59
        expect(cal.isSameWeek(first, second)).to.be.true;
    });

    it('will correctly find two are are not in the same week', () => {
        var first = new Date(2015, 8, 13, 0, 0, 0); // Sun 13 Sep 2015
        var second = new Date(2015, 8, 20, 0, 0, 0); // Sun 20 Sep 2015 00:00:00
        expect(cal.isSameWeek(first, second)).to.be.false;
    });

});

describe('floor and ceiling tests', () => {

    it('will correctly floor a given date', () => {
        var now = new Date();
        var floor = cal.floorToDay(now);

        expect(cal.isSameDate(now, floor)).to.be.true;
        expect(floor.getHours()).to.equal(0);
        expect(floor.getMinutes()).to.equal(0);
        expect(floor.getSeconds()).to.equal(0);
    });

    it('will correctly ceiling a given date', () => {
        var now = new Date();

        var tomorrow = now;
        tomorrow.setDate(tomorrow.getDate() + 1);

        var ceil = cal.ceilToDay(now);
        expect(cal.isSameDate(tomorrow, ceil)).to.be.true;
        expect(ceil.getHours()).to.equal(0);
        expect(ceil.getMinutes()).to.equal(0);
        expect(ceil.getSeconds()).to.equal(0);
    });

    it('will correctly floor a date to start of week', () => {
        var now = new Date(2015, 8, 16); // Wed 16 Sep 2015
        var floor = cal.floorToWeekStart(now);
        var expected = new Date(2015, 8, 13); // Sun 13 Sep 2015
        expect(cal.isSameDate(floor, expected)).to.be.true;
        expect(floor.getHours()).to.equal(0);
        expect(floor.getMinutes()).to.equal(0);
    });

    it('will correctly ceiling a date to end of week', () => {
        var now = new Date(2015, 8, 16); // Wed 16 Sep 2015 00:00:00
        var ceil = cal.ceilToWeekEnd(now);
        var expected = new Date(2015, 8, 20); // Sun 20 Sep 2015 00:00:00
        expect(cal.isSameDate(ceil, expected)).to.be.true;
        expect(ceil.getHours()).to.equal(0);
        expect(ceil.getMinutes()).to.equal(0);
    });


});