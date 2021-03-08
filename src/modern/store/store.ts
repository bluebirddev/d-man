import { createStore } from 'redux';
import { getDefaultState, getRootReducer, RootState } from './reducer';

export function setupStore(
    reducer: ReturnType<typeof getRootReducer>,
    subscribe?: (state: RootState) => void,
    storeEnhancer?: any
) {
    /**
     * Creates redux store with devtools extension.
     */
    const store = createStore(reducer, storeEnhancer);

    /**
     * Saves store state on each change to localStorage.
     */
    if (subscribe) {
        store.subscribe(() => {
            const state = store.getState();
            subscribe(state);
        });
    }

    return store;
}

export function setupLocalStorageStore(localStorageKey: string) {
    const cachedState = localStorage.getItem(localStorageKey);

    const initialState: RootState = cachedState
        ? (JSON.parse(cachedState) as RootState)
        : {};

    const subscribe = (state: RootState) => {
        localStorage.setItem(localStorageKey, JSON.stringify(state));
    };

    return setupStore(
        getRootReducer(initialState),
        subscribe,
        (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
            (window as any).__REDUX_DEVTOOLS_EXTENSION__()
    );
}

export type StoreState<T = unknown> = {
    data: T | undefined;
    /**
     * If api call is in progress.
     */
    loading: boolean;
    /**
     * If error occured.
     */
    error: string | undefined;
    /**
     * Last time call was executed.
     */
    lastUpdated: number | undefined;
    /**
     * If call was ever executed (start of api call)
     */
    executed: boolean;
    /**
     * If successfull.
     */
    success: boolean | undefined;
};

/**
 * storeState may not be fully defined.  Return a fully defined store state.
 */
export function parseStoreState<T>(
    storeState: Partial<StoreState<unknown>> | undefined,
    lazy = true
): StoreState<T> {
    const validStoreState = storeState || getDefaultState();

    const data = (validStoreState?.data as T) || undefined;

    const onDemandAndEmpty = !lazy && !storeState;

    return {
        ...storeState,
        error: storeState?.error || undefined,
        lastUpdated: onDemandAndEmpty
            ? validStoreState?.lastUpdated
            : storeState?.lastUpdated,
        executed: onDemandAndEmpty ? true : !!validStoreState.executed,
        success: storeState?.success || undefined,
        data,
        /**
         * If it is "not lazy", that means it should load on demand.  If no store state yet - fake an initial loading.
         */
        loading: onDemandAndEmpty ? true : !!validStoreState.loading
    };
}
