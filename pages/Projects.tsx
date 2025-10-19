import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import ProjectModal from '../components/ProjectModal';
import ConfirmationModal from '../components/ConfirmationModal';
import dataService from '../services/dataService';
import { Project } from '../types';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      try {
        const loadedProjects = await dataService.getProjects();
        setProjects(loadedProjects);
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProjects();
  }, []);

  const handleSaveProject = async (projectToSave: Project) => {
    const projectExists = projects.some(p => p.id === projectToSave.id);
    let newProjectsList: Project[];
    if (projectExists) {
      newProjectsList = projects.map(p => (p.id === projectToSave.id ? projectToSave : p));
    } else {
      newProjectsList = [projectToSave, ...projects];
    }
    setProjects(newProjectsList);
    await dataService.saveProjects(newProjectsList);
    setSelectedProject(null); // Close modal after save
  };

  const handleNewProject = () => {
    const newProjectTemplate: Project = {
      id: Date.now(),
      title: 'Novo Projeto',
      description: '',
      type: 'Sem tipo',
      status: 'Planejado',
      color: '',
      tags: [],
      tracks: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setSelectedProject(newProjectTemplate);
  };

  const handleDeleteClick = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from opening the project modal
    setProjectToDelete(project);
  };

  const handleConfirmDelete = async () => {
    if (projectToDelete) {
      const newProjects = projects.filter(p => p.id !== projectToDelete.id);
      setProjects(newProjects);
      setProjectToDelete(null);
      await dataService.saveProjects(newProjects);
    }
  };
  
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'Em Andamento': return 'bg-blue-500';
      case 'Concluído': return 'bg-green-500';
      case 'Planejado': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };
  
  const isCreatingNewProject = selectedProject ? !projects.some(p => p.id === selectedProject.id) : false;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
         <svg className="animate-spin h-8 w-8 text-neon-purple" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-cyber-text-primary">Projetos Musicais</h2>
        <button 
          onClick={handleNewProject}
          className="bg-neon-purple hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-lg transition-all transform hover:scale-105 hover:shadow-glow-purple">
          + Novo Projeto
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <Card 
            key={project.id}
            className="cursor-pointer hover:border-neon-purple transition-colors relative group"
            onClick={() => setSelectedProject(project)}
          >
             <button 
              onClick={(e) => handleDeleteClick(project, e)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-cyber-border/50 text-cyber-text-secondary hover:bg-red-500/80 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
              aria-label={`Excluir projeto ${project.title}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)} mb-3`} title={project.status}></div>
            <h3 className="font-bold text-lg text-cyber-text-primary truncate">{project.title}</h3>
            <p className="text-sm text-cyber-text-secondary mt-1 h-10 overflow-hidden">{project.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {project.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-cyber-border text-cyber-text-secondary text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
             <div className="mt-4 pt-4 border-t border-cyber-border text-xs text-cyber-text-secondary/50">
                {project.type}
            </div>
          </Card>
        ))}
      </div>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onUpdate={handleSaveProject}
          allProjects={projects}
          isCreating={isCreatingNewProject}
        />
      )}

      <ConfirmationModal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir Projeto"
        message={`Tem certeza que deseja excluir o projeto '${projectToDelete?.title}'?`}
      />
    </div>
  );
};

export default Projects;
