// Implemented the Settings page for user preferences, ensuring API key security message is displayed.
import React, { useState } from 'react';
import Card from '../components/Card';
import { MultimodalProviders, AiProvider, AppSettings, BackgroundSettings, AiProviderSettings, DataSource } from '../types';
import { getSettings, saveSettings, getAiSettings, saveAiSettings } from '../services/settingsService';
import { useAuth } from '../contexts/AuthContext';
import BackgroundSettingsModal from '../components/BackgroundSettingsModal';

type ProviderType = 'text' | 'image' | 'video';

interface AiProviderSettingsEditorProps {
    settings: AiProviderSettings;
    onChange: (newSettings: AiProviderSettings) => void;
    providerTypeLabel: string;
}

const AiProviderSettingsEditor: React.FC<AiProviderSettingsEditorProps> = ({ settings, onChange, providerTypeLabel }) => {
    return (
        <div className="space-y-6">
            <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-cyber-text-secondary">Provedor para {providerTypeLabel}</legend>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <input id={`ai-default-${providerTypeLabel}`} name={`ai-provider-${providerTypeLabel}`} type="radio" value="default" checked={settings.provider === 'default'} onChange={() => onChange({ ...settings, provider: 'default' })} className="h-4 w-4 text-neon-purple border-cyber-border focus:ring-neon-purple bg-cyber-surface" />
                        <label htmlFor={`ai-default-${providerTypeLabel}`} className="ml-2 block text-sm text-cyber-text-primary">Padrão (Gemini)</label>
                    </div>
                    <div className="flex items-center">
                        <input id={`ai-custom-${providerTypeLabel}`} name={`ai-provider-${providerTypeLabel}`} type="radio" value="custom" checked={settings.provider !== 'default'} onChange={() => onChange({ ...settings, provider: 'openai' })} className="h-4 w-4 text-neon-purple border-cyber-border focus:ring-neon-purple bg-cyber-surface" />
                        <label htmlFor={`ai-custom-${providerTypeLabel}`} className="ml-2 block text-sm text-cyber-text-primary">Personalizada</label>
                    </div>
                </div>
            </fieldset>

            {settings.provider !== 'default' && (
                <div className="space-y-4 pt-4 border-t border-cyber-border">
                    <div>
                        <label htmlFor="custom-provider" className="block text-sm font-medium text-cyber-text-secondary mb-2">
                            Provedor Personalizado
                        </label>
                        <select
                            id="custom-provider"
                            value={settings.provider}
                            onChange={(e) => onChange({ ...settings, provider: e.target.value as AiProvider })}
                            className="w-full bg-cyber-surface border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple"
                        >
                            <option value="openai">OpenAI</option>
                            <option value="groq">Groq</option>
                            <option value="replicate">Replicate</option>
                            <option value="anthropic">Anthropic</option>
                            <option value="cohere">Cohere</option>
                            <option value="mistral">Mistral AI</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="api-key" className="block text-sm font-medium text-cyber-text-secondary mb-2">
                            Chave da API
                        </label>
                        <input
                            type="password"
                            id="api-key"
                            value={settings.apiKey || ''}
                            onChange={(e) => onChange({ ...settings, apiKey: e.target.value })}
                            placeholder="Cole sua chave de API aqui"
                            className="w-full bg-cyber-surface border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple"
                        />
                    </div>
                    <div>
                        <label htmlFor="model-name" className="block text-sm font-medium text-cyber-text-secondary mb-2">
                            Nome do Modelo
                        </label>
                        <input
                            type="text"
                            id="model-name"
                            value={settings.model || ''}
                            onChange={(e) => onChange({ ...settings, model: e.target.value })}
                            placeholder="Ex: gpt-4, llama3-70b-8192"
                            className="w-full bg-cyber-surface border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple"
                        />
                    </div>
                </div>
            )}

            {settings.provider === 'default' && (
                <div className="bg-cyber-bg/50 p-4 rounded-lg border border-cyber-border mt-4">
                    <p className="text-sm text-cyber-text-secondary">
                        O provedor padrão utiliza a API Google Gemini carregada de forma segura a partir das variáveis de ambiente (`process.env.API_KEY`) e não necessita de configuração adicional.
                    </p>
                </div>
            )}
        </div>
    );
};


