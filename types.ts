// Populated types.ts with all necessary type definitions for the application.
export type Page = 
  | 'Dashboard' 
  | 'Ideias' 
  | 'Projetos' 
  | 'Assistente' 
  | 'Tarefas' 
  | 'Contatos' 
  | 'Configurações';

export interface User {
  name: string;
  email: string;
  picture: string;
}

export interface AudioVersion {
  id: number;
  name: string;
  url: string;
  versionType: 'demo' | 'final';
}

export interface Track {
  id: number;
  number: number;
  title: string;
  description: string;
  status: 'Planejada' | 'Iniciada' | 'Finalizada' | 'Mixagem';
  lyrics?: string;
  objective?: string;
  creativeNotes?: string;
  technicalNotes?: string;
  audioVersions?: AudioVersion[];
}

export type ProjectType = 'Álbum' | 'Single' | 'Música' | 'Demo' | 'Sem tipo';

export interface Project {
  id: number;
  title: string;
  description: string;
  type: ProjectType;
  status: 'Em Andamento' | 'Concluído' | 'Planejado';
  color: string;
  tags: string[];
  tracks?: Track[];
  createdAt: string; // YYYY-MM-DD
  parentId?: number | null;
}

export interface Task {
  id: number;
  title: string;
  project: string;
  dueDate: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  completed: boolean;
}

export interface Idea {
  id: number;
  title: string;
  content: string;
  tags: string[];
  type: 'text' | 'audio';
  audioUrl?: string;
  createdAt: string; // YYYY-MM-DD
}

export interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  imageUrl?: string;
  videoUrl?: string;
  isGenerating?: boolean;
}

export interface AssistantConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

export type AiProvider = 'openai' | 'groq' | 'replicate' | 'anthropic' | 'cohere' | 'mistral';

export interface AiProviderSettings {
  provider: 'default' | AiProvider;
  apiKey?: string;
  model?: string;
}

export interface MultimodalProviders {
  text: AiProviderSettings;
  image: AiProviderSettings;
  video: AiProviderSettings;
}

export interface BackgroundSettings {
  overlayOpacity: number;
  blur: number;
  grayscale: number;
  brightness: number;
}

export type DataSource = 'local' | 'supabase' | 'baserow';

export interface AppSettings {
  theme: 'dark' | 'light';
  notifications: boolean;
  language: 'pt-br' | 'en-us';
  speechRate?: number;
  dataSource: DataSource;
  supabaseUrl?: string;
  supabaseApiKey?: string;
  baserowUrl?: string;
  baserowApiKey?: string;
  backgroundWallpaper?: string;
  backgroundVideo?: string;
  backgroundSettings?: BackgroundSettings;
}