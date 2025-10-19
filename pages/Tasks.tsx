import React, { useState, useEffect } from 'react';
import { Task, Project } from '../types';
import dataService from '../services/dataService';
import Card from '../components/Card';
import TaskModal from '../components/TaskModal';
import ConfirmationModal from '../components/ConfirmationModal';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [loadedTasks, loadedProjects] = await Promise.all([
          dataService.getTasks(),
          dataService.getProjects(),
        ]);
        setTasks(loadedTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
        setProjects(loadedProjects);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSaveTask = async (taskToSave: Task) => {
    const taskExists = tasks.some(t => t.id === taskToSave.id);
    let newTasksList: Task[];
    if (taskExists) {
      newTasksList = tasks.map(t => (t.id === taskToSave.id ? taskToSave : t));
    } else {
      newTasksList = [taskToSave, ...tasks];
    }
    const sortedTasks = newTasksList.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    setTasks(sortedTasks);
    await dataService.saveTasks(sortedTasks);
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleNewTask = () => {
    const newTaskTemplate: Task = {
      id: Date.now(),
      title: '',
      description: '',
      project: projects[0]?.title || 'Geral',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'Média',
      completed: false,
    };
    setSelectedTask(newTaskTemplate);
    setIsModalOpen(true);
  };

  const handleToggleComplete = async (taskId: number) => {
    const newTasksList = tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setTasks(newTasksList);
    await dataService.saveTasks(newTasksList);
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      const newTasks = tasks.filter(t => t.id !== taskToDelete.id);
      setTasks(newTasks);
      setTaskToDelete(null);
      await dataService.saveTasks(newTasks);
    }
  };

  const getPriorityClass = (priority: 'Alta' | 'Média' | 'Baixa') => {
    switch (priority) {
      case 'Alta': return 'border-red-500';
      case 'Média': return 'border-yellow-500';
      case 'Baixa': return 'border-cyan-500';
      default: return 'border-cyber-border';
    }
  };

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

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-cyber-text-primary">Tarefas</h2>
        <button
          onClick={handleNewTask}
          className="bg-neon-purple hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-lg transition-all transform hover:scale-105 hover:shadow-glow-purple">
          + Nova Tarefa
        </button>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-cyber-text-primary border-b border-cyber-border pb-2">Pendentes</h3>
        <div className="space-y-4">
          {pendingTasks.length > 0 ? (
            pendingTasks.map(task => (
              <Card key={task.id} className={`p-4 border-l-4 ${getPriorityClass(task.priority)}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task.id)}
                      className="h-5 w-5 rounded bg-cyber-bg border-cyber-border text-neon-purple focus:ring-neon-purple cursor-pointer mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-cyber-text-primary">{task.title}</p>
                      <p className="text-sm text-cyber-text-secondary">{task.project} - {new Date(task.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                      {task.description && (
                        <p className="text-sm text-cyber-text-secondary mt-1 whitespace-pre-wrap">{task.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => { setSelectedTask(task); setIsModalOpen(true); }} className="p-1.5 rounded-full text-cyber-text-secondary hover:bg-cyber-border hover:text-white transition-colors" aria-label="Editar Tarefa">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                    </button>
                    <button onClick={() => setTaskToDelete(task)} className="p-1.5 rounded-full text-cyber-text-secondary hover:bg-cyber-border hover:text-red-500 transition-colors" aria-label="Excluir Tarefa">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-cyber-text-secondary italic text-center py-4">Nenhuma tarefa pendente. Bom trabalho!</p>
          )}
        </div>
      </div>
      
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-cyber-text-primary border-b border-cyber-border pb-2">Concluídas</h3>
        <div className="space-y-4">
           {completedTasks.map(task => (
              <Card key={task.id} className="p-4 opacity-60">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task.id)}
                      className="h-5 w-5 rounded bg-cyber-bg border-cyber-border text-neon-purple focus:ring-neon-purple cursor-pointer"
                    />
                    <div>
                      <p className="font-semibold text-cyber-text-primary line-through">{task.title}</p>
                      <p className="text-sm text-cyber-text-secondary">{task.project}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>

      {isModalOpen && selectedTask && (
        <TaskModal
          task={selectedTask}
          projects={projects}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTask}
          isCreating={!tasks.some(t => t.id === selectedTask.id)}
        />
      )}

      <ConfirmationModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir Tarefa"
        message={`Tem certeza que deseja excluir a tarefa '${taskToDelete?.title}'?`}
      />
    </div>
  );
};

export default Tasks;