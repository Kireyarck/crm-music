import React, { useState, useEffect } from 'react';
import { Idea } from '../types';

interface IdeaModalProps {
  idea: Idea;
  onClose: () => void;
  onSave: (idea: Idea) => void;
  isCreating?: boolean;
}

const IdeaModal: React.FC<IdeaModalProps> = ({ idea, onClose, onSave, isCreating = false }) => {
  const [formData, setFormData] = useState<Idea>(idea);
  const [tagString, setTagString] = useState(idea.tags.join(', '));

  useEffect(() => {
    setFormData(idea);
    setTagString(idea.tags.join(', '));
  }, [idea]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedIdea = {
      ...formData,
      tags: tagString.split(',').map(tag => tag.trim()).filter(Boolean),
    };
    onSave(updatedIdea);
  };

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
            <h2 className="text-2xl font-bold text-cyber-text-primary">{isCreating ? 'Nova Ideia' : 'Editar Ideia'}</h2>
            <p className="text-cyber-text-secondary">Capture os detalhes da sua ideia.</p>
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
          {formData.type === 'text' && (
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-cyber-text-secondary mb-1">Conteúdo</label>
              <textarea name="content" id="content" value={formData.content} onChange={handleChange} rows={5} className="w-full bg-cyber-bg border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple"></textarea>
            </div>
          )}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-cyber-text-secondary mb-1">Tags (separe por vírgula)</label>
            <input type="text" name="tags" id="tags" value={tagString} onChange={(e) => setTagString(e.target.value)} className="w-full bg-cyber-bg border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple" />
          </div>
        </main>
        
        <footer className="p-6 border-t border-cyber-border flex justify-end items-center space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-cyber-border hover:bg-cyber-border/80 text-cyber-text-primary font-semibold transition-colors">
                Cancelar
            </button>
            <button type="submit" className="px-6 py-2 rounded-lg bg-neon-purple hover:bg-purple-500 text-white font-semibold transition-colors transform hover:scale-105">
                {isCreating ? 'Criar' : 'Salvar'}
            </button>
        </footer>
      </form>
    </div>
  );
};

export default IdeaModal;
