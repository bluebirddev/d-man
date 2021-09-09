import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStore } from 'redux';
import getRootReducer, { RootState } from './reducer';

export default function setupStore(localStorageKey: string) {
    /**
     * Creates redux store with devtools extension.
     */
    const store = createStore(
        getRootReducer(),
        (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
            (window as any).__REDUX_DEVTOOLS_EXTENSION__()
    );

    (async () => {
        try {
            const cachedState = await AsyncStorage.getItem(localStorageKey);

            const initialState: RootState = cachedState
                ? (JSON.parse(cachedState) as RootState)
                : {};

            if (Object.keys(initialState).length) {
                store.dispatch({ type: 'INITIAL', payload: initialState });
            }
        } catch (error) {
            //
        }
    })();

    /**
     * Saves store state on each change to localStorage.
     */
    store.subscribe(async () => {
        const state = store.getState();
        try {
            await AsyncStorage.setItem(localStorageKey, JSON.stringify(state));
        } catch (error) {
            //
        }
    });

    return store;
}
