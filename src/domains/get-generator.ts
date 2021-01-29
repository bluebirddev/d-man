import { AxiosInstance } from 'axios';
import { RootState } from '../store/reducer';
import { Store } from 'redux';
import { GetHookOptions, GetOptions, GetResult } from '..';
import genericGenerator from './generic-generator';
import getHookGenerator from './get-hook-generator';

export default function getGenerator(
    domainApi: AxiosInstance,
    domain: string,
    store: Store<RootState>,
    uuid: string | undefined = undefined
) {
    return function get<Res = any, Req = any>(
        url: string,
        options: GetOptions<Res, Req> = {}
    ): GetResult<Req, Res> {
        const generic = genericGenerator<Req, Res>(
            domainApi,
            store,
            {
                url,
                domain,
                method: 'get'
            },
            options,
            uuid
        );

        return {
            ...generic,
            useHook: (hookOptions?: GetHookOptions) =>
                getHookGenerator(
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
