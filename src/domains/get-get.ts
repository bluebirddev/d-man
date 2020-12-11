import * as R from 'ramda';
import { AxiosInstance } from 'axios';
import { normalizePath } from '../utils';
import { getDefaultState, RootState, StoreState } from '../store/reducer';
import { Store } from 'redux';
import getGetHook from './get-get-hook';

type Options = {
    /**
     * Used if you want to tie this hook to another domain call
     */
    customUrl?: [string, 'get' | 'post' | 'put'];
};

export default function getGet(
    api: AxiosInstance,
    domainName: string,
    store: Store<RootState>
) {
    return function get<Res = any>(url: string, options: Options = {}) {
        const apiUrl = normalizePath(url);

        const { dispatch } = store;

        const domainUrl = options.customUrl
            ? normalizePath(options.customUrl[0])
            : apiUrl;

        const method = options.customUrl ? options.customUrl[1] : 'get';

        const getStoreState = () => {
            const storeState = R.path<StoreState>(
                [domainName, domainUrl, method],
                store.getState()
            );
            const validStoreState = storeState || {
                ...getDefaultState(),
                loading: true
            };

            const data = (validStoreState?.data as Res) || undefined;

            return {
                ...validStoreState,
                data
            };
        };

        const basePath = `${domainName}|${domainUrl}|${method}`;

        const reset = () => {
            dispatch({ type: basePath });
        };

        const fetch = async (): Promise<
            [string | undefined, Res | undefined]
        > => {
            try {
                dispatch({ type: `${basePath}|loading` });
                const response = await api.get(apiUrl);
                dispatch({ type: `${basePath}|data`, payload: response.data });
                return [undefined, response.data as Res];
            } catch (error) {
                dispatch({
                    type: `${basePath}|error`,
                    payload: error.toString()
                });
                return [error.toString() as string, undefined];
            }
        };

        return {
            getState: getStoreState,
            /**
             * TODO: since we use getGetHook here -> it can be drastically simplified (because it currently uses same logic as in here^)
             */
            useHook: (hookOptions?: {
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
            }) =>
                getGetHook(api, domainName)<Res>(url, {
                    ...options,
                    ...hookOptions
                }),
            fetch,
            reset
        };
    };
}
