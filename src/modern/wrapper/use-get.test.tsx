/* eslint-disable react/react-in-jsx-scope */
import { Provider } from 'react-redux';
import renderer, { act, ReactTestRenderer } from 'react-test-renderer';
import { wait } from '../../utils';
import { RestApiExecutor } from '../rest';
import { getRootReducer, RootState } from '../store/reducer';
import { setupStore } from '../store/store';
import { GetHookOptions, getUseGet } from './use-get';

const simpleApiExecutor: RestApiExecutor = async (requestOptions) => {
    await wait(1000);
    return Promise.resolve({
        data: requestOptions.data,
        requestOptions,
        status: 200
    });
};
const domain = 'domain';
const baseUrl = 'https://example.com';

const rootState: RootState = {};

const store = setupStore(getRootReducer(rootState));

const useGet = getUseGet(domain, store, simpleApiExecutor);

const transformRequest = () => ({ data: 2 });

function TestComponent(getHookOptions: GetHookOptions) {
    const { loading, data } = useGet(getHookOptions);
    if (loading) {
        return <div>loading</div>;
    }
    return <div>{data}</div>;
}

function WrappedComponent({
    getHookOptions
}: {
    getHookOptions: GetHookOptions;
}) {
    return (
        <Provider store={store}>
            <TestComponent {...getHookOptions} />
        </Provider>
    );
}

describe('useGet', () => {
    it('simple loading', async () => {
        let component: ReactTestRenderer = renderer.create(<div />);
        act(() => {
            component = renderer.create(
                <WrappedComponent
                    getHookOptions={{ transformRequest, baseUrl, url: 'url' }}
                />
            );
        });
        expect((component.toJSON() as any).children[0]).toEqual('loading');
        await wait(500);
        expect((component.toJSON() as any).children[0]).toEqual('loading');
        await wait(600);
        expect((component.toJSON() as any).children[0]).toEqual('2');
    });

    it('simple lazy loading', async () => {
        let component: ReactTestRenderer = renderer.create(<div />);
        act(() => {
            component = renderer.create(
                <WrappedComponent
                    getHookOptions={{
                        transformRequest,
                        baseUrl,
                        url: 'url2',
                        lazy: true
                    }}
                />
            );
        });
        expect((component.toJSON() as any).children).toEqual(null);
        await wait(1200);
        expect((component.toJSON() as any).children).toEqual(null);
    });
});
