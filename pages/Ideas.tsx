// Implemented the Ideas page with an interactive chat UI to develop ideas with the Gemini API.
import React, { useState, useRef, useEffect } from 'react';
import Card from '../components/Card';
import ChatBubble from '../components/ChatBubble';
import { Idea, ChatMessage } from '../types';
import { getCreativeResponse, transcribeAudio } from '../services/geminiService';
import { speak, stop } from '../services/ttsService';
import dataService from '../services/dataService';


const Ideas: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(true);
  const [speakingMessageId, setSpeakingMessageId] = useState<number | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadIdeas = async () => {
      setIsLoadingIdeas(true);
      try {
        const loadedIdeas = await dataService.getIdeas();
        setIdeas(loadedIdeas);
        if(loadedIdeas.length > 0) {
          // Do not automatically select an idea
        }
      } catch (error) {
        console.error("Failed to load ideas:", error);
      } finally {
        setIsLoadingIdeas(false);
      }
    };
    loadIdeas();
  }, []);

  useEffect(() => {
    if (selectedIdea) {
      setIsChatMinimized(false);
      setMessages([
        { id: Date.now(), sender: 'ai', text: `Olá! Vamos desenvolver a ideia "${selectedIdea.title}". Como posso ajudar?`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    } else {
      setIsChatMinimized(true);
      setMessages([]);
    }
    stop();
    setSpeakingMessageId(null);
  }, [selectedIdea]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleToggleSpeech = (message: ChatMessage) => {
    if (speakingMessageId === message.id) {
        stop();
        setSpeakingMessageId(null);
    } else {
        setSpeakingMessageId(message.id);
        speak(message.text, () => setSpeakingMessageId(null));
    }
  };
  
  const handleAddIdea = async (type: 'text' | 'audio', data?: { audioUrl: string }) => {
    const timestamp = new Date();
    const newIdea: Idea = {
        id: timestamp.getTime(),
        type: type,
        title: type === 'audio' ? `Gravação de Áudio ${timestamp.toLocaleDateString()}` : 'Nova Anotação',
        content: type === 'audio' ? 'Clique para ouvir a gravação.' : '',
        tags: [],
        createdAt: timestamp.toISOString().split('T')[0], // YYYY-MM-DD format
        audioUrl: data?.audioUrl,
    };
    const newIdeasList = [newIdea, ...ideas];
    setIdeas(newIdeasList);
    setSelectedIdea(newIdea);
    await dataService.saveIdeas(newIdeasList);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        handleAddIdea('audio', { audioUrl });
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedIdea || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setNewMessage('');
    setIsLoading(true);

    try {
      const aiResponseText = await getCreativeResponse(selectedIdea, messages, newMessage);
      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to get AI response:", error);
       const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'Desculpe, não consegui processar sua solicitação. Tente novamente.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedIdea) return;

    setIsLoading(true);
    
    try {
        const transcribedText = await transcribeAudio(file);
        // The service adds a prefix, let's clean it for the chat message.
        const cleanText = transcribedText.replace(/\(Letra transcrita do áudio ".*"\)\n\n/g, '');

        const userMessage: ChatMessage = {
            id: Date.now(),
            sender: 'user',
            text: `(Transcrição do áudio "${file.name}")\n\n${cleanText}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Add user message to chat UI
        const currentMessages = [...messages, userMessage];
        setMessages(currentMessages);
        
        // Get AI response, passing the history *before* this new message
        const aiResponseText = await getCreativeResponse(selectedIdea, messages, cleanText);
        const aiMessage: ChatMessage = {
            id: Date.now() + 1,
            sender: 'ai',
            text: aiResponseText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
        console.error("Failed to transcribe or get AI response:", error);
        const errorMessage: ChatMessage = {
            id: Date.now() + 1,
            sender: 'ai',
            text: 'Desculpe, não consegui processar o áudio. Tente novamente.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
        // Reset file input so user can upload the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }
  };

  return (
    <div className="h-full">
      {/* Ideas List Container */}
      <div className="flex flex-col gap-4 h-full">
        <h2 className="text-2xl font-semibold text-cyber-text-primary">Banco de Ideias</h2>
        
        <div className="flex gap-2">
            <button onClick={() => handleAddIdea('text')} className="flex-1 bg-cyber-border hover:bg-cyber-border/80 text-cyber-text-primary font-semibold py-2 px-4 rounded-lg transition-colors">
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
                    className={`cursor-pointer transition-all ${selectedIdea?.id === idea.id ? 'border-neon-purple ring-2 ring-neon-purple' : 'hover:border-cyber-border'}`}
                    onClick={() => setSelectedIdea(idea)}
                >
                    <h3 className="font-bold text-lg">{idea.title}</h3>
                    {idea.type === 'text' ? (
                        <p className="text-sm text-cyber-text-secondary mt-1">{idea.content.substring(0, 100)}...</p>
                    ) : (
                        idea.audioUrl && <audio controls src={idea.audioUrl} className="w-full mt-2"></audio>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                    {idea.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-cyber-border text-cyber-text-secondary text-xs rounded">
                        {tag}
                        </span>
                    ))}
                    </div>
                </Card>
                ))
            )}
        </div>
      </div>
      
      {/* Floating Action Button to restore chat */}
      {isChatMinimized && selectedIdea && (
          <button 
            onClick={() => setIsChatMinimized(false)}
            className="fixed bottom-8 right-8 bg-neon-purple hover:bg-purple-500 text-white font-bold p-3 rounded-full shadow-lg z-40 transition-transform hover:scale-105 hover:shadow-glow-purple"
            aria-label="Abrir chat da IA"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          </button>
      )}

      {/* Backdrop for mobile */}
      {!isChatMinimized && selectedIdea && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-20 lg:hidden"
          onClick={() => setIsChatMinimized(true)}
          aria-hidden="true"
        />
      )}

      {/* Floating Chat Panel */}
      <div className={`
        fixed bottom-0 right-0 z-30
        w-full h-[85vh]
        lg:bottom-8 lg:right-8 lg:w-full lg:max-w-lg lg:h-auto lg:max-h-[80vh]
        bg-cyber-surface border border-cyber-border rounded-t-2xl lg:rounded-2xl flex flex-col shadow-2xl 
        transition-transform duration-300 ease-in-out
        ${isChatMinimized || !selectedIdea ? 'translate-y-full' : 'translate-y-0'}
      `}>
          {selectedIdea && (
            <>
              <header className="p-4 border-b border-cyber-border flex justify-between items-center flex-shrink-0">
                  <div className="min-w-0">
                      <h3 className="text-xl font-bold truncate">{selectedIdea.title}</h3>
                      <p className="text-sm text-cyber-text-secondary truncate">{selectedIdea.content || 'Gravação de áudio'}</p>
                  </div>
                  <button onClick={() => setIsChatMinimized(true)} className="p-2 rounded-full hover:bg-cyber-border ml-2" aria-label="Minimizar chat">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 10a.75.75 0 01.75-.75h8.5a.75.75 0 010 1.5h-8.5A.75.75 0 015 10z" clipRule="evenodd" /></svg>
                  </button>
              </header>
              <main className="flex-1 p-6 space-y-6 overflow-y-auto">
                {messages.map(msg => <ChatBubble key={msg.id} message={msg} isSpeaking={speakingMessageId === msg.id} onToggleSpeech={handleToggleSpeech} />)}
                {isLoading && <ChatBubble message={{id: 0, sender: 'ai', text: 'Pensando...', timestamp: ''}} />}
                <div ref={chatEndRef} />
              </main>
              <footer className="p-4 border-t border-cyber-border flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleAudioUpload} 
                    className="hidden" 
                    accept="audio/*" 
                  />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 rounded-full hover:bg-cyber-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={isLoading || isRecording}
                    aria-label="Anexar áudio"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyber-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.415a6 6 0 108.485 8.485L17 13" />
                    </svg>
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Envie uma mensagem para a IA..."
                    className="flex-1 bg-cyber-border rounded-full py-3 px-5 text-cyber-text-primary placeholder-cyber-text-secondary focus:outline-none focus:ring-2 focus:ring-neon-purple"
                    disabled={isLoading || isRecording}
                  />
                  <button type="submit" className="bg-neon-purple hover:bg-purple-500 text-white font-bold p-3 rounded-full disabled:opacity-50 transition-all transform hover:scale-105 hover:shadow-glow-purple" disabled={isLoading || isRecording || !newMessage.trim()}>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
                </form>
              </footer>
            </>
          )}
      </div>
    </div>
  );
};

export default Ideas;