import { wait } from '../utils';
import { execute } from './execute';
import { ApiExecutor, RequestOptions } from './rest';

/**
 * simple api executor that always returns 200, and the same data that was passed in.
 */
const simpleApiExecutor: ApiExecutor = (requestOptions) => {
    return Promise.resolve({
        data: requestOptions.data,
        requestOptions,
        status: 200
    });
};

const simpleRequestOptions: RequestOptions = {
    method: 'get',
    url: 'https://example.com'
};

describe('execute', () => {
    it('simple', async () => {
        const restResponse = await execute(
            1,
            simpleRequestOptions,
            simpleApiExecutor
        );
        expect(restResponse).toEqual({
            data: 1,
            requestOptions: { ...simpleRequestOptions, data: 1 },
            status: 200
        });
    });

    it('perform before request', async () => {
        const requestOptions: RequestOptions = {
            method: 'get',
            url: 'https://example.com'
        };
        let state = 1;
        const restResponsePromise = await execute(
            1,
            {
                ...requestOptions,
                beforeExecute: ({ data }) => {
                    // should first execute and set state to 2.
                    state = state * 2 * (data as number);
                }
            },
            async (ro) => {
                await wait(50);
                // should execute second and set state to 3.
                // otherwise this will hit first and the result will be 4.
                state += 1;
                return {
                    data: ro.data,
                    requestOptions: ro,
                    status: 200
                };
            }
        );
        expect(state).toEqual(3);
        const restResponse = await restResponsePromise;
        expect(restResponse).toEqual({
            data: 1,
            requestOptions: { ...requestOptions, data: 1 },
            status: 200
        });
    });

    it('perform after request', async () => {
        const requestOptions: RequestOptions = {
            method: 'get',
            url: 'https://example.com'
        };
        let state = 1;
        const restResponsePromise = await execute(
            1,
            {
                ...requestOptions,
                afterExecute: ({ data }) => {
                    // should second execute and set state to 4.
                    state = state * 2 * (data as number);
                }
            },
            async (ro) => {
                await wait(50);
                // should execute first and set state to 2.
                // otherwise this will hit first and the result will be 3.
                state += 1;
                return {
                    data: ro.data,
                    requestOptions: ro,
                    status: 200
                };
            }
        );
        expect(state).toEqual(4);
        const restResponse = await restResponsePromise;
        expect(restResponse).toEqual({
            data: 1,
            requestOptions: { ...requestOptions, data: 1 },
            status: 200
        });
    });

    it('perform transform request', async () => {
        const restResponse = await execute(
            1,
            {
                ...simpleRequestOptions,
                transformRequest: (requestData, requestOptions) => ({
                    url: `${requestOptions.url}/${requestData}`,
                    method: 'post',
                    data: requestData * 2
                })
            },
            simpleApiExecutor
        );
        expect(restResponse).toEqual({
            data: 2,
            requestOptions: {
                ...simpleRequestOptions,
                url: `${simpleRequestOptions.url}/${1}`,
                method: 'post',
                data: 2
            },
            status: 200
        });
    });

    it('perform transform response data', async () => {
        const restResponse = await execute<number>(
            1,
            {
                ...simpleRequestOptions,
                transformResponseData: (response) =>
                    (response.data as number) * 2
            },
            simpleApiExecutor
        );
        expect(restResponse).toEqual({
            data: 2,
            requestOptions: {
                ...simpleRequestOptions,
                data: 1
            },
            status: 200
        });
    });

    it('perform parseError', async () => {
        const errorMessage = 'error!!!!';
        const restResponse = await execute<number>(
            1,
            {
                ...simpleRequestOptions,
                parseError: () => errorMessage
            },
            async (requestOptions, parseError) => {
                await wait(50);
                try {
                    throw new Error('this error should not be returned');
                } catch (err) {
                    return {
                        error: parseError && parseError(err),
                        requestOptions
                    };
                }
            }
        );
        expect(restResponse).toEqual({
            error: errorMessage,
            requestOptions: {
                ...simpleRequestOptions,
                data: 1
            }
        });
    });
});
