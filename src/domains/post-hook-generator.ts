import { useSelector } from 'react-redux';
import * as R from 'ramda';
import { AxiosInstance } from 'axios';
import { RootState, StoreState } from '../store/reducer';
import { parseStoreState } from '../utils';
import { PostOptions, PostHookOptions } from '..';
import { Store } from 'redux';
import postGenerator from './post-generator';

export default function postHookGenerator(
    domainApi: AxiosInstance,
    domain: string,
    store: Store<RootState>
) {
    return function usePost<Req, Res>(
        url: string,
        options: PostHookOptions & PostOptions<Req, Res> = {}
    ) {
        const post = postGenerator(
            domainApi,
            domain,
            store
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
