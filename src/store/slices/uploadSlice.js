import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isUploading: false,
    jobQueue: null, // Will hold { files, metadata, uploadType }
};

const uploadSlice = createSlice({
    name: 'upload',
    initialState,
    reducers: {
        setUploadJob: (state, action) => {
            state.isUploading = action.payload.isUploading;
            state.jobQueue = action.payload.jobQueue;
        },
        clearUploadJob: (state) => {
            state.isUploading = false;
            state.jobQueue = null;
        }
    }
});

export const { setUploadJob, clearUploadJob } = uploadSlice.actions;
export default uploadSlice.reducer;