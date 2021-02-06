import React from 'react';
import { Store } from 'redux';
import { useSelector } from 'react-redux';
import { RootState } from './store/reducer';
import { path as getPath, has } from './utils';
import { getLocalStoreLocationPath, StoreLocationPath } from './store-location';

export type UseLocalResponse<X> = {
    data: X;
    dispatch: (data: X) => void;
    selector: (state: RootState) => X | undefined;
    domainSelector: (state: RootState) => Record<string, any>;
};

export function generateLocal(store: Store<RootState>) {
    function getLocalProps<X>(
        action: string,
        defaultValue?: X,
        persist?: boolean
    ) {
        const storeLocationPath = getLocalStoreLocationPath(
            action,
            persist
        ) as StoreLocationPath;
        const [domain] = storeLocationPath;

        const domainSelector = (state: RootState) => {
            return getPath<Record<string, any>>([domain], state);
        };

        const selector = (state: RootState) => {
            const domainData = domainSelector(state);
            return domainData && has(action, domainData)
                ? domainData[action]
                : defaultValue;
        };

        function dispatch(value: X) {
            store.dispatch({
                type: storeLocationPath.join('|'),
                payload: value
            });
        }

        function getData() {
            return selector(store.getState());
        }

        return {
            getData,
            domainSelector,
            selector,
            dispatch
        };
    }

    function useLocal<X>(
        action: string,
        defaultValue?: X,
        persist?: boolean
    ): UseLocalResponse<X> {
        const localProps = getLocalProps(action, defaultValue, persist);

        const domainData = useSelector(localProps.domainSelector);
        const data = useSelector(localProps.selector);

        React.useEffect(() => {
            if (defaultValue && (!domainData || !has(action, domainData))) {
                localProps.dispatch(defaultValue);
            }
        }, [action, defaultValue, domainData, localProps]);

        return { ...localProps, data };
    }

    function local<X>(
        action: string,
        defaultValue?: X,
        persist?: boolean
    ): {
        getData: () => X;
        useHook: () => UseLocalResponse<X>;
        dispatch: (data: X) => void;
    } {
        const localProps = getLocalProps(action, defaultValue, persist);

        return {
            ...localProps,
            useHook: () => useLocal<X>(action, defaultValue, persist)
        };
    }
    return { local, useLocal };
}
