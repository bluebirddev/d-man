import axios, { AxiosRequestConfig } from 'axios';
import { createSelector } from 'reselect';
import { useSelector } from 'react-redux';
import { DomainState, RootState } from '../store/reducer';
import { DomainOptions } from '..';
import { Store } from 'redux';
import postGenerator from './post-generator';
import postHookGenerator from './post-hook-generator';
import getGenerator from './get-generator';
import getHookGenerator from './get-hook-generator';
import deleteGenerator from './delete-generator';
import deleteHookGenerator from './delete-hook-generator';

export function createDomain(
    domain: string,
    domainOptions: DomainOptions,
    store: Store<RootState>
) {
    const domainApi = axios.create({
        baseURL: domainOptions.baseURL
    });

    return {
        post: postGenerator(domainApi, domain, store),
        usePost: postHookGenerator(domainApi, domain, store),

        get: getGenerator(domainApi, domain, store),
        useGet: getHookGenerator(domainApi, domain, store),

        delete: deleteGenerator(domainApi, domain, store),
        useDelete: deleteHookGenerator(domainApi, domain, store),

        useSelector: (selector: (state: DomainState) => unknown) =>
            useSelector(
                createSelector((state: RootState) => state[domain], selector)
            ),

        api: domainApi,

        addErrorInterceptor: (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            errorInterceptor: (error: any) => unknown
        ) => {
            domainApi.interceptors.response.use((req) => req, errorInterceptor);
        },

        addRequestInterceptor: (
            requestInterceptor: (
                request: AxiosRequestConfig
            ) => AxiosRequestConfig | Promise<AxiosRequestConfig>
        ) => {
            domainApi.interceptors.request.use(requestInterceptor);
        }
    };
}
