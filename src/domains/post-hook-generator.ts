import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { RootState, StoreState } from '../store/reducer';
import { parseStoreState, path } from '../utils';
import { Store } from 'redux';
import postGenerator, { PostOptions } from './post-generator';
import { useMemo } from 'react';
import { GenericGeneratorResult } from './generic-generator';
import { DomainOptions } from '.';

export type PostHookResult<Req, Res> = GenericGeneratorResult<Req, Res> &
    StoreState<Res>;

export type PostHookOptions = {};

export default function postHookGenerator(
    domain: string,
    domainOptions: DomainOptions,
    store: Store<RootState>
) {
    return function usePost<Req, Res>(
        url: string,
        options: PostHookOptions & PostOptions<Req, Res> = {}
    ): PostHookResult<Req, Res> {
        const uuid = useMemo(() => {
            return options.multiple ? uuidv4() : undefined;
        }, []);

        const post = postGenerator(
            domain,
            domainOptions,
            store,
            uuid
        )<Req, Res>(url, options);

        const storeState = useSelector((state: RootState) =>
            path<StoreState>(post.storeLocationPath, state)
        );

        const validStoreState = parseStoreState<Res>(storeState);

        return {
            ...post,
            ...storeState,
            ...validStoreState
        };
    };
}
