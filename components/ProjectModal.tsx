import React, { useState, useEffect } from 'react';
import { Project } from '../types';

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

  useEffect(() => {
    setFormData(project);
    setTagString(project.tags.join(', '));
  }, [project]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProject = {
      ...formData,
      tags: tagString.split(',').map(tag => tag.trim()).filter(Boolean),
    };
    onUpdate(updatedProject);
  };

  const isNewProject = isCreating;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <form 
        onSubmit={handleSubmit}
        className="bg-cyber-surface/90 backdrop-blur-sm rounded-2xl w-full max-w-2xl flex flex-col overflow-hidden relative border border-cyber-border modal-animate"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-6 border-b border-cyber-border flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-cyber-text-primary">{isNewProject ? 'Novo Projeto' : 'Editar Projeto'}</h2>
            <p className="text-cyber-text-secondary">Defina um título e detalhes rápidos</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-cyber-border transition-colors" aria-label="Fechar modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="flex-1 p-6 overflow-y-auto space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-cyber-text-secondary mb-1">Título</label>
            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="w-full bg-cyber-bg border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple" required />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-cyber-text-secondary mb-1">Descrição</label>
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="w-full bg-cyber-bg border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple"></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="color" className="block text-sm font-medium text-cyber-text-secondary mb-1">Cor (opcional)</label>
                <input type="text" name="color" id="color" value={formData.color} onChange={handleChange} placeholder="ex: hsl(210 90% 50%) ou 'azul'" className="w-full bg-cyber-bg border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple" />
            </div>
            <div>
                <label htmlFor="tags" className="block text-sm font-medium text-cyber-text-secondary mb-1">Tags (separe por vírgula)</label>
                <input type="text" name="tags" id="tags" value={tagString} onChange={(e) => setTagString(e.target.value)} className="w-full bg-cyber-bg border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple" />
            </div>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="type" className="block text-sm font-medium text-cyber-text-secondary mb-1">Tipo</label>
                <select name="type" id="type" value={formData.type} onChange={handleChange} className="w-full bg-cyber-bg border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple">
                    <option>Sem tipo</option>
                    <option>Música</option>
                    <option>Álbum</option>
                    <option>Single</option>
                    <option>Demo</option>
                </select>
            </div>
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-cyber-text-secondary mb-1">Status</label>
                <select name="status" id="status" value={formData.status} onChange={handleChange} className="w-full bg-cyber-bg border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple">
                    <option value="Planejado">Planejado</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluído">Concluído</option>
                </select>
            </div>
          </div>
          <div>
            <label htmlFor="parentId" className="block text-sm font-medium text-cyber-text-secondary mb-1">Projeto pai (opcional)</label>
            <select name="parentId" id="parentId" value={formData.parentId || ''} onChange={handleChange} className="w-full bg-cyber-bg border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple">
                <option value="">Sem pai</option>
                {allProjects.filter(p => p.id !== project.id).map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                ))}
            </select>
          </div>
        </main>
        
        <footer className="p-6 border-t border-cyber-border flex justify-end items-center space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-cyber-border hover:bg-cyber-border/80 text-cyber-text-primary font-semibold transition-colors">
                Cancelar
            </button>
            <button type="submit" className="px-6 py-2 rounded-lg bg-neon-purple hover:bg-purple-500 text-white font-semibold transition-colors transform hover:scale-105">
                {isNewProject ? 'Criar' : 'Salvar'}
            </button>
        </footer>
      </form>
    </div>
  );
};

export default ProjectModal;