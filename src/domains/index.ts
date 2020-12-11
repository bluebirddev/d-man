import axios, { AxiosRequestConfig } from 'axios';
import { createSelector } from 'reselect';
import { useSelector } from 'react-redux';
import getGetHook from './get-get-hook';
import getPostHook from './get-post-hook';
import { DomainState, RootState } from '../store/reducer';
import getDeleteHook from './get-delete-hook';
import { DomainOptions } from '..';
import { Store } from 'redux';
import getGet from './get-get';
import getDelete from './get-delete';
import getPost from './get-post';

export function createDomain(
    domainName: string,
    domainOptions: DomainOptions,
    store: Store<RootState>
) {
    const api = axios.create({
        baseURL: domainOptions.baseURL
    });

    return {
        usePost: getPostHook(api, domainName),
        post: getPost(api, domainName, store),
        useGet: getGetHook(api, domainName),
        get: getGet(api, domainName, store),
        useDelete: getDeleteHook(api, domainName),
        delete: getDelete(api, domainName, store),
        useSelector: (selector: (state: DomainState) => unknown) =>
            useSelector(
                createSelector(
                    (state: RootState) => state[domainName],
                    selector
                )
            ),
        api,
        addErrorInterceptor: (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            errorInterceptor: (error: any) => unknown
        ) => {
            api.interceptors.response.use((req) => req, errorInterceptor);
        },
        addRequestInterceptor: (
            requestInterceptor: (
                request: AxiosRequestConfig
            ) => AxiosRequestConfig | Promise<AxiosRequestConfig>
        ) => {
            api.interceptors.request.use(requestInterceptor);
        }
    };
}
