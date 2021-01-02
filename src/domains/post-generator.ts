import { AxiosInstance } from 'axios';
import { RootState } from '../store/reducer';
import { Store } from 'redux';
import genericGenerator from './generic-generator';
import { PostHookOptions, PostOptions } from '..';
import postHookGenerator from './post-hook-generator';

export default function postGenerator(
    domainApi: AxiosInstance,
    domain: string,
    store: Store<RootState>
) {
    return function post<Req, Res>(
        url: string,
        options: PostOptions<Req, Res> = {}
    ) {
        const generic = genericGenerator<Req, Res>(
            domainApi,
            store,
            {
                url,
                domain,
                method: 'post'
            },
            options
        );

        return {
            ...generic,
            useHook: (hookOptions?: PostHookOptions) =>
                postHookGenerator(
                    domainApi,
                    domain,
                    store
                )<Req, Res>(url, {
                    ...options,
                    ...hookOptions
                })
        };
    };
}
