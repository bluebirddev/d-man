// import axios from 'axios';
import { axiosExecutor } from './axios-executor';

jest.mock('axios');

describe('axios-executor', () => {
    it('simple', async () => {
        // TODO
        // eslint-disable-next-line no-console
        console.warn('Figure out how to test');
        expect(axiosExecutor).toBeTruthy();
    });
});
