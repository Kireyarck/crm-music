// Implemented Gemini API service functions adhering to coding guidelines.
import { GoogleGenAI } from "@google/genai";
import { getAiSettings } from "./settingsService";

let ai: GoogleGenAI | null = null;

// Lazy initialization of the AI client
const getAiClient = (): GoogleGenAI => {
  if (!ai) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      const errorMessage = "A chave da API do Google Gemini (API_KEY) não está configurada no ambiente de execução. As funcionalidades de IA estão desativadas.";
      console.error(errorMessage);
      alert(errorMessage); // Alert the user for immediate feedback
      throw new Error(errorMessage);
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};


// Helper to convert File object to a base64 string for the API
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // The result includes the data URL prefix (e.g., "data:audio/webm;base64,"),
        // which needs to be removed.
        resolve(reader.result.split(',')[1]);
      } else {
        resolve('');
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const transcribeAudio = async (audioFile: File): Promise<string> => {
    const aiSettings = getAiSettings();
    if (aiSettings.text.provider !== 'default') {
        return `[TRANSCRIÇÃO SIMULADA DO PROVEDOR: ${aiSettings.text.provider.toUpperCase()}] O áudio "${audioFile.name}" foi processado e a transcrição seria exibida aqui.`;
    }

    // FIX: Use the recommended 'gemini-2.5-flash' model for multimodal tasks.
    const model = 'gemini-2.5-flash';
    const audioPart = await fileToGenerativePart(audioFile);

    const prompt = `Transcribe the following audio. The audio contains a musician speaking or singing a musical idea. Transcribe the lyrics or the spoken idea. If it's a melody without lyrics, describe it.`;

    try {
        const response = await getAiClient().models.generateContent({
            model,
            contents: { parts: [audioPart, { text: prompt }] },
        });

        // FIX: Access response text directly via the .text property as per guidelines.
        const transcription = response.text;

        // The user's code expects a prefix, so we will add it back for compatibility.
        return `(Letra transcrita do áudio "${audioFile.name}")\n\n${transcription}`;

    } catch (error) {
        console.error('Error transcribing audio:', error);
        throw new Error('Failed to transcribe audio.');
    }
};
