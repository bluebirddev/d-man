import { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { addMilliseconds, fromUnixTime, isBefore } from 'date-fns';
import { AxiosInstance } from 'axios';
import { wait } from '../utils';
import { RootState } from '../store/reducer';
import getGet, { GetOptions, parseStoreState } from './get-get';
import { Store } from 'redux';

type GetHookOptions<Res = any, Req = any> = GetOptions<Res, Req> & {
    /**
     * Will trigger every interval milliseconds.
     */
    interval?: number;
    /**
     * Will not execute on load.
     */
    lazy?: boolean;
};

export default function getGetHook(
    domainApi: AxiosInstance,
    domain: string,
    store: Store<RootState>
) {
    return function useGet<Res = any, Req = any>(
        url: string,
        options: GetHookOptions<Res, Req> = {}
    ) {
        const get = getGet(domainApi, domain, store)(url, options);

        const storeState = useSelector(get.selector);

        const { dispatch } = store;

        const interval = useRef(false);

        const mounted = useRef(false);

        const reset = useCallback(() => {
            dispatch({ type: get.location });
        }, [get.location, dispatch]);

        useEffect(() => {
            mounted.current = true;
            return () => {
                mounted.current = false;
            };
        }, []);

        /**
         * Loops recursively.
         */
        const checkInterval = useCallback(async () => {
            if (options.interval && mounted.current) {
                if (
                    !storeState?.lastUpdated ||
                    isBefore(
                        addMilliseconds(
                            fromUnixTime(storeState.lastUpdated as number),
                            options.interval
                        ),
                        new Date()
                    )
                ) {
                    get.execute();
                }
                /**
                 * Wait first to make sure onMoutned "refresh has not trigger"
                 */
                await wait(options.interval);
                checkInterval();
            }
        }, [options.interval, get.execute, storeState]);

        /**
         * If mounted, and not lazy -> refresh
         */
        useEffect(() => {
            if (!options.lazy && !storeState?.executed) {
                get.execute();
            }
        }, [options.lazy, get.execute, storeState]);

        /**
         * Triggers interval.
         */
        useEffect(() => {
            if (storeState && !interval.current) {
                interval.current = true;
                checkInterval();
            }
        }, [checkInterval, storeState]);

        const validStoreState = parseStoreState<Res>(storeState, options.lazy);

        return {
            ...get,
            ...validStoreState,
            data: validStoreState.data,
            reset
        };
    };
}