const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [aiSettings, setAiSettings] = useState<MultimodalProviders>(getAiSettings());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isBgModalOpen, setIsBgModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ProviderType>('text');
  const { currentUser } = useAuth();

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaveStatus('idle');
  };
  
  const handleAiSettingChange = (providerType: ProviderType, newProviderSettings: AiProviderSettings) => {
    setAiSettings(prev => ({...prev, [providerType]: newProviderSettings}));
    setSaveStatus('idle');
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // FIX: The type of reader.result was not being narrowed correctly inside this callback.
        // Assigning it to a local constant `result` allows TypeScript's control flow analysis
        // to correctly infer it as a string, fixing the type error.
        const result = reader.result;
        if (typeof result === 'string') {
          if (fileType === 'image') {
            setSettings(prev => ({...prev, backgroundWallpaper: result, backgroundVideo: undefined}));
          } else {
            setSettings(prev => ({...prev, backgroundVideo: result, backgroundWallpaper: undefined}));
          }
          setSaveStatus('idle');
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveWallpaper = () => {
    setSettings(prev => ({ ...prev, backgroundWallpaper: undefined, backgroundVideo: undefined }));
    setSaveStatus('idle');
  };
  
  const handleSaveAdvancedBgSettings = (newBgSettings: BackgroundSettings) => {
    handleSettingChange('backgroundSettings', newBgSettings);
    setIsBgModalOpen(false);
  };


  const handleSave = () => {
    setSaveStatus('saving');
    saveSettings(settings);
    saveAiSettings(aiSettings);
    window.dispatchEvent(new CustomEvent('settings_updated'));
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };
  
  const TABS: { key: ProviderType, label: string }[] = [
    { key: 'text', label: 'Texto' },
    { key: 'image', label: 'Imagem' },
    { key: 'video', label: 'Vídeo' },
  ];
  
  const hasWallpaper = settings.backgroundWallpaper || settings.backgroundVideo;

  return (
    <>
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-semibold text-cyber-text-primary">Configurações</h2>
      
      <Card>
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-cyber-text-primary">Aparência</h3>
          
          <div>
            <label className="block text-sm font-medium text-cyber-text-secondary mb-2">
                Foto de Perfil (via Google)
            </label>
            <div className="flex items-center space-x-4">
                {currentUser?.picture ? (
                    <img src={currentUser.picture} alt="Foto de Perfil" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-neon-purple flex items-center justify-center font-bold text-2xl">
                        {currentUser?.name?.[0]}
                    </div>
                )}
                <p className="text-sm text-cyber-text-secondary">Sua foto de perfil é gerenciada pela sua conta Google.</p>
            </div>
          </div>
          
           <div>
            <label className="block text-sm font-medium text-cyber-text-secondary mb-2">
                Plano de Fundo Personalizado
            </label>
            <div className="flex items-start space-x-4">
                <div className="w-28 h-16 rounded-md bg-cyber-bg border-2 border-cyber-border flex items-center justify-center overflow-hidden">
                    {settings.backgroundVideo ? (
                        <video src={settings.backgroundVideo} muted loop autoPlay className="w-full h-full object-cover"></video>
                    ) : settings.backgroundWallpaper ? (
                        <img src={settings.backgroundWallpaper} alt="Plano de Fundo" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-cyber-text-secondary text-xs">Sem mídia</span>
                    )}
                </div>

                <div className="flex-1 flex flex-col gap-2">
                    <input type="file" id="image-upload" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
                    <input type="file" id="video-upload" className="hidden" accept="video/*" onChange={(e) => handleFileChange(e, 'video')} />
                    
                    <button onClick={() => document.getElementById('image-upload')?.click()} className="bg-cyber-border hover:bg-cyber-border/80 text-cyber-text-primary font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                        Carregar Imagem
                    </button>
                    <button onClick={() => document.getElementById('video-upload')?.click()} className="bg-cyber-border hover:bg-cyber-border/80 text-cyber-text-primary font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                        Carregar Vídeo
                    </button>
                </div>
                 <div className="flex flex-col gap-2">
                    {hasWallpaper && (
                        <>
                            <button onClick={() => setIsBgModalOpen(true)} className="bg-cyber-border hover:bg-cyber-border/80 text-neon-cyan font-semibold py-2 px-4 rounded-lg transition-colors text-sm whitespace-nowrap">
                                Ajustes Avançados
                            </button>
                             <button onClick={handleRemoveWallpaper} className="bg-red-900/50 hover:bg-red-900/80 text-red-400 font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                                Remover
                            </button>
                        </>
                    )}
                 </div>
            </div>
          </div>

          <div>
            <label htmlFor="speech-rate" className="block text-sm font-medium text-cyber-text-secondary mb-2">
                Velocidade da Fala ({settings.speechRate?.toFixed(1) || '1.0'}x)
            </label>
            <input
                id="speech-rate"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.speechRate || 1}
                onChange={(e) => handleSettingChange('speechRate', parseFloat(e.target.value))}
                className="w-full h-2 bg-cyber-border rounded-lg appearance-none cursor-pointer accent-neon-purple"
            />
          </div>

        </div>
      </Card>

      <Card>
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-cyber-text-primary">Armazenamento de Dados</h3>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-cyber-text-secondary">Provedor de Banco de Dados</legend>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
              {(['local', 'supabase', 'baserow'] as DataSource[]).map(source => (
                <div key={source} className="flex items-center">
                  <input
                    id={`data-source-${source}`}
                    name="data-source"
                    type="radio"
                    value={source}
                    checked={settings.dataSource === source}
                    onChange={() => handleSettingChange('dataSource', source)}
                    className="h-4 w-4 text-neon-purple border-cyber-border focus:ring-neon-purple bg-cyber-surface"
                  />
                  <label htmlFor={`data-source-${source}`} className="ml-2 block text-sm text-cyber-text-primary capitalize">{source}</label>
                </div>
              ))}
            </div>
          </fieldset>

          {settings.dataSource === 'supabase' && (
            <div className="space-y-4 pt-4 border-t border-cyber-border">
              <h4 className="font-semibold text-neon-cyan">Configurações do Supabase</h4>
              <div>
                <label htmlFor="supabase-url" className="block text-sm font-medium text-cyber-text-secondary mb-2">URL do Projeto</label>
                <input type="text" id="supabase-url" value={settings.supabaseUrl || ''} onChange={(e) => handleSettingChange('supabaseUrl', e.target.value)} className="w-full bg-cyber-surface border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple" placeholder="https://exemplo.supabase.co"/>
              </div>
              <div>
                <label htmlFor="supabase-api-key" className="block text-sm font-medium text-cyber-text-secondary mb-2">Chave da API (anon key)</label>
                <input type="password" id="supabase-api-key" value={settings.supabaseApiKey || ''} onChange={(e) => handleSettingChange('supabaseApiKey', e.target.value)} className="w-full bg-cyber-surface border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple" placeholder="Cole sua chave de API pública aqui"/>
              </div>
            </div>
          )}

          {settings.dataSource === 'baserow' && (
            <div className="space-y-4 pt-4 border-t border-cyber-border">
              <h4 className="font-semibold text-neon-cyan">Configurações do Baserow</h4>
              <div>
                <label htmlFor="baserow-url" className="block text-sm font-medium text-cyber-text-secondary mb-2">URL da Instância</label>
                <input type="text" id="baserow-url" value={settings.baserowUrl || ''} onChange={(e) => handleSettingChange('baserowUrl', e.target.value)} className="w-full bg-cyber-surface border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple" placeholder="https://api.baserow.io"/>
              </div>
              <div>
                <label htmlFor="baserow-api-key" className="block text-sm font-medium text-cyber-text-secondary mb-2">Token do Banco de Dados</label>
                <input type="password" id="baserow-api-key" value={settings.baserowApiKey || ''} onChange={(e) => handleSettingChange('baserowApiKey', e.target.value)} className="w-full bg-cyber-surface border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple" placeholder="Cole seu token de API aqui"/>
              </div>
            </div>
          )}
          
          {settings.dataSource !== 'local' && (
             <div className="bg-amber-900/50 p-3 rounded-lg border border-amber-500/50 mt-4">
                <p className="text-xs text-amber-200">
                    Atenção: A integração com provedores externos é simulada. Nenhum dado real será enviado. Mudar a fonte de dados requer que a página seja recarregada para ter efeito.
                </p>
            </div>
          )}

        </div>
      </Card>

      <Card>
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-cyber-text-primary">Geral</h3>
            <div>
                <label htmlFor="language" className="block text-sm font-medium text-cyber-text-secondary mb-2">
                Idioma
                </label>
                <select
                id="language"
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="w-full bg-cyber-surface border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple"
                >
                <option value="pt-br">Português (Brasil)</option>
                <option value="en-us">English (US)</option>
                </select>
            </div>

            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-cyber-text-secondary">
                Habilitar Notificações
                </span>
                <button
                onClick={() => handleSettingChange('notifications', !settings.notifications)}
                className={`${
                    settings.notifications ? 'bg-neon-purple' : 'bg-cyber-border'
                } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cyber-bg focus:ring-neon-purple`}
                >
                <span
                    className={`${
                    settings.notifications ? 'translate-x-6' : 'translate-x-1'
                    } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                />
                </button>
            </div>
          </div>
      </Card>

      <Card>
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-cyber-text-primary">Configuração da IA</h3>
            <div className="border-b border-cyber-border">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`${
                                activeTab === tab.key
                                    ? 'border-neon-purple text-neon-purple'
                                    : 'border-transparent text-cyber-text-secondary hover:text-cyber-text-primary hover:border-cyber-border'
                            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="pt-4">
                {activeTab === 'text' && <AiProviderSettingsEditor settings={aiSettings.text} onChange={(s) => handleAiSettingChange('text', s)} providerTypeLabel="Texto" />}
                {activeTab === 'image' && <AiProviderSettingsEditor settings={aiSettings.image} onChange={(s) => handleAiSettingChange('image', s)} providerTypeLabel="Imagem" />}
                {activeTab === 'video' && <AiProviderSettingsEditor settings={aiSettings.video} onChange={(s) => handleAiSettingChange('video', s)} providerTypeLabel="Vídeo" />}
            </div>
        </div>
      </Card>

       <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-neon-purple hover:bg-purple-500 text-white font-semibold py-2 px-6 rounded-lg transition-all transform hover:scale-105 hover:shadow-glow-purple disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={saveStatus === 'saving'}
        >
          {saveStatus === 'saving' ? 'Salvando...' : saveStatus === 'saved' ? 'Salvo!' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
    {isBgModalOpen && hasWallpaper && settings.backgroundSettings && (
        <BackgroundSettingsModal
          isOpen={isBgModalOpen}
          onClose={() => setIsBgModalOpen(false)}
          onSave={handleSaveAdvancedBgSettings}
          settings={settings.backgroundSettings}
          wallpaperUrl={settings.backgroundVideo || settings.backgroundWallpaper!}
          wallpaperType={settings.backgroundVideo ? 'video' : 'image'}
        />
    )}
    </>
  );
};

export default Settings;