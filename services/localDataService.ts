import { Project, Task, Idea, AssistantConversation } from '../types';
import { IDataService } from './dataService';

const PROJECTS_KEY = 'musicFlowProjects';
const TASKS_KEY = 'musicFlowTasks';
const IDEAS_KEY = 'musicFlowIdeas';
const CONVERSATIONS_KEY = 'musicFlowAssistantConversations';

const createInitialConversation = (): AssistantConversation => ({
  id: crypto.randomUUID(),
  title: 'Bem-vindo!',
  createdAt: new Date().toISOString(),
  messages: [
    { 
      id: Date.now(), 
      sender: 'ai', 
      text: `Olá! Eu sou seu assistente criativo. Tenho acesso aos seus projetos, ideias e tarefas. Como posso te ajudar a criar algo incrível hoje? Você pode me pedir para gerar texto, imagens ou vídeos.`, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }
  ],
});

const LocalDataService: IDataService = {
  getProjects: async (): Promise<Project[]> => {
    try {
      const stored = localStorage.getItem(PROJECTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) { console.error(e); return []; }
  },
  saveProjects: async (projects: Project[]): Promise<void> => {
    try { localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects)); } catch (e) { console.error(e); }
  },

  getTasks: async (): Promise<Task[]> => {
     try {
      const stored = localStorage.getItem(TASKS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) { console.error(e); return []; }
  },
  saveTasks: async (tasks: Task[]): Promise<void> => {
     try { localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); } catch (e) { console.error(e); }
  },

  getIdeas: async (): Promise<Idea[]> => {
     try {
      const stored = localStorage.getItem(IDEAS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) { console.error(e); return []; }
  },
  saveIdeas: async (ideas: Idea[]): Promise<void> => {
    try { localStorage.setItem(IDEAS_KEY, JSON.stringify(ideas)); } catch (e) { console.error(e); }
  },
  
  getConversations: async (): Promise<AssistantConversation[]> => {
    try {
      const stored = localStorage.getItem(CONVERSATIONS_KEY);
      if (stored) {
        const conversations = JSON.parse(stored);
        if (Array.isArray(conversations) && conversations.length > 0) {
          return conversations;
        }
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
    const initial = [createInitialConversation()];
    await LocalDataService.saveConversations(initial);
    return initial;
  },
  saveConversations: async (conversations: AssistantConversation[]): Promise<void> => {
    try {
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error("Failed to save conversations:", error);
    }
  },
};

export default LocalDataService;
