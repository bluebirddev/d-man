import { Store } from 'redux';
import { v4 as uuidv4 } from 'uuid';
import { RootState, StoreState } from '../store/reducer';
import { path } from '../utils';
import { axiosExecutor } from './axios-executor';
import { performInjectRequests, performInjectResponses } from './injector';
import {
    AfterTransformRequestOptions,
    rest,
    RestApiExecutor,
    RestOptions,
    RestResponse
} from './rest';
import {
    StoreLocation,
    parseStoreLocation,
    addStoreLocationModifier,
    StoreLocationModifier,
    convertToPathStoreLocation
} from './store-location';

export type InjectRequest = {
    /**
     * If storeLocation is defined, then replace store response in that store location.
     * If storeLocation is not defined, store in default store location.
     */
    storeLocation?: string | StoreLocation;
    /**
     * request is after transformRequest.
     */
    transformer?: (requestData: any, storeState: StoreState<any>) => unknown;
};

export type InjectResponse<RequestData> = {
    /**
     * If storeLocation is defined, then replace store response in that store location.
     * If storeLocation is not defined, store in default store location.
     */
    storeLocation?: string | StoreLocation;
    /**
     * requestData is before transformRequest.
     * responseData is before transformResponse.
     */
    transformer?: (
        responseData: unknown,
        requestData: RequestData,
        storeState: StoreState<any>
    ) => unknown;
};

export type StoreRestOptions<
    RequestData = any,
    ResponseData = any
> = RestOptions<RequestData, ResponseData> & {
    /**
     * By default the storeLocation is - domain|action|method(|uuid)
     */
    storeLocation?: string | StoreLocation;
    /**
     * Before executing, injects the result of "transformer" at the "storeLocation".
     * Used for optimistic updates.
     */
    injectRequest?: InjectRequest | InjectRequest[];
    /**
     * After executing, injects the result of "transformer" at the "storeLocation".
     * Used for post execution updates.
     */
    injectResponse?:
        | InjectResponse<RequestData>
        | InjectResponse<RequestData>[];
    /**
     * If true - then create a uuid in the storeLocation.
     */
    multiple?: boolean;
    /**
     * Directly passes in uuid.
     */
    uuid?: string;
};

export function getStoreRest(
    domain: string,
    store: Store<RootState>,
    restApiExecutor: RestApiExecutor = axiosExecutor
) {
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
        const storeLocation: StoreLocation = parseStoreLocation(
            {
                domain,
                action: storeRestOptions.url,
                method: storeRestOptions.method,
                uuid
            },
            storeRestOptions.storeLocation
        );

        const selector = (state: RootState) =>
            path<StoreState>(convertToPathStoreLocation(storeLocation), state);

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

        /**
         * Injects request into store using "beforeExecute"
         */
        const beforeExecute = storeRestOptions.injectRequest
            ? async (requestOptions: AfterTransformRequestOptions) => {
                  if (storeRestOptions.beforeExecute) {
                      await storeRestOptions.beforeExecute(requestOptions);
                  }
                  performInjectRequests(
                      store,
                      storeLocation,
                      storeRestOptions.injectRequest as
                          | InjectRequest
                          | InjectRequest[],
                      requestOptions.data
                  );
              }
            : storeRestOptions.beforeExecute;

        /**
         * Injects request into store using "beforeExecute"
         */
        const afterExecute = storeRestOptions.injectResponse
            ? async (response: RestResponse) => {
                  if (storeRestOptions.afterExecute) {
                      await storeRestOptions.afterExecute(response);
                  }
                  performInjectResponses(
                      store,
                      storeLocation,
                      storeRestOptions.injectResponse as
                          | InjectResponse<RequestData>
                          | InjectResponse<RequestData>[],
                      response.data,
                      response.requestOptions.data
                  );
              }
            : storeRestOptions.afterExecute;

        async function execute() {
            store.dispatch({
                type: addStoreLocationModifier(
                    storeLocation,
                    StoreLocationModifier.loading
                )
            });

            const restResult = await rest(
                requestData,
                {
                    ...storeRestOptions,
                    beforeExecute,
                    afterExecute
                },
                restApiExecutor
            );

            if (storeRestOptions.afterExecute) {
                await storeRestOptions.afterExecute(restResult);
            }

            if (restResult.error) {
                store.dispatch({
                    type: addStoreLocationModifier(
                        storeLocation,
                        StoreLocationModifier.error
                    ),
                    payload: restResult.error
                });
            } else {
                store.dispatch({
                    type: addStoreLocationModifier(
                        storeLocation,
                        StoreLocationModifier.data
                    ),
                    payload: restResult.data
                });
            }

            return restResult;
        }

        return { execute, uuid, storeLocation, selector };
    }
    return storeRest;
}
