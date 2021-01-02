import { createDomain } from './domains';
import { RootState, DomainState, StoreState } from './store/reducer';
import { createDMan } from './d-man';

export { RootState, DomainState, StoreState };

export type DomainsOptions<T> = Record<keyof T, DomainOptions>;

export type DomainOptions = {
    /**
     * The root of the api you are accessing.
     */
    baseURL: string;
    /**
     * This will execute before every rest request to obtain the latest auth token.
     */
    getAuthToken?: (state: RootState) => string | undefined;
};

export type Options<T> = {
    /**
     * Name of the local storage key.  Defaults to a random GUID.
     */
    localStorageKey?: string;
    /**
     * If passing only one rest client.
     */
    domain?: DomainOptions;
    /**
     * If passing multiple rest clients.
     */
    domains?: DomainsOptions<T>;
};

export type Domain = ReturnType<typeof createDomain>;

export type Domains<T> = Record<keyof T | 'default', Domain>;

export type UseLocalResponse<X> = {
    data: X;
    dispatch: (data: X) => void;
};

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
        useHook: UseLocalResponse<X>;
        dispatch: (data: X) => void;
    };
};

export type Method = 'get' | 'post' | 'put' | 'delete';
export type Location =
    | [string, string, Method]
    | [string, string, Method, string];

export type DefaultLocationOptions = {
    url: string;
    method: Method;
    domain: string;
    multiple?: string;
};

export type LocationOptions = {
    url?: string;
    method?: Method;
    domain?: string;
    location?: Location;
    multiple?: string;
};

export type InjectRequest = LocationOptions & {
    /**
     * @data The store data of specified location.
     * @requestData The data post "parseRequest".
     */
    parseRequestData?: (data: StoreState<any>, requestData: unknown) => unknown;
};

export type InjectResponse = LocationOptions & {
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

export type ParseResponseData<Res> = (
    responseData: unknown,
    requestData?: unknown
) => Res;

export type ParseRequest<Req> = (
    requestData?: Req
) => {
    data?: unknown;
    headers?: unknown;
    params?: unknown;
    url?: string;
};

export type BaseOptions<Req, Res> = LocationOptions & {
    parseResponseData?: ParseResponseData<Res>;
    parseRequest?: ParseRequest<Req>;
    injectResponse?: InjectResponse[];
    injectRequest?: InjectRequest[];
};

export type PostOptions<Req = any, Res = any> = BaseOptions<Req, Res>;
export type PostHookOptions = {};

export type DeleteOptions<Res = any, Req = any> = BaseOptions<Req, Res>;
export type DeleteHookOptions = {};

export type GetOptions<Res = any, Req = any> = BaseOptions<Req, Res>;
export type GetHookOptions = {
    /**
     * Will trigger every interval milliseconds.
     */
    interval?: number;
    /**
     * Will not execute on load.
     */
    lazy?: boolean;
};

export { createDMan };
