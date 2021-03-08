import {
    StoreLocation,
    addStoreLocationModifier,
    StoreLocationModifier
} from '../store-location';
import { getDefaultState, getRootReducer, RootState } from './reducer';

describe('reducer', () => {
    const storeState = getDefaultState();
    const location: StoreLocation = {
        domain: 'domain',
        action: 'action',
        method: 'get'
    };

    const rootState: RootState = {
        [location.domain as string]: {
            [location.action as string]: {
                [location.method as string]: storeState
            }
        }
    };

    it('"getRootReducer" default state', () => {
        const rootReducer = getRootReducer(rootState);
        const state = rootReducer(undefined, {
            type: 'nothing'
        });
        expect(state).toEqual(rootState);
    });

    it('"getRootReducer" removes LOCAL', () => {
        const rootReducer = getRootReducer({
            ...rootState,
            LOCAL: 2
        } as RootState);
        const state = rootReducer(undefined, {
            type: 'nothing'
        });
        expect(state).toEqual(rootState);
    });

    it('"getRootReducer" does not remove LOCAL-PERSIST', () => {
        const rootReducer = getRootReducer({
            ...rootState,
            // TODO enums
            'LOCAL-PERSIST': 2
        } as RootState);
        const state = rootReducer(undefined, {
            type: 'nothing'
        });
        expect(state).toEqual({
            ...rootState,
            // TODO enums
            'LOCAL-PERSIST': 2
        });
    });

    it('"getRootReducer" removes loading state', () => {
        const rootReducer = getRootReducer({
            [location.domain as string]: {
                [location.action as string]: {
                    [location.method as string]: {
                        ...storeState,
                        loading: true,
                        error: 'Some error'
                    }
                }
            }
        });
        const state = rootReducer(undefined, {
            type: 'nothing'
        });
        expect(state).toEqual(rootState);
    });

    it('"getRootReducer" logout', () => {
        const rootReducer = getRootReducer({
            [location.domain as string]: {
                [location.action as string]: {
                    [location.method as string]: {
                        ...storeState,
                        data: 2
                    }
                }
            }
        });
        const state = rootReducer(undefined, {
            type: 'LOGOUT'
        });
        expect(state).toEqual({});
    });

    it('"getRootReducer" local', () => {
        const rootReducer = getRootReducer({
            LOCAL: {
                domain: 0
            }
        } as RootState);
        const state = rootReducer(undefined, {
            type: 'LOCAL|domain',
            payload: 2
        });
        expect(state).toEqual({
            LOCAL: {
                domain: 2
            }
        });
    });

    it('"getRootReducer" data', () => {
        const rootReducer = getRootReducer(rootState);
        const state = rootReducer(undefined, {
            type: addStoreLocationModifier(
                location,
                StoreLocationModifier.data
            ),
            payload: 2
        });
        expect(state).toEqual({
            [location.domain as string]: {
                [location.action as string]: {
                    [location.method as string]: {
                        ...storeState,
                        data: 2,
                        success: true,
                        executed: true
                    }
                }
            }
        });
    });

    it('"getRootReducer" loading', () => {
        const rootReducer = getRootReducer(rootState);
        const state = rootReducer(undefined, {
            type: addStoreLocationModifier(
                location,
                StoreLocationModifier.loading
            )
        });
        expect(state).toEqual({
            [location.domain as string]: {
                [location.action as string]: {
                    [location.method as string]: {
                        ...storeState,
                        loading: true,
                        executed: true
                    }
                }
            }
        });
    });

    it('"getRootReducer" error', () => {
        const rootReducer = getRootReducer(rootState);
        const state = rootReducer(undefined, {
            type: addStoreLocationModifier(
                location,
                StoreLocationModifier.error
            ),
            payload: 'Error!'
        });
        expect(state).toEqual({
            [location.domain as string]: {
                [location.action as string]: {
                    [location.method as string]: {
                        ...storeState,
                        error: 'Error!',
                        success: false,
                        executed: true
                    }
                }
            }
        });
    });
});
