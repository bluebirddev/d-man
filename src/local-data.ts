import React from 'react';
import { RootState } from './store/reducer';
import { path as getPath, has } from './utils';
import { Store } from 'redux';
import { getLocalPath } from './path';
import { useSelector } from 'react-redux';

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
        const path = getLocalPath(action, persist);
        const [domain] = path;

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
                type: path.join('|'),
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
        }, []);

        return { ...localProps, data };
    }
    return { local, useLocal };
}
