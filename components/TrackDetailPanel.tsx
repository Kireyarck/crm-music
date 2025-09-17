import React, { useState, useEffect, useRef } from 'react';
import { Track, AudioVersion } from '../types';

interface TrackDetailPanelProps {
  track: Track;
  onUpdate: (updatedTrack: Track) => void;
  onBack: () => void;
}

const TrackDetailPanel: React.FC<TrackDetailPanelProps> = ({ track, onUpdate, onBack }) => {
  const [localTrack, setLocalTrack] = useState<Track>(track);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalTrack(track);
  }, [track]);

  const updateAndPropagate = (updatedTrack: Track) => {
    setLocalTrack(updatedTrack);
    onUpdate(updatedTrack);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateAndPropagate({ ...localTrack, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newAudioVersion: AudioVersion = {
        id: Date.now(),
        name: file.name,
        url: URL.createObjectURL(file),
      };
      const updatedVersions = [...(localTrack.audioVersions || []), newAudioVersion];
      updateAndPropagate({ ...localTrack, audioVersions: updatedVersions });
    }
  };
  
  const handleRemoveAudio = (audioId: number) => {
    const audioToRemove = localTrack.audioVersions?.find(v => v.id === audioId);
    if(audioToRemove) {
      URL.revokeObjectURL(audioToRemove.url); // Clean up object URL to prevent memory leaks
    }
    const updatedVersions = localTrack.audioVersions?.filter(v => v.id !== audioId) || [];
    updateAndPropagate({ ...localTrack, audioVersions: updatedVersions });
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-cyber-border transition-colors mr-4" aria-label="Voltar para a lista de faixas">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-xl font-semibold text-cyber-text-primary">
          Detalhes da Faixa: <span className="font-bold text-neon-purple">{track.title}</span>
        </h3>
      </div>
      <div className="space-y-6">

        {/* Audio Versions Section */}
        <div className="p-4 bg-cyber-bg rounded-lg border border-cyber-border">
            <h4 className="text-lg font-semibold text-cyber-text-primary mb-4">Versões de Áudio</h4>
            <div className="space-y-3 mb-4">
              {(localTrack.audioVersions || []).length > 0 ? (
                localTrack.audioVersions?.map(version => (
                  <div key={version.id} className="flex items-center justify-between p-3 bg-cyber-border/50 rounded-md">
                    <p className="text-sm text-cyber-text-primary truncate mr-4" title={version.name}>{version.name}</p>
                    <div className="flex items-center gap-2">
                      <audio controls src={version.url} className="h-8 w-64"></audio>
                      <button 
                        onClick={() => handleRemoveAudio(version.id)} 
                        className="p-1.5 text-cyber-text-secondary hover:text-red-500 transition-colors"
                        aria-label={`Remover ${version.name}`}
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-cyber-text-secondary italic">Nenhuma versão de áudio adicionada.</p>
              )}
            </div>
             <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-neon-purple/20 hover:bg-neon-purple/40 text-neon-purple font-semibold py-2 px-4 rounded-lg border border-neon-purple/50 transition-colors"
            >
              + Adicionar Versão de Áudio
            </button>
        </div>

        <div>
          <label htmlFor="lyrics" className="text-sm font-medium text-cyber-text-secondary block mb-2">Letra</label>
          <textarea name="lyrics" id="lyrics" value={localTrack.lyrics || ''} onChange={handleChange} rows={10} className="w-full bg-cyber-bg rounded-md p-3 border border-cyber-border focus:ring-2 focus:ring-neon-purple focus:border-neon-purple transition-colors text-cyber-text-primary" placeholder="Escreva a letra da música aqui..."></textarea>
        </div>
        <div>
          <label htmlFor="objective" className="text-sm font-medium text-cyber-text-secondary block mb-2">Objetivo da Faixa</label>
          <textarea name="objective" id="objective" value={localTrack.objective || ''} onChange={handleChange} rows={3} className="w-full bg-cyber-bg rounded-md p-3 border border-cyber-border focus:ring-2 focus:ring-neon-purple focus:border-neon-purple transition-colors text-cyber-text-primary" placeholder="Qual é o propósito ou a mensagem principal desta faixa?"></textarea>
        </div>
        <div>
          <label htmlFor="creativeNotes" className="text-sm font-medium text-cyber-text-secondary block mb-2">Informações Criativas</label>
          <textarea name="creativeNotes" id="creativeNotes" value={localTrack.creativeNotes || ''} onChange={handleChange} rows={5} className="w-full bg-cyber-bg rounded-md p-3 border border-cyber-border focus:ring-2 focus:ring-neon-purple focus:border-neon-purple transition-colors text-cyber-text-primary" placeholder="Ex: Mood, temas, referências, instrumentação..."></textarea>
        </div>
        <div>
          <label htmlFor="technicalNotes" className="text-sm font-medium text-cyber-text-secondary block mb-2">Informações Técnicas</label>
          <textarea name="technicalNotes" id="technicalNotes" value={localTrack.technicalNotes || ''} onChange={handleChange} rows={5} className="w-full bg-cyber-bg rounded-md p-3 border border-cyber-border focus:ring-2 focus:ring-neon-purple focus:border-neon-purple transition-colors text-cyber-text-primary" placeholder="Ex: BPM, tom, equipamentos, VSTs..."></textarea>
        </div>
      </div>
    </div>
  );
};

export default TrackDetailPanel;