import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface SettingsState {
  language: 'ar' | 'en'
  voiceEnabled: boolean
}

const initialState: SettingsState = {
  language: 'ar',
  voiceEnabled: true,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<'ar' | 'en'>) => {
      state.language = action.payload
    },
    toggleVoice: (state) => {
      state.voiceEnabled = !state.voiceEnabled
    },
  },
})

export const { setLanguage, toggleVoice } = settingsSlice.actions
export default settingsSlice.reducer
