import { getDefaultState, RootState } from './reducer';
import { parseStoreState, setupStore } from './store';
import { mergeDeep } from '../../utils';

describe('store', () => {
    it('"parseStoreState" non-lazy', () => {
        const storeState = getDefaultState();

        const parsedStoreState = parseStoreState(undefined, false);

        expect(parsedStoreState).toEqual({
            ...storeState,
            executed: true,
            loading: true,
            lastUpdated: expect.any(Number)
        });
    });

    it('"parseStoreState" lazy', () => {
        const storeState = getDefaultState();

        const parsedStoreState = parseStoreState(undefined, true);

        expect(parsedStoreState).toEqual({
            ...storeState,
            lastUpdated: undefined
        });
    });

    it('"setupStore', () => {
        const storeState = getDefaultState();

        const rootState: RootState = {
            default: {
                domain: {
                    method: storeState
                }
            }
        };

        let cachedState: RootState | undefined;

        const store = setupStore(
            (state = rootState, action) => {
                if (action.type === 'set') {
                    return mergeDeep(state, {
                        default: {
                            domain: {
                                method: {
                                    data: action.payload
                                }
                            }
                        }
                    });
                }
                return state as RootState;
            },
            (state) => {
                cachedState = state;
            }
        );
        expect(store.getState()).toEqual(rootState);
        store.dispatch({ type: 'set', payload: 2 });
        expect(store.getState().default.domain.method.data).toEqual(2);
        store.dispatch({ type: 'set', payload: 3 });
        expect(cachedState?.default.domain.method.data).toEqual(3);
    });
});
