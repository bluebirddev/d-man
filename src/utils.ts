import { assocPath as _assocPath } from 'ramda';
import { getDefaultState, StoreState } from './store/reducer';

export const wait = (n: number) =>
    new Promise((resolve) => setTimeout(resolve, n));

export function normalizePath(url: string | undefined) {
    if (url === undefined) return '';
    const parts = url.split('/').filter((part) => part);
    return `${parts.join('/')}`;
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

export function path<T>(keys: string[], obj: unknown): T {
    if (!obj || !keys || keys.length === 0) return obj as T;
    const [key, ...remKeys] = keys;
    const value = (obj as any)[key];
    return path(remKeys, value);
}

export function has(key: string, obj: Record<string, unknown>): boolean {
    if (!obj) return false;
    return Object.prototype.hasOwnProperty.call(obj, key);
}

export function map<T, U>(func: (value: T) => U, obj: Record<string, T>) {
    if (!obj) return obj;
    return Object.keys(obj).reduce<Record<string, U>>((res, key) => {
        const value = obj[key];
        res[key] = func(value);
        return res;
    }, {});
}

export const assocPath = _assocPath;

// https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge/34749873
/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: any) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function mergeDeep<T>(target: any, ...sources: any): T {
    if (!sources.length) return target as T;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        // eslint-disable-next-line no-restricted-syntax
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
}
