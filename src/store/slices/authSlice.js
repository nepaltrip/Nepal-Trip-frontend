import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null, // Holds { id, name, email, role, profilePic, etc. }
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
        // ✨ NEW: Add this reducer to handle profile updates
        updateUser: (state, action) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
        logOutState: (state) => {
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
        },
    },
});

// ✨ Export the new action
export const { setCredentials, updateAccessToken, updateUser, logOutState } = authSlice.actions;

export default authSlice.reducer;