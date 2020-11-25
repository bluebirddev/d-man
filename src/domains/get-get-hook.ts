import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as R from 'ramda';
import { addMilliseconds, fromUnixTime, isBefore } from 'date-fns';
import { AxiosInstance } from 'axios';
import { normalizePath, wait } from '../utils';
import { getDefaultState, RootState, StoreState } from '../store/reducer';

type Options = {
    /**
     * Will trigger every interval milliseconds.
     */
    interval?: number;
    /**
     * Will not execute on load.
     */
    lazy?: boolean;
    /**
     * Used if you want to tie this hook to another domain call
     */
    customUrl?: [string, 'get' | 'post' | 'put'];
};

export default function getGetHook(api: AxiosInstance, domainName: string) {
    return function useGet<Res = any>(url: string, options: Options = {}) {
        const apiUrl = normalizePath(url);

        const domainUrl = options.customUrl
            ? normalizePath(options.customUrl[0])
            : apiUrl;

        const method = options.customUrl ? options.customUrl[1] : 'get';

        const storeState = useSelector((state: RootState) =>
            R.path<StoreState>([domainName, domainUrl, method], state)
        );

        const basePath = `${domainName}|${domainUrl}|${method}`;

        const dispatch = useDispatch();

        const interval = useRef(false);

        const mounted = useRef(false);

        const reset = useCallback(() => {
            dispatch({ type: basePath });
        }, [basePath, dispatch]);

        const refetch = useCallback(async () => {
            try {
                dispatch({ type: `${basePath}|loading` });
                const response = await api.get(apiUrl);
                dispatch({ type: `${basePath}|data`, payload: response.data });
            } catch (error) {
                dispatch({
                    type: `${basePath}|error`,
                    payload: error.toString()
                });
            }
        }, [apiUrl, basePath, dispatch]);

        useEffect(() => {
            if (!storeState && options.lazy) {
                reset();
            }
        }, [options.lazy, reset, storeState]);

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
                    refetch();
                }
                /**
                 * Wait first to make sure onMoutned "refresh has not trigger"
                 */
                await wait(options.interval);
                checkInterval();
            }
        }, [options.interval, refetch, storeState]);

        /**
         * If mounted, and not lazy -> refresh
         */
        useEffect(() => {
            if (!options.lazy && !storeState?.executed) {
                refetch();
            }
        }, [options.lazy, refetch, storeState]);

        /**
         * Triggers interval.
         */
        useEffect(() => {
            if (storeState && !interval.current) {
                interval.current = true;
                checkInterval();
            }
        }, [checkInterval, storeState]);

        const validStoreState = storeState || {
            ...getDefaultState(),
            loading: true
        };

        return {
            ...validStoreState,
            data: validStoreState.data
                ? (validStoreState.data as Res)
                : undefined,
            refetch,
            reset
        };
    };
}
