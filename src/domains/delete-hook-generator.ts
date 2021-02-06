import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { parseStoreState, path } from '../utils';
import { RootState, StoreState } from '../store/reducer';
import { AxiosInstance } from 'axios';
import deleteGenerator from './delete-generator';
import { Store } from 'redux';
import { DeleteOptions, DeleteHookResult } from '..';
import { useMemo } from 'react';

export default function deleteHookGenerator(
    domainApi: AxiosInstance,
    domain: string,
    store: Store<RootState>
) {
    return function useDelete<Res = any, Req = any>(
        url: string,
        options: DeleteOptions<Res, Req> = {}
    ): DeleteHookResult<Req, Res> {
        const uuid = useMemo(() => {
            return options.multiple ? uuidv4() : undefined;
        }, []);

        const del = deleteGenerator(
            domainApi,
            domain,
            store,
            uuid
        )<Res, Req>(url, options);

        const storeState = useSelector((state: RootState) =>
            path<StoreState>(del.location, state)
        );

        const validStoreState = parseStoreState<Res>(storeState);

        return {
            ...del,
            ...storeState,
            ...validStoreState
        };
    };
}
