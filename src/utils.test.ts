import { isEmpty, filterRecord, stripEmpty, isObject } from './utils';

describe('utils', () => {
    it('"isEmpty" \'\'', () => {
        expect(isEmpty('')).toEqual(true);
    });
    it('"isEmpty" 0', () => {
        expect(isEmpty(0)).toEqual(false);
    });
    it('"isEmpty" text', () => {
        expect(isEmpty('text')).toEqual(false);
    });
    it('"isEmpty" null', () => {
        expect(isEmpty(null)).toEqual(true);
    });
    it('"isEmpty" undefined', () => {
        expect(isEmpty(undefined)).toEqual(true);
    });
    it('"isEmpty" array', () => {
        expect(isEmpty([])).toEqual(false);
    });
    it('"isEmpty" object', () => {
        expect(isEmpty({})).toEqual(false);
    });

    const record = { a: 0, b: 1, c: undefined };
    it('"filterRecord" filtered', () => {
        expect(filterRecord(record, (n) => !!n)).toEqual({ b: 1 });
    });
    it('"filterRecord" unfiltered', () => {
        expect(filterRecord(record, (n) => n !== 2)).toEqual(record);
    });

    it('"stripEmpty"', () => {
        expect(stripEmpty(record)).toEqual({ a: 0, b: 1 });
    });

    it('"isObject" object', () => {
        expect(isObject(record)).toEqual(true);
    });
    it('"isObject" array', () => {
        expect(isObject([])).toEqual(false);
    });
    it('"isObject" string', () => {
        expect(isObject('1')).toEqual(false);
    });
    it('"isObject" number', () => {
        expect(isObject(1)).toEqual(false);
    });
    it('"isObject" null', () => {
        expect(isObject(null)).toEqual(false);
    });
    it('"isObject" empty object', () => {
        expect(isObject({})).toEqual(true);
    });
    it('"isObject" date', () => {
        expect(isObject(new Date())).toEqual(false);
    });
});
