import axios, { AxiosRequestConfig } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Store } from 'redux';
import { RootState, StoreState } from '../store/reducer';
import { BaseOptions, DManAxiosRequestConfig } from '..';
import {
    has,
    mergeDeep,
    parseError,
    parseStoreState,
    path,
    wait
} from '../utils';
import {
    getStoreLocation,
    Method,
    convertToStoreLocationPath,
    StoreLocationPath,
    trimStoreLocation
} from '../store-location';
import { DomainOptions } from '.';

function convertToAxiosRequest(
    requestConfig: DManAxiosRequestConfig
): AxiosRequestConfig {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { queryParams, urlParams, ...rem } = requestConfig;
    return {
        ...rem,
        params: queryParams
    };
}

function parseRequest<Req, Res>(
    requestData: Req | undefined,
    baseUrl: string,
    url: string,
    method: Method,
    options: BaseOptions<Req, Res> = {},
    authHeader?: string
) {
    const requestConfig: Partial<DManAxiosRequestConfig> = {
        data: requestData,
        baseURL: baseUrl,
        method,
        url,
        headers: {
            Authorization: authHeader
        },
        ...options?.requestConfig
    };

    // transformRequest takes precedence
    if (options?.transformRequest) {
        const transformedRequest = options.transformRequest(requestData as Req);
        if (transformedRequest.urlParams) {
            transformedRequest.url = Object.keys(
                transformedRequest.urlParams
            ).reduce<string>((res, key) => {
                const replacement =
                    transformedRequest.urlParams &&
                    transformedRequest.urlParams[key];
                return res.replaceAll(`:${key}`, replacement?.toString() || '');
            }, transformedRequest.url || url);
        }

        return {
            ...mergeDeep(requestConfig, transformedRequest),
            data: has('data', transformedRequest)
                ? transformedRequest.data
                : requestConfig.data
        } as Partial<DManAxiosRequestConfig>;
    }

    return requestConfig;
}

export type GenericGeneratorResult<Req, Res> = {
    selector: (state: RootState) => StoreState<unknown> | undefined;
    storeLocationPath: StoreLocationPath;
    getState: () => StoreState<Res>;
    execute: (
        data?: Req | undefined
    ) => Promise<[string | undefined, Res | undefined]>;
    reset: () => void;
};

export default function genericGenerator<Req = any, Res = any>(
    domain: string,
    domainOptions: DomainOptions,
    store: Store<RootState>,
    uuid: string | undefined,
    action: string,
    method: Method,
    options: BaseOptions<Req, Res> = {}
): GenericGeneratorResult<Req, Res> {
    const _uuid = (() => {
        if (uuid) return uuid;
        if (options.multiple) return uuidv4();
        return undefined;
    })();

    const defaultStoreLocation = trimStoreLocation({
        domain,
        action,
        method,
        uuid: _uuid
    });

    const { dispatch } = store;

    /**
     * Merges options.storeLocation with defaultStoreLocation (if you want a custom location for the store)
     */
    const storeLocationPath = convertToStoreLocationPath({
        ...defaultStoreLocation,
        ...options?.storeLocation
    });

    if (!storeLocationPath) {
        throw new Error('Something went wrong.  Location not defined');
    }

    const selector = (state: RootState) =>
        path<StoreState>(storeLocationPath, state);

    const getStoreState = () =>
        parseStoreState<Res>(selector(store.getState()));

    const reset = () => {
        dispatch({ type: storeLocationPath.join('|') });
    };

    const execute = async (
        requestData?: Req
    ): Promise<[string | undefined, Res | undefined]> => {
        try {
            dispatch({ type: `${storeLocationPath.join('|')}|loading` });

            const requestConfig = parseRequest(
                requestData,
                domainOptions.baseURL,
                action,
                method,
                options,
                domainOptions?.getAuthToken &&
                    domainOptions.getAuthToken(store.getState())
            );

            const { data: parsedRequestData } = requestConfig;

            if (options.injectRequest) {
                options.injectRequest.forEach((injector) => {
                    const injectLocation = getStoreLocation(
                        storeLocationPath,
                        injector.storeLocation
                    );
                    if (injectLocation) {
                        const injectorSelector = (state: RootState) =>
                            path<StoreState>(injectLocation, state);

                        const injectorStoreState = parseStoreState<Res>(
                            injectorSelector(store.getState())
                        );

                        const injectorData = injector.parseRequestData
                            ? injector.parseRequestData(
                                  injectorStoreState,
                                  parsedRequestData
                              )
                            : parsedRequestData;

                        dispatch({
                            type: `${injectLocation.join('|')}|data`,
                            payload: injectorData
                        });
                    }
                });
            }

            const responseData = await (async () => {
                if (options.fake) {
                    await wait(options.fake);
                    return undefined;
                }
                const instance = axios.create();
                if (domainOptions.useRequestInterceptor) {
                    instance.interceptors.request.use(
                        domainOptions.useRequestInterceptor.onSuccess,
                        domainOptions.useRequestInterceptor.onError
                    );
                }
                const response = await instance(
                    convertToAxiosRequest(requestConfig)
                );
                return response.data;
            })();

            if (options.injectResponse) {
                options.injectResponse.forEach((injector) => {
                    const injectLocation = getStoreLocation(
                        storeLocationPath,
                        injector.storeLocation
                    );
                    if (injectLocation) {
                        const injectorSelector = (state: RootState) =>
                            path<StoreState>(injectLocation, state);

                        const injectorStoreState = parseStoreState<Res>(
                            injectorSelector(store.getState())
                        );

                        const injectorPayload = injector.parseResponse
                            ? injector.parseResponse(
                                  injectorStoreState,
                                  responseData,
                                  parsedRequestData
                              )
                            : responseData;

                        dispatch({
                            type: `${injectLocation.join('|')}|data`,
                            payload: injectorPayload
                        });
                    }
                });
            }

            const parsedResponseData: Res = options.transformResponseData
                ? options.transformResponseData(responseData, parsedRequestData)
                : responseData;

            if (options.onSuccess) {
                await options.onSuccess(responseData, parsedRequestData);
            }

            dispatch({
                type: `${storeLocationPath.join('|')}|data`,
                payload: parsedResponseData
            });

            return [undefined, responseData];
        } catch (_error) {
            const error = parseError(_error);

            dispatch({
                type: `${storeLocationPath.join('|')}|error`,
                payload: error
            });

            return [error, undefined];
        }
    };

    return {
        selector,
        storeLocationPath,
        getState: getStoreState,
        execute,
        reset
    };
}
