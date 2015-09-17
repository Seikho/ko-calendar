var chai = require('chai');
var KoCal = require('../ko-calendar');
console.log(KoCal);
var expect = chai.expect;
var cal = new KoCal.Calendar();
describe('equivalence tests', function () {
    it('will find two dates equivalent', function () {
        var first = new Date(2015, 1, 1, 1, 1, 1);
        var second = new Date(2015, 1, 1, 23, 59, 59);
        expect(cal.isSameDate(first, second)).to.be.true;
    });
    it('will find two dates to not be equivalent', function () {
        var first = new Date(2015, 1, 1, 1, 1, 1);
        var second = new Date(2015, 1, 2, 0, 0, 1);
        expect(cal.isSameDate(first, second)).to.be.false;
    });
    it('will find two days are in the same week', function () {
        var first = new Date(2015, 8, 13, 0, 0, 0); // Sun 13 Sep 2015 00:00:00
        var second = new Date(2015, 8, 19, 23, 59, 59); // Sun 19 Sep 2015 23:59:59
        expect(cal.isSameWeek(first, second)).to.be.true;
    });
    it('will find two are are not in the same week', function () {
        var first = new Date(2015, 8, 13, 0, 0, 0); // Sun 13 Sep 2015
        var second = new Date(2015, 8, 20, 0, 0, 0); // Sun 20 Sep 2015 00:00:00
        expect(cal.isSameWeek(first, second)).to.be.false;
    });
});
describe('floor and ceiling tests', function () {
    it('will floor a given date', function () {
        var now = new Date();
        var floor = cal.floorToDay(now);
        expect(cal.isSameDate(now, floor)).to.be.true;
        expect(floor.getHours()).to.equal(0);
        expect(floor.getMinutes()).to.equal(0);
        expect(floor.getSeconds()).to.equal(0);
    });
    it('will ceil a given date', function () {
        var now = new Date();
        var ceil = cal.ceilToDay(now);
        expect(cal.isSameDate(now, ceil)).to.be.true;
        expect(ceil.getHours()).to.equal(23);
        expect(ceil.getMinutes()).to.equal(59);
        expect(ceil.getSeconds()).to.equal(59);
        expect(ceil.getMilliseconds()).to.equal(999);
    });
    it('will ceil a date that has 00:00:00 time to 23:59:59.999 the same day', function () {
        var testDate = new Date(2015, 1, 1, 0, 0, 0);
        var ceil = cal.ceilToDay(testDate);
        expect(ceil.getDate()).to.equal(1);
        expect(ceil.getHours()).to.equal(23);
        expect(ceil.getMinutes()).to.equal(59);
        expect(ceil.getSeconds()).to.equal(59);
        expect(ceil.getMilliseconds()).to.equal(999);
    });
    it('will floor a date to start of week', function () {
        var now = new Date(2015, 8, 16); // Wed 16 Sep 2015
        var floor = cal.floorToWeekStart(now);
        var expected = new Date(2015, 8, 13); // Sun 13 Sep 2015
        expect(cal.isSameDate(floor, expected)).to.be.true;
        expect(floor.getHours()).to.equal(0);
        expect(floor.getMinutes()).to.equal(0);
    });
    it('will ceil a date to end of week', function () {
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
//# sourceMappingURL=index.js.map