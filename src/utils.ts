import {
    DefaultLocationOptions,
    LocationOptions,
    Location,
    Method,
    StoreState
} from '.';
import { getDefaultState } from './store/reducer';

export const wait = (n: number) =>
    new Promise((resolve) => setTimeout(resolve, n));

export function normalizePath(url: string | undefined) {
    if (url === undefined) return '';
    const parts = url.split('/').filter((part) => part);
    return `${parts.join('/')}`;
}

/**
 * You can either specify domain, url, method seperately, or as an array.
 */
export function parseLocation(
    defaultLocation: DefaultLocationOptions,
    customLocation: LocationOptions,
    allowEmpty = true
): Location | undefined {
    if (!allowEmpty) {
        if (
            !customLocation.location ||
            (!customLocation.url &&
                !customLocation.method &&
                !customLocation.domain)
        ) {
            console.warn(
                'You must specify either "location" or one of "url", "method", or "domain"'
            );
            return undefined;
        }
    }
    const [domain, url, method, multiple] = (() => {
        if (customLocation.location)
            return [
                customLocation.location[0],
                customLocation.location[1],
                customLocation.location[2],
                customLocation.location[3]
            ].filter((l) => l);
        return [
            customLocation.domain || defaultLocation.domain,
            customLocation.url || defaultLocation.url,
            customLocation.method || defaultLocation.method,
            customLocation.multiple || defaultLocation.multiple
        ].filter((l) => l);
    })();

    const location = [
        normalizePath(domain),
        normalizePath(url),
        method as Method
    ] as Location;
    if (multiple) {
        return [...location, multiple as string] as Location;
    }
    return location;
}

export function parseError(error: any) {
    try {
        return error.toString() || 'An unknown error has occured';
    } catch (err) {
        return 'An unknown error has occured';
    }
}

export function parseStoreState<Res>(
    storeState: StoreState<unknown> | undefined,
    lazy = true
): StoreState<Res> {
    const validStoreState = storeState || getDefaultState();

    const data = (validStoreState?.data as Res) || undefined;

    return {
        ...storeState,
        error: storeState?.error || undefined,
        lastUpdated: storeState?.lastUpdated || undefined,
        executed: !lazy && !storeState ? true : validStoreState.executed,
        success: storeState?.success || undefined,
        data,
        /**
         * If it is "not lazy", that means it should load on demand.  If no store state yet - fake an initial loading.
         */
        loading: !lazy && !storeState ? true : validStoreState.loading
    };
}
