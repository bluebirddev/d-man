import { useSelector } from 'react-redux';
import * as R from 'ramda';
import { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { RootState, StoreState } from '../store/reducer';
import { parseStoreState } from '../utils';
import { PutHookOptions, PutOptions, PutHookResult } from '..';
import { Store } from 'redux';
import putGenerator from './put-generator';
import { useMemo } from 'react';

export default function putHookGenerator(
    domainApi: AxiosInstance,
    domain: string,
    store: Store<RootState>
) {
    return function usePut<Req, Res>(
        url: string,
        options: PutHookOptions & PutOptions<Req, Res> = {}
    ): PutHookResult<Req, Res> {
        const uuid = useMemo(() => {
            return options.multiple ? uuidv4() : undefined;
        }, []);

        const put = putGenerator(
            domainApi,
            domain,
            store,
            uuid
        )<Req, Res>(url, options);

        const storeState = useSelector((state: RootState) =>
            R.path<StoreState>(put.location, state)
        );

        const validStoreState = parseStoreState<Res>(storeState);

        return {
            ...put,
            ...storeState,
            ...validStoreState
        };
    };
}
