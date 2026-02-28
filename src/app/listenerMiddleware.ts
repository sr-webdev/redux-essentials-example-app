import { createListenerMiddleware, addListener } from '@reduxjs/toolkit'
import { AppDispatch, RootState } from './store'
import { addPostsListeners } from '@/features/posts/postsSlice'

export const listenerMiddleware = createListenerMiddleware()

export const startAppListening = listenerMiddleware.startListening.withTypes<RootState, AppDispatch>()

export type AppStartListening = typeof startAppListening

export const addAppListener = addListener.withTypes<RootState, AppDispatch>()
export type AppAddListener = typeof addAppListener

//Set up posts listeners
addPostsListeners(startAppListening)
