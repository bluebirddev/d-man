import { StoreLocation } from '../store-location';
import {
    parseStringStoreLocation,
    getInitialStoreLocation
} from './store-location';

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

    it('"getInitialStoreLocation" just default', () => {
        const storeLocation = getInitialStoreLocation(defaultStoreLocation);
        expect(storeLocation).toEqual(defaultStoreLocation);
    });
    it('"getInitialStoreLocation" string complete replace', () => {
        const storeLocation = getInitialStoreLocation(
            defaultStoreLocation,
            'a|b||d'
        );
        expect(storeLocation).toEqual({
            domain: 'a',
            action: 'b',
            uuid: 'd'
        });
    });
    it('"getInitialStoreLocation" merge', () => {
        const storeLocation = getInitialStoreLocation(defaultStoreLocation, {
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
