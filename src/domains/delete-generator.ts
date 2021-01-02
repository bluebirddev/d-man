import { RootState } from '../store/reducer';
import { AxiosInstance } from 'axios';
import { Store } from 'redux';
import { DeleteOptions } from '..';
import genericGenerator from './generic-generator';

export default function deleteGenerator(
    domainApi: AxiosInstance,
    domain: string,
    store: Store<RootState>
) {
    return function del<Res = any, Req = any>(
        url: string,
        options: DeleteOptions<Res, Req> = {}
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
            ...generic
            /**
             * TODO: since we use getGetHook here -> it can be drastically simplified (because it currently uses same logic as in here^)
             */
            // useHook: (hookOptions?: GetHookOptions) =>
            //     getHookGenerator(
            //         domainApi,
            //         domain,
            //         store
            //     )<Res, Req>(url, {
            //         ...options,
            //         ...hookOptions
            //     })
        };
    };
}
