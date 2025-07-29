import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    isSidebarOpen: true,
}

export const sidebarSlice = createSlice({
    name: 'sidebar',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.isSidebarOpen = !state.isSidebarOpen
        },
        setSidebarOpen: (state, action) => {
            state.isSidebarOpen = action.payload
        },
    },
})

export const { toggleSidebar, setSidebarOpen } = sidebarSlice.actions

export default sidebarSlice.reducer