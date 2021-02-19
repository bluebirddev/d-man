import { mergeUrl, stringReplace, stripEmpty, trimDash } from '../utils';
import { UseRestOptions, RequestOptions } from './rest';

type AxiosRequestOptions = Omit<RequestOptions<any>, 'urlParams' | 'baseUrl'>;

export function getRequestOptions<Request, Response>(
    request: Request,
    options: UseRestOptions<Request, Response>
): AxiosRequestOptions {
    const requestOptions: RequestOptions<any> = {
        method: options.method,
        url: options.url,
        baseUrl: options.baseUrl,
        queryParams: options.queryParams,
        data: request,
        headers: options.headers
    };

    const transformedRequest =
        options.transformRequest &&
        options.transformRequest(request, requestOptions);

    const { urlParams, baseUrl, ...shallowMergedRequest } = {
        ...requestOptions,
        ...transformedRequest
    };

    const url = (() => {
        try {
            // merge baseUrl and url
            const fullUrl = mergeUrl(
                shallowMergedRequest.url as string,
                baseUrl
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
    }) as AxiosRequestOptions;
}
