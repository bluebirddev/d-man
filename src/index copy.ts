import { AxiosRequestConfig } from 'axios';
import { StoreState } from './store/reducer';
import { createDMan } from './d-man';
import { StoreLocation } from './store-location';
import { Domain, Domains } from './domains';
import { UseLocalResponse } from './local-data';
// import { rest } from './modern/rest';

export type DMan<T> = {
    /**
     * Record that matches the "domains" object you passed in.
     */
    domains: Domains<T>;
    /**
     * Record that matches the "domain" object you passed in.
     */
    domain: Domain;
    /**
     * Clears the local storage cache and redux store.
     */
    logout: () => void;
    /**
     * Required wrapper to allow RRS to work.
     */
    Provider: (props: { children: React.ReactNode }) => JSX.Element;
    /**
     * Using local store.
     */
    useLocal: <X>(
        localName: string,
        defaultValue?: X,
        persist?: boolean
    ) => UseLocalResponse<X>;
    /**
     * Local store.
     */
    local: <X>(
        localName: string,
        defaultValue?: X,
        persist?: boolean
    ) => {
        getData: () => X;
        useHook: () => UseLocalResponse<X>;
        dispatch: (data: X) => void;
    };
};

export type InjectRequest = {
    storeLocation?: StoreLocation;
} & {
    /**
     * @data The store data of specified location.
     * @requestData The data post "parseRequest".
     */
    parseRequestData?: (data: StoreState<any>, requestData: unknown) => unknown;
};

export type InjectResponse = {
    storeLocation?: StoreLocation;
} & {
    /**
     * @data The store data of specified location.
     * @responseData The data pre "parseResponse".
     * @requestData The data post "parseRequest".
     */
    parseResponse?: (
        data: StoreState<any>,
        responseData: unknown,
        requestData: unknown
    ) => unknown;
};

export type TransformResponseData<Req, Res> = (
    responseData: unknown,
    requestData?: Req
) => Res;

export type TransformedRequest = {
    data?: unknown;
    headers?: unknown;
    queryParams?: unknown;
    url?: string;
    urlParams?: Record<string, string | number | undefined>;
};

export type TransformRequest<Req> = (requestData: Req) => TransformedRequest;

export type DManAxiosRequestConfig = {
    queryParams?: AxiosRequestConfig['params'];
    urlParams?: Record<string, string | number | undefined>;
} & Omit<
    AxiosRequestConfig,
    'transformRequest' | 'transformResponse' | 'params'
>;

export type BaseOptions<Req, Res> = {
    storeLocation?: StoreLocation;
} & {
    requestConfig?: DManAxiosRequestConfig;
    transformResponseData?: TransformResponseData<Req, Res>;
    transformRequest?: TransformRequest<Req>;
    injectResponse?: InjectResponse[];
    injectRequest?: InjectRequest[];
    multiple?: boolean;
    fake?: number;
    onSuccess?: (res: Res, req?: Req) => Promise<void>;
};

export { createDMan };
