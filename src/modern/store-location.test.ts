import { parseStringStoreLocation } from './store-location';

describe('store-location', () => {
    it('"parseStringStoreLocation" empty', () => {
        const storeLocation = parseStringStoreLocation('');
        expect(storeLocation).toEqual({});
    });
    it('"parseStringStoreLocation" normal', () => {
        const storeLocation = parseStringStoreLocation('a|b|c|d');
        expect(storeLocation).toEqual({
            domain: 'a',
            action: 'b',
            method: 'c',
            uuid: 'd'
        });
    });
});
