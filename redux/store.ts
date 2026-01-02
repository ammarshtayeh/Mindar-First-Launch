import { configureStore } from '@reduxjs/toolkit'
import quizReducer from './slices/quizSlice'
import gamificationReducer from './slices/gamificationSlice'
import settingsReducer from './slices/settingsSlice'

export const store = configureStore({
  reducer: {
    quiz: quizReducer,
    gamification: gamificationReducer,
    settings: settingsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
