import { Store } from 'redux';
import { RootState } from '../store/reducer';
import { BaseOptions } from '..';
import genericGenerator, { GenericGeneratorResult } from './generic-generator';
import deleteHookGenerator, {
    DeleteHookOptions,
    DeleteHookResult
} from './delete-hook-generator';
import { DomainOptions } from '.';

// type Method = 'get' | 'post';

// type Spec = {
//     a: {
//         get: number;
//         post: {
//             data?: boolean;
//         };
//     };
//     b: {
//         get: string;
//     };
//     c: {
//         get: Date;
//     };
// };

// function get<T extends Record<string, any>, K extends keyof T>() {
//     type P = T[K];
//     return function me<V extends keyof P>() {
//         type S = P[V];

//         type q = S['data'];

//         return (2 as unknown) as q;
//     };
// }

// const hey = get<Spec, 'a'>();
// const r = hey<'post'>();

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
            'get',
            options
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
