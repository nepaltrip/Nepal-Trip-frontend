import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uploadReducer from './slices/uploadSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        upload: uploadReducer, // ✨ Add it to the store
    },
    // Adding this middleware configuration prevents Redux from throwing warnings 
    // if we ever pass non-serializable data through the state (like File objects).
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;