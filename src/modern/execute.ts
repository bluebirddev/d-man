import { RestApiExecutor, RestOptions, RestResponse } from './rest';
import { getRequestOptions } from './rest-request';

export async function execute<RequestData = any, ResponseData = any>(
    requestData: RequestData,
    restOptions: RestOptions<RequestData, ResponseData>,
    restApiExecutor: RestApiExecutor
): Promise<RestResponse<ResponseData>> {
    // transforms request
    const requestOptions = getRequestOptions(requestData, restOptions);

    try {
        // preExecute
        if (restOptions.beforeExecute) {
            await restOptions.beforeExecute(requestOptions);
        }

        // execute
        const restResponse = await restApiExecutor(
            requestOptions,
            restOptions.parseError,
            restOptions.useRequestInterceptor
        );

        // postExecute
        const data = restOptions.transformResponseData
            ? restOptions.transformResponseData(restResponse)
            : restResponse.data;

        const transformedResponse = { ...restResponse, data };

        if (restOptions.afterExecute) {
            await restOptions.afterExecute(transformedResponse);
        }

        return transformedResponse;
    } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Something went terrible wrong:', err);
        throw err;
    }
}
