import { Store } from 'redux';
import { InjectRequest } from './store-rest';
import { RootState } from '../store/reducer';
import {
    appendToStoreLocation,
    parseStoreLocation,
    StoreLocation,
    StoreLocationModifier
} from './store-location';
import { parseStoreState, StoreState } from './store';
import { path } from '../utils';

export function performInjectRequests<RequestData, ResponseData>(
    store: Store<RootState>,
    storeLocation: StoreLocation,
    injectRequest: InjectRequest | InjectRequest[],
    requestData: RequestData
) {
    const injectRequests = (Array.isArray(injectRequest)
        ? injectRequest
        : [injectRequest]) as InjectRequest[];

    injectRequests.forEach((injector) => {
        if (!injector.storeLocation && !injector.transformer) {
            // eslint-disable-next-line no-console
            console.warn(
                'You must pass in either storeLocation or transformer into an injector'
            );
        }
        const injectLocation = parseStoreLocation(
            storeLocation,
            injector.storeLocation
        );
        if (injectLocation) {
            const injectorSelector = (state: RootState) =>
                path<StoreState>(injectLocation as string[], state);

            const injectorStoreState = parseStoreState<ResponseData>(
                injectorSelector(store.getState())
            );

            const injectorData = injector.transformer
                ? injector.transformer(requestData, injectorStoreState)
                : requestData;

            store.dispatch({
                type: appendToStoreLocation(
                    injectLocation,
                    StoreLocationModifier.data
                ),
                payload: injectorData
            });
        }
    });
}
