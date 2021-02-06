import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { parseStoreState, path } from '../utils';
import { RootState, StoreState } from '../store/reducer';
import deleteGenerator, { DeleteOptions } from './delete-generator';
import { Store } from 'redux';
import { useMemo } from 'react';
import { GenericGeneratorResult } from './generic-generator';
import { DomainOptions } from '.';

export type DeleteHookResult<Req, Res> = GenericGeneratorResult<Req, Res> &
    StoreState<Res>;
export type DeleteHookOptions = {};

export default function deleteHookGenerator(
    domain: string,
    domainOptions: DomainOptions,
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
            domain,
            domainOptions,
            store,
            uuid
        )<Res, Req>(url, options);

        const storeState = useSelector((state: RootState) =>
            path<StoreState>(del.storeLocationPath, state)
        );

        const validStoreState = parseStoreState<Res>(storeState);

        return {
            ...del,
            ...storeState,
            ...validStoreState
        };
    };
}
