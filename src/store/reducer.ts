import { getUnixTime } from 'date-fns';
import { assocPath, map, path as getPath } from '../utils';

export type StoreState<T = unknown> = {
    data: T | undefined;
    /**
     * If api call is in progress.
     */
    loading: boolean;
    /**
     * If error occured.
     */
    error: string | undefined;
    /**
     * Last time call was executed.
     */
    lastUpdated: number | undefined;
    /**
     * If call was ever executed (start of api call)
     */
    executed: boolean;
    /**
     * If successfull.
     */
    success: boolean | undefined;
};

export type DomainState = {
    // name of domain (url)
    [domain: string]: {
        // name of method (get / delete / post / put)
        [method: string]: StoreState;
    };
};

export type RootState = {
    // name of domain
    [name: string]: DomainState;
};

export const getDefaultState = () => ({
    data: undefined,
    error: undefined,
    loading: false,
    executed: false,
    success: undefined,
    lastUpdated: getUnixTime(new Date())
});

export default function getRootReducer() {
    /**
     * Remove all cached "loading" states.  Maybe should remove all error states as well (forcing
     * refetch on refresh?)
     */
    function parsedInitialState(initialState: RootState) {
        // eslint-disable-next-line no-param-reassign
        delete initialState.LOCAL;
        const { 'LOCAL-PERSIST': localPersist, ...domainsState } = initialState;

        return {
            'LOCAL-PERSIST': localPersist,
            ...map(
                (api) =>
                    map(
                        (url) =>
                            map((method) => {
                                if (
                                    method &&
                                    (method.loading || method.error)
                                ) {
                                    return getDefaultState();
                                }
                                return { ...method, executed: false };
                            }, url),
                        api
                    ),
                domainsState
            )
        };
    }

    function rootReducer(
        state = {},
        { type, payload }: { type: string; payload?: any }
    ): RootState {
        const [name, url, method, _uuid, _action] = type.split('|');

        if (name === 'LOGOUT') {
            return {};
        }

        if (name === 'INITIAL') {
            return parsedInitialState(payload);
        }

        if (!name || !url) return state;

        if (name === 'LOCAL' || name === 'LOCAL-PERSIST') {
            const path = [name, url];
            return assocPath(path, payload, state);
        }

        /**
         * Action is the last non-empty value.
         */
        const action = _action || _uuid;
        const uuid = _action ? _uuid : undefined;

        const path = uuid ? [name, url, method, uuid] : [name, url, method];

        const existing = getPath<StoreState>(path, state);

        const setState = (props: unknown) => assocPath(path, props, state);

        if (action === 'data') {
            const props = {
                executed: true,
                data: payload,
                error: undefined,
                loading: false,
                success: true,
                lastUpdated: getUnixTime(new Date())
            };
            return setState(props);
        }
        if (action === 'loading') {
            const props = {
                data: existing?.data,
                error: undefined,
                loading: true,
                executed: true,
                lastUpdated: getUnixTime(new Date())
            };
            return setState(props);
        }
        if (action === 'error') {
            const props = {
                executed: true,
                data: undefined,
                error: payload || 'An unkown error has occured',
                loading: false,
                success: false,
                lastUpdated: getUnixTime(new Date())
            };
            return setState(props);
        }
        if (!action) {
            return setState(getDefaultState());
        }
        return state;
    }

    return rootReducer;
}
