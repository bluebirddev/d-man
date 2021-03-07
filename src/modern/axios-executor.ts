import axios from 'axios';
import {
    AfterTransformRequestOptions,
    RestResponse,
    UseRequestInterceptor
} from './rest';

export const DEFAULT_MESSAGE = 'An unknown error has occured';

function defaultParseError(error: any) {
    try {
        return error.toString() || DEFAULT_MESSAGE;
    } catch (err) {
        return DEFAULT_MESSAGE;
    }
}

/**
 * The axios implementation of the executor.
 *
 * An exutor simply takes in the request paramaters and options, calls whatever method,
 * and returns a promise.
 */
export async function axiosExecutor(
    requestOptions: AfterTransformRequestOptions,
    parseError?: (error: any) => any,
    useRequestInterceptor?: UseRequestInterceptor
): Promise<RestResponse> {
    try {
        const instance = axios.create();
        if (useRequestInterceptor) {
            instance.interceptors.request.use(
                useRequestInterceptor.onSuccess,
                useRequestInterceptor.onError
            );
        }
        const response = await instance(requestOptions);
        return {
            data: response.data,
            requestOptions,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
        };
    } catch (err) {
        const parsedError = (parseError || defaultParseError)(err);
        return {
            error: parsedError,
            requestOptions,
            status: err?.response?.status,
            statusText: err?.response?.statusText,
            headers: err?.response?.headers,
            data: err?.response?.data
        };
    }
}
