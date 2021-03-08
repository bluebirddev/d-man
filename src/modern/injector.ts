import { Store } from 'redux';
import { InjectRequest, InjectResponse } from './store-rest';
import { RootState } from '../store/reducer';
import {
    addStoreLocationModifier,
    convertToPathStoreLocation,
    parseStoreLocation,
    StoreLocation,
    StoreLocationModifier
} from './store-location';
import { parseStoreState, StoreState } from './store/store';
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
                path<StoreState>(
                    convertToPathStoreLocation(injectLocation),
                    state
                );

            const injectorStoreState = parseStoreState<ResponseData>(
                injectorSelector(store.getState())
            );

            const injectorData = injector.transformer
                ? injector.transformer(requestData, injectorStoreState)
                : requestData;

            store.dispatch({
                type: addStoreLocationModifier(
                    injectLocation,
                    StoreLocationModifier.data
                ),
                payload: injectorData
            });
        }
    });
}

export function performInjectResponses<RequestData, ResponseData>(
    store: Store<RootState>,
    storeLocation: StoreLocation,
    injectResponse: InjectResponse<RequestData> | InjectResponse<RequestData>[],
    responseData: unknown,
    requestData: RequestData
) {
    const injectResponses = (Array.isArray(injectResponse)
        ? injectResponse
        : [injectResponse]) as InjectResponse<RequestData>[];

    injectResponses.forEach((injector) => {
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
                path<StoreState>(
                    convertToPathStoreLocation(injectLocation),
                    state
                );

            const injectorStoreState = parseStoreState<ResponseData>(
                injectorSelector(store.getState())
            );

            const injectorData = injector.transformer
                ? injector.transformer(
                      responseData,
                      requestData,
                      injectorStoreState
                  )
                : responseData;

            store.dispatch({
                type: addStoreLocationModifier(
                    injectLocation,
                    StoreLocationModifier.data
                ),
                payload: injectorData
            });
        }
    });
}
