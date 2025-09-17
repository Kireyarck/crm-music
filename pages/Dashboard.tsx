// Implemented the Dashboard page to show an overview of creative work.
import React, { useState, useMemo, useEffect } from 'react';
import Card from '../components/Card';
import dataService from '../services/dataService';
import { Project, Task, Idea } from '../types';

type FilterOption = 'Tudo' | 'Hoje' | 'Semana' | 'Mês' | 'Ano';

const Dashboard: React.FC = () => {
  const [filter, setFilter] = useState<FilterOption>('Tudo');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [loadedProjects, loadedTasks, loadedIdeas] = await Promise.all([
          dataService.getProjects(),
          dataService.getTasks(),
          dataService.getIdeas(),
        ]);
        setProjects(loadedProjects);
        setTasks(loadedTasks);
        setIdeas(loadedIdeas);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const { filteredProjects, filteredTasks, filteredIdeas } = useMemo(() => {
    const now = new Date();
    
    const isToday = (d: Date) => {
        return d.getDate() === now.getDate() &&
               d.getMonth() === now.getMonth() &&
               d.getFullYear() === now.getFullYear();
    };

    const isThisWeek = (d: Date) => {
        const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))); // Monday
        firstDayOfWeek.setHours(0,0,0,0);
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
        lastDayOfWeek.setHours(23,59,59,999);
        return d >= firstDayOfWeek && d <= lastDayOfWeek;
    };

    const isThisMonth = (d: Date) => {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    };

    const isThisYear = (d: Date) => {
        return d.getFullYear() === now.getFullYear();
    };

    const checkDate = (dateStr: string) => {
      if (filter === 'Tudo') return true;
      
      const date = new Date(dateStr);
      // Adjust for timezone differences by getting UTC values. Assumes YYYY-MM-DD input.
      const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

      if (isNaN(utcDate.getTime())) return false;
      
      switch(filter) {
        case 'Hoje': return isToday(utcDate);
        case 'Semana': return isThisWeek(utcDate);
        case 'Mês': return isThisMonth(utcDate);
        case 'Ano': return isThisYear(utcDate);
        default: return true;
      }
    };

    return {
      filteredProjects: projects.filter(p => checkDate(p.createdAt)),
      filteredTasks: tasks.filter(t => checkDate(t.dueDate)),
      filteredIdeas: ideas.filter(i => checkDate(i.createdAt)),
    };
  }, [filter, projects, tasks, ideas]);

  const ongoingProjects = filteredProjects.filter(p => p.status === 'Em Andamento');
  const pendingTasks = filteredTasks.filter(t => !t.completed);
  const upcomingTasks = pendingTasks.slice(0, 3);
  const recentIdeas = filteredIdeas.slice(0, 2);
  const filterOptions: FilterOption[] = ['Tudo', 'Hoje', 'Semana', 'Mês', 'Ano'];

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
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-2xl font-semibold text-cyber-text-primary">Visão Geral</h2>
            <div className="flex flex-wrap items-center gap-2">
                {filterOptions.map(option => (
                    <button
                        key={option}
                        onClick={() => setFilter(option)}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                            filter === option
                            ? 'bg-neon-purple text-white shadow-glow-purple'
                            : 'bg-cyber-surface hover:bg-cyber-border text-cyber-text-secondary'
                        }`}
                    >
                        {option === 'Tudo' ? 'Desde o início' : option}
                    </button>
                ))}
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-neon-purple to-indigo-500 text-white">
            <h3 className="text-lg font-bold">Projetos em Andamento</h3>
            <p className="text-5xl font-bold mt-2">{ongoingProjects.length}</p>
          </Card>
          <Card className="bg-gradient-to-br from-neon-cyan to-blue-500 text-white">
            <h3 className="text-lg font-bold">Tarefas Pendentes</h3>
            <p className="text-5xl font-bold mt-2">{pendingTasks.length}</p>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <h3 className="text-lg font-bold">Ideias Capturadas</h3>
            <p className="text-5xl font-bold mt-2">{filteredIdeas.length}</p>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h3 className="text-xl font-semibold mb-4 text-cyber-text-primary">Projetos Atuais</h3>
          {ongoingProjects.length > 0 ? (
            <ul className="space-y-4">
              {ongoingProjects.map(project => (
                <li key={project.id} className="p-4 bg-cyber-border/50 rounded-lg">
                  <p className="font-bold">{project.title}</p>
                  <p className="text-sm text-cyber-text-secondary">{project.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-cyber-text-secondary italic">Nenhum projeto em andamento no período selecionado.</p>
          )}
        </Card>
        <Card>
          <h3 className="text-xl font-semibold mb-4 text-cyber-text-primary">Próximas Tarefas</h3>
          {upcomingTasks.length > 0 ? (
            <ul className="space-y-4">
              {upcomingTasks.map(task => (
                <li key={task.id} className="flex items-center justify-between p-4 bg-cyber-border/50 rounded-lg">
                  <div>
                    <p className="font-bold">{task.title}</p>
                    <p className="text-sm text-cyber-text-secondary">{task.project}</p>
                  </div>
                  <span className="text-sm text-cyber-text-secondary">{task.dueDate}</span>
                </li>
              ))}
            </ul>
           ) : (
            <p className="text-cyber-text-secondary italic">Nenhuma tarefa pendente no período selecionado.</p>
          )}
        </Card>
      </div>

       <Card>
          <h3 className="text-xl font-semibold mb-4 text-cyber-text-primary">Ideias Recentes</h3>
          {recentIdeas.length > 0 ? (
            <ul className="space-y-4">
              {recentIdeas.map(idea => (
                 <li key={idea.id} className="p-4 bg-cyber-border/50 rounded-lg">
                  <p className="font-bold">{idea.title}</p>
                  <p className="text-sm text-cyber-text-secondary">{idea.content}</p>
                </li>
              ))}
            </ul>
           ) : (
            <p className="text-cyber-text-secondary italic">Nenhuma ideia capturada no período selecionado.</p>
          )}
        </Card>
    </div>
  );
};

export default Dashboard;