import { createDomain } from './domains';
import { RootState } from './store/reducer';

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

export type Rrs<T> = {
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
};