import { axiosExecutor } from './axios-executor';
import { execute } from './execute';

export type Method = 'get' | 'post' | 'put' | 'delete' | 'patch';

/**
 * The options you pass in to change the request.
 */
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
 * The same as RequestOptions, except this is after all the RequestOptions have been transformed and validated.
 */
export type AfterTransformRequestOptions = Omit<
    RequestOptions,
    'urlParams' | 'baseUrl'
>;

/**
 * Complete rest response.
 */
export type RestResponse<ResponseData = any> = {
    error?: string | undefined;
    data?: ResponseData;
    requestOptions: AfterTransformRequestOptions;
    status?: number;
    statusText?: string;
    headers?: Record<string, string | number>;
};

export type UseRequestInterceptor = {
    onSuccess: (value: any) => any | Promise<any>;
    onError: (error: any) => any;
};

/**
 * Request: the initial request that is passed in.
 * Response: the final data that comes out.
 */
export type RestOptions<RequestData = any, ResponseData = any> = Omit<
    RequestOptions<ResponseData>,
    'data'
> & {
    /**
     * Before submit, transforms request.  It will replace any options already defined.
     */
    transformRequest?: (
        requestData: RequestData,
        requestOptions: RequestOptions
    ) => RequestOptions;
    /**
     * After submit, transforms response data.
     */
    transformResponseData?: (response: RestResponse) => ResponseData;
    /**
     * After transform request.
     */
    beforeExecute?: (
        requestOptions: AfterTransformRequestOptions
    ) => void | Promise<void>;
    /**
     * After transform response.
     */
    afterExecute?: (response: RestResponse) => void | Promise<void>;
    /**
     * Side effect interceptor that has no affect on the rest of the flow.
     */
    useRequestInterceptor?: UseRequestInterceptor;
    /**
     * Parse error that occurs after apiExecute
     */
    parseError?: (error: any) => any;
};

/**
 * The function that will actually make the api call.
 */
export type ApiExecutor = (
    requestOptions: AfterTransformRequestOptions,
    parseError?: (error: any) => any,
    useRequestInterceptor?: UseRequestInterceptor
) => Promise<RestResponse>;

export function rest<RequestData = any, ResponseData = any>(
    requestData: RequestData,
    restOptions: RestOptions<RequestData, ResponseData>
) {
    return execute<RequestData, ResponseData>(
        requestData,
        restOptions,
        axiosExecutor
    );
}
