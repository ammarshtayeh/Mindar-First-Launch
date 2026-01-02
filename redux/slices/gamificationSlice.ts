import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface GamificationState {
  xp: number
  level: number
  badges: any[]
}

const savedData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user_gamification_data') || 'null') : null;
const initialState: GamificationState = savedData || {
  xp: 0,
  level: 1,
  badges: [],
};

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    setXPData: (state, action: PayloadAction<{ xp: number; level: number; badges: any[] }>) => {
      state.xp = action.payload.xp
      state.level = action.payload.level
      state.badges = action.payload.badges
    },
    addXP: (state, action: PayloadAction<number>) => {
      state.xp += action.payload
      state.level = Math.floor(Math.sqrt(state.xp / 50)) + 1
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_gamification_data', JSON.stringify({
          xp: state.xp,
          level: state.level,
          badges: state.badges
        }))
      }
    }
  },
})

export const { setXPData, addXP } = gamificationSlice.actions
export default gamificationSlice.reducer
