import {
    isEmpty,
    filterRecord,
    stripEmpty,
    isObject,
    stringReplace,
    normalizePath,
    mergeUrl,
    trimDash
} from './utils';

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

    it('"stringReplace" simple', () => {
        expect(
            stringReplace(
                'https://example.com/users/{id}/details?name={name}',
                { id: 2, name: 'cj' }
            )
        ).toEqual('https://example.com/users/2/details?name=cj');
    });

    it('"stringReplace" multiple', () => {
        expect(
            stringReplace('https://example.com/users/{id}/details?id={id}', {
                id: 2
            })
        ).toEqual('https://example.com/users/2/details?id=2');
    });

    it('"stringReplace" different comparer', () => {
        expect(
            stringReplace(
                'https://example.com/users/:id/details',
                {
                    id: 2
                },
                (key) => `:${key}`
            )
        ).toEqual('https://example.com/users/2/details');
    });

    it('"normalizePath" 0', () => {
        expect(normalizePath('/')).toEqual('');
    });
    it('"normalizePath" 1', () => {
        expect(normalizePath('/0')).toEqual('0');
    });
    it('"normalizePath" 2', () => {
        expect(normalizePath('/0/')).toEqual('0');
    });
    it('"normalizePath" 3', () => {
        expect(normalizePath('0')).toEqual('0');
    });
    it('"normalizePath" 4', () => {
        expect(normalizePath('0/')).toEqual('0');
    });
    it('"normalizePath" 5', () => {
        expect(normalizePath('/0/1')).toEqual('0/1');
    });
    it('"normalizePath" 6', () => {
        expect(normalizePath('/0/1/2/')).toEqual('0/1/2');
    });
    it('"normalizePath" 7', () => {
        expect(normalizePath('/0/1/2////3/')).toEqual('0/1/2/3');
    });

    it('"trimDash" url', () => {
        expect(trimDash('https://example.com/')).toEqual('https://example.com');
    });
    it('"trimDash" front and back', () => {
        expect(trimDash('////example.com//')).toEqual('example.com');
    });

    it('"mergeUrl"', () => {
        expect(mergeUrl('https://example.com/', '/bla')).toEqual(
            'https://example.com/bla'
        );
    });
    it('"mergeUrl" just first', () => {
        expect(mergeUrl('https://example.com/', '')).toEqual(
            'https://example.com'
        );
    });
});
