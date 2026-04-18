import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface Message {
  role: 'user' | 'model';
  text: string;
}

// Initialize the Google Gen AI SDK
let aiChatInstance: any = null;

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '¡Hola! Soy el asistente virtual de SkyTech. ¿En qué te puedo ayudar hoy?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const initChat = () => {
    if (!aiChatInstance) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        aiChatInstance = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction: 'Eres un asistente útil y muy conciso para una empresa de tecnología llamada SkyTech Solutions, ubicada en República Dominicana. Sus servicios son: Redes Avanzadas, Ciberseguridad, Nube Híbrida y Soporte TI 24/7. Limita tus respuestas a 2-3 oraciones breves y útiles y siempre mantén una actitud corporativa pero amigable.'
          }
        });
      } catch (err) {
        console.error("Failed to initialize GoogleGenAI", err);
      }
    }
    return aiChatInstance;
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const chat = initChat();
      if (!chat) {
        throw new Error("Chat instance not available");
      }

      const response = await chat.sendMessage({ message: userText });
      
      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'Lo siento, estoy teniendo problemas de conexión. Por favor intenta más tarde o contáctanos por el formulario.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="mb-4 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              style={{ maxHeight: "400px", height: "60vh" }}
            >
              {/* Header */}
              <div className="bg-sky-500 p-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white">Soporte SkyTech</h3>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Body */}
              <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex flex-col gap-4">
                {messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[85%] rounded-2xl p-3 text-sm font-medium ${
                        msg.role === 'user' 
                          ? 'bg-sky-500 text-white rounded-tr-sm' 
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-tl-sm shadow-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm p-3 shadow-sm">
                      <Loader2 className="w-4 h-4 text-sky-500 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
                <form 
                  onSubmit={handleSendMessage}
                  className="relative flex items-center"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow dark:text-white dark:placeholder-slate-400"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="absolute right-2 p-1.5 bg-sky-500 text-white rounded-lg hover:bg-sky-400 disabled:opacity-50 disabled:hover:bg-sky-500 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Toggle Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
          className="w-14 h-14 bg-sky-500 text-white shadow-xl flex items-center justify-center hover:bg-sky-400 transition-colors pointer-events-auto rounded-2xl"
          style={{ borderRadius: isOpen ? '16px' : '24px' }}
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </motion.button>
      </div>
    </>
  );
}
