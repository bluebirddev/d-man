import { RootState } from '../store/reducer';
import { Store } from 'redux';
import { BaseOptions } from '..';
import genericGenerator, { GenericGeneratorResult } from './generic-generator';
import deleteHookGenerator, {
    DeleteHookOptions,
    DeleteHookResult
} from './delete-hook-generator';
import { DomainOptions } from '.';

export type DeleteOptions<Res = any, Req = any> = BaseOptions<Req, Res>;
export type DeleteResult<Req, Res> = GenericGeneratorResult<Req, Res> & {
    useHook: (hookOptions?: DeleteHookOptions) => DeleteHookResult<Req, Res>;
};

export default function deleteGenerator(
    domain: string,
    domainOptions: DomainOptions,
    store: Store<RootState>,
    uuid?: string
) {
    return function del<Res = any, Req = any>(
        action: string,
        options: DeleteOptions<Res, Req> = {}
    ): DeleteResult<Req, Res> {
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
            useHook: (hookOptions?: DeleteHookOptions) =>
                deleteHookGenerator(
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
