import { setupStore } from './store/store';
import { getRootReducer, getDefaultState, RootState } from './store/reducer';
import { StoreLocation } from './store-location';
import { getStoreRest } from './store-rest';
import { Method, RestApiExecutor } from './rest';
import { wait } from '../utils';

describe('store-rest', () => {
    const domain = 'domain';
    const baseUrl = 'https://example.com';

    const simpleApiExecutor: RestApiExecutor = async (requestOptions) => {
        await wait(1000);
        return Promise.resolve({
            data: requestOptions.data,
            requestOptions,
            status: 200
        });
    };

    const location: StoreLocation = {
        domain,
        action: 'action/{id}',
        method: 'get'
    };

    const storeState = getDefaultState();

    const rootState: RootState = {
        [location.domain as string]: {
            [location.action as string]: {
                [location.method as string]: {
                    ...storeState,
                    data: 1
                }
            }
        }
    };

    const store = setupStore(getRootReducer(rootState));

    const storeRest = getStoreRest(domain, store, simpleApiExecutor);

    it('"storeRest" e2e', async () => {
        let preChange = 10;
        let postChange = 20;
        const response = await storeRest(2, {
            method: location.method,
            url: location.action,
            baseUrl,
            queryParams: {
                name: 'cj'
            },
            urlParams: {
                id: '1'
            },
            headers: {
                something: 'some header'
            },
            storeLocation: {
                domain: 'otherdomain',
                action: 'otheraction',
                method: 'post',
                uuid: '1234'
            },
            transformRequest: (requestData, requestOptions) => {
                return {
                    method: `put`,
                    url: 'actionx/{id}',
                    baseUrl: 'https://examplex.com',
                    queryParams: {
                        name: `${requestOptions.queryParams?.name}please`
                    },
                    urlParams: {
                        id: '4'
                    },
                    // requestData = 2. data should be 8
                    data: 4 * requestData,
                    headers: {
                        something: 'some header'
                    }
                };
            },
            transformResponseData: (res) => {
                // should be 1 * 8 * 2 = 16
                return (
                    (Object.keys(res.requestOptions.headers || {}).length ||
                        0) *
                    res.data *
                    2
                );
            },
            beforeExecute: (requestOptions) => {
                // should be 8
                preChange = requestOptions.data;
            },
            afterExecute: (res) => {
                // should be 8 * 16 = 128
                postChange = (preChange * res.data) as number;
            },
            useRequestInterceptor: {
                onSuccess: (value) => {
                    preChange += value;
                }
            },
            parseError: (error: any) => new Error(`${error}!`),
            injectRequest: {
                storeLocation: {
                    domain: 'injectrequestdomain',
                    action: 'injectrequestaction',
                    method: 'delete' as Method,
                    uuid: '4321'
                },
                transformer: (requestData) => {
                    // 8
                    return requestData as number;
                }
            },
            injectResponse: {
                storeLocation: {
                    domain: 'injectresponsedomain',
                    action: 'injectresponseaction',
                    method: 'delete' as Method,
                    uuid: '0000'
                },
                transformer: (responseData, requestData) => {
                    // 16 + 8
                    return (responseData as number) + requestData;
                }
            },
            /**
             * If true - then create a uuid in the storeLocation.
             */
            multiple: true,
            /**
             * Directly passes in uuid.
             */
            uuid: '4444'
        });

        const state = store.getState();

        expect(
            state?.injectrequestdomain.injectrequestaction.delete['4321'].data
        ).toEqual(8);
        expect(
            state?.injectresponsedomain.injectresponseaction.delete['0000'].data
        ).toEqual(24);
        expect(state?.otherdomain.otheraction.post['1234'].data).toEqual(16);
        expect(postChange).toEqual(128);
        expect(preChange).toEqual(8);
        expect(response.data).toEqual(16);
        expect(response.requestOptions.url).toEqual(
            'https://examplex.com/actionx/4'
        );
    });
});
