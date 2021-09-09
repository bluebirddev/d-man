import React from 'react';
import { Provider } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import {
    createDomain,
    DomainOptions,
    Domains,
    DomainsOptions
} from './domains';
import setupStore from './store';
import { DMan } from '.';
import { generateLocal } from './local-data';

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
    const domains = (() => {
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
    })() as unknown as any as Domains<T>;

    /**
     * Logs a user out.  May perform a logout function, like hitting an API before logging out completely
     * out the front-end.
     */
    async function logout() {
        if (options.onLogout) {
            if (!(await options.onLogout())) return;
        }
        try {
            await AsyncStorage.removeItem(localStorageKey);
        } catch (error) {
            //
        }
        store.dispatch({ type: 'LOGOUT' });
    }

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
