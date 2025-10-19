import React, { useState, useEffect, useRef } from 'react';
import { Track, AudioVersion } from '../types';
import * as assistantService from '../services/assistantService';

interface TrackDetailPanelProps {
  track: Track;
  onUpdate: (updatedTrack: Track) => void;
  onBack: () => void;
}

const AiFeedbackDisplay: React.FC<{ title: string; content: string; onClear: () => void }> = ({ title, content, onClear }) => (
    <div className="mt-4 p-4 bg-cyber-bg rounded-lg border border-neon-purple/50 relative">
        <button onClick={onClear} className="absolute top-2 right-2 p-1 text-cyber-text-secondary hover:text-white transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h5 className="font-semibold text-neon-purple mb-2">{title}</h5>
        <p className="text-sm text-cyber-text-secondary whitespace-pre-wrap">{content}</p>
    </div>
);


const TrackDetailPanel: React.FC<TrackDetailPanelProps> = ({ track, onUpdate, onBack }) => {
  const [localTrack, setLocalTrack] = useState<Track>(track);
  const [aiFeedback, setAiFeedback] = useState<{title: string, content: string} | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Sync local state if the parent's track prop changes
    setLocalTrack(track);
  }, [track]);

  // Propagate changes up to the parent component on every update
  useEffect(() => {
    onUpdate(localTrack);
  }, [localTrack, onUpdate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalTrack(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const newAudioVersion: AudioVersion = {
          id: Date.now(),
          name: file.name,
          url: result, // Save as base64 data URL
          versionType: 'demo',
        };
        const updatedVersions = [...(localTrack.audioVersions || []), newAudioVersion];
        setLocalTrack(prev => ({ ...prev, audioVersions: updatedVersions }));
      };
      reader.onerror = (error) => {
          console.error('Error converting file to Data URL:', error);
          alert('Falha ao carregar o arquivo de áudio.');
      }
    }
  };
  
  const handleRemoveAudio = (audioId: number) => {
    const updatedVersions = localTrack.audioVersions?.filter(v => v.id !== audioId) || [];
    setLocalTrack(prev => ({ ...prev, audioVersions: updatedVersions }));
  };
  
  const handleAudioVersionTypeChange = (audioId: number, versionType: 'demo' | 'final') => {
    const updatedVersions = localTrack.audioVersions?.map(v => v.id === audioId ? { ...v, versionType } : v) || [];
    setLocalTrack(prev => ({...prev, audioVersions: updatedVersions }));
  };

  const handleGetAIFeedback = async (type: 'lyrics' | 'music' | 'mixing' | 'comprehensive') => {
    setIsGeneratingFeedback(true);
    setAiFeedback(null);
    try {
        let title = '';
        let content = '';
        if (type === 'comprehensive') {
            const audioToAnalyze = localTrack.audioVersions?.[0];
            if (!audioToAnalyze) {
                alert('Por favor, adicione uma versão de áudio para a análise completa.');
                setIsGeneratingFeedback(false);
                return;
            }
            title = 'Análise Completa da Faixa (Áudio + Letra)';
            content = await assistantService.getComprehensiveTrackAnalysis(localTrack, audioToAnalyze);
        } else if (type === 'lyrics' && localTrack.lyrics) {
            title = 'Feedback da Letra';
            content = await assistantService.getLyricsFeedback(localTrack.lyrics);
        } else if (type === 'music') {
            title = 'Feedback Geral da Música';
            content = await assistantService.getMusicFeedback(localTrack);
        } else if (type === 'mixing' && localTrack.technicalNotes) {
            title = 'Sugestões de Mixagem';
            content = await assistantService.getMixingFeedback(localTrack);
        } else {
            alert('Por favor, preencha o campo correspondente (Letra ou Informações Técnicas) antes de pedir feedback.');
            setIsGeneratingFeedback(false);
            return;
        }
        setAiFeedback({ title, content });
    } catch (error) {
        console.error('Failed to get AI feedback:', error);
        alert('Ocorreu um erro ao obter o feedback da IA.');
    } finally {
        setIsGeneratingFeedback(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <header className="p-6 border-b border-cyber-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-cyber-border transition-colors mr-4" aria-label="Voltar para o projeto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h3 className="text-xl font-semibold text-cyber-text-primary">
            Detalhes da Faixa
            </h3>
        </div>
        <select name="status" value={localTrack.status} onChange={handleChange} className="bg-cyber-bg border border-cyber-border rounded-md py-1 px-3 text-sm text-cyber-text-primary focus:outline-none focus:ring-1 focus:ring-neon-purple">
            <option value="Planejada">Planejada</option>
            <option value="Iniciada">Iniciada</option>
            <option value="Finalizada">Finalizada</option>
            <option value="Mixagem">Mixagem</option>
        </select>
      </header>
      
      <main className="flex-1 p-6 overflow-y-auto space-y-6">
        <input type="text" name="title" value={localTrack.title} onChange={handleChange} className="w-full text-lg font-semibold bg-transparent border-b border-cyber-border py-2 text-cyber-text-primary focus:outline-none focus:ring-0 focus:border-neon-purple" />
        
        {/* Audio Versions Section */}
        <div className="p-4 bg-cyber-bg rounded-lg border border-cyber-border">
            <h4 className="text-lg font-semibold text-cyber-text-primary mb-4">Versões de Áudio</h4>
            <div className="space-y-3 mb-4">
              {(localTrack.audioVersions || []).length > 0 ? (
                localTrack.audioVersions?.map(version => (
                  <div key={version.id} className="flex flex-col md:flex-row items-center justify-between p-3 bg-cyber-border/50 rounded-md gap-3">
                    <p className="text-sm font-medium text-cyber-text-primary truncate flex-shrink-0" title={version.name}>{version.name}</p>
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <select value={version.versionType} onChange={(e) => handleAudioVersionTypeChange(version.id, e.target.value as 'demo' | 'final')} className="bg-cyber-bg border border-cyber-border rounded text-xs py-1 px-2">
                            <option value="demo">Demo</option>
                            <option value="final">Final</option>
                        </select>
                        <audio controls src={version.url} className="h-8 flex-1 max-w-xs"></audio>
                        <button onClick={() => handleRemoveAudio(version.id)} className="p-1.5 text-cyber-text-secondary hover:text-red-500" aria-label={`Remover ${version.name}`}>
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                  </div>
                ))
              ) : <p className="text-sm text-cyber-text-secondary italic">Nenhuma versão de áudio adicionada.</p>}
            </div>
             <input type="file" accept="audio/*" onChange={handleFileChange} ref={fileInputRef} className="hidden"/>
            <button onClick={() => fileInputRef.current?.click()} className="w-full bg-neon-purple/20 hover:bg-neon-purple/40 text-neon-purple font-semibold py-2 px-4 rounded-lg border border-neon-purple/50 transition-colors">+ Adicionar Áudio</button>
        </div>

        {/* AI Feedback Section */}
        <div className="p-4 bg-cyber-bg rounded-lg border border-cyber-border">
            <h4 className="text-lg font-semibold text-cyber-text-primary mb-4">Assistente Criativo AI</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button onClick={() => handleGetAIFeedback('comprehensive')} disabled={isGeneratingFeedback || !localTrack.audioVersions || localTrack.audioVersions.length === 0} className="col-span-1 sm:col-span-2 text-sm bg-neon-cyan/20 hover:bg-neon-cyan/40 text-neon-cyan font-semibold py-2 px-2 rounded-md transition-colors disabled:opacity-50 border border-neon-cyan/50">
                    Análise Completa (Áudio + Letra)
                </button>
                <button onClick={() => handleGetAIFeedback('lyrics')} disabled={isGeneratingFeedback || !localTrack.lyrics} className="text-sm bg-cyber-border hover:bg-cyber-border/80 font-semibold py-2 px-2 rounded-md transition-colors disabled:opacity-50">Analisar Letra</button>
                <button onClick={() => handleGetAIFeedback('music')} disabled={isGeneratingFeedback} className="text-sm bg-cyber-border hover:bg-cyber-border/80 font-semibold py-2 px-2 rounded-md transition-colors disabled:opacity-50">Feedback Geral</button>
                <button onClick={() => handleGetAIFeedback('mixing')} disabled={isGeneratingFeedback || !localTrack.technicalNotes} className="text-sm bg-cyber-border hover:bg-cyber-border/80 font-semibold py-2 px-2 rounded-md transition-colors disabled:opacity-50 col-span-1 sm:col-span-2">Dicas de Mixagem</button>
            </div>
            {isGeneratingFeedback && <p className="text-sm text-center text-cyber-text-secondary italic mt-4">🤖 Gerando feedback... isso pode levar um minuto.</p>}
            {aiFeedback && <AiFeedbackDisplay title={aiFeedback.title} content={aiFeedback.content} onClear={() => setAiFeedback(null)} />}
        </div>
        
        {/* Text Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label htmlFor="lyrics" className="text-sm font-medium text-cyber-text-secondary block mb-2">Letra</label>
              <textarea name="lyrics" value={localTrack.lyrics || ''} onChange={handleChange} rows={12} className="w-full bg-cyber-bg rounded-md p-3 border border-cyber-border focus:ring-2 focus:ring-neon-purple text-cyber-text-primary" placeholder="Escreva a letra aqui..."></textarea>
            </div>
            <div className="space-y-4">
              <div>
                  <label htmlFor="objective" className="text-sm font-medium text-cyber-text-secondary block mb-2">Objetivo da Faixa</label>
                  <textarea name="objective" value={localTrack.objective || ''} onChange={handleChange} rows={3} className="w-full bg-cyber-bg rounded-md p-3 border border-cyber-border focus:ring-2 focus:ring-neon-purple text-cyber-text-primary" placeholder="Qual a mensagem ou propósito?"></textarea>
              </div>
              <div>
                  <label htmlFor="creativeNotes" className="text-sm font-medium text-cyber-text-secondary block mb-2">Informações Criativas</label>
                  <textarea name="creativeNotes" value={localTrack.creativeNotes || ''} onChange={handleChange} rows={5} className="w-full bg-cyber-bg rounded-md p-3 border border-cyber-border focus:ring-2 focus:ring-neon-purple text-cyber-text-primary" placeholder="Mood, temas, referências, instrumentação..."></textarea>
              </div>
              <div>
                  <label htmlFor="technicalNotes" className="text-sm font-medium text-cyber-text-secondary block mb-2">Informações Técnicas</label>
                  <textarea name="technicalNotes" value={localTrack.technicalNotes || ''} onChange={handleChange} rows={5} className="w-full bg-cyber-bg rounded-md p-3 border border-cyber-border focus:ring-2 focus:ring-neon-purple text-cyber-text-primary" placeholder="BPM, tom, equipamentos, VSTs..."></textarea>
              </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default TrackDetailPanel;