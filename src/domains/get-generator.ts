import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { RootState } from '../store/reducer';
import { Store } from 'redux';
import { GetHookOptions, GetOptions, GetResult } from '..';
import genericGenerator from './generic-generator';
import getHookGenerator from './get-hook-generator';
import { path as getPath } from './utils';

type ResponseTransformer<Res> = {
    (data: any, axiosResponse?: AxiosResponse): Res;
};

type DManAxiosRequestConfig = Omit<
    AxiosRequestConfig,
    'transformRequest' | 'transformResponse'
>;

type Path = {
    domain?: string;
    url?: string;
    method?: string;
};

type RequestConfig<Req, Res> = {
    requestConfig?: DManAxiosRequestConfig;
    path?: Path;
    transformRequest?: Transformer<Req>;
    transformResponse?: ResponseTransformer<Res>;
};

type GlobalConfig = {
    baseUrl: string;
    domain: string;
};

type Props = {
    store: Store<RootState>;
};

function generateUseGet(props: Props, globalConfig: GlobalConfig) {
    function useGet<Req, Res>(
        action: string,
        config?: RequestConfig<Req, Res>
    ) {
        const path = [
            globalConfig.domain || config?.path?.domain,
            action || config?.path?.url,
            'get' || config?.path?.method
        ];

        const selector = (state: RootState) =>
            getPath<StoreState>(location, state);

        async function execute() {
            const response = await axios({
                baseURL: globalConfig.baseUrl,
                url: action,
                ...config?.requestConfig
            });

            const data =
                config?.transformResponse &&
                config?.transformResponse(response.data, response);

            return data;
        }

        return {
            execute
        };
    }

    return useGet;
}

export default function getGenerator(
    domainApi: AxiosInstance,
    domain: string,
    store: Store<RootState>,
    uuid: string | undefined = undefined
) {
    return function get<Res = any, Req = any>(
        url: string,
        options: GetOptions<Res, Req> = {}
    ): GetResult<Req, Res> {
        const generic = genericGenerator<Req, Res>(
            domainApi,
            store,
            {
                url,
                domain,
                method: 'get'
            },
            options,
            uuid
        );

        return {
            ...generic,
            useHook: (hookOptions?: GetHookOptions) =>
                getHookGenerator(
                    domainApi,
                    domain,
                    store
                )<Res, Req>(url, {
                    ...options,
                    ...hookOptions
                })
        };
    };
}
