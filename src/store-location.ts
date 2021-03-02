import { normalizePath } from './utils';

export type Method = 'get' | 'post' | 'put' | 'delete';

export type StoreLocation = {
    domain?: string;
    action?: string;
    method?: Method;
    uuid?: string;
};
export type StoreLocationPath =
    | [string] // LOGOUT
    | [string, string] // localDomain, action
    | [string, string, string] // domain, action, method
    | [string, string, string, string]; // domain, action, method

/**
 * Removes empty elements from array from the back until a non-empty element is found.
 */
export function trimStoreLocationPath(
    path: StoreLocationPath
): StoreLocationPath {
    const _path = path as string[];
    if (_path.length === 0) return path;
    const last = path[path.length - 1];
    if (last === undefined) {
        return trimStoreLocationPath(
            _path.slice(0, _path.length - 1) as StoreLocationPath
        );
    }
    return path;
}

export function convertToStoreLocationPath(
    storeLocation: StoreLocation | undefined
) {
    if (!storeLocation) return undefined;
    return trimStoreLocationPath([
        storeLocation.domain as string,
        normalizePath(storeLocation.action as string),
        storeLocation.method as string,
        storeLocation.uuid as string
    ]) as StoreLocationPath;
}

export function getLocalStoreLocationPath(action: string, persist?: boolean) {
    return convertToStoreLocationPath({
        domain: `LOCAL${persist ? '-PERSIST' : ''}`,
        action: normalizePath(action)
    });
}

export function convertToStoreLocation(
    storeLocationPath: StoreLocationPath | undefined
): StoreLocation | undefined {
    if (!storeLocationPath) return undefined;
    const storeLocation: StoreLocation = {
        domain: storeLocationPath[0],
        action: normalizePath(storeLocationPath[1]),
        method: storeLocationPath[2] as Method
    };
    if (!storeLocationPath[3]) return storeLocation;
    return { ...storeLocation, uuid: storeLocationPath[3] };
}

export function trimStoreLocation(storeLocation: StoreLocation): StoreLocation {
    if (storeLocation.uuid) return storeLocation;
    return {
        domain: storeLocation.domain,
        action: normalizePath(storeLocation.action),
        method: storeLocation.method
    };
}

/**
 * You can either specify domain, url, method seperately, or as an array.
 */
export function getStoreLocation(
    defaultStoreLocationPath: StoreLocationPath,
    storeLocation?: StoreLocation
): StoreLocationPath | undefined {
    const defaultStoreLocation = convertToStoreLocation(
        defaultStoreLocationPath
    );

    if (!defaultStoreLocation) {
        return undefined;
    }

    const mergedStoreLocation: StoreLocation = {
        ...defaultStoreLocation,
        ...storeLocation
    };

    if (!mergedStoreLocation) {
        return undefined;
    }

    return convertToStoreLocationPath(mergedStoreLocation);
}
