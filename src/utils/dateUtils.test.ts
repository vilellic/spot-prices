import {expect, test} from '@jest/globals';

var dateUtils = require("./dateUtils");

const fixedFakeDate = new Date('2023-08-22')

jest.useFakeTimers()
    .setSystemTime(fixedFakeDate);

test('parse ISO date', () => {
    const parsedDate = dateUtils.parseISODate("2023-09-13T05:00:00+0300")
    expect(parsedDate.toISOString()).toBe('2023-09-13T02:00:00.000Z')
    expect(new Date(parsedDate)).toBeInstanceOf(Date)
})

test('test getDate', () => {
    expect(dateUtils.getDateStr('1694570400')).toBe('2023-09-13T05:00:00+0300')
})

test('test date span start', () => {
    expect(dateUtils.getTodaySpanStart()).toBe('2023-08-21T21:00:00.000Z')
})

test('test date span end', () => {
    expect(dateUtils.getTodaySpanEnd()).toBe('2023-08-22T20:59:59.999Z')
})

test('test date str', () => {
    expect(dateUtils.getWeekdayAndHourStr(new Date())).toBe('3 Tue')
})
