import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface QuizState {
  currentQuiz: any | null
  hasData: boolean
}

const initialState: QuizState = {
  currentQuiz: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('currentQuiz') || 'null') : null,
  hasData: typeof window !== 'undefined' ? !!localStorage.getItem('currentQuiz') : false,
}

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setQuiz: (state, action: PayloadAction<any>) => {
      state.currentQuiz = action.payload
      state.hasData = !!action.payload
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentQuiz', JSON.stringify(action.payload))
      }
    },
    clearQuiz: (state) => {
      state.currentQuiz = null
      state.hasData = false
      if (typeof window !== 'undefined') {
        localStorage.removeItem('currentQuiz')
      }
    },
  },
})

export const { setQuiz, clearQuiz } = quizSlice.actions
export default quizSlice.reducer
