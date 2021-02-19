import { StoreState } from '../store/reducer';

export type Method = 'get' | 'post' | 'put' | 'delete' | 'patch';

export type RequestOptions<Data = any> = {
    /**
     * Basic rest options - get, post, put, etc.
     */
    method?: Method;
    /**
     * Either pass the full url, like: "https://example.com/users"
     * or pass "https://example.com" in baseUrl, and "/users" here.
     */
    url?: string;
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

/**
 * request is "post" transformRequest.
 */
type InjectRequest<Request> = (request: Request) => unknown;

/**
 * request is before transformRequest.
 * response is before transformResponse.
 */
type InjectResponse<Request> = (
    response: unknown,
    request: Request,
    storeState: StoreState<any>
) => unknown;

/**
 * Request: the initial request that is passed in.
 * Response: the final data that comes out.
 */
export type UseRestOptions<Request = any, Response = any> = Omit<
    RequestOptions<Response>,
    'data'
> & {
    /**
     * Before submit, transforms request.  It will replace any options already defined.
     */
    transformRequest?: (
        request: Request,
        requestOptions: RequestOptions
    ) => RequestOptions;
    /**
     * After submit, transforms response data.
     */
    transformResponseData?: (
        response: unknown,
        requestOptions: RequestOptions
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
     *
     */
    preExecute?: () => void;
};

export function rest<Request = any, Response = any>(
    options: UseRestOptions<Request, Response>
) {
    const execute = async (
        request: Request
    ): Promise<
        [string | undefined, Request | undefined, AxiosRespose<any> | undefined]
    > => {
        try {
            if (options.preExecute) {
                options.preExecute();
            }
        } catch (err) {}
    };

    return true;
}
