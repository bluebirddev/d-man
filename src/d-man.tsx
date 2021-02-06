import React from 'react';
import { Provider } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { createDomain } from './domains';
import setupStore from './store';
import { DMan, Domains, RootState } from '.';
import { generateLocal } from './local-data';

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
    /**
     * Optional call when logging out.  If result is false, cancel logging out process.
     */
    onLogout?: () => Promise<boolean>;
};

export function createDMan<T>(options: Options<T>): DMan<T> {
    /**
     * Generate the key with which to access localStorage.
     */
    const localStorageKey = options.localStorageKey || uuidv4();

    const store = setupStore(localStorageKey);

    if (!options.domain && !options.domains) {
        throw new Error('You must specify either domain or domains!');
    }

    /**
     * Create domains based of DomainOption(s)
     */
    const domains = (((() => {
        if (!options.domains) {
            /**
             * If there is only one domain, it will still exist within "domains" with
             * the "default" name.
             */
            return {
                default: createDomain(
                    'default',
                    options.domain as DomainOptions,
                    store
                )
            };
        }
        return Object.keys(options.domains).reduce<Partial<Domains<T>>>(
            (acc, _key) => {
                const key = _key as keyof T;
                const domainOptions = (options.domains as DomainsOptions<T>)[
                    key
                ];
                const domain = createDomain(
                    key as string,
                    domainOptions,
                    store
                );
                acc[key] = domain;
                return acc;
            },
            {}
        ) as Domains<T>;
    })() as unknown) as any) as Domains<T>;

    /**
     * Logs a user out.  May perform a logout function, like hitting an API before logging out completely
     * out the front-end.
     */
    async function logout() {
        if (options.onLogout) {
            if (!(await options.onLogout())) return;
        }
        localStorage.removeItem(localStorageKey);
        store.dispatch({ type: 'LOGOUT' });
    }

    // TODO: move auth to each individual request.
    // const InnerWrapper = ({ children }: { children: React.ReactNode }) => {
    //     const [setup, setSetup] = useState(false);

    //     useEffect(() => {
    //         for (const name in domains) {
    //             const domain = domains[name] as Domain;
    //             const { getAuthToken } =
    //                 name === 'default'
    //                     ? (options.domain as DomainOptions)
    //                     : (options.domains as DomainsOptions<T>)[name];

    //             if (getAuthToken) {
    //                 domain.api.interceptors.request.use((req) => {
    //                     const token = getAuthToken(store.getState());
    //                     if (token) {
    //                         req.headers.authorization = `Bearer ${token}`;
    //                     } else {
    //                         req.headers.authorization = undefined;
    //                     }
    //                     return req;
    //                 });
    //             }
    //         }
    //         setSetup(true);
    //     }, []);

    //     if (!setup) return null;

    //     return children as JSX.Element;
    // };

    const { local, useLocal } = generateLocal(store);

    const DManProvider = ({ children }: { children: React.ReactNode }) => {
        return <Provider store={store}>{children}</Provider>;
    };

    return {
        domains,
        domain: domains.default,
        logout,
        useLocal,
        local,
        Provider: DManProvider
    };
}
