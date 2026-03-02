import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Play, MessageSquare, Zap, Loader2, ArrowRight } from 'lucide-react';
import { extractVideoId, getTranscriptText } from '../utils/youtube';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const LandingPage = () => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('theme') === 'dark') {
            setIsDarkMode(true);
        }
    }, []);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setError('');

        try {
            const videoId = extractVideoId(url);
            const transcript = await getTranscriptText(videoId);

            const res = await fetch(`${BACKEND_URL}/api/load`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ video_id: videoId, transcript }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'Failed to initialize chat');
            }

            navigate(`/chat?v=${videoId}`);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex flex-col font-inter transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-[#111111]'}`}>
            {/* Header */}
            <header className="w-full flex justify-between items-center py-6 px-8 md:px-12 max-w-7xl mx-auto">
                <div className="font-bold text-xl tracking-tight">YtChat</div>
                <button
                    onClick={toggleTheme}
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 w-full max-w-3xl mx-auto text-center mt-12 md:mt-0">

                {/* Badge */}
                <div className={`flex items-center space-x-2 border shadow-sm px-4 py-1.5 rounded-full mb-8 ${isDarkMode ? 'border-gray-800 bg-[#111] text-gray-400' : 'border-gray-200 bg-white text-gray-500'}`}>
                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                    <span className="text-xs font-medium">AI-powered video understanding</span>
                </div>

                {/* Hero Title */}
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
                    Chat with any<br />YouTube video
                </h1>

                {/* Description */}
                <p className={`text-sm md:text-base mb-10 max-w-lg mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Paste a link, ask questions, get instant answers. No<br className="hidden md:block" /> more scrubbing through hours of content.
                </p>

                {/* Input Form */}
                <div className="w-full max-w-2xl relative">
                    <form
                        onSubmit={handleSubmit}
                        className={`flex items-center w-full rounded-full p-1.5 transition-all focus-within:ring-2 ${isDarkMode ? 'bg-[#1a1a1a] focus-within:ring-gray-700' : 'bg-[#F3F4F6] focus-within:ring-gray-200'}`}
                    >
                        <input
                            type="url"
                            placeholder="https://youtu.be/gcuR_rzIDw?si=zqgvoOlTfsPGakug"
                            required
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className={`flex-1 bg-transparent border-none py-3 px-6 text-sm placeholder-gray-500 focus:outline-none ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-3 rounded-full text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group whitespace-nowrap ${isDarkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-[#111111] hover:bg-black text-white'}`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    <span>...</span>
                                </>
                            ) : (
                                <>
                                    <span>Start chatting</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {error && (
                        <p className="absolute -bottom-8 left-0 w-full text-center text-red-500 text-sm font-medium">
                            {error}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2 mt-4 text-xs text-gray-400 font-medium">
                    <span>Free to use</span>
                    <span>No sign-up required</span>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-24 mb-16 w-full max-w-4xl mx-auto px-4">
                    <div className="space-y-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                            <Play size={20} />
                        </div>
                        <h3 className="font-semibold text-sm">Paste any YouTube URL</h3>
                        <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Simply drop a video link and we'll process the entire transcript for you.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                            <MessageSquare size={20} />
                        </div>
                        <h3 className="font-semibold text-sm">Ask anything</h3>
                        <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Chat naturally about the video content. Get precise, context-aware answers.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                            <Zap size={20} />
                        </div>
                        <h3 className="font-semibold text-sm">Powered by RAG</h3>
                        <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Retrieval Augmented Generation ensures accurate, grounded responses.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className={`w-full text-center py-8 text-xs border-t mt-auto transition-colors ${isDarkMode ? 'text-gray-500 border-gray-900' : 'text-gray-400 border-gray-50'}`}>
                <span className="mr-2">Built with YtChat</span>
                <span>© 2026</span>
            </footer>
        </div>
    );
};

export default LandingPage;
