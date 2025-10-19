import React, { useState, useEffect } from 'react';
import { Project, Track, ProjectType } from '../types';
import TrackDetailPanel from './TrackDetailPanel';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
  onUpdate: (project: Project) => void;
  allProjects: Project[];
  isCreating?: boolean;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose, onUpdate, allProjects, isCreating = false }) => {
  const [formData, setFormData] = useState<Project>(project);
  const [tagString, setTagString] = useState(project.tags.join(', '));
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);

  useEffect(() => {
    setFormData(project);
    setTagString(project.tags.join(', '));
     // For a 'Single' project type, if it's being edited and has one track, go directly to the track detail view.
    if (project.type === 'Single' && project.tracks?.length === 1 && !isCreating) {
        setEditingTrack(project.tracks[0]);
    }
  }, [project, isCreating]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    
    // If changing type to Single, ensure there's exactly one track
    if (name === 'type' && value === 'Single') {
      if (!newFormData.tracks || newFormData.tracks.length === 0) {
        newFormData.tracks = [createNewTrack()];
      } else {
        newFormData.tracks = [newFormData.tracks[0]]; // Keep only the first track
      }
    }
    setFormData(newFormData);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const updatedProject = {
      ...formData,
      tags: tagString.split(',').map(tag => tag.trim()).filter(Boolean),
    };
    onUpdate(updatedProject);
  };
  
  const handleCloseAndSave = () => {
    handleSubmit();
  };


  const createNewTrack = (): Track => ({
    id: Date.now(),
    number: (formData.tracks?.length || 0) + 1,
    title: 'Nova Faixa',
    description: '',
    status: 'Planejada',
    lyrics: '',
    audioVersions: [],
  });

  const handleAddTrack = () => {
    const newTrack = createNewTrack();
    const newTracks = [...(formData.tracks || []), newTrack];
    setFormData({ ...formData, tracks: newTracks });
    setEditingTrack(newTrack);
  };

  const handleUpdateTrack = (updatedTrack: Track) => {
     const newTracks = (formData.tracks || []).map(t => t.id === updatedTrack.id ? updatedTrack : t);
     setFormData({ ...formData, tracks: newTracks });
  };
  
  const handleDeleteTrack = (trackId: number) => {
    const newTracks = (formData.tracks || []).filter(t => t.id !== trackId);
    setFormData({ ...formData, tracks: newTracks });
  };

  const handleBackToProject = () => {
    // Before going back, ensure the latest track data is saved in the project form state
    if (editingTrack) {
      handleUpdateTrack(editingTrack);
    }
    setEditingTrack(null);
  };

  if (editingTrack) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-cyber-surface/90 backdrop-blur-sm rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden relative border border-cyber-border modal-animate" onClick={(e) => e.stopPropagation()}>
          <TrackDetailPanel
            track={editingTrack}
            onUpdate={handleUpdateTrack}
            onBack={handleBackToProject}
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
      onClick={handleCloseAndSave}
    >
      <form 
        onSubmit={handleSubmit}
        className="bg-cyber-surface/90 backdrop-blur-sm rounded-2xl w-full max-w-3xl flex flex-col overflow-hidden relative border border-cyber-border modal-animate"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-6 border-b border-cyber-border flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-cyber-text-primary">{isCreating ? 'Novo Projeto' : 'Editar Projeto'}</h2>
          </div>
          <button type="button" onClick={handleCloseAndSave} className="p-2 rounded-full hover:bg-cyber-border transition-colors" aria-label="Fechar modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <main className="flex-1 p-6 overflow-y-auto space-y-5 max-h-[60vh]">
          {/* Project Details */}
          <div className="space-y-4">
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Título do Projeto" className="w-full text-lg font-semibold bg-transparent border-b border-cyber-border py-2 text-cyber-text-primary focus:outline-none focus:ring-0 focus:border-neon-purple" required />
            <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="w-full bg-cyber-bg border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple" placeholder="Descrição / Objetivo do Projeto"></textarea>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-cyber-bg border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple">
                    <option value="Álbum">Álbum</option>
                    <option value="Single">Single</option>
                </select>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-cyber-bg border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple">
                    <option value="Planejado">Planejado</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluído">Concluído</option>
                </select>
            </div>
          </div>

          {/* Single Track Section */}
          {formData.type === 'Single' && formData.tracks && formData.tracks.length > 0 && (
             <div className="pt-5 mt-5 border-t border-cyber-border">
                <h3 className="text-lg font-semibold text-cyber-text-primary mb-2">Faixa Principal</h3>
                <div className="flex items-center justify-between p-3 bg-cyber-border/30 rounded-lg">
                    <div>
                        <p className="font-medium text-cyber-text-primary">{formData.tracks[0].title}</p>
                        <p className="text-xs text-cyber-text-secondary">{formData.tracks[0].status}</p>
                    </div>
                    <button type="button" onClick={() => setEditingTrack(formData.tracks![0])} className="text-sm font-semibold text-neon-purple hover:underline">
                        Editar Detalhes da Faixa
                    </button>
                </div>
            </div>
          )}

          {/* Album Tracks Section */}
          {formData.type === 'Álbum' && (
            <div className="pt-5 mt-5 border-t border-cyber-border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-cyber-text-primary">Faixas do Álbum</h3>
                <button type="button" onClick={handleAddTrack} className="bg-neon-cyan/20 hover:bg-neon-cyan/40 text-neon-cyan text-sm font-semibold py-1 px-3 rounded-md border border-neon-cyan/50 transition-colors">
                  + Adicionar Faixa
                </button>
              </div>
              <div className="space-y-2">
                {(formData.tracks || []).map(track => (
                  <div key={track.id} className="flex items-center justify-between p-3 bg-cyber-border/30 rounded-lg">
                    <div>
                      <p className="font-medium text-cyber-text-primary">{track.title}</p>
                      <p className="text-xs text-cyber-text-secondary">{track.status}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setEditingTrack(track)} className="text-sm font-semibold text-neon-purple hover:underline">Editar</button>
                      <button type="button" onClick={() => handleDeleteTrack(track.id)} className="p-1 text-cyber-text-secondary hover:text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
                {(formData.tracks || []).length === 0 && <p className="text-sm text-center text-cyber-text-secondary italic py-4">Nenhuma faixa adicionada ainda.</p>}
              </div>
            </div>
          )}
        </main>
        
        <footer className="p-6 border-t border-cyber-border flex justify-end items-center space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-cyber-border hover:bg-cyber-border/80 text-cyber-text-primary font-semibold transition-colors">Cancelar</button>
            <button type="submit" className="px-6 py-2 rounded-lg bg-neon-purple hover:bg-purple-500 text-white font-semibold transition-colors transform hover:scale-105">{isCreating ? 'Criar Projeto' : 'Salvar Alterações'}</button>
        </footer>
      </form>
    </div>
  );
};

export default ProjectModal;