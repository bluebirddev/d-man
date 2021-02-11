import { Store } from 'redux';
import { RootState } from '../store/reducer';
import genericGenerator, { GenericGeneratorResult } from './generic-generator';
import { BaseOptions } from '..';
import postHookGenerator, {
    PostHookOptions,
    PostHookResult
} from './post-hook-generator';
import { DomainOptions } from '.';

export type PostResult<Req, Res> = GenericGeneratorResult<Req, Res> & {
    useHook: (hookOptions?: PostHookOptions) => PostHookResult<Req, Res>;
};
export type PostOptions<Req = any, Res = any> = BaseOptions<Req, Res>;

export default function postGenerator(
    domain: string,
    domainOptions: DomainOptions,
    store: Store<RootState>,
    uuid?: string
) {
    return function post<Req, Res>(
        action: string,
        options: PostOptions<Req, Res> = {}
    ): PostResult<Req, Res> {
        const generic = genericGenerator<Req, Res>(
            domain,
            domainOptions,
            store,
            uuid,
            action,
            'post',
            options
        );

        return {
            ...generic,
            useHook: (hookOptions?: PostHookOptions) =>
                postHookGenerator(
                    domain,
                    domainOptions,
                    store
                )<Req, Res>(action, {
                    ...options,
                    ...hookOptions
                })
        };
    };
}
