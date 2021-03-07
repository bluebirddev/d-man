import { stripEmpty } from '../utils';
import { Method } from './rest';

const SEPERATOR = '|';

export type StoreLocation = {
    /**
     * The name of domain.  Defaults to "default"
     */
    domain?: string;
    /**
     * The action.  Defaults to the url.
     */
    action?: string;
    /**
     * The method.  Defaults to the rest method (put, post, get, etc)
     */
    method?: Method;
    /**
     * If multiple > generates uuid.
     */
    uuid?: string;
};

export enum StoreLocationModifier {
    data = 'data',
    loading = 'loading',
    error = 'error'
}

export function parseStringStoreLocation(
    storeLocationString: string
): StoreLocation {
    const [domain, action, method, uuid] = (storeLocationString || '').split(
        SEPERATOR
    );
    return stripEmpty({ domain, action, method: method as Method, uuid });
}

export function appendToStoreLocation(
    storeLocation: StoreLocation,
    appender: string
) {
    return [...(storeLocation as string[]), appender].join(SEPERATOR);
}

export function parseStoreLocation(
    defaultStoreLocation: StoreLocation | string,
    overwriteStoreLocation?: StoreLocation | string
) {
    const defaultStoreLocationObject =
        typeof defaultStoreLocation === 'string'
            ? parseStringStoreLocation(defaultStoreLocation)
            : defaultStoreLocation;

    if (!overwriteStoreLocation) {
        return defaultStoreLocationObject;
    }
    if (typeof overwriteStoreLocation === 'string') {
        return parseStringStoreLocation(overwriteStoreLocation);
    }
    return {
        domain: defaultStoreLocationObject.domain,
        action: defaultStoreLocationObject.action,
        method: defaultStoreLocationObject.method,
        uuid: defaultStoreLocationObject.uuid,
        ...overwriteStoreLocation
    };
}
