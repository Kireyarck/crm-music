// Implemented a service to manage user settings via localStorage.
import { MultimodalProviders, AppSettings } from '../types';

const SETTINGS_KEY = 'musicFlowAppSettings';
const AI_SETTINGS_KEY = 'musicFlowMultimodalProviders';

// Default settings
const defaultSettings: AppSettings = {
  theme: 'dark',
  notifications: true,
  language: 'pt-br',
  speechRate: 1,
  backgroundWallpaper: undefined,
  backgroundVideo: undefined,
  backgroundSettings: {
    overlayOpacity: 0.8,
    blur: 0,
    grayscale: 0,
    brightness: 1,
  },
  dataSource: 'local',
  supabaseUrl: '',
  supabaseApiKey: '',
  baserowUrl: '',
  baserowApiKey: '',
};

const defaultAiSettings: MultimodalProviders = {
  text: { provider: 'default', apiKey: '', model: '' },
  image: { provider: 'default', apiKey: '', model: '' },
  video: { provider: 'default', apiKey: '', model: '' },
};


/**
 * Retrieves settings from localStorage.
 * If no settings are found, it returns the default settings.
 * @returns {AppSettings} The user's settings.
 */
export const getSettings = (): AppSettings => {
  try {
    const storedSettings = localStorage.getItem(SETTINGS_KEY);
    if (storedSettings) {
      const parsed = JSON.parse(storedSettings);
      // Merge with defaults to ensure all keys are present, especially nested ones
      return { 
        ...defaultSettings, 
        ...parsed,
        backgroundSettings: {
            ...defaultSettings.backgroundSettings,
            ...(parsed.backgroundSettings || {}),
        }
      };
    }
  } catch (error) {
    console.error("Failed to parse settings from localStorage:", error);
  }
  return defaultSettings;
};

/**
 * Saves the settings object to localStorage.
 * @param {AppSettings} settings - The settings object to save.
 */
export const saveSettings = (settings: AppSettings): void => {
  try {
    const settingsJson = JSON.stringify(settings);
    localStorage.setItem(SETTINGS_KEY, settingsJson);
  } catch (error) {
    console.error("Failed to save settings to localStorage:", error);
  }
};

/**
 * Retrieves AI settings from localStorage.
 * @returns {MultimodalProviders} The user's AI settings.
 */
export const getAiSettings = (): MultimodalProviders => {
  try {
    const storedSettings = localStorage.getItem(AI_SETTINGS_KEY);
    if (storedSettings) {
      const parsed = JSON.parse(storedSettings);
      return {
        text: { ...defaultAiSettings.text, ...parsed.text },
        image: { ...defaultAiSettings.image, ...parsed.image },
        video: { ...defaultAiSettings.video, ...parsed.video },
      };
    }
  } catch (error) {
    console.error("Failed to parse AI settings from localStorage:", error);
  }
  return defaultAiSettings;
};

/**
 * Saves the AI settings object to localStorage.
 * @param {MultimodalProviders} settings - The AI settings object to save.
 */
export const saveAiSettings = (settings: MultimodalProviders): void => {
  try {
    const settingsJson = JSON.stringify(settings);
    localStorage.setItem(AI_SETTINGS_KEY, settingsJson);
  } catch (error) {
    console.error("Failed to save AI settings to localStorage:", error);
  }
};