import React, { useState, useRef, useEffect } from 'react';
import ChatBubble from '../components/ChatBubble';
import { ChatMessage, AssistantConversation } from '../types';
import * as multimodalService from '../services/multimodalService';
import dataService from '../services/dataService';
import { speak, stop } from '../services/ttsService';
import { transcribeAudio } from '../services/geminiService';


type GenerationMode = 'text' | 'image' | 'video';

const Assistant: React.FC = () => {
  const [conversations, setConversations] = useState<AssistantConversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<GenerationMode>('text');
  const [speakingMessageId, setSpeakingMessageId] = useState<number | null>(null);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadConvos = async () => {
        setIsLoadingConversations(true);
        try {
            const loadedConvos = await dataService.getConversations();
            setConversations(loadedConvos);
            if (loadedConvos.length > 0 && !currentConversationId) {
                if (window.innerWidth >= 1024) {
                    setCurrentConversationId(loadedConvos[0].id);
                }
            }
        } catch(e) {
            console.error("Failed to load conversations", e);
        } finally {
            setIsLoadingConversations(false);
        }
    };
    loadConvos();
  }, []);

  useEffect(() => {
    if (!isLoadingConversations) {
        dataService.saveConversations(conversations);
    }
  }, [conversations, isLoadingConversations]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, isLoading, currentConversationId]);
  
  useEffect(() => {
    stop();
    setSpeakingMessageId(null);
  }, [currentConversationId]);

  const handleToggleSpeech = (message: ChatMessage) => {
    if (speakingMessageId === message.id) {
        stop();
        setSpeakingMessageId(null);
    } else {
        setSpeakingMessageId(message.id);
        speak(message.text, () => setSpeakingMessageId(null));
    }
  };
  
  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    setShowChatOnMobile(true);
  };
  
  const addMessageToConversation = (convoId: string, message: ChatMessage) => {
     setConversations(prev => prev.map(convo => 
        convo.id === convoId ? { ...convo, messages: [...convo.messages, message] } : convo
    ));
  };

  const updateMessageInConversation = (convoId: string, messageId: number, updatedMessage: Partial<ChatMessage>) => {
    setConversations(prev => prev.map(convo => {
      if (convo.id === convoId) {
        return {
          ...convo,
          messages: convo.messages.map(msg => msg.id === messageId ? { ...msg, ...updatedMessage } : msg)
        };
      }
      return convo;
    }));
  };

  const sendMessageAndGetResponse = async (prompt: string, convoId: string) => {
    const currentConversation = conversations.find(c => c.id === convoId);
    if (!currentConversation) return;
    
    setIsLoading(true);

    const placeholderMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: `Gerando ${mode}...`,
        timestamp: '',
        isGenerating: true,
    };
    addMessageToConversation(convoId, placeholderMessage);

    try {
        let aiResponse: Partial<ChatMessage> = {};
        if (mode === 'image') {
            const imageUrl = await multimodalService.generateImageResponse(prompt);
            aiResponse = { imageUrl, text: prompt };
        } else if (mode === 'video') {
            const videoUrl = await multimodalService.generateVideoResponse(prompt);
            aiResponse = { videoUrl, text: prompt };
        } else {
            const text = await multimodalService.generateTextResponse(prompt, currentConversation.messages);
            aiResponse = { text };
        }
        
        updateMessageInConversation(convoId, placeholderMessage.id, {
            ...aiResponse,
            isGenerating: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

    } catch (error) {
        console.error(`Failed to generate ${mode}:`, error);
        updateMessageInConversation(convoId, placeholderMessage.id, {
            text: `Desculpe, ocorreu um erro ao gerar ${mode}. Por favor, tente novamente.`,
            isGenerating: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    } finally {
        setIsLoading(false);
    }
  };


  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentConversationId) return;
    
    const userMessage: ChatMessage = {
        id: Date.now(),
        sender: 'user',
        text: input,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    addMessageToConversation(currentConversationId, userMessage);
    const prompt = input;
    setInput('');
    
    await sendMessageAndGetResponse(prompt, currentConversationId);
  };
  
  const startRecording = async () => {
    if (!currentConversationId) return;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = (event) => audioChunksRef.current.push(event.data);
        mediaRecorderRef.current.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const audioFile = new File([audioBlob], "recording.webm", { type: "audio/webm" });
            stream.getTracks().forEach(track => track.stop());
            
            // Handle audio processing
            setIsLoading(true);
            const tempMsgId = Date.now();
            const tempUserMessage: ChatMessage = {
                id: tempMsgId, sender: 'user', text: '🎤 Transcrevendo áudio...',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            addMessageToConversation(currentConversationId, tempUserMessage);

            try {
                const transcribedText = await transcribeAudio(audioFile);
                const cleanText = transcribedText.replace(/\(Letra transcrita do áudio ".*"\)\n\n/g, '');
                updateMessageInConversation(currentConversationId, tempMsgId, { text: `🎤: "${cleanText}"` });
                await sendMessageAndGetResponse(cleanText, currentConversationId);
            } catch (err) {
                 updateMessageInConversation(currentConversationId, tempMsgId, { text: 'Falha ao transcrever o áudio.' });
            } finally {
                setIsLoading(false);
            }
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
  
  const handleNewConversation = () => {
    const newConvo: AssistantConversation = {
        id: crypto.randomUUID(),
        title: 'Nova Conversa',
        createdAt: new Date().toISOString(),
        messages: [
            { id: Date.now(), sender: 'ai', text: 'Olá! Como posso te ajudar?', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ],
    };
    setConversations(prev => [newConvo, ...prev]);
    setCurrentConversationId(newConvo.id);
    setShowChatOnMobile(true);
  };
  
  const currentConversation = conversations.find(c => c.id === currentConversationId);

  return (
    <div className="bg-cyber-surface border border-cyber-border rounded-2xl flex h-full relative overflow-hidden">
      {/* Conversation List Sidebar */}
      <aside className={`w-full lg:w-72 lg:flex-shrink-0 border-r border-cyber-border flex flex-col transition-transform duration-300 ease-in-out absolute lg:relative h-full z-10 bg-cyber-surface ${showChatOnMobile ? '-translate-x-full' : 'translate-x-0'} lg:translate-x-0`}>
        <div className="p-4 border-b border-cyber-border">
          <button onClick={handleNewConversation} className="w-full bg-neon-purple/20 hover:bg-neon-purple/40 text-neon-purple font-semibold py-2 px-4 rounded-lg border border-neon-purple/50 transition-colors">
            + Nova Conversa
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoadingConversations ? (
            <div className="flex justify-center items-center h-full">
                <svg className="animate-spin h-5 w-5 text-neon-purple" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
          ) : (
            conversations.map(convo => (
                <a
                key={convo.id}
                href="#"
                onClick={(e) => { e.preventDefault(); handleSelectConversation(convo.id); }}
                className={`block p-3 rounded-lg truncate transition-colors ${currentConversationId === convo.id ? 'bg-cyber-border' : 'hover:bg-cyber-border/50'}`}
                >
                <p className="font-semibold text-sm text-cyber-text-primary">{convo.title || convo.messages[0].text.substring(0, 30)}...</p>
                <p className="text-xs text-cyber-text-secondary">{new Date(convo.createdAt).toLocaleDateString()}</p>
                </a>
            ))
          )}
        </nav>
      </aside>

      {/* Main Chat Panel */}
      <div className={`flex-1 flex flex-col h-full w-full lg:w-auto absolute lg:relative transition-transform duration-300 ease-in-out ${showChatOnMobile ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0`}>
          {currentConversation ? (
            <>
                <div className="p-4 md:p-6 border-b border-cyber-border flex items-center flex-shrink-0">
                    <button onClick={() => setShowChatOnMobile(false)} className="p-2 rounded-full hover:bg-cyber-border transition-colors mr-3 lg:hidden" aria-label="Voltar para conversas">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h3 className="text-xl md:text-2xl font-bold text-cyber-text-primary truncate">{currentConversation.title}</h3>
                </div>
                <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
                    {currentConversation.messages.map(msg => <ChatBubble key={msg.id} message={msg} isSpeaking={speakingMessageId === msg.id} onToggleSpeech={handleToggleSpeech} />)}
                    <div ref={chatEndRef} />
                </div>
                <div className="p-4 md:p-6 border-t border-cyber-border flex-shrink-0">
                    <div className="flex justify-center mb-4">
                        <div className="bg-cyber-border p-1 rounded-full flex items-center space-x-1">
                            {(['text', 'image', 'video'] as GenerationMode[]).map(m => (
                                <button key={m} onClick={() => setMode(m)} className={`px-4 py-1.5 text-sm font-semibold rounded-full capitalize transition-colors ${mode === m ? 'bg-neon-purple text-white' : 'text-cyber-text-secondary hover:bg-cyber-surface'}`}>
                                    {m === 'text' ? 'Texto' : m === 'image' ? 'Imagem' : 'Vídeo'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <form onSubmit={handleTextSubmit} className="flex items-center space-x-3">
                        <div className="flex-1 relative flex items-center">
                            {isRecording && <div className="absolute left-4 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={isRecording ? 'Gravando...' : `Enviar uma mensagem para gerar ${mode}...`}
                                className={`w-full bg-cyber-border rounded-full py-3 px-5 text-cyber-text-primary placeholder-cyber-text-secondary focus:outline-none focus:ring-2 focus:ring-neon-purple ${isRecording ? 'pl-8' : ''}`}
                                disabled={isLoading || isRecording}
                            />
                        </div>
                        {input.trim() === '' && !isRecording ? (
                            <button type="button" onClick={startRecording} className="bg-cyber-border hover:bg-neon-purple/20 text-cyber-text-primary font-bold p-3 rounded-full disabled:opacity-50 transition-colors" disabled={isLoading}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                                </svg>
                            </button>
                        ) : isRecording ? (
                             <button type="button" onClick={stopRecording} className="bg-red-500 hover:bg-red-600 text-white font-bold p-3 rounded-full disabled:opacity-50 transition-colors" disabled={isLoading}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        ) : (
                            <button type="submit" className="bg-neon-purple hover:bg-purple-500 text-white font-bold p-3 rounded-full disabled:opacity-50 transition-all transform hover:scale-105 hover:shadow-glow-purple" disabled={isLoading || !input.trim()}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                                </svg>
                            </button>
                        )}
                    </form>
                </div>
            </>
          ) : (
            <div className="hidden lg:flex items-center justify-center h-full">
                <p className="text-cyber-text-secondary">Selecione ou crie uma nova conversa para começar.</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default Assistant;