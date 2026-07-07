import axios from 'axios';
import { updateAccessToken, logOutState } from '../store/slices/authSlice';

// A variable to hold the Redux store to avoid circular dependency issues
let store;

export const injectStore = (_store) => {
    store = _store;
};

// 1. Create the base Axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
});

// Variables to handle the silent refresh queue
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// 2. Request Interceptor: Attach the Access Token to outgoing requests
api.interceptors.request.use(
    (config) => {
        if (store) {
            const token = store.getState().auth.accessToken;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. Response Interceptor: The Silent Refresh Engine
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {

            // ==========================================
            // THE FIX: PREVENT LOGIN/SIGNUP HIJACKING
            // Do NOT attempt to refresh tokens if the 401 came from an auth route.
            // Just pass the error straight back to the LoginModal.
            // ==========================================
            if (
                originalRequest.url.includes('/auth/login') ||
                originalRequest.url.includes('/auth/signup')
            ) {
                return Promise.reject(error);
            }

            if (originalRequest.url.includes('/auth/refresh-token')) {
                store.dispatch(logOutState());
                return Promise.reject(error);
            }

            // If a refresh is already happening, queue this incoming request
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers.Authorization = 'Bearer ' + token;
                        return api(originalRequest);
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await axios.post(
                    `${api.defaults.baseURL}/auth/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                const newAccessToken = data.accessToken;
                store.dispatch(updateAccessToken(newAccessToken));
                processQueue(null, newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);

            } catch (err) {
                processQueue(err, null);
                store.dispatch(logOutState());
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;