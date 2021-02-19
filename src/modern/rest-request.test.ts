import { getRequestOptions } from './rest-request';

describe('rest-request', () => {
    it('"getRequestOptions" simple', () => {
        const requestOptions = getRequestOptions(1, {
            method: 'get',
            url: 'https://example.com'
        });
        expect(requestOptions).toEqual({
            method: 'get',
            url: 'https://example.com',
            data: 1
        });
    });

    it('"getRequestOptions" invalid url', () => {
        const getter = () =>
            getRequestOptions(1, {
                method: 'get',
                url: 'ample.com'
            });
        expect(getter).toThrowError();
    });

    it('"getRequestOptions" merges', () => {
        const requestOptions = getRequestOptions(1, {
            method: 'get',
            url: 'https://example.com',
            transformRequest: (req, options) => ({
                method: 'post',
                data: req * 2,
                url: `${options.url}/${req}`
            })
        });
        expect(requestOptions).toEqual({
            method: 'post',
            data: 2,
            url: 'https://example.com/1'
        });
    });

    it('"getRequestOptions" only shallow merges', () => {
        const requestOptions = getRequestOptions(1, {
            method: 'get',
            url: 'https://example.com',
            headers: {
                a: '1'
            },
            transformRequest: () => ({
                headers: {
                    b: '2'
                }
            })
        });
        expect(requestOptions).toEqual({
            data: 1,
            method: 'get',
            url: 'https://example.com',
            headers: {
                b: '2'
            }
        });
    });

    it('"getRequestOptions" url replace', () => {
        const requestOptions = getRequestOptions(1, {
            method: 'get',
            url: 'https://example.com/{id}',
            transformRequest: (req) => ({
                urlParams: {
                    id: req
                },
                data: undefined
            })
        });
        expect(requestOptions).toEqual({
            method: 'get',
            url: 'https://example.com/1'
        });
    });
});
