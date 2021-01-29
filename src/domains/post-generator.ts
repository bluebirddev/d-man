import { AxiosInstance } from 'axios';
import { RootState } from '../store/reducer';
import { Store } from 'redux';
import genericGenerator from './generic-generator';
import { PostResult, PostHookOptions, PostOptions } from '..';
import postHookGenerator from './post-hook-generator';

export default function postGenerator(
    domainApi: AxiosInstance,
    domain: string,
    store: Store<RootState>,
    uuid: string | undefined = undefined
) {
    return function post<Req, Res>(
        url: string,
        options: PostOptions<Req, Res> = {}
    ): PostResult<Req, Res> {
        const generic = genericGenerator<Req, Res>(
            domainApi,
            store,
            {
                url,
                domain,
                method: 'post'
            },
            options,
            uuid
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
