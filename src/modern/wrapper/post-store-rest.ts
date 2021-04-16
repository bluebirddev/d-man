import { merge } from 'lodash';
import { Store } from 'redux';
import { axiosExecutor } from '../axios-executor';
import { RestApiExecutor } from '../rest';
import { getStoreRest, StoreRestOptions } from '../store-rest';
import { RootState } from '../store/reducer';

export function getPostStoreRest(
    domain: string,
    store: Store<RootState>,
    restApiExecutor: RestApiExecutor = axiosExecutor
) {
    function postStoreRest<RequestData = any, ResponseData = any>(
        requestData: RequestData,
        storeRestOptions: StoreRestOptions<RequestData, ResponseData>
    ) {
        return getStoreRest(
            domain,
            store,
            restApiExecutor
        )(
            requestData,
            merge<
                StoreRestOptions<RequestData, ResponseData>,
                StoreRestOptions<RequestData, ResponseData>
            >(
                {
                    method: 'post'
                },
                storeRestOptions
            )
        );
    }

    return postStoreRest;
}
