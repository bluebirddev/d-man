import * as R from 'ramda';
import { v4 as uuidv4 } from 'uuid';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { RootState, StoreState } from '../store/reducer';
import { Store } from 'redux';
import { DefaultLocationOptions, Location, BaseOptions } from '..';
import { parseError, parseLocation, parseStoreState } from '../utils';

export default function genericGenerator<Req = any, Res = any>(
    domainApi: AxiosInstance,
    store: Store<RootState>,
    _location: DefaultLocationOptions,
    options: BaseOptions<Req, Res> = {}
) {
    const { dispatch } = store;

    const uuid = options.multiple ? uuidv4() : undefined;

    const location = parseLocation(
        { ..._location, multiple: uuid },
        options
    ) as Location;

    const selector = (state: RootState) => R.path<StoreState>(location, state);

    const getStoreState = parseStoreState<Res>(
        selector(store.getState()),
        options.parseResponseData
    );

    const reset = () => {
        dispatch({ type: location });
    };

    const execute = async (
        data?: Req
    ): Promise<[string | undefined, Res | undefined]> => {
        try {
            dispatch({ type: `${location}|loading` });

            const parsedRequest =
                options.parseRequest && options.parseRequest(data);

            const hasParsedRequestData =
                parsedRequest && R.has('data', parsedRequest);
            const hasParsedHeaders =
                parsedRequest && R.has('headers', parsedRequest);
            const hasParsedParams =
                parsedRequest && R.has('params', parsedRequest);
            const hasParsedUrl = parsedRequest && R.has('url', parsedRequest);

            const parsedRequestData = hasParsedRequestData
                ? parsedRequest?.data
                : data;

            if (options.injectRequest) {
                options.injectRequest.forEach((injector) => {
                    const injectLocation = parseLocation(
                        _location,
                        injector,
                        false
                    );
                    if (injectLocation) {
                        const injectorSelector = (state: RootState) =>
                            R.path<StoreState>(injectLocation, state);

                        const injectorStoreState = parseStoreState(
                            injectorSelector(store.getState())
                        );

                        const injectorData = injector.parseRequestData
                            ? injector.parseRequestData(
                                  injectorStoreState,
                                  parsedRequestData
                              )
                            : parsedRequestData;

                        dispatch({
                            type: `${location}|data`,
                            payload: injectorData
                        });
                    }
                });
            }

            const axiosConfig: AxiosRequestConfig = {
                method: location[2]
            };
            if (hasParsedHeaders) {
                axiosConfig.headers = parsedRequest?.headers;
            }
            if (hasParsedParams) {
                axiosConfig.params = parsedRequest?.params;
            }

            axiosConfig.url = hasParsedUrl
                ? (parsedRequest?.url as string)
                : location[1];

            axiosConfig.data = parsedRequestData;

            const response = await domainApi.request(axiosConfig);

            if (options.injectResponse) {
                options.injectResponse.forEach((request) => {
                    const injectLocation = parseLocation(
                        _location,
                        request,
                        false
                    );
                    if (injectLocation) {
                        const injectorSelector = (state: RootState) =>
                            R.path<StoreState>(injectLocation, state);

                        const injectorStoreState = parseStoreState(
                            injectorSelector(store.getState())
                        );

                        const injectorPayload = request.parseResponse
                            ? request.parseResponse(
                                  injectorStoreState,
                                  response.data,
                                  parsedRequestData
                              )
                            : response.data;

                        dispatch({
                            type: `${location}|data`,
                            payload: injectorPayload
                        });
                    }
                });
            }

            const responseData: Res = options.parseResponseData
                ? options.parseResponseData(response.data, parsedRequestData)
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
        execute,
        reset,
        uuid
    };
}
