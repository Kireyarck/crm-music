import { getSettings } from './settingsService';

const synth = window.speechSynthesis;
let keepAliveInterval: number | null = null;

/**
 * Starts a timer to periodically 'ping' the speech synthesis engine
 * to prevent it from timing out on long text. This is a workaround
 * for a known bug in some browser implementations.
 */
const startKeepAlive = () => {
    if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
    }
    // Ping every 10 seconds
    keepAliveInterval = window.setInterval(() => {
        if (synth.speaking && !synth.paused) {
            synth.pause();
            synth.resume();
        }
    }, 10000); 
};

/**
 * Stops the keep-alive timer.
 */
const stopKeepAlive = () => {
    if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        keepAliveInterval = null;
    }
};

/**
 * Speaks the given text using the browser's Speech Synthesis API.
 * Cancels any previously playing speech.
 * @param text The text to be spoken.
 * @param onEnd A callback function to execute when speech has finished.
 */
export const speak = (text: string, onEnd: () => void): void => {
  // Cancel any ongoing speech and clear any existing timers
  if (synth.speaking) {
    synth.cancel();
  }
  stopKeepAlive();

  // Don't try to speak empty text
  if (!text.trim()) {
    onEnd();
    return;
  }
  
  const settings = getSettings();
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set language to Portuguese (Brazil) to hint for the correct voice
  utterance.lang = 'pt-BR';
  // Apply the rate from settings, defaulting to 1
  utterance.rate = settings.speechRate || 1;

  utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
    // Log the specific error property for better debugging
    console.error('An error occurred during speech synthesis:', event.error, event);
    stopKeepAlive();
    onEnd();
  };
  
  utterance.onstart = () => {
    startKeepAlive();
  };

  utterance.onend = () => {
    stopKeepAlive();
    onEnd();
  };

  synth.speak(utterance);
};

/**
 * Stops any currently ongoing speech synthesis.
 */
export const stop = (): void => {
  stopKeepAlive();
  synth.cancel();
};