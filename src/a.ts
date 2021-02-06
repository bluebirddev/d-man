import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { RootState, StoreState } from './store/reducer';
import { Store } from 'redux';
import { path as getPath } from './utils';

const a = {
    bla: 'string'
};

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
        ] as [string, string, string];

        const selector = (state: RootState) => getPath<StoreState>(path, state);

        const getStoreState = () =>
            parseStoreState<Res>(selector(store.getState()));

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
            execute,
            selector
        };
    }

    return useGet;
}
