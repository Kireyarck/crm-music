// Implemented the Ideas page with an interactive chat UI to develop ideas with the Gemini API.
import React, { useState, useRef, useEffect } from 'react';
import Card from '../components/Card';
import { Idea } from '../types';
import { transcribeAudio } from '../services/geminiService';
import dataService from '../services/dataService';
import IdeaModal from '../components/IdeaModal';
import ConfirmationModal from '../components/ConfirmationModal';

const Ideas: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // State for modals
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ideaToDelete, setIdeaToDelete] = useState<Idea | null>(null);
  
  // State for async operations on cards
  const [isTranscribingId, setIsTranscribingId] = useState<number | null>(null);

  useEffect(() => {
    const loadIdeas = async () => {
      setIsLoadingIdeas(true);
      try {
        const loadedIdeas = await dataService.getIdeas();
        setIdeas(loadedIdeas);
      } catch (error) {
        console.error("Failed to load ideas:", error);
      } finally {
        setIsLoadingIdeas(false);
      }
    };
    loadIdeas();
  }, []);
  
  const handleSaveIdea = async (ideaToSave: Idea) => {
    const ideaExists = ideas.some(i => i.id === ideaToSave.id);
    let newIdeasList: Idea[];
    if (ideaExists) {
      newIdeasList = ideas.map(i => (i.id === ideaToSave.id ? ideaToSave : i));
    } else {
      newIdeasList = [ideaToSave, ...ideas];
    }
    setIdeas(newIdeasList);
    await dataService.saveIdeas(newIdeasList);
    setIsModalOpen(false);
    setSelectedIdea(null);
  };
  
  const handleNewIdea = (type: 'text' | 'audio', data?: { audioUrl: string }) => {
    const timestamp = new Date();
    const newIdea: Idea = {
        id: timestamp.getTime(),
        type: type,
        title: type === 'audio' ? `Gravação de Áudio ${timestamp.toLocaleDateString()}` : 'Nova Anotação',
        content: type === 'audio' ? 'Áudio gravado. Clique em transcrever para ver o conteúdo.' : '',
        tags: [],
        createdAt: timestamp.toISOString().split('T')[0], // YYYY-MM-DD format
        audioUrl: data?.audioUrl,
    };
    setSelectedIdea(newIdea);
    setIsModalOpen(true);
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const timestamp = new Date();
        const newIdea: Idea = {
            id: timestamp.getTime(),
            type: 'audio',
            title: `Gravação de Áudio ${timestamp.toLocaleDateString()}`,
            content: 'Áudio gravado. Clique em transcrever para ver o conteúdo.',
            tags: [],
            createdAt: timestamp.toISOString().split('T')[0],
            audioUrl: audioUrl,
        };
        const newIdeasList = [newIdea, ...ideas];
        setIdeas(newIdeasList);
        await dataService.saveIdeas(newIdeasList);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Não foi possível acessar o microfone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const handleEditClick = (idea: Idea) => {
      setSelectedIdea(idea);
      setIsModalOpen(true);
  };

  const handleDeleteClick = (idea: Idea) => {
      setIdeaToDelete(idea);
  };
  
  const handleConfirmDelete = async () => {
      if (ideaToDelete) {
          const newIdeasList = ideas.filter(i => i.id !== ideaToDelete.id);
          setIdeas(newIdeasList);
          await dataService.saveIdeas(newIdeasList);
          setIdeaToDelete(null);
      }
  };

  const handleTranscribe = async (idea: Idea) => {
      if (!idea.audioUrl) return;
      setIsTranscribingId(idea.id);
      try {
          const response = await fetch(idea.audioUrl);
          const blob = await response.blob();
          const file = new File([blob], "transcription.webm", { type: "audio/webm" });
          
          const transcribedText = await transcribeAudio(file);
          const cleanText = transcribedText.replace(/\(Letra transcrita do áudio ".*"\)\n\n/g, '');

          const updatedIdea = { ...idea, content: cleanText };
          const newIdeasList = ideas.map(i => (i.id === updatedIdea.id ? updatedIdea : i));
          setIdeas(newIdeasList);
          await dataService.saveIdeas(newIdeasList);
      } catch (error) {
          console.error("Failed to transcribe audio:", error);
          alert("Falha ao transcrever o áudio.");
      } finally {
          setIsTranscribingId(null);
      }
  };

  const isCreatingNewIdea = selectedIdea ? !ideas.some(p => p.id === selectedIdea.id) : false;

  return (
    <>
      <div className="flex flex-col gap-4 h-full">
        <h2 className="text-2xl font-semibold text-cyber-text-primary">Banco de Ideias</h2>
        
        <div className="flex gap-2">
            <button onClick={() => handleNewIdea('text')} className="flex-1 bg-cyber-border hover:bg-cyber-border/80 text-cyber-text-primary font-semibold py-2 px-4 rounded-lg transition-colors">
                + Nova Anotação
            </button>
            <button 
              onClick={isRecording ? stopRecording : startRecording} 
              className={`flex-1 text-white font-semibold py-2 px-4 rounded-lg transition-all transform hover:scale-105 ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-neon-purple hover:bg-purple-500 hover:shadow-glow-purple'}`}
            >
                {isRecording ? 'Parar Gravação' : '🎙️ Gravar Áudio'}
            </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-2 flex-1 pb-4">
            {isLoadingIdeas ? (
                 <div className="flex justify-center items-center h-32">
                    <svg className="animate-spin h-6 w-6 text-neon-purple" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                 </div>
            ) : ideas.length === 0 ? (
                <p className="text-center text-cyber-text-secondary italic py-8">Nenhuma ideia capturada ainda.</p>
            ) : (
                ideas.map(idea => (
                <Card 
                    key={idea.id}
                    className="group"
                >
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-cyber-text-primary pr-12">{idea.title}</h3>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditClick(idea)} className="p-1.5 rounded-full text-cyber-text-secondary hover:bg-cyber-border hover:text-white transition-colors" aria-label="Editar Ideia">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                            </button>
                            <button onClick={() => handleDeleteClick(idea)} className="p-1.5 rounded-full text-cyber-text-secondary hover:bg-cyber-border hover:text-red-500 transition-colors" aria-label="Excluir Ideia">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    </div>
                    
                    {idea.type === 'text' ? (
                        <p className="text-sm text-cyber-text-secondary mt-1 whitespace-pre-wrap">{idea.content}</p>
                    ) : (
                        <div className="mt-2 space-y-3">
                            {idea.audioUrl && <audio controls src={idea.audioUrl} className="w-full h-10"></audio>}
                            <div className="p-3 bg-cyber-bg rounded-md border border-cyber-border">
                                {isTranscribingId === idea.id ? (
                                    <div className="flex items-center space-x-2 text-sm text-cyber-text-secondary">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        <span>Transcrevendo...</span>
                                    </div>
                                ) : (
                                    <p className="text-sm text-cyber-text-secondary italic whitespace-pre-wrap">{idea.content}</p>
                                )}
                            </div>
                            <button onClick={() => handleTranscribe(idea)} disabled={isTranscribingId === idea.id} className="w-full text-sm bg-neon-cyan/20 hover:bg-neon-cyan/40 text-neon-cyan font-semibold py-2 px-4 rounded-lg border border-neon-cyan/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {isTranscribingId === idea.id ? 'Aguarde' : 'Transcrever Áudio'}
                            </button>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2 mt-3">
                    {idea.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-cyber-border text-cyber-text-secondary text-xs rounded-full">
                        {tag}
                        </span>
                    ))}
                    </div>
                </Card>
                ))
            )}
        </div>
      </div>

      {isModalOpen && selectedIdea && (
        <IdeaModal 
          idea={selectedIdea}
          onClose={() => { setIsModalOpen(false); setSelectedIdea(null); }}
          onSave={handleSaveIdea}
          isCreating={isCreatingNewIdea}
        />
      )}

      <ConfirmationModal
        isOpen={!!ideaToDelete}
        onClose={() => setIdeaToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir Ideia"
        message={`Tem certeza de que deseja excluir a ideia "${ideaToDelete?.title}"? Esta ação não pode ser desfeita.`}
      />
    </>
  );
};

export default Ideas;
