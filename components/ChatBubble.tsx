import React from 'react';
import { ChatMessage } from '../types';

interface ChatBubbleProps {
  message: ChatMessage;
  isSpeaking?: boolean;
  onToggleSpeech?: (message: ChatMessage) => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isSpeaking, onToggleSpeech }) => {
  const isUser = message.sender === 'user';
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
       {!isUser && onToggleSpeech && !message.imageUrl && !message.videoUrl && !message.isGenerating && (
        <button 
          onClick={() => onToggleSpeech(message)}
          className="p-1.5 rounded-full text-cyber-text-secondary hover:bg-cyber-border hover:text-white transition-colors mb-1 flex-shrink-0"
          aria-label={isSpeaking ? "Parar áudio" : "Ouvir mensagem"}
        >
          {isSpeaking ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 4a1 1 0 011.697-.732l5.906 4.43a1 1 0 010 1.464l-5.906 4.43A1 1 0 017 13.43V4z" />
                <path d="M3 4a1 1 0 011-1h1a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
            </svg>
          )}
        </button>
      )}
      <div
        className={`max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-neon-purple text-white rounded-br-none'
            : 'bg-cyber-border text-cyber-text-primary rounded-bl-none'
        }`}
      >
        {message.isGenerating ? (
          <div className="flex items-center space-x-3 p-2">
            <svg className="animate-spin h-5 w-5 text-cyber-text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm text-cyber-text-secondary italic">
                {message.text.includes('video') ? 'Gerando vídeo... isso pode levar alguns minutos.' : 'Gerando conteúdo...'}
            </span>
          </div>
        ) : message.imageUrl ? (
            <div className="space-y-2">
                 <p className="text-sm text-gray-400 italic">Prompt: "{message.text}"</p>
                 <img src={message.imageUrl} alt={message.text} className="rounded-lg max-w-full h-auto" />
            </div>
        ) : message.videoUrl ? (
            <div className="space-y-2">
                <p className="text-sm text-gray-400 italic">Prompt: "{message.text}"</p>
                <video controls src={message.videoUrl} className="rounded-lg max-w-full h-auto bg-black"></video>
            </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        )}
        
        {message.timestamp && !message.isGenerating && (
            <p className={`text-xs mt-1 ${isUser ? 'text-purple-200' : 'text-cyber-text-secondary'} text-right`}>
                {message.timestamp}
            </p>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;