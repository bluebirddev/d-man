import React, { useEffect, useState } from 'react';
import * as R from 'ramda';
import { Provider } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { createDomain } from './domains';
import setupStore from './store';
import { Options, Rrs, Domains, DomainOptions, DomainsOptions } from '.';

export function createRrs<T>(options: Options<T>): Rrs<T> {
    const localStorageKey = options.localStorageKey || uuidv4();

    const store = setupStore(localStorageKey);

    if (!options.domain && !options.domains) {
        throw new Error('You must specify either domain or domains!');
    }

    const domains = (((() => {
        if (!options.domains) {
            return {
                default: createDomain(
                    'default',
                    options.domain as DomainOptions
                )
            };
        }
        return R.reduce<keyof T, Partial<Domains<T>>>(
            (acc, key) => {
                const domainOptions = (options.domains as DomainsOptions<T>)[
                    key
                ];
                const domain = createDomain(key as string, domainOptions);
                acc[key] = domain;
                return acc;
            },
            {},
            R.keys(options.domains)
        ) as Domains<T>;
    })() as unknown) as any) as Domains<T>;

    function logout() {
        localStorage.removeItem(localStorageKey);
        store.dispatch({ type: 'LOGOUT' });
    }

    const InnerWrapper = ({ children }: { children: React.ReactNode }) => {
        const [setup, setSetup] = useState(false);

        useEffect(() => {
            R.forEachObjIndexed((domain, name) => {
                const { getAuthToken } =
                    name === 'default'
                        ? (options.domain as DomainOptions)
                        : (options.domains as DomainsOptions<T>)[name];

                if (getAuthToken) {
                    domain.api.interceptors.request.use((req) => {
                        const token = getAuthToken(store.getState());
                        if (token) {
                            req.headers.authorization = `Bearer ${token}`;
                        } else {
                            req.headers.authorization = undefined;
                        }
                        return req;
                    });
                }
            }, domains);
            setSetup(true);
        }, []);

        if (!setup) return null;

        return children as JSX.Element;
    };

    const RrsProvider = ({ children }: { children: React.ReactNode }) => {
        return (
            <Provider store={store}>
                <InnerWrapper>{children}</InnerWrapper>
            </Provider>
        );
    };

    return {
        domains,
        domain: domains.default,
        logout,
        Provider: RrsProvider
    };
}
