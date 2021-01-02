import React, { useEffect, useState } from 'react';
import * as R from 'ramda';
import { Provider, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { createDomain } from './domains';
import setupStore from './store';
import {
    Options,
    DMan,
    Domains,
    DomainOptions,
    DomainsOptions,
    RootState,
    UseLocalResponse
} from '.';

export function createDMan<T>(options: Options<T>): DMan<T> {
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
                    options.domain as DomainOptions,
                    store
                )
            };
        }
        return R.reduce<keyof T, Partial<Domains<T>>>(
            (acc, key) => {
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

    function local<X>(
        localName: string,
        defaultValue?: X,
        persist?: boolean
    ): {
        getData: () => X;
        useHook: () => UseLocalResponse<X>;
        dispatch: (data: X) => void;
    } {
        const key = `LOCAL${persist ? '-PERSIST' : ''}`;

        const allSelector = (state: RootState) => {
            return R.path<Record<string, any>>([key], state);
        };

        const selector = (state: RootState) => {
            const allLocalData = allSelector(state);
            return (allLocalData && allLocalData[localName]) || defaultValue;
        };

        function dispatch(value: X) {
            store.dispatch({ type: `${key}|${localName}`, payload: value });
        }

        function getData() {
            return selector(store.getState());
        }

        return {
            getData,
            dispatch,
            useHook: () => useLocal<X>(localName, defaultValue, persist)
        };
    }

    function useLocal<X>(
        localName: string,
        defaultValue?: X,
        persist?: boolean
    ): UseLocalResponse<X> {
        const key = `LOCAL${persist ? '-PERSIST' : ''}`;

        const allSelector = (state: RootState) => {
            return R.path<Record<string, any>>([key], state);
        };

        const selector = (state: RootState) => {
            const allLocalData = allSelector(state);
            return (allLocalData && allLocalData[localName]) || defaultValue;
        };

        const _local = local(localName, defaultValue, persist);

        const allData = useSelector(allSelector);
        const data = useSelector(selector);

        React.useEffect(() => {
            if (defaultValue && (!allData || !allData[localName])) {
                _local.dispatch(defaultValue);
            }
        }, []);

        return { ..._local, data };
    }

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
        useLocal,
        local,
        Provider: RrsProvider
    };
}
