import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null, // Holds { id, name, email, role }
    accessToken: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, accessToken } = action.payload;
            state.user = user;
            state.accessToken = accessToken;
            state.isAuthenticated = true;
        },
        updateAccessToken: (state, action) => {
            state.accessToken = action.payload;
        },
        logOutState: (state) => {
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
        },
    },
});

export const { setCredentials, updateAccessToken, logOutState } = authSlice.actions;

export default authSlice.reducer;