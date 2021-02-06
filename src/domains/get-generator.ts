import { Store } from 'redux';
import { RootState } from '../store/reducer';
import { BaseOptions } from '..';
import genericGenerator, { GenericGeneratorResult } from './generic-generator';
import getHookGenerator, {
    GetHookOptions,
    GetHookResult
} from './get-hook-generator';
import { DomainOptions } from '.';

export type GetOptions<Res = any, Req = any> = BaseOptions<Req, Res>;

export type GetResult<Req, Res> = GenericGeneratorResult<Req, Res> & {
    useHook: (hookOptions?: GetHookOptions) => GetHookResult<Req, Res>;
};

export default function getGenerator(
    domain: string,
    domainOptions: DomainOptions,
    store: Store<RootState>,
    uuid?: string
) {
    return function get<Res = any, Req = any>(
        action: string,
        options: GetOptions<Res, Req> = {}
    ): GetResult<Req, Res> {
        const generic = genericGenerator<Req, Res>(
            domain,
            domainOptions,
            store,
            uuid,
            action,
            'get'
        );

        return {
            ...generic,
            useHook: (hookOptions?: GetHookOptions) =>
                getHookGenerator(
                    domain,
                    domainOptions,
                    store
                )<Res, Req>(action, {
                    ...options,
                    ...hookOptions
                })
        };
    };
}
