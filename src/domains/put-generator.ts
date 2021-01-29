import { AxiosInstance } from 'axios';
import { RootState } from '../store/reducer';
import { Store } from 'redux';
import genericGenerator from './generic-generator';
import { PutHookOptions, PutOptions, PutResult } from '..';
import putHookGenerator from './put-hook-generator';

export default function putGenerator(
    domainApi: AxiosInstance,
    domain: string,
    store: Store<RootState>,
    uuid: string | undefined = undefined
) {
    return function put<Req, Res>(
        url: string,
        options: PutOptions<Req, Res> = {}
    ): PutResult<Req, Res> {
        const generic = genericGenerator<Req, Res>(
            domainApi,
            store,
            {
                url,
                domain,
                method: 'put'
            },
            options,
            uuid
        );

        return {
            ...generic,
            useHook: (hookOptions?: PutHookOptions) =>
                putHookGenerator(
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
