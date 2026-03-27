import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';
import notificationReducer from './slices/notifications.slice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        notifications: notificationReducer,
    },
});
