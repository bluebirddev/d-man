import { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { addMilliseconds, fromUnixTime, isBefore } from 'date-fns';
import { AxiosInstance } from 'axios';
import { parseStoreState, wait } from '../utils';
import { RootState } from '../store/reducer';
import { Store } from 'redux';
import { GetHookOptions, GetOptions } from '..';
import getGenerator from './get-generator';

export default function getHookGenerator(
    domainApi: AxiosInstance,
    domain: string,
    store: Store<RootState>
) {
    return function useGet<Res = any, Req = any>(
        url: string,
        options: GetHookOptions & GetOptions<Res, Req> = {}
    ) {
        const get = getGenerator(
            domainApi,
            domain,
            store
        )<Res, Req>(url, options);

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

        const validStoreState = parseStoreState<Res>(
            storeState,
            options.parseResponseData,
            options.lazy
        );

        return {
            ...get,
            ...validStoreState,
            data: validStoreState.data,
            reset
        };
    };
}
