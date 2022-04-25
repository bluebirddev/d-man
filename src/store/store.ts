import { createStore } from 'redux';
import getRootReducer from './reducer';

export default function setupStore(
    localStorageKey: string,
    disableLocalStorage?: boolean
) {
    /**
     * Creates redux store with devtools extension.
     */
    const store = createStore(
        getRootReducer(localStorageKey, disableLocalStorage),
        (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
            (window as any).__REDUX_DEVTOOLS_EXTENSION__()
    );

    if (!disableLocalStorage) {
        /**
         * Saves store state on each change to localStorage.
         */
        store.subscribe(() => {
            const state = store.getState();
            localStorage.setItem(localStorageKey, JSON.stringify(state));
        });
    }

    return store;
}
