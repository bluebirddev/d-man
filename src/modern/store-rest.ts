import { Store } from 'redux';
import { v4 as uuidv4 } from 'uuid';
import { RootState, StoreState } from '../store/reducer';
import { performInjectRequests } from './injector';
import {
    AfterTransformRequestOptions,
    rest,
    RestOptions,
    RestResponse
} from './rest';
import { StoreLocation, parseStoreLocation } from './store-location';

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
    injectRequest?: InjectRequest | InjectRequest[];
    /**
     * After executing, injects the result of "transformer" at the "storeLocation".
     * Used for post execution updates.
     */
    injectResponse?: InjectResponse<Request> | InjectResponse<Request>[];
    /**
     * Called after onSuccess.  Will await for result before continuing.
     */
    onSuccess?: (response: RestResponse<RequestData>) => Promise<void> | void;
    /**
     * Called after onError.  Will await for result before continuing.
     */
    onError?: (response: RestResponse<RequestData>) => Promise<void> | void;
    /**
     * If true - then create a uuid in the storeLocation.
     */
    multiple?: boolean;
    /**
     * Directly passes in uuid.
     */
    uuid?: string;
};

export function getStoreRest(domain: string, store: Store<RootState>) {
    async function storeRest<RequestData = any, ResponseData = any>(
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
        const beforeExecute =
            storeRestOptions.injectRequest &&
            ((requestOptions: AfterTransformRequestOptions) => {
                performInjectRequests(
                    store,
                    storeLocation,
                    storeRestOptions.injectRequest as
                        | InjectRequest
                        | InjectRequest[],
                    requestOptions.data
                );
            });

        const restResult = await rest(requestData, {
            ...storeRestOptions,
            beforeExecute
        });
    }
    return storeRest;
}
