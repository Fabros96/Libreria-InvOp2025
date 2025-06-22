import axios from 'axios';

const axiosClient = axios.create({
    // baseURL: import.meta.env.VITE_API_BASE_URL || 'https://valorant-api.com/v1', PARA PROBAR
    baseURL:  'http://localhost:3000/',
    headers: {
        'Content-Type': 'application/json',
    }
});

// ✅ Este interceptor va en las respuestas, no en las requests
axiosClient.interceptors.response.use(res => res.data);

export default axiosClient;
