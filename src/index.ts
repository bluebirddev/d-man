import { createDomain } from './domains';
import { RootState, DomainState, StoreState } from './store/reducer';
import { createDMan } from './d-man';

export { RootState, DomainState, StoreState };

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
        useHook: () => UseLocalResponse<X>;
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
    uuid?: string;
};

export type LocationOptions = {
    url?: string;
    method?: Method;
    domain?: string;
    location?: Location;
    uuid?: boolean;
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

export type ParseResponseData<Req, Res> = (
    responseData: unknown,
    requestData?: Req
) => Res;

export type ParseRequest<Req> = (
    requestData: Req
) => {
    data?: unknown;
    headers?: unknown;
    params?: unknown;
    url?: string;
};

export type BaseOptions<Req, Res> = LocationOptions & {
    parseResponseData?: ParseResponseData<Req, Res>;
    parseRequest?: ParseRequest<Req>;
    injectResponse?: InjectResponse[];
    injectRequest?: InjectRequest[];
    multiple?: boolean;
    fake?: number;
    onSuccess?: (res: Res, req?: Req) => Promise<void>;
};

export type PostOptions<Req = any, Res = any> = BaseOptions<Req, Res>;
export type PostHookOptions = {};

export type PutOptions<Req = any, Res = any> = BaseOptions<Req, Res>;
export type PutHookOptions = {};

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

export type GenericGeneratorResult<Req, Res> = {
    selector: (state: RootState) => StoreState<unknown> | undefined;
    location: Location;
    getState: () => StoreState<Res>;
    execute: (
        data?: Req | undefined
    ) => Promise<[string | undefined, Res | undefined]>;
    reset: () => void;
    uuid: string | undefined;
};

export type GetHookResult<Req, Res> = GenericGeneratorResult<Req, Res> &
    StoreState<Res>;
export type GetResult<Req, Res> = GenericGeneratorResult<Req, Res> & {
    useHook: (hookOptions?: GetHookOptions) => GetHookResult<Req, Res>;
};

export type DeleteHookResult<Req, Res> = GenericGeneratorResult<Req, Res> &
    StoreState<Res>;
export type DeleteResult<Req, Res> = GenericGeneratorResult<Req, Res> & {
    useHook: (hookOptions?: DeleteHookOptions) => DeleteHookResult<Req, Res>;
};

export type PostHookResult<Req, Res> = GenericGeneratorResult<Req, Res> &
    StoreState<Res>;
export type PostResult<Req, Res> = GenericGeneratorResult<Req, Res> & {
    useHook: (hookOptions?: PostHookOptions) => PostHookResult<Req, Res>;
};

export type PutHookResult<Req, Res> = GenericGeneratorResult<Req, Res> &
    StoreState<Res>;
export type PutResult<Req, Res> = GenericGeneratorResult<Req, Res> & {
    useHook: (hookOptions?: PutHookOptions) => PutHookResult<Req, Res>;
};

export { createDMan };
