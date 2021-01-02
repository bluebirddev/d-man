import { useSelector } from 'react-redux';
import * as R from 'ramda';
import { parseStoreState } from '../utils';
import { RootState, StoreState } from '../store/reducer';
import { AxiosInstance } from 'axios';
import deleteGenerator from './delete-generator';
import { Store } from 'redux';
import { DeleteOptions } from '..';

export default function deleteHookGenerator(
    domainApi: AxiosInstance,
    domain: string,
    store: Store<RootState>
) {
    return function useDelete<Res = any, Req = any>(
        url: string,
        options: DeleteOptions<Res, Req> = {}
    ) {
        const del = deleteGenerator(
            domainApi,
            domain,
            store
        )<Res, Req>(url, options);

        const storeState = useSelector((state: RootState) =>
            R.path<StoreState>(del.location, state)
        );

        const validStoreState = parseStoreState<Res>(
            storeState,
            options.parseResponseData
        );

        return {
            ...del,
            ...storeState,
            ...validStoreState,
            data: validStoreState.data
        };
    };
}
