import { RootState } from '../store/reducer';
import { Store } from 'redux';
import genericGenerator, { GenericGeneratorResult } from './generic-generator';
import { BaseOptions } from '..';
import putHookGenerator, {
    PutHookOptions,
    PutHookResult
} from './put-hook-generator';
import { DomainOptions } from '.';

export type PutOptions<Req = any, Res = any> = BaseOptions<Req, Res>;

export type PutResult<Req, Res> = GenericGeneratorResult<Req, Res> & {
    useHook: (hookOptions?: PutHookOptions) => PutHookResult<Req, Res>;
};

export default function putGenerator(
    domain: string,
    domainOptions: DomainOptions,
    store: Store<RootState>,
    uuid?: string
) {
    return function put<Req, Res>(
        action: string,
        options: PutOptions<Req, Res> = {}
    ): PutResult<Req, Res> {
        const generic = genericGenerator<Req, Res>(
            domain,
            domainOptions,
            store,
            uuid,
            action,
            'put'
        );

        return {
            ...generic,
            useHook: (hookOptions?: PutHookOptions) =>
                putHookGenerator(
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
