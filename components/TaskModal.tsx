import React, { useState, useEffect } from 'react';
import { Task, Project } from '../types';

interface TaskModalProps {
  task: Task;
  projects: Project[];
  onClose: () => void;
  onSave: (task: Task) => void;
  isCreating: boolean;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, projects, onClose, onSave, isCreating }) => {
  const [formData, setFormData] = useState<Task>(task);

  useEffect(() => {
    setFormData(task);
  }, [task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-cyber-surface/90 backdrop-blur-sm rounded-2xl w-full max-w-lg flex flex-col overflow-hidden relative border border-cyber-border modal-animate"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-6 border-b border-cyber-border flex justify-between items-center">
          <h2 className="text-2xl font-bold text-cyber-text-primary">{isCreating ? 'Nova Tarefa' : 'Editar Tarefa'}</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-cyber-border transition-colors" aria-label="Fechar modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-cyber-text-secondary mb-1">Título da Tarefa</label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-cyber-bg border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-cyber-text-secondary mb-1">Descrição (Opcional)</label>
            <textarea
              name="description"
              id="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
              className="w-full bg-cyber-bg border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple"
              placeholder="Adicione mais detalhes sobre a tarefa..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="project" className="block text-sm font-medium text-cyber-text-secondary mb-1">Projeto</label>
              <select
                name="project"
                id="project"
                value={formData.project}
                onChange={handleChange}
                className="w-full bg-cyber-bg border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple"
              >
                <option value="Geral">Geral</option>
                {projects.map(p => <option key={p.id} value={p.title}>{p.title}</option>)}
              </select>
            </div>
            <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-cyber-text-secondary mb-1">Data de Entrega</label>
                <input
                    type="date"
                    name="dueDate"
                    id="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full bg-cyber-bg border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple"
                    required
                />
            </div>
          </div>
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-cyber-text-secondary mb-1">Prioridade</label>
            <select
              name="priority"
              id="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full bg-cyber-bg border border-cyber-border rounded-md py-2 px-3 text-cyber-text-primary focus:outline-none focus:ring-2 focus:ring-neon-purple"
            >
              <option value="Alta">Alta</option>
              <option value="Média">Média</option>
              <option value="Baixa">Baixa</option>
            </select>
          </div>
        </main>

        <footer className="p-6 border-t border-cyber-border flex justify-end items-center space-x-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-cyber-border hover:bg-cyber-border/80 text-cyber-text-primary font-semibold transition-colors">
            Cancelar
          </button>
          <button type="submit" className="px-6 py-2 rounded-lg bg-neon-purple hover:bg-purple-500 text-white font-semibold transition-colors transform hover:scale-105">
            {isCreating ? 'Criar Tarefa' : 'Salvar'}
          </button>
        </footer>
      </form>
    </div>
  );
};

export default TaskModal;