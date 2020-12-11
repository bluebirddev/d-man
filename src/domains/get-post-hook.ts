import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as R from 'ramda';
import { v4 as uuidv4 } from 'uuid';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getDefaultState, RootState, StoreState } from '../store/reducer';
import { normalizePath } from '../utils';

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
        request: Req
    ) => {
        data?: unknown;
        headers?: unknown;
        params?: unknown;
        url?: string;
    };
    parseResponse?: (response: unknown, request: Req) => Res;
    injectRequest?: InjectRequest;
};

function useInjectorData(domainName: string, injectRequest?: InjectRequest) {
    return useSelector((state) =>
        injectRequest
            ? R.path<StoreState>(
                  [
                      domainName,
                      normalizePath(injectRequest.location[0]),
                      injectRequest.location[1]
                  ],
                  state
              )
            : undefined
    );
}

export default function getPostHook(api: AxiosInstance, domainName: string) {
    return function usePost<Req, Res>(
        u: string,
        options: Options<Req, Res> = {}
    ) {
        const normalizedUrl = normalizePath(u);

        const basePath = `${domainName}|${normalizedUrl}|post`;

        const { multiple, injectRequest } = options;

        const uuid = useMemo(() => uuidv4(), []);

        const storeState =
            useSelector((state: RootState) =>
                multiple
                    ? R.path<StoreState>(
                          [domainName, normalizedUrl, 'post', uuid],
                          state
                      )
                    : R.path<StoreState>(
                          [domainName, normalizedUrl, 'post'],
                          state
                      )
            ) || getDefaultState();

        const injectorData = useInjectorData(domainName, injectRequest);

        const dispatch = useDispatch();

        const post: (
            payload?: Req
        ) => Promise<[string | undefined, Res | undefined]> = useCallback(
            async (payload: Req) => {
                try {
                    dispatch({
                        type: `${basePath}|loading${multiple ? `|${uuid}` : ''}`
                    });

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
            },
            [basePath, dispatch, multiple, normalizedUrl, options, uuid]
        );

        return {
            ...storeState,
            data: storeState.data ? (storeState.data as Res) : undefined,
            post,
            uuid
        };
    };
}
