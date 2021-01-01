import * as R from 'ramda';
import { v4 as uuidv4 } from 'uuid';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getDefaultState, RootState, StoreState } from '../store/reducer';
import { normalizePath } from '../utils';
import { Store } from 'redux';
import getPostHook from './get-post-hook';

type InjectRequest<Req = any> = {
    location: [string, string];
    injector: (data: StoreState<any>, request: Req) => unknown;
};

type Options<Req = any, Res = any> = {
    /**
     * If multiple = false, then there will be only one result for each request per url,
     * (like for GET / DELETE).
     * If multiple = true, a unique id is generated for each request.
     */
    multiple?: boolean;
    parseRequest?: (
        request?: Req
    ) => {
        data?: unknown;
        headers?: unknown;
        params?: unknown;
        url?: string;
    };
    parseResponse?: (response: unknown, request?: Req) => Res;
    injectRequest?: InjectRequest;
};

function getInjectorData(
    store: Store<RootState>,
    domainName: string,
    injectRequest?: InjectRequest
) {
    return injectRequest
        ? R.path<StoreState>(
              [
                  domainName,
                  normalizePath(injectRequest.location[0]),
                  injectRequest.location[1]
              ],
              store.getState()
          )
        : undefined;
}

export default function getPost(
    api: AxiosInstance,
    domainName: string,
    store: Store<RootState>
) {
    return function post<Req, Res>(u: string, options: Options<Req, Res> = {}) {
        const normalizedUrl = normalizePath(u);

        const { dispatch } = store;

        const basePath = `${domainName}|${normalizedUrl}|post`;

        const { multiple, injectRequest } = options;

        const uuid = uuidv4();

        const getStoreState = () => {
            const storeState = multiple
                ? R.path<StoreState>(
                      [domainName, normalizedUrl, 'post', uuid],
                      store.getState()
                  )
                : R.path<StoreState>(
                      [domainName, normalizedUrl, 'post'],
                      store.getState()
                  );

            const validStoreState = storeState || getDefaultState();

            const data = (validStoreState?.data as Res) || undefined;

            return {
                ...validStoreState,
                data
            };
        };

        async function postSubmit(
            payload?: Req
        ): Promise<[string | undefined, Res | undefined]> {
            try {
                dispatch({
                    type: `${basePath}|loading${multiple ? `|${uuid}` : ''}`
                });

                const injectorData = getInjectorData(
                    store,
                    domainName,
                    injectRequest
                );

                const parsedRequest =
                    options.parseRequest && options.parseRequest(payload);

                const hasParsedData =
                    parsedRequest && R.has('data', parsedRequest);

                const parsedRequestData = hasParsedData
                    ? parsedRequest?.data
                    : payload;

                if (injectRequest) {
                    const provisionalData = injectRequest.injector(
                        injectorData as StoreState,
                        parsedRequestData
                    );
                    dispatch({
                        type: `${domainName}|${normalizePath(
                            injectRequest.location[0]
                        )}|${injectRequest.location[1]}|data`,
                        payload: provisionalData
                    });
                }

                const hasParsedHeaders =
                    parsedRequest && R.has('headers', parsedRequest);
                const hasParsedParams =
                    parsedRequest && R.has('params', parsedRequest);
                const hasParsedUrl =
                    parsedRequest && R.has('url', parsedRequest);

                const axiosConfig: AxiosRequestConfig = {};
                if (hasParsedHeaders) {
                    axiosConfig.headers = parsedRequest?.headers;
                }
                if (hasParsedParams) {
                    axiosConfig.params = parsedRequest?.params;
                }

                const apiUrl = hasParsedUrl
                    ? (parsedRequest?.url as string)
                    : normalizedUrl;

                const response = await api.post(
                    apiUrl,
                    parsedRequestData,
                    axiosConfig
                );

                const responseData: Res = options.parseResponse
                    ? options.parseResponse(response.data, payload)
                    : response.data;

                dispatch({
                    type: `${basePath}|data${multiple ? `|${uuid}` : ''}`,
                    payload: responseData
                });

                return [undefined, responseData];
            } catch (error) {
                dispatch({
                    type: `${basePath}|error${multiple ? `|${uuid}` : ''}`,
                    payload: error.toString()
                });
                return [error, undefined];
            }
        }

        return {
            getStoreState,
            /**
             * TODO: since we use getGetHook here -> it can be drastically simplified (because it currently uses same logic as in here^)
             */
            useHook: () =>
                getPostHook(api, domainName)<Req, Res>(normalizedUrl, options),
            execute: postSubmit,
            uuid
        };
    };
}
