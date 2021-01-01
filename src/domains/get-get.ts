import * as R from 'ramda';
import { AxiosInstance } from 'axios';
import { normalizePath } from '../utils';
import { getDefaultState, RootState, StoreState } from '../store/reducer';
import { Store } from 'redux';
import getGetHook from './get-get-hook';

type Method = 'get' | 'post' | 'put' | 'delete';
type Location = [string, string, Method];

type LocationOptions = {
    url?: string;
    method?: Method;
    domain?: string;
    location?: Location;
};

type InjectRequest<Req = any> = LocationOptions & {
    injector: (data: StoreState<any>, request: Req) => unknown;
};

type InjectResponse = LocationOptions & {
    injector: (data: StoreState<any>, response: unknown) => unknown;
};

export type GetOptions<Res = any, Req = any> = LocationOptions & {
    parseResponse?: (response: unknown, request?: Req) => Res;
    injectResponse?: InjectResponse[];
    injectRequest?: InjectRequest<Req>[];
};

/**
 * You can either specify domain, url, method seperately, or as an array.
 */
function parseLocation(
    defaultLocation: {
        url: string;
        method: Method;
        domain: string;
    },
    customLocation: LocationOptions,
    allowEmpty = true
) {
    if (!allowEmpty) {
        if (
            !customLocation.location ||
            (!customLocation.url &&
                !customLocation.method &&
                !customLocation.domain)
        ) {
            console.warn(
                'You must specify either "location" or one of "url", "method", or "domain"'
            );
            return undefined;
        }
    }
    const [domain, url, method] = (() => {
        if (customLocation.location)
            return [
                customLocation.location[0],
                customLocation.location[1],
                customLocation.location[2]
            ];
        return [
            customLocation.domain || defaultLocation.domain,
            customLocation.url || defaultLocation.url,
            customLocation.method || defaultLocation.method
        ];
    })();

    return [normalizePath(domain), normalizePath(url), method];
}

export function parseError(error: any) {
    try {
        return error.toString() || 'An unknown error has occured';
    } catch (err) {
        return 'An unknown error has occured';
    }
}

export function parseStoreState<Res>(
    storeState: StoreState<unknown> | undefined,
    lazy = true
) {
    const validStoreState = storeState || getDefaultState();

    const data = (validStoreState?.data as Res) || undefined;

    return {
        ...validStoreState,
        data,
        /**
         * If it is "not lazy", that means it should load on demand.  If no store state yet - fake an initial loading.
         */
        loading: !lazy && !storeState ? true : validStoreState.loading
    };
}

export default function getGet(
    domainApi: AxiosInstance,
    domain: string,
    store: Store<RootState>
) {
    return function get<Res = any, Req = any>(
        url: string,
        options: GetOptions<Res, Req> = {}
    ) {
        const { dispatch } = store;

        const location = parseLocation(
            {
                url,
                method: 'get',
                domain
            },
            options
        ) as [string, string, string];

        const selector = (state: RootState) =>
            R.path<StoreState>(location, state);

        const getStoreState = parseStoreState<Res>(selector(store.getState()));

        const reset = () => {
            dispatch({ type: location });
        };

        const execute = async (
            payload?: Req
        ): Promise<[string | undefined, Res | undefined]> => {
            try {
                dispatch({ type: `${location}|loading` });

                const response = await domainApi.get(location[1]);

                const responseData: Res = options.parseResponse
                    ? options.parseResponse(response.data, payload)
                    : response.data;

                dispatch({ type: `${location}|data`, payload: responseData });

                return [undefined, responseData];
            } catch (_error) {
                const error = parseError(_error);

                dispatch({
                    type: `${location}|error`,
                    payload: error
                });

                return [error, undefined];
            }
        };

        return {
            selector,
            location,
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
                getGetHook(
                    domainApi,
                    domain,
                    store
                )<Res, Req>(url, {
                    ...options,
                    ...hookOptions
                }),
            execute,
            reset
        };
    };
}
