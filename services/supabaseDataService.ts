import { Project, Task, Idea, AssistantConversation } from '../types';
import { IDataService } from './dataService';

// This is a mocked service. In a real app, you would use the Supabase client library.
const SupabaseDataService: IDataService = {
  getProjects: async (): Promise<Project[]> => {
    console.log('[Supabase MOCK] Getting projects...');
    return Promise.resolve([]);
  },
  saveProjects: async (projects: Project[]): Promise<void> => {
    console.log('[Supabase MOCK] Saving projects:', projects);
    return Promise.resolve();
  },

  getTasks: async (): Promise<Task[]> => {
    console.log('[Supabase MOCK] Getting tasks...');
    return Promise.resolve([]);
  },
  saveTasks: async (tasks: Task[]): Promise<void> => {
    console.log('[Supabase MOCK] Saving tasks:', tasks);
    return Promise.resolve();
  },

  getIdeas: async (): Promise<Idea[]> => {
    console.log('[Supabase MOCK] Getting ideas...');
    return Promise.resolve([]);
  },
  saveIdeas: async (ideas: Idea[]): Promise<void> => {
    console.log('[Supabase MOCK] Saving ideas:', ideas);
    return Promise.resolve();
  },
  
  getConversations: async (): Promise<AssistantConversation[]> => {
    console.log('[Supabase MOCK] Getting conversations...');
    const initial: AssistantConversation = {
        id: 'mock-convo',
        title: 'Conversa (Supabase Mock)',
        createdAt: new Date().toISOString(),
        messages: [{ id: 1, sender: 'ai', text: 'Dados carregados do mock do Supabase.', timestamp: '' }]
    };
    return Promise.resolve([initial]);
  },
  saveConversations: async (conversations: AssistantConversation[]): Promise<void> => {
    console.log('[Supabase MOCK] Saving conversations:', conversations);
    return Promise.resolve();
  },
};

export default SupabaseDataService;
