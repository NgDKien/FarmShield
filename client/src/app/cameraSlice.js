import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentCameraId: null,
    currentCameraRtspUrl: null,
};

const cameraSlice = createSlice({
    name: 'camera',
    initialState,
    reducers: {
        setCameraDetails: (state, action) => {
            state.currentCameraId = action.payload.cameraId;
            state.currentCameraRtspUrl = action.payload.rtspUrl;
        },
        clearCameraDetails: (state) => {
            state.currentCameraId = null;
            state.currentCameraRtspUrl = null;
        },
    },
});

export const { setCameraDetails, clearCameraDetails } = cameraSlice.actions;
export default cameraSlice.reducer;