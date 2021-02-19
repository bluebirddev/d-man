import { stripEmpty } from '../utils';
import { Method } from './rest';

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

export function parseStringStoreLocation(
    storeLocationString: string
): StoreLocation {
    const [domain, action, method, uuid] = (storeLocationString || '').split(
        '|'
    );
    return stripEmpty({ domain, action, method: method as Method, uuid });
}

export function getInitialStoreLocation(
    defaultStoreLocation: StoreLocation,
    overwriteStoreLocation?: StoreLocation | string
) {
    if (!overwriteStoreLocation) return defaultStoreLocation;
    if (typeof overwriteStoreLocation === 'string') {
        return parseStringStoreLocation(overwriteStoreLocation);
    }
    return {
        domain: defaultStoreLocation.domain,
        action: defaultStoreLocation.action,
        method: defaultStoreLocation.method,
        uuid: defaultStoreLocation.uuid,
        ...overwriteStoreLocation
    };
}
