import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Bot,
    User,
    RotateCcw,
    Loader2,
    X,
    MessageCircle,
    Mic,
    MicOff,
} from 'lucide-react';
import Logo from './common/Logo';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { apiCall } from '../api';
import { useToast } from '../context/ToastContext';

// Compact markdown rendering tuned for a ~350px-wide chat bubble —
// tight spacing instead of the default prose-sized margins, and no
// reliance on the Tailwind typography plugin (which may not be
// installed in this project).
const markdownComponents = {
    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5 last:mb-0">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5 last:mb-0">{children}</ol>,
    li: ({ children }) => <li>{children}</li>,
    code: ({ children }) => (
        <code className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[0.85em] font-mono">
            {children}
        </code>
    ),
    a: ({ href, children }) => (
            <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-fintech-emerald dark:text-neon-emerald"
        >
            {children}
        </a>
    ),
    h1: ({ children }) => <p className="font-semibold mb-1">{children}</p>,
    h2: ({ children }) => <p className="font-semibold mb-1">{children}</p>,
    h3: ({ children }) => <p className="font-semibold mb-1">{children}</p>,
    // In case the model still emits a table despite the system prompt,
    // make it scroll horizontally rather than break the bubble layout.
    table: ({ children }) => (
        <div className="overflow-x-auto mb-2 last:mb-0 -mx-1">
            <table className="text-xs border-collapse">{children}</table>
        </div>
    ),
    th: ({ children }) => (
        <th className="border border-gray-300 dark:border-white/10 px-2 py-1 text-left bg-black/5 dark:bg-white/5">
            {children}
        </th>
    ),
    td: ({ children }) => (
        <td className="border border-gray-300 dark:border-white/10 px-2 py-1">{children}</td>
    ),
};

// Widget hides itself on pages where there's no logged-in user context
// (landing, auth, email verification flows).
const HIDDEN_PATHS = ['/', '/auth', '/verify-email-sent', '/verify-email'];

