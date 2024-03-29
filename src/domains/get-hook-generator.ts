import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { addMilliseconds, fromUnixTime, isBefore } from 'date-fns';
import { Store } from 'redux';
import { parseStoreState, wait } from '../utils';
import { RootState, StoreState } from '../store/reducer';
import getGenerator, { GetOptions } from './get-generator';
import { GenericGeneratorResult } from './generic-generator';
import { DomainOptions } from '.';

export type GetHookResult<Req, Res> = GenericGeneratorResult<Req, Res> &
    StoreState<Res>;

export type GetHookOptions = {
    /**
     * Will trigger every interval milliseconds.
     */
    interval?: number;
    /**
     * Will not execute on load.
     */
    lazy?: boolean;
};

export default function getHookGenerator(
    domain: string,
    domainOptions: DomainOptions,
    store: Store<RootState>
) {
    return function useGet<Res = any, Req = any>(
        action: string,
        options: Omit<
            GetHookOptions & GetOptions<Res, Req>,
            'transformRequest'
        > = {}
    ): GetHookResult<Req, Res> {
        const uuid = useMemo(() => {
            return options.multiple ? uuidv4() : undefined;
        }, [options.multiple]);

        const get = getGenerator(
            domain,
            domainOptions,
            store,
            uuid
        )<Res, Req>(action, options);

        const lazy = options.lazy !== false;

        const storeState = useSelector(get.selector);

        const validStoreState = parseStoreState<Res>(
            storeState,
            lazy
        );

        const { dispatch } = store;

        const interval = useRef(false);

        const mounted = useRef(false);

        const reset = useCallback(() => {
            dispatch({ type: get.storeLocationPath.join('|') });
        }, [get.storeLocationPath, dispatch]);

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
        }, [options.interval, storeState?.lastUpdated, get]);

        /**
         * If mounted, and not lazy -> refresh
         */
        useEffect(() => {
            if (!lazy) {
                get.execute();
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [lazy]);

        /**
         * Triggers interval.
         */
        useEffect(() => {
            if (storeState && !interval.current) {
                interval.current = true;
                checkInterval();
            }
        }, [checkInterval, storeState]);

        return {
            ...get,
            ...validStoreState,
            reset
        };
    };
}
