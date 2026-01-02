import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface SettingsState {
  language: 'ar' | 'en'
  voiceEnabled: boolean
}

const savedSettings = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('app-settings') || 'null') : null;
const initialState: SettingsState = savedSettings || {
  language: 'ar',
  voiceEnabled: true,
};

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
