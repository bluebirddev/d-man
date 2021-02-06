import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { Store } from 'redux';
import { useMemo } from 'react';
import { RootState, StoreState } from '../store/reducer';
import { parseStoreState, path } from '../utils';
import putGenerator, { PutOptions } from './put-generator';
import { GenericGeneratorResult } from './generic-generator';
import { DomainOptions } from '.';

export type PutHookOptions = {
    //
};

export type PutHookResult<Req, Res> = GenericGeneratorResult<Req, Res> &
    StoreState<Res>;

export default function putHookGenerator(
    domain: string,
    domainOptions: DomainOptions,
    store: Store<RootState>
) {
    return function usePut<Req, Res>(
        url: string,
        options: PutHookOptions & PutOptions<Req, Res> = {}
    ): PutHookResult<Req, Res> {
        const uuid = useMemo(() => {
            return options.multiple ? uuidv4() : undefined;
        }, [options.multiple]);

        const put = putGenerator(
            domain,
            domainOptions,
            store,
            uuid
        )<Req, Res>(url, options);

        const storeState = useSelector((state: RootState) =>
            path<StoreState>(put.storeLocationPath, state)
        );

        const validStoreState = parseStoreState<Res>(storeState);

        return {
            ...put,
            ...storeState,
            ...validStoreState
        };
    };
}
