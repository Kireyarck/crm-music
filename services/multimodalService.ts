import { GoogleGenAI } from "@google/genai";
import { getAiSettings } from "./settingsService";
import { ChatMessage } from '../types';
import dataService from "./dataService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateTextResponse = async (prompt: string, history: ChatMessage[]): Promise<string> => {
  const settings = getAiSettings();
  if (settings.text.provider !== 'default') {
    return `[RESPOSTA DE TEXTO SIMULADA DE ${settings.text.provider.toUpperCase()}] Resposta para: "${prompt}"`;
  }

  // Fetch context data asynchronously
  const projects = await dataService.getProjects();
  const ideas = await dataService.getIdeas();
  const tasks = await dataService.getTasks();

  const model = settings.text.model || 'gemini-2.5-flash';
  const systemInstruction = `You are a helpful AI assistant for a musician using the 'MusicFlow' app.
You have access to their current projects, ideas, and tasks.
Your primary role is to help them manage their creative workflow.
Be helpful, concise, and use the provided data to answer questions.

Here is the user's current data:
Projects: ${JSON.stringify(projects, null, 2)}
Ideas: ${JSON.stringify(ideas, null, 2)}
Tasks: ${JSON.stringify(tasks, null, 2)}
`;
  
  const contents = [
    ...history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    })),
    { role: 'user', parts: [{ text: prompt }] }
  ];

  try {
    const response = await ai.models.generateContent({ model, contents, config: { systemInstruction } });
    return response.text;
  } catch (error) {
    console.error("Error generating text response:", error);
    throw new Error("Failed to communicate with the text assistant.");
  }
};

export const generateImageResponse = async (prompt: string): Promise<string> => {
  const settings = getAiSettings();
  if (settings.image.provider !== 'default') {
    return `https://dummyimage.com/512x512/1A1B22/E0E1E8.png&text=Simulado:%20${encodeURIComponent(prompt.substring(0,20))}`;
  }
  
  try {
    const model = settings.image.model || 'imagen-4.0-generate-001';
    const response = await ai.models.generateImages({
        model,
        prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/png' },
    });
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image.");
  }
};

export const generateVideoResponse = async (prompt: string): Promise<string> => {
  const settings = getAiSettings();
  if (settings.video.provider !== 'default') {
    // Return a placeholder video
    return `https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4`;
  }

  try {
    const model = settings.video.model || 'veo-2.0-generate-001';
    let operation = await ai.models.generateVideos({ model, prompt, config: { numberOfVideos: 1 } });
    
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video URI not found in operation response.");
    
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const videoBlob = await response.blob();
    const videoUrl = URL.createObjectURL(videoBlob);
    return videoUrl;

  } catch (error) {
    console.error("Error generating video:", error);
    throw new Error("Failed to generate video.");
  }
};