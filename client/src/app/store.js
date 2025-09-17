import { configureStore } from '@reduxjs/toolkit'
import sidebarReducer from './sidebarSlice'
import userReducer from './userSlice';
import storage from 'redux-persist/lib/storage'
import { persistReducer, persistStore } from 'redux-persist';
import cameraReducer from '../app/cameraSlice';
import {
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist'

const commonConfig = {
    key: 'farmshield/user',
    storage
}
const userConfig = {
    ...commonConfig,
    whitelist: ['isLoggedIn', 'token']
}

export const store = configureStore({
    reducer: {
        sidebar: sidebarReducer,
        camera: cameraReducer,
        user: persistReducer(userConfig, userReducer),
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }),
})

export const persistor = persistStore(store)