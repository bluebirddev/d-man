import { v4 as uuidv4 } from 'uuid';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { RootState, StoreState } from '../store/reducer';
import { Store } from 'redux';
import {
    DefaultLocationOptions,
    Location,
    BaseOptions,
    GenericGeneratorResult
} from '..';
import {
    has,
    parseError,
    parseLocation,
    parseStoreState,
    path,
    wait
} from '../utils';

export default function genericGenerator<Req = any, Res = any>(
    domainApi: AxiosInstance,
    store: Store<RootState>,
    _location: DefaultLocationOptions,
    options: BaseOptions<Req, Res> = {},
    _uuid: string | undefined
): GenericGeneratorResult<Req, Res> {
    const { dispatch } = store;

    // This cannot be generated on each render.  If it comes from a hook, it should only generate once.
    // TODO: find a better way to do this.
    const uuid = options.multiple ? _uuid || uuidv4() : undefined;

    const location = parseLocation({ ..._location, uuid }, options) as Location;

    const selector = (state: RootState) => path<StoreState>(location, state);

    const getStoreState = () =>
        parseStoreState<Res>(selector(store.getState()));

    const reset = () => {
        dispatch({ type: location.join('|') });
    };

    const execute = async (
        data?: Req
    ): Promise<[string | undefined, Res | undefined]> => {
        try {
            dispatch({ type: `${location.join('|')}|loading` });

            const parsedRequest =
                options.parseRequest && options.parseRequest(data as Req);

            const hasParsedRequestData =
                parsedRequest && has('data', parsedRequest);
            const hasParsedHeaders =
                parsedRequest && has('headers', parsedRequest);
            const hasParsedParams =
                parsedRequest && has('params', parsedRequest);
            const hasParsedUrl = parsedRequest && has('url', parsedRequest);

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
                : _location.url;

            axiosConfig.data = parsedRequestData;

            const _responseData = await (async () => {
                if (options.fake) {
                    await wait(options.fake);
                    return undefined;
                }
                const response = await domainApi.request(axiosConfig);
                return response.data;
            })();

            if (options.injectResponse) {
                options.injectResponse.forEach((request) => {
                    const injectLocation = parseLocation(
                        _location,
                        request,
                        false
                    );
                    if (injectLocation) {
                        const injectorSelector = (state: RootState) =>
                            path<StoreState>(injectLocation, state);

                        const injectorStoreState = parseStoreState<Res>(
                            injectorSelector(store.getState())
                        );

                        const injectorPayload = request.parseResponse
                            ? request.parseResponse(
                                  injectorStoreState,
                                  _responseData,
                                  parsedRequestData
                              )
                            : _responseData;

                        dispatch({
                            type: `${injectLocation.join('|')}|data`,
                            payload: injectorPayload
                        });
                    }
                });
            }

            const responseData: Res = options.parseResponseData
                ? options.parseResponseData(_responseData, data)
                : _responseData;

            if (options.onSuccess) {
                await options.onSuccess(responseData, data);
            }

            dispatch({
                type: `${location.join('|')}|data`,
                payload: responseData
            });

            return [undefined, responseData];
        } catch (_error) {
            const error = parseError(_error);

            dispatch({
                type: `${location.join('|')}|error`,
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
