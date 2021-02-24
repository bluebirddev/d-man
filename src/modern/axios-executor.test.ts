import axios from 'axios';
import { axiosExecutor } from './axios-executor';

jest.mock('axios');

describe('axios-executor', () => {
    // Replace any instances with the mocked instance (a new mock could be used here instead):
    (axios.create as any).mockImplementation(() => axios);

    // Mock out the interceptor (assuming there is only one):
    let requestCallback = () => {
        // eslint-disable-next-line no-console
        console.log('There were no interceptors');
    };
    (axios.interceptors.request.use as any).mockImplementation(
        (callback: any) => {
            requestCallback = callback;
        }
    );

    // Mock out the get request so that it returns the mocked data but also calls the
    // interceptor code:
    (axios.get as any).mockImplementation(() => {
        requestCallback();
        return {
            data: 'this is some data'
        };
    });

    it('simple', async () => {
        const users = [{ name: 'Bob' }];
        const resp = { data: users };
        (axios.get as any).mockResolvedValue(resp);

        const response = await axiosExecutor({
            method: 'get',
            url: 'https://example.com'
        });

        expect(response).toEqual(users);
    });
});
