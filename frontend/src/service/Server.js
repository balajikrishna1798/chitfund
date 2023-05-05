import axios from 'axios';

const server = axios.create({
    baseURL: 'https://some-domain.com/api/',
    timeout: 1000,
    headers: {'X-Custom-Header': 'foobar'}
  });
export const BASE_URL = "http://localhost:8000"
export default server;
