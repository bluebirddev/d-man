import { rest } from './rest';

describe('rest', () => {
    it('"rest" defined', () => {
        expect(rest).toBeTruthy();
    });
    // it('"rest" empty', () => {
    //     const rest = getRest('domain');
    //     const options: UseRestOptions<number, number> = {
    //         method: 'post',
    //         url: ''
    //     };
    //     expect(() => {
    //         rest(options);
    //     }).toThrow();
    // });

    // it('"rest" default', () => {
    //     const rest = getRest('domain');
    //     const options: UseRestOptions<number, number> = {
    //         method: 'post',
    //         url: 'https://example.com/'
    //     };
    //     expect(rest(options)).toBeTruthy();
    // });

    // it('"rest" custom storeLocation', () => {
    //     const rest = getRest('domain');
    //     const options: UseRestOptions<number, number> = {
    //         method: 'post',
    //         url: 'https://example.com',
    //         storeLocation: {
    //             method: 'get',
    //             action: 'blabla'
    //         }
    //     };
    //     expect(rest(options)).toBeTruthy();
    // });
});
