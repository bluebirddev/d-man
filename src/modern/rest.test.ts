import { getRest, UseRestOptions } from '.';

describe('rest', () => {
    it('"rest" empty', () => {
        const rest = getRest('domain');
        const options: UseRestOptions<number, number> = {
            method: 'post',
            url: ''
        };
        expect(() => {
            rest(options);
        }).toThrow();
    });

    it('"rest" default', () => {
        const rest = getRest('domain');
        const options: UseRestOptions<number, number> = {
            method: 'post',
            url: 'https://example.com'
        };
        expect(rest(options)).toBeTruthy();
    });
});
