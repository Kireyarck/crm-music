// Implemented AI assistant service for creative feedback.
import { GoogleGenAI } from "@google/genai";
import { Track } from "../types";

let ai: GoogleGenAI | null = null;

// Lazy initialization of the AI client
const getAiClient = (): GoogleGenAI => {
  if (!ai) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      const errorMessage = "A chave da API do Google Gemini (API_KEY) não está configurada no ambiente de execução. As funcionalidades de IA estão desativadas.";
      console.error(errorMessage);
      alert(errorMessage);
      throw new Error(errorMessage);
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

const callGemini = async (prompt: string): Promise<string> => {
    try {
        const model = 'gemini-2.5-flash';
        const response = await getAiClient().models.generateContent({ model, contents: prompt });
        return response.text;
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw new Error('Falha na comunicação com a IA.');
    }
};

export const getLyricsFeedback = async (lyrics: string): Promise<string> => {
    const prompt = `Você é um compositor e coach de escrita de canções experiente. Analise a seguinte letra de música e forneça um feedback construtivo em português. Foque em:
- Imagens e metáforas
- Estrutura (verso, refrão, ponte)
- Rima e ritmo
- Clareza da mensagem e impacto emocional
- Potencial de originalidade
Seja encorajador e dê sugestões práticas para melhoria, usando bullet points para organizar suas ideias.

Letra para analisar:
---
${lyrics}
---
`;
    return callGemini(prompt);
};

export const getMusicFeedback = async (track: Track): Promise<string> => {
    const prompt = `Você é um produtor musical e A&R (Artista e Repertório). Analise os detalhes desta faixa e forneça um feedback geral sobre seu potencial comercial e artístico em português. Considere o objetivo, as notas criativas e a letra para formar sua opinião. Dê sugestões sobre o arranjo, público-alvo e próximos passos.

Detalhes da Faixa:
- Título: ${track.title}
- Objetivo: ${track.objective || 'Não definido'}
- Notas Criativas: ${track.creativeNotes || 'Não definido'}
- Letra:
${track.lyrics || '(Sem letra fornecida)'}
---

Análise e Sugestões:
`;
    return callGemini(prompt);
};

export const getMixingFeedback = async (track: Track): Promise<string> => {
    const prompt = `Você é um engenheiro de mixagem e masterização. Baseado nas seguintes anotações técnicas para uma faixa, forneça sugestões e dicas práticas para a mixagem em português. Considere como os elementos podem interagir e sugira técnicas para alcançar clareza e impacto.

Anotações Técnicas:
---
${track.technicalNotes}
---

Sugestões de Mixagem:
`;
    return callGemini(prompt);
};