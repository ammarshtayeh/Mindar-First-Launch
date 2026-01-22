import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  language: "ar" | "en";
  voiceEnabled: boolean;
  zenMode: boolean;
}

const savedSettings =
  typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("app-settings") || "null")
    : null;
const initialState: SettingsState = savedSettings || {
  language: "ar",
  voiceEnabled: true,
  zenMode: false,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<"ar" | "en">) => {
      state.language = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("app-settings", JSON.stringify(state));
      }
    },
    toggleVoice: (state) => {
      state.voiceEnabled = !state.voiceEnabled;
      if (typeof window !== "undefined") {
        localStorage.setItem("app-settings", JSON.stringify(state));
        // Sync with voiceManager's independent localStorage key for legacy support/independent usage
        localStorage.setItem(
          "voice_master_enabled",
          String(state.voiceEnabled),
        );
      }
    },
    toggleZenMode: (state) => {
      state.zenMode = !state.zenMode;
      if (typeof window !== "undefined") {
        localStorage.setItem("app-settings", JSON.stringify(state));
      }
    },
  },
});

export const { setLanguage, toggleVoice, toggleZenMode } =
  settingsSlice.actions;
export default settingsSlice.reducer;
