import { AxiosInstance } from 'axios';
import { RootState } from '../store/reducer';
import { Store } from 'redux';
import { GetHookOptions, GetOptions } from '..';
import genericGenerator from './generic-generator';
import getHookGenerator from './get-hook-generator';

export default function getGenerator(
    domainApi: AxiosInstance,
    domain: string,
    store: Store<RootState>
) {
    return function get<Res = any, Req = any>(
        url: string,
        options: GetOptions<Res, Req> = {}
    ) {
        const generic = genericGenerator<Req, Res>(
            domainApi,
            store,
            {
                url,
                domain,
                method: 'get'
            },
            options
        );

        return {
            ...generic,
            /**
             * TODO: since we use getGetHook here -> it can be drastically simplified (because it currently uses same logic as in here^)
             */
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
