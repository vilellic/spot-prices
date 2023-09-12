import {describe, expect, test} from '@jest/globals';

var dateUtils = require("./dateUtils");

jest.useFakeTimers()
    .setSystemTime(new Date('2023-09-13'));

test('test date start', () => {
    expect(dateUtils.getTodaySpanStart()).toBe('2023-09-12T21:00:00.000Z')
})