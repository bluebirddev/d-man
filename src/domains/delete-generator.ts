import { RootState } from '../store/reducer';
import { AxiosInstance } from 'axios';
import { Store } from 'redux';
import { DeleteHookOptions, DeleteOptions, DeleteResult } from '..';
import genericGenerator from './generic-generator';
import deleteHookGenerator from './delete-hook-generator';

export default function deleteGenerator(
    domainApi: AxiosInstance,
    domain: string,
    store: Store<RootState>,
    uuid: string | undefined = undefined
) {
    return function del<Res = any, Req = any>(
        url: string,
        options: DeleteOptions<Res, Req> = {}
    ): DeleteResult<Req, Res> {
        const generic = genericGenerator<Req, Res>(
            domainApi,
            store,
            {
                url,
                domain,
                method: 'delete'
            },
            options,
            uuid
        );

        return {
            ...generic,
            useHook: (hookOptions?: DeleteHookOptions) =>
                deleteHookGenerator(
                    domainApi,
                    domain,
                    store
                )<Res, Req>(url, {
                    ...options,
                    ...hookOptions
                })
        };
    };
}
