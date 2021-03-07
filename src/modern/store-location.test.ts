import { StoreLocation } from '../store-location';
import { parseStringStoreLocation, parseStoreLocation } from './store-location';

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
    it('"parseStringStoreLocation" partial', () => {
        const storeLocation = parseStringStoreLocation('a|b||d');
        expect(storeLocation).toEqual({
            domain: 'a',
            action: 'b',
            uuid: 'd'
        });
    });

    const defaultStoreLocation: StoreLocation = {
        domain: 'a',
        action: 'b',
        method: 'get',
        uuid: 'd'
    };

    it('"parseStoreLocation" just default', () => {
        const storeLocation = parseStoreLocation(defaultStoreLocation);
        expect(storeLocation).toEqual(defaultStoreLocation);
    });
    it('"parseStoreLocation" string complete replace', () => {
        const storeLocation = parseStoreLocation(
            defaultStoreLocation,
            'a|b||d'
        );
        expect(storeLocation).toEqual({
            domain: 'a',
            action: 'b',
            uuid: 'd'
        });
    });
    it('"parseStoreLocation" merge', () => {
        const storeLocation = parseStoreLocation(defaultStoreLocation, {
            domain: 'A',
            method: 'post'
        });
        expect(storeLocation).toEqual({
            domain: 'A',
            action: 'b',
            method: 'post',
            uuid: 'd'
        });
    });
    it('"parseStoreLocation" merge with string', () => {
        const storeLocation = parseStoreLocation('a|b|c|d', {
            domain: 'A',
            method: 'post'
        });
        expect(storeLocation).toEqual({
            domain: 'A',
            action: 'b',
            method: 'post',
            uuid: 'd'
        });
    });
});
