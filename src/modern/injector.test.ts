import { StoreLocation } from '../store-location';
import { getDefaultState } from '../store/reducer';
import { performInjectRequests, performInjectResponses } from './injector';
import { getRootReducer, RootState } from './store/reducer';
import { setupStore } from './store/store';

const location: StoreLocation = {
    domain: 'domain',
    action: 'action',
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

describe('injector', () => {
    it('"performInjectRequests" location', () => {
        const store = setupStore(getRootReducer(rootState));

        performInjectRequests(
            store,
            location,
            {
                storeLocation: {
                    domain: 'A'
                }
            },
            61
        );
        expect(store.getState()).toEqual({
            ...rootState,
            A: {
                [location.action as string]: {
                    [location.method as string]: {
                        ...storeState,
                        data: 61,
                        success: true,
                        executed: true
                    }
                }
            }
        });
    });

    it('"performInjectRequests" transformer', () => {
        const store = setupStore(getRootReducer(rootState));

        performInjectRequests(
            store,
            location,
            {
                transformer: (requestData, state) => {
                    return requestData - state.data;
                }
            },
            61
        );
        expect(store.getState()).toEqual({
            [location.domain as string]: {
                [location.action as string]: {
                    [location.method as string]: {
                        ...storeState,
                        data: 60,
                        success: true,
                        executed: true
                    }
                }
            }
        });
    });

    it('"performInjectResponses" location', () => {
        const store = setupStore(getRootReducer(rootState));

        performInjectResponses(
            store,
            location,
            {
                storeLocation: {
                    domain: 'A'
                }
            },
            61,
            2
        );
        expect(store.getState()).toEqual({
            ...rootState,
            A: {
                [location.action as string]: {
                    [location.method as string]: {
                        ...storeState,
                        data: 61,
                        success: true,
                        executed: true
                    }
                }
            }
        });
    });

    it('"performInjectResponses" transformer', () => {
        const store = setupStore(getRootReducer(rootState));

        performInjectResponses(
            store,
            location,
            {
                transformer: (responseData, requestData, state) => {
                    return (responseData as number) - state.data - requestData;
                }
            },
            61, // response
            2 // request
        );
        expect(store.getState()).toEqual({
            [location.domain as string]: {
                [location.action as string]: {
                    [location.method as string]: {
                        ...storeState,
                        data: 58,
                        success: true,
                        executed: true
                    }
                }
            }
        });
    });
});
