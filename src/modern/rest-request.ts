import { mergeUrl, stringReplace, stripEmpty, trimDash } from '../utils';
import {
    RestOptions,
    RequestOptions,
    AfterTransformRequestOptions
} from './rest';

export function getRequestOptions<RequestData, ResponseData>(
    requestData: RequestData,
    restOptions: RestOptions<RequestData, ResponseData>
): AfterTransformRequestOptions {
    const requestOptions: RequestOptions<any> = {
        method: restOptions.method,
        url: restOptions.url,
        baseUrl: restOptions.baseUrl,
        queryParams: restOptions.queryParams,
        data: requestData,
        headers: restOptions.headers
    };

    const transformedRequest =
        restOptions.transformRequest &&
        restOptions.transformRequest(requestData, requestOptions);

    const { urlParams, baseUrl, ...shallowMergedRequest } = {
        ...requestOptions,
        ...transformedRequest
    };

    const url = (() => {
        try {
            // merge baseUrl and url
            const fullUrl = mergeUrl(
                baseUrl,
                shallowMergedRequest.url as string
            );
            // perform urlParams replacement (before new URL changes string to url friendly)
            const replacedUrl = urlParams
                ? stringReplace(fullUrl as string, urlParams)
                : fullUrl;

            // checks that valid url and makes url friendly
            const testedUrl = new URL(replacedUrl as string).href;

            // remove stupid back dashes
            return trimDash(testedUrl);
        } catch (err) {
            throw new Error(`No url specified: ${err}`);
        }
    })();

    return stripEmpty({
        ...shallowMergedRequest,
        url
    }) as AfterTransformRequestOptions;
}
