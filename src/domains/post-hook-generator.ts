import { useSelector } from 'react-redux';
import * as R from 'ramda';
import { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { RootState, StoreState } from '../store/reducer';
import { parseStoreState } from '../utils';
import { PostOptions, PostHookOptions, PostHookResult } from '..';
import { Store } from 'redux';
import postGenerator from './post-generator';
import { useMemo } from 'react';

export default function postHookGenerator(
    domainApi: AxiosInstance,
    domain: string,
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
            domainApi,
            domain,
            store,
            uuid
        )<Req, Res>(url, options);

        const storeState = useSelector((state: RootState) =>
            R.path<StoreState>(post.location, state)
        );

        const validStoreState = parseStoreState<Res>(storeState);

        return {
            ...post,
            ...storeState,
            ...validStoreState
        };
    };
}
