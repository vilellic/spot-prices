var dateUtils = require("./dateUtils");

jest.setSystemTime(new Date('2020-01-01'));

test('test date start', () => {
    expect(dateUtils.getTodaySpanStart()).toBe('hep')
})