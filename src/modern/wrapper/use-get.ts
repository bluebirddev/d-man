import { addMilliseconds, fromUnixTime, isBefore } from 'date-fns';
import { merge } from 'lodash';
import { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Store } from 'redux';
import { deepEqual, wait } from '../../utils';
import { axiosExecutor } from '../axios-executor';
import { RestApiExecutor } from '../rest';
import {
    addStoreLocationModifier,
    StoreLocationModifier
} from '../store-location';
import { getStoreRest, StoreRestOptions } from '../store-rest';
import { RootState } from '../store/reducer';
import { parseStoreState } from '../store/store';

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

const usePrevious = (value: any) => {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
};

export function useGetGenerator(
    domain: string,
    store: Store<RootState>,
    restApiExecutor: RestApiExecutor = axiosExecutor
) {
    function useGet<ResponseData = any>(
        storeRestOptions: GetHookOptions &
            StoreRestOptions<unknown, ResponseData>
    ) {
        const storeRest = getStoreRest(
            domain,
            store,
            restApiExecutor
        )(
            undefined,
            merge<
                StoreRestOptions<undefined, ResponseData>,
                StoreRestOptions<undefined, ResponseData>
            >(
                {
                    method: 'get'
                },
                storeRestOptions
            )
        );

        const { dispatch } = store;

        const storeState = useSelector(storeRest.selector);

        const validStoreState = parseStoreState<ResponseData>(
            storeState,
            storeRestOptions.lazy === true
        );

        const interval = useRef(false);

        const mounted = useRef(false);

        const reset = useCallback(() => {
            dispatch({
                type: addStoreLocationModifier(
                    storeRest.storeLocation,
                    StoreLocationModifier.reset
                )
            });
        }, [dispatch, storeRest.storeLocation]);

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
            if (storeRestOptions.interval && mounted.current) {
                if (
                    !storeState?.lastUpdated ||
                    isBefore(
                        addMilliseconds(
                            fromUnixTime(storeState.lastUpdated as number),
                            storeRestOptions.interval
                        ),
                        new Date()
                    )
                ) {
                    storeRest.execute();
                }
                /**
                 * Wait first to make sure onMoutned "refresh has not trigger"
                 */
                await wait(storeRestOptions.interval);
                checkInterval();
            }
        }, [storeRest, storeRestOptions.interval, storeState.lastUpdated]);

        const previousProps = usePrevious({ storeRestOptions });

        useEffect(() => {
            /**
             * If mounted, and not lazy -> refresh
             */
            if (!storeRestOptions.lazy) {
                if (!storeState?.executed) {
                    storeRest.execute();
                } else {
                    const propsEqual = deepEqual(
                        { storeRestOptions },
                        previousProps
                    );
                    if (!propsEqual) {
                        storeRest.execute();
                    }
                }
            }
        });

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
            storeRest,
            ...validStoreState,
            reset
        };
    }

    return useGet;
}
