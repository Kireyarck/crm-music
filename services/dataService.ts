import { getSettings } from './settingsService';
import LocalDataService from './localDataService';
import SupabaseDataService from './supabaseDataService';
import BaserowDataService from './baserowDataService';
import { Project, Task, Idea, AssistantConversation } from '../types';

export interface IDataService {
    getProjects(): Promise<Project[]>;
    saveProjects(projects: Project[]): Promise<void>;
    getTasks(): Promise<Task[]>;
    saveTasks(tasks: Task[]): Promise<void>;
    getIdeas(): Promise<Idea[]>;
    saveIdeas(ideas: Idea[]): Promise<void>;
    getConversations(): Promise<AssistantConversation[]>;
    saveConversations(conversations: AssistantConversation[]): Promise<void>;
}

const settings = getSettings();
let dataService: IDataService;

switch(settings.dataSource) {
    case 'supabase':
        // In a real app, you would pass credentials from settings to the service constructor
        dataService = SupabaseDataService; 
        break;
    case 'baserow':
        dataService = BaserowDataService; 
        break;
    default:
        dataService = LocalDataService;
}

export default dataService;
