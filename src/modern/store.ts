import { getUnixTime } from 'date-fns';

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

export const getDefaultState = () => ({
    data: undefined,
    error: undefined,
    loading: false,
    executed: false,
    success: undefined,
    lastUpdated: getUnixTime(new Date())
});

/**
 * storeState may not be fully defined.  Return a fully defined store state.
 */
export function parseStoreState<T>(
    storeState: Partial<StoreState<unknown>> | undefined,
    lazy = true
): StoreState<T> {
    const validStoreState = storeState || getDefaultState();

    const data = (validStoreState?.data as T) || undefined;

    return {
        ...storeState,
        error: storeState?.error || undefined,
        lastUpdated: storeState?.lastUpdated || undefined,
        executed: !lazy && !storeState ? true : !!validStoreState.executed,
        success: storeState?.success || undefined,
        data,
        /**
         * If it is "not lazy", that means it should load on demand.  If no store state yet - fake an initial loading.
         */
        loading: !lazy && !storeState ? true : !!validStoreState.loading
    };
}