const ChatWidget = () => {
    const location = useLocation();
    const { i18n } = useTranslation();
    const { showToast } = useToast();

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content:
                "Hi! I'm CRESTA AI. Ask me anything about your portfolio, forecasts, risk profile, or the market.",
        },
    ]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [followups, setFollowups] = useState([]);
    const bottomRef = useRef(null);
    const recognitionRef = useRef(null);

    const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('access_token');
    const shouldRender = hasToken && !HIDDEN_PATHS.includes(location.pathname);

    useEffect(() => {
        if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isSending, isOpen]);

    // Clean up any in-progress recognition if the widget unmounts mid-listen.
    useEffect(() => {
        return () => {
            recognitionRef.current?.stop();
        };
    }, []);

    const startVoice = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            showToast('Voice input is not supported in this browser. Try Chrome or Edge.', 'error');
            return;
        }
        if (isListening) return;

        const recognition = new SpeechRecognition();
        // Best-effort language guess from the app's i18n setting — Web
        // Speech API has no reliable auto-detect across browsers.
        recognition.lang = i18n.language?.startsWith('hi') ? 'hi-IN' : 'en-IN';
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (e) => {
            setIsListening(false);
            if (e.error !== 'aborted' && e.error !== 'no-speech') {
                showToast('Could not hear you clearly — try again.', 'error');
            }
        };
        // Populate the input rather than auto-sending, so you can review
        // or correct a mis-transcription before it goes to the agent.
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const stopVoice = () => {
        recognitionRef.current?.stop();
        setIsListening(false);
    };

    const sendMessage = async (overrideText) => {
        const text = (overrideText ?? input).trim();
        if (!text || isSending) return;

        // Push the user's message, then a placeholder assistant message
        // that we'll fill in token-by-token as the stream arrives.
        let assistantIndex;
        setMessages((prev) => {
            assistantIndex = prev.length + 1;
            return [...prev, { role: 'user', content: text }, { role: 'assistant', content: '' }];
        });
        setInput('');
        setFollowups([]);
        setIsSending(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        try {
            const lang = i18n.language?.startsWith('hi') ? 'hi' : 'en';
            const res = await apiCall('/chatbot/chat/', {
                method: 'POST',
                body: JSON.stringify({ message: text, lang }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                let errMsg = 'Chat request failed';
                try {
                    const data = await res.json();
                    errMsg = data.error || errMsg;
                } catch {}
                showToast(errMsg, 'error');
                setMessages((prev) => {
                    const msgs = [...prev];
                    msgs[assistantIndex] = {
                        role: 'assistant',
                        content: "I couldn't fetch that data right now. Please try again.",
                    };
                    return msgs;
                });
                return;
            }

            const data = await res.json();
            const answerText = data.answer || "No response received.";

            setMessages((prev) => {
                const msgs = [...prev];
                msgs[assistantIndex] = {
                    role: 'assistant',
                    content: answerText,
                };
                return msgs;
            });
            if (data.followups) {
                setFollowups(data.followups);
            }
        } catch (err) {
            clearTimeout(timeoutId);
            console.error('Chat error:', err);
            const message = err?.name === 'AbortError' ? 'Chat timed out. Please try again.' : 'Connection failed';
            showToast(message, 'error');
            setMessages((prev) => {
                const msgs = [...prev];
                if (typeof assistantIndex === 'number' && msgs[assistantIndex]?.content === '') {
                    msgs[assistantIndex] = {
                        role: 'assistant',
                        content: "I'm having trouble connecting right now. Please try again in a moment.",
                    };
                }
                return msgs;
            });
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const resetChat = async () => {
        try {
            await apiCall('/chatbot/reset/', { method: 'POST' });
        } catch {
            // non-critical — local reset still happens below
        }
        setMessages([
            {
                role: 'assistant',
                content: 'Conversation cleared. What would you like to know?',
            },
        ]);
        setFollowups([]);
    };

    if (!shouldRender) return null;

    return (
        <>
            {/* Floating toggle button */}
            <motion.button
                onClick={() => setIsOpen((o) => !o)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl bg-[#111827] border border-emerald-500 flex items-center justify-center"
                aria-label="Toggle CRESTA AI chat"
            >
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={isOpen ? 'close' : 'open'}
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.15 }}
                    >
                        {isOpen ? (
    <X className="w-6 h-6 text-white" />
) : (
    <Logo className="w-7 h-7" color="#22c55e" />
)}
                    </motion.div>
                </AnimatePresence>
            </motion.button>

            {/* Chat panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                       className="fixed bottom-24 right-6 z-50 w-96 max-w-[90vw] h-[32rem] max-h-[75vh] rounded-2xl shadow-2xl border border-gray-700 bg-[#0f172a] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="border-b border-gray-700 bg-[#111827] px-4 py-3 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                               <div className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
    <Logo className="w-8 h-8" color="#22c55e" />
</div>
                                <span className="font-semibold text-sm text-white">
                                    CRESTA AI
                                </span>
                            </div>
                            <button
                                onClick={resetChat}
                                className="text-gray-400 hover:text-fintech-emerald dark:hover:text-neon-emerald transition-colors"
                                title="Reset conversation"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#0f172a]">
                            {messages.map((m, i) => {
                                if (m.role === 'assistant' && m.content === '') return null;
                                return (
                                <div
                                    key={i}
                                    className={`flex gap-2 ${
                                        m.role === 'user' ? 'justify-end' : 'justify-start'
                                    }`}
                                >
                                    {m.role === 'assistant' && (
                                        <div className="p-1.5 h-fit rounded-full bg-fintech-emerald/10 dark:bg-neon-emerald/10 border border-fintech-emerald/20 dark:border-neon-emerald/20 shrink-0">
                                            <Bot className="w-3.5 h-3.5 text-fintech-emerald dark:text-neon-emerald" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                                            m.role === 'user'
                                                ? 'whitespace-pre-wrap bg-emerald-500 text-white'
                                                : 'bg-[#1e293b] border border-gray-700 text-white'
                                        }`}
                                    >
                                        {m.role === 'assistant' ? (
                                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                                {m.content}
                                            </ReactMarkdown>
                                        ) : (
                                            m.content
                                        )}
                                    </div>
                                    {m.role === 'user' && (
                                        <div className="p-1.5 h-fit rounded-full bg-gray-200 dark:bg-white/10 shrink-0">
                                            <User className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                                        </div>
                                    )}
                                </div>
                                );
                            })}

                            {isSending && messages[messages.length - 1]?.content === '' && (
                                <div className="flex gap-2 justify-start">
                                    <div className="p-1.5 h-fit rounded-full bg-fintech-emerald/10 dark:bg-neon-emerald/10 border border-fintech-emerald/20 dark:border-neon-emerald/20 shrink-0">
                                        <Bot className="w-3.5 h-3.5 text-fintech-emerald dark:text-neon-emerald" />
                                    </div>
                                    <div className="rounded-xl px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center gap-2">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-fintech-emerald dark:text-neon-emerald" />
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            Thinking...
                                        </span>
                                    </div>
                                </div>
                            )}

                            {!isSending && followups.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {followups.map((q, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => sendMessage(q)}
                                            className="text-xs px-3 py-1.5 rounded-full border border-fintech-emerald/30 dark:border-neon-emerald/30 text-fintech-emerald dark:text-neon-emerald hover:bg-fintech-emerald/10 dark:hover:bg-neon-emerald/10 transition-colors text-left"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div className="border-t border-gray-200 dark:border-white/10 px-3 py-3 shrink-0">
                            <div className="flex items-center gap-2">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={isListening ? 'Listening...' : 'Ask about your portfolio...'}
                                    disabled={isSending}
                                    className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500/50 dark:focus:border-neon-emerald/50 transition-all disabled:opacity-50"
                                />
                                <button
                                    type="button"
                                    onClick={isListening ? stopVoice : startVoice}
                                    disabled={isSending}
                                    title={isListening ? 'Stop listening' : 'Voice input'}
                                    aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                                    className={`p-2.5 rounded-lg border transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
                                        isListening
                                            ? 'bg-red-500/10 border-red-500/30 text-red-500 animate-pulse'
                                            : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-fintech-emerald dark:hover:text-neon-emerald'
                                    }`}
                                >
                                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={sendMessage}
                                    disabled={isSending || !input.trim()}
                                    className="p-2.5 rounded-lg bg-fintech-emerald dark:bg-neon-emerald text-white dark:text-black disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatWidget;