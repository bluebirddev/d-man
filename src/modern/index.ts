import { v4 as uuidv4 } from 'uuid';
import { StoreState } from '../store/reducer';
import { getInitialStoreLocation, StoreLocation } from './store-location';

type Method = 'get' | 'post' | 'put' | 'delete' | 'patch';

type RequestOptions<Data = any> = {
    /**
     * Basic rest options - get, post, put, etc.
     */
    method: Method;
    /**
     * Either pass the full url, like: "https://example.com/users"
     * or pass "https://example.com" in baseUrl, and "/users" here.
     */
    url: string;
    /**
     * Any request will prepend this to the url.
     */
    baseUrl?: string;
    /**
     * Pass a record of query params, like: { name: 'cj' }.
     * It will be appended to the url, like: "https://example.com/users?name=cj"
     */
    queryParams?: Record<string, string | number | boolean>;
    /**
     * Replaces parameters within a url like:
     * give url: https://example.com/users/{id}/details?name={name}
     * and queryParams: { id: 2, name: 'cj' } results in:
     * https://example.com/users/2/details?name=cj
     */
    urlParams?: Record<string, string | number>;
    /**
     * Data being submitted in body.
     */
    data?: Data;
    /**
     * Headers of the request.
     */
    headers?: Record<string, string>;
};

type InjectRequest<Request> = {
    /**
     * If storeLocation is defined, then replace store response in that store location.
     * If storeLocation is not defined, store in default store location.
     */
    storeLocation?: string | StoreLocation;
    /**
     * request is "post" transformRequest.
     */
    transformer: (request: Request, storeState: StoreState<any>) => unknown;
};

type InjectResponse<Request> = {
    /**
     * If storeLocation is defined, then replace store response in that store location.
     * If storeLocation is not defined, store in default store location.
     */
    storeLocation?: string | StoreLocation;
    /**
     * request is before transformRequest.
     * response is before transformResponse.
     */
    transformer: (
        response: unknown,
        request: Request,
        storeState: StoreState<any>
    ) => unknown;
};

/**
 * Request: the initial request that is passed in.
 * Response: the final data that comes out.
 */
export type UseRestOptions<
    Request = any,
    Response = any
> = RequestOptions<Response> & {
    /**
     * By default the storeLocation is - domain|action|method(|uuid)
     */
    storeLocation?: string | StoreLocation;
    /**
     * Should it execute onMount, or onDemand.  By default: get=true, rest=false
     */
    lazy?: boolean;
    /**
     * Before submit, transforms request.  It will replace any options already defined.
     * *Note: if lazy=false, and the function is not memoized, the hook will trigger on every render.
     */
    transformRequest?: (
        request?: Request,
        storeState?: StoreState<any>
    ) => RequestOptions;
    /**
     * After submit, transforms response data.
     * *Note: if lazy=false, and the function is not memoized, the hook will trigger on every render.
     */
    transformResponseData?: (
        response?: unknown,
        requestOptions?: RequestOptions,
        storeState?: StoreState<any>
    ) => Response;
    /**
     * Before executing, injects the result of "transformer" at the "storeLocation".
     * Used for optimistic updates.
     */
    injectRequest?: InjectRequest<Request> | InjectRequest<Request>[];
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

export function getRest(domain: string) {
    function rest<Request = any, Response = any>(
        options: UseRestOptions<Request, Response>
    ) {
        /**
         * Generates uuid if multiple.  Prioritize explicit defined uuid.
         */
        const uuid = (() => {
            if (options.uuid) return options.uuid;
            if (options.multiple) return uuidv4();
            return undefined;
        })();

        /**
         * Gets initial storeLocation.  Prioritize "storeLocation" prop.
         */
        const storeLocation: StoreLocation = getInitialStoreLocation(
            {
                domain,
                action: options.url,
                method: options.method,
                uuid
            },
            options.storeLocation
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

        const execute = async (
            request: Request
        ): Promise<
            [
                string | undefined,
                Request | undefined,
                AxiosRespose<any> | undefined
            ]
        > => {
            try {
            } catch (err) {}
        };

        return true;
    }
    return rest;
}
