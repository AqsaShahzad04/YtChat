import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Loader2, Youtube, Bot } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

type Message = {
    id: string;
    role: 'user' | 'ai';
    content: string;
};

const ChatPage = () => {
    const [searchParams] = useSearchParams();
    const videoId = searchParams.get('v');
    const navigate = useNavigate();

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'ai',
            content: 'Hello! I am ready to answer your questions about the video. What would you like to know?',
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!videoId) {
            navigate('/');
        }
    }, [videoId, navigate]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading || !videoId) return;

        const userMsg = input.trim();
        setInput('');
        setLoading(true);

        // Add user message to UI immediately
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'user',
            content: userMsg
        }]);

        try {
            const res = await fetch(`${BACKEND_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ video_id: videoId, question: userMsg }),
            });

            if (!res.ok) {
                throw new Error('Failed to get answer');
            }

            const data = await res.json();

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'ai',
                content: data.answer
            }]);

        } catch (err: any) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'ai',
                content: `Error: ${err.message || 'Something went wrong'}`
            }]);
        } finally {
            setLoading(false);
        }
    };

    if (!videoId) return null;

    return (
        <div className="flex h-screen bg-[#FDFDFD] font-inter overflow-hidden">

            {/* Sidebar / Left Column (Video Context) */}
            <div className="w-[300px] border-r border-gray-100 bg-white/50 backdrop-blur-xl p-6 flex flex-col justify-between hidden md:flex z-10">
                <div>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center text-sm font-semibold text-gray-500 hover:text-black transition-colors mb-8 group"
                    >
                        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </button>

                    <div className="space-y-6">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex items-center gap-3 font-bold text-gray-800 mb-2">
                                <Youtube className="text-red-500" />
                                Active Video
                            </div>
                            <p className="text-sm text-gray-500 break-all font-mono bg-white p-2 rounded-lg py-1 border border-gray-200">
                                {videoId}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-bold text-sm text-gray-400 uppercase tracking-widest pl-1">Status</h3>
                            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                RAG Pipeline Active
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-xs font-semibold text-gray-400 text-center uppercase tracking-widest">
                    YtChat Platform
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative">
                <div className="absolute top-0 w-full h-24 bg-gradient-to-b from-[#FDFDFD] to-transparent z-10 pointer-events-none"></div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto px-4 md:px-12 py-8 scroll-smooth w-full max-w-4xl mx-auto">
                    <div className="space-y-8 mt-12 pb-20">
                        <AnimatePresence>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>

                                        {/* Avatar */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm
                      ${msg.role === 'user' ? 'bg-[#111111] text-white' : 'bg-blue-100 text-blue-600'}
                    `}>
                                            {msg.role === 'user' ? (
                                                <span className="font-bold text-sm">You</span>
                                            ) : (
                                                <Bot size={20} />
                                            )}
                                        </div>

                                        {/* Bubble */}
                                        <div className={`px-6 py-4 rounded-3xl text-[15px] leading-relaxed shadow-sm
                      ${msg.role === 'user'
                                                ? 'bg-[#111111] text-white rounded-br-sm'
                                                : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm whitespace-pre-line'
                                            }
                    `}>
                                            {msg.content}
                                        </div>

                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                        <Bot size={20} className="text-blue-600" />
                                    </div>
                                    <div className="px-5 py-4 bg-white border border-gray-100 rounded-3xl rounded-bl-sm shadow-sm flex gap-1 items-center">
                                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 md:p-6 sticky bottom-0 z-20">
                    <div className="max-w-4xl mx-auto">
                        <form
                            onSubmit={handleSubmit}
                            className="flex items-center w-full bg-[#F3F4F6] rounded-2xl p-2 transition-all focus-within:ring-2 focus-within:ring-blue-200 focus-within:bg-white border border-transparent focus-within:border-blue-200 shadow-sm"
                        >
                            <input
                                type="text"
                                placeholder="Ask a question about this video..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1 bg-transparent border-none py-3 px-4 text-base text-gray-800 placeholder-gray-500 focus:outline-none"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="bg-[#111111] md:hover:bg-black text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                            </button>
                        </form>
                        <div className="mt-3 text-center text-xs text-gray-400 font-medium">
                            AI answers are generated from the video transcript. It might not be perfect.
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ChatPage;
