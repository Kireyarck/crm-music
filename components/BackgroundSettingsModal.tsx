import React, { useState, useEffect } from 'react';
import { BackgroundSettings } from '../types';

interface BackgroundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newSettings: BackgroundSettings) => void;
  settings: BackgroundSettings;
  wallpaperUrl: string;
  wallpaperType: 'image' | 'video';
}

const BackgroundSettingsModal: React.FC<BackgroundSettingsModalProps> = ({ 
    isOpen, onClose, onSave, settings, wallpaperUrl, wallpaperType
}) => {
  const [localSettings, setLocalSettings] = useState<BackgroundSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  if (!isOpen) return null;

  const handleSettingChange = (key: keyof BackgroundSettings, value: number) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(localSettings);
  };
  
  const backgroundStyle = {
    filter: `blur(${localSettings.blur}px) grayscale(${localSettings.grayscale}%) brightness(${localSettings.brightness})`,
  };
  
  const overlayStyle = {
    backgroundColor: `rgba(13, 14, 18, ${localSettings.overlayOpacity})`,
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bg-settings-title"
    >
      <div 
        className="bg-cyber-surface/90 backdrop-blur-sm rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col lg:flex-row overflow-hidden border border-cyber-border shadow-lg modal-animate"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Preview Pane */}
        <div className="flex-1 lg:w-2/3 relative flex items-center justify-center p-4 overflow-hidden bg-cyber-bg">
            <div className="absolute inset-0 z-0 overflow-hidden">
                {wallpaperType === 'video' ? (
                     <video
                        src={wallpaperUrl}
                        autoPlay
                        loop
                        muted
                        className="w-full h-full object-cover transition-all duration-100"
                        style={backgroundStyle}
                    ></video>
                ) : (
                    <div 
                        className="w-full h-full bg-cover bg-center transition-all duration-100" 
                        style={{...backgroundStyle, backgroundImage: `url(${wallpaperUrl})`}}
                    ></div>
                )}
            </div>
            <div className="absolute inset-0 transition-colors duration-100" style={overlayStyle}></div>
            <div className="relative z-10 text-center text-cyber-text-primary bg-cyber-surface/50 p-6 rounded-lg backdrop-blur-sm">
                <h3 className="text-2xl font-bold">Pré-visualização ao Vivo</h3>
                <p className="text-cyber-text-secondary mt-2">Ajuste os controles para ver as mudanças aqui.</p>
            </div>
        </div>

        {/* Controls Pane */}
        <div className="w-full lg:w-1/3 bg-cyber-bg/50 p-6 flex flex-col border-t lg:border-t-0 lg:border-l border-cyber-border">
          <header className="mb-6">
            <h2 id="bg-settings-title" className="text-2xl font-bold text-cyber-text-primary">Ajustes Avançados</h2>
            <p className="text-cyber-text-secondary">Personalize a aparência do seu plano de fundo.</p>
          </header>

          <main className="flex-1 space-y-6 overflow-y-auto pr-2">
            <div>
              <label htmlFor="overlayOpacity" className="block text-sm font-medium text-cyber-text-secondary mb-2">
                  Opacidade da Sobreposição ({Math.round(localSettings.overlayOpacity * 100)}%)
              </label>
              <input
                  id="overlayOpacity" type="range" min="0" max="1" step="0.05"
                  value={localSettings.overlayOpacity}
                  onChange={(e) => handleSettingChange('overlayOpacity', parseFloat(e.target.value))}
                  className="w-full h-2 bg-cyber-border rounded-lg appearance-none cursor-pointer accent-neon-purple"
              />
            </div>
             <div>
              <label htmlFor="blur" className="block text-sm font-medium text-cyber-text-secondary mb-2">
                  Desfoque ({localSettings.blur}px)
              </label>
              <input
                  id="blur" type="range" min="0" max="20" step="1"
                  value={localSettings.blur}
                  onChange={(e) => handleSettingChange('blur', parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-cyber-border rounded-lg appearance-none cursor-pointer accent-neon-purple"
              />
            </div>
             <div>
              <label htmlFor="grayscale" className="block text-sm font-medium text-cyber-text-secondary mb-2">
                  Escala de Cinza ({localSettings.grayscale}%)
              </label>
              <input
                  id="grayscale" type="range" min="0" max="100" step="1"
                  value={localSettings.grayscale}
                  onChange={(e) => handleSettingChange('grayscale', parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-cyber-border rounded-lg appearance-none cursor-pointer accent-neon-purple"
              />
            </div>
            <div>
              <label htmlFor="brightness" className="block text-sm font-medium text-cyber-text-secondary mb-2">
                  Brilho ({Math.round(localSettings.brightness * 100)}%)
              </label>
              <input
                  id="brightness" type="range" min="0.5" max="1.5" step="0.1"
                  value={localSettings.brightness}
                  onChange={(e) => handleSettingChange('brightness', parseFloat(e.target.value))}
                  className="w-full h-2 bg-cyber-border rounded-lg appearance-none cursor-pointer accent-neon-purple"
              />
            </div>
          </main>

          <footer className="mt-6 pt-6 border-t border-cyber-border flex justify-end space-x-4">
            <button 
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-cyber-border hover:bg-cyber-border/80 text-cyber-text-primary font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2 rounded-lg bg-neon-purple hover:bg-purple-500 text-white font-semibold transition-colors transform hover:scale-105"
            >
              Salvar
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default BackgroundSettingsModal;