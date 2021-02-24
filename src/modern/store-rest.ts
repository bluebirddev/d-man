import { v4 as uuidv4 } from 'uuid';
import { StoreState } from '../store/reducer';
import { AfterTransformRequestOptions, RestOptions } from './rest';
import { StoreLocation, getInitialStoreLocation } from './store-location';

type InjectRequest<RequestData> = {
    /**
     * If storeLocation is defined, then replace store response in that store location.
     * If storeLocation is not defined, store in default store location.
     */
    storeLocation?: string | StoreLocation;
    /**
     * request is after transformRequest.
     */
    transformer: (
        requestData: RequestData,
        storeState: StoreState<any>
    ) => unknown;
};

type InjectResponse<RequestData> = {
    /**
     * If storeLocation is defined, then replace store response in that store location.
     * If storeLocation is not defined, store in default store location.
     */
    storeLocation?: string | StoreLocation;
    /**
     * requestData is before transformRequest.
     * responseData is before transformResponse.
     */
    transformer: (
        responseData: unknown,
        requestData: RequestData,
        storeState: StoreState<any>
    ) => unknown;
};

export type StoreRestOptions<RequestData = any, ResponseData = any> = Omit<
    RestOptions<RequestData, ResponseData>,
    'beforeExecute' | 'afterExecute'
> & {
    /**
     * By default the storeLocation is - domain|action|method(|uuid)
     */
    storeLocation?: string | StoreLocation;
    /**
     * Before executing, injects the result of "transformer" at the "storeLocation".
     * Used for optimistic updates.
     */
    injectRequest?: InjectRequest<RequestData> | InjectRequest<RequestData>[];
    /**
     * After executing, injects the result of "transformer" at the "storeLocation".
     * Used for post execution updates.
     */
    injectResponse?: InjectResponse<Request> | InjectResponse<Request>[];
    /**
     * If true - then create a uuid in the storeLocation.
     */
    multiple?: boolean;
    /**
     * Directly passes in uuid.
     */
    uuid?: string;
};

export function getStoreRest(domain: string) {
    function storeRest<RequestData = any, ResponseData = any>(
        requestData: RequestData,
        storeRestOptions: StoreRestOptions<RequestData, ResponseData>
    ) {
        /**
         * Generates uuid if multiple.  Prioritize explicit defined uuid.
         */
        const uuid = (() => {
            if (storeRestOptions.uuid) return storeRestOptions.uuid;
            if (storeRestOptions.multiple) return uuidv4();
            return undefined;
        })();

        /**
         * Gets initial storeLocation.  Prioritize "storeLocation" prop.
         */
        const storeLocation: StoreLocation = getInitialStoreLocation(
            {
                domain,
                action: storeRestOptions.url,
                method: storeRestOptions.method,
                uuid
            },
            storeRestOptions.storeLocation
        );

        /**
         * Do not progress if storeLocation is invalid.
         */
        if (
            !storeLocation.domain ||
            !storeLocation.action ||
            !storeLocation.method
        ) {
            throw new Error(
                `Something went wrong.  Location not defined properly: ${JSON.stringify(
                    storeLocation
                )}`
            );
        }

        const beforeExecute =
            storeRestOptions.injectRequest &&
            ((requestOptions: AfterTransformRequestOptions) => {
                const injectRequests = (Array.isArray(
                    storeRestOptions.injectRequest
                )
                    ? storeRestOptions.injectRequest
                    : [
                          storeRestOptions.injectRequest
                      ]) as InjectRequest<RequestData>[];

                injectRequests.forEach((injector) => {
                    const injectLocation = getStoreLocation(
                        storeLocation,
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
            });
    }
    return storeRest;
}
