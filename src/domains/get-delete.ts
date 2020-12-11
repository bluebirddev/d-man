import { useCallback } from 'react';
import * as R from 'ramda';
import { normalizePath } from '../utils';
import { getDefaultState, RootState, StoreState } from '../store/reducer';
import { AxiosInstance } from 'axios';
import { Store } from 'redux';
import getDeleteHook from './get-delete-hook';

export default function getDelete(
    api: AxiosInstance,
    domainName: string,
    store: Store<RootState>
) {
    return function del<Res = any>(url: string) {
        const normalizedUrl = normalizePath(url);

        const basePath = `${domainName}|${normalizedUrl}|delete`;

        const { dispatch } = store;

        const getStoreState = () => {
            const storeState = R.path<StoreState>(
                [domainName, normalizedUrl, 'delete'],
                store.getState()
            );
            const validStoreState = storeState || getDefaultState();

            const data = (validStoreState?.data as Res) || undefined;

            return {
                ...validStoreState,
                data
            };
        };

        const deleteFunc = useCallback(async () => {
            try {
                dispatch({ type: `${basePath}|loading` });
                const response = await api.delete(normalizedUrl);
                dispatch({ type: `${basePath}|data`, payload: response.data });
            } catch (error) {
                dispatch({
                    type: `${basePath}|error`,
                    payload: error.toString()
                });
            }
        }, [basePath, dispatch, normalizedUrl]);

        return {
            getState: getStoreState,
            /**
             * TODO: since we use getGetHook here -> it can be drastically simplified (because it currently uses same logic as in here^)
             */
            useHook: () => getDeleteHook(api, domainName)(url),
            delete: deleteFunc
        };
    };
}
