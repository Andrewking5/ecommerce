import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useLocalizedNavigate } from '@/src/lib/i18nRouting';
import { useTranslation } from 'react-i18next';
import api from '@/src/services/api';

interface Message {
  id: string;
  text: string;
  from: 'user' | 'system';
  time: string;
}

export default function ChatWidget() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useLocalizedNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: t('chat.welcome', 'Hi! How can we help you today? Our team typically responds within a few hours.'),
      from: 'system',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      from: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      await api.post('/contact', {
        name: 'Chat User',
        email: 'chat@ayersguitars.com',
        subject: 'Live Chat Message',
        message: userMsg.text,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: t('chat.received', 'Message received! We\'ll get back to you via email shortly.'),
          from: 'system',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: t('chat.error', 'Failed to send. Please try again or email us at service@ayersguitars.com'),
          from: 'system',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Chat toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-ayers-ink text-white shadow-xl flex items-center justify-center hover:bg-ayers-gold transition-colors"
        aria-label={t('chat.toggle', 'Open chat')}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-ayers-ink/10 overflow-hidden flex flex-col"
            style={{ maxHeight: '480px' }}
          >
            {/* Header */}
            <div className="bg-ayers-ink text-white px-5 py-4">
              <h3 className="text-sm font-bold">{t('chat.title', 'Ayers Guitars Support')}</h3>
              <p className="text-[10px] text-white/50">{t('chat.subtitle', 'We usually reply within a few hours')}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: '200px', maxHeight: '300px' }}>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      msg.from === 'user'
                        ? 'bg-ayers-ink text-white rounded-br-md'
                        : 'bg-ayers-cream text-ayers-ink rounded-bl-md'
                    }`}
                  >
                    {msg.text}
                    <span className={`block text-[9px] mt-1 ${msg.from === 'user' ? 'text-white/40' : 'text-ayers-ink/30'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-ayers-ink/5 p-3 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={t('chat.placeholder', 'Type a message...')}
                className="flex-1 text-xs px-4 py-2.5 rounded-xl border border-ayers-ink/8 bg-ayers-cream/30 focus:outline-none focus:border-ayers-gold/40"
                disabled={sending}
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="p-2.5 rounded-xl bg-ayers-ink text-white hover:bg-ayers-gold transition-colors disabled:opacity-30"
              >
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
