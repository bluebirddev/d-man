import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as R from 'ramda';
import { normalizePath } from '../utils';
import { getDefaultState, RootState, StoreState } from '../store/reducer';
import { AxiosInstance } from 'axios';

export default function getDeleteHook(api: AxiosInstance, domainName: string) {
    return function useDelete<Res = any>(url: string) {
        const normalizedUrl = normalizePath(url);

        const basePath = `${domainName}|${normalizedUrl}|delete`;

        const storeState =
            useSelector((state: RootState) =>
                R.path<StoreState>([domainName, normalizedUrl, 'delete'], state)
            ) || getDefaultState();

        const dispatch = useDispatch();

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
            ...storeState,
            data: storeState.data ? (storeState.data as Res) : undefined,
            delete: deleteFunc
        };
    };
}
