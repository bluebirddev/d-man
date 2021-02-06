import { createSelector } from 'reselect';
import { useSelector } from 'react-redux';
import { Store } from 'redux';
import { DomainState, RootState } from '../store/reducer';
import postGenerator from './post-generator';
import postHookGenerator from './post-hook-generator';
import getGenerator from './get-generator';
import getHookGenerator from './get-hook-generator';
import deleteGenerator from './delete-generator';
import deleteHookGenerator from './delete-hook-generator';
import putGenerator from './put-generator';
import putHookGenerator from './put-hook-generator';

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

    /**
     * Axios interceptors
     */
    useRequestInterceptor?: {
        onSuccess: (value: any) => any | Promise<any>;
        onError: (error: any) => any;
    };
};

export type Domain = ReturnType<typeof createDomain>;

export type Domains<T> = Record<keyof T | 'default', Domain>;

export function createDomain(
    domain: string,
    domainOptions: DomainOptions,
    store: Store<RootState>
) {
    return {
        post: postGenerator(domain, domainOptions, store),
        usePost: postHookGenerator(domain, domainOptions, store),

        put: putGenerator(domain, domainOptions, store),
        usePut: putHookGenerator(domain, domainOptions, store),

        get: getGenerator(domain, domainOptions, store),
        useGet: getHookGenerator(domain, domainOptions, store),

        delete: deleteGenerator(domain, domainOptions, store),
        useDelete: deleteHookGenerator(domain, domainOptions, store),

        useSelector: (selector: (state: DomainState) => unknown) =>
            useSelector(
                createSelector((state: RootState) => state[domain], selector)
            )
    };
}
