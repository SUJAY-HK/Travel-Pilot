"use client";

import { useState, useRef, useEffect } from "react";
import { Send, MapPin, User, Bot, Loader2, Sparkles, Menu, Trash2, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load sessions from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("travelpilot_sessions");
    if (saved) {
      try {
        setSessions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    }
  }, []);

  // Save sessions to local storage whenever they change
  useEffect(() => {
    localStorage.setItem("travelpilot_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    
    // Optimistic update
    const updatedMessages = [...messages, { role: "user", content: userMessage } as Message];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          session_id: sessionId,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      
      const assistantMessage = { role: "assistant", content: data.response } as Message;
      const finalMessages = [...updatedMessages, assistantMessage];
      
      setMessages(finalMessages);

      // Handle Session Management
      const currentSessionId = sessionId || data.session_id;
      if (!sessionId && data.session_id) {
        setSessionId(data.session_id);
      }

      setSessions(prev => {
        const existingIndex = prev.findIndex(s => s.id === currentSessionId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            messages: finalMessages,
            // Update title if it's the generic "New Chat" or purely generated
             title: updated[existingIndex].title // Keep existing title
          };
          // Move updated session to top
          const [movedSession] = updated.splice(existingIndex, 1);
          return [movedSession, ...updated];
        } else {
          // New Session
          return [{
            id: currentSessionId,
            title: userMessage.slice(0, 40) + (userMessage.length > 40 ? "..." : ""),
            messages: finalMessages,
            createdAt: Date.now()
          }, ...prev];
        }
      });

    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setSessionId(null);
    setIsSidebarOpen(false);
  };

  const loadSession = (session: ChatSession) => {
    setSessionId(session.id);
    setMessages(session.messages);
    setIsSidebarOpen(false);
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== id));
    if (sessionId === id) {
        handleNewChat();
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar (Mobile/Desktop) */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-xl">
                <div className="bg-rose-500 p-1.5 rounded-lg text-white">
                    <MapPin size={20} />
                </div>
                TravelPilot
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-500">
                <Menu size={20} />
            </button>
        </div>
        
        <div className="p-4 flex-shrink-0">
            <button 
                onClick={handleNewChat}
                className="w-full flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium border border-slate-200"
            >
                <Sparkles size={16} />
                New Trip
            </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">Recent Trips</h3>
            <div className="space-y-1">
                {sessions.length === 0 ? (
                   <p className="text-xs text-slate-400 px-2 italic">No recent trips</p>
                ) : (
                    sessions.map((session) => (
                        <div 
                            key={session.id}
                            onClick={() => loadSession(session)}
                            className={cn(
                                "group flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors",
                                sessionId === session.id 
                                    ? "bg-rose-50 text-rose-600 font-medium" 
                                    : "text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            <MessageSquare size={14} className={cn("flex-shrink-0", sessionId === session.id ? "text-rose-500" : "text-slate-400")} />
                            <span className="truncate flex-1">{session.title}</span>
                            <button 
                                onClick={(e) => deleteSession(e, session.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-100 hover:text-rose-500 rounded text-slate-400 transition-all"
                                title="Delete chat"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full w-full relative">
        {/* Header (Mobile) */}
        <div className="lg:hidden h-14 bg-white border-b border-slate-200 flex items-center px-4 justify-between flex-shrink-0">
            <span className="font-bold text-slate-800">TravelPilot</span>
            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600">
                <Menu />
            </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-slate-500 opacity-0 animate-in fade-in duration-700 fill-mode-forwards" style={{ opacity: 1 }}>
              <div className="bg-rose-100 p-4 rounded-full text-rose-500 mb-4">
                <MapPin size={48} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Where to next?</h1>
              <p className="max-w-md text-slate-600">
                I can help you find the perfect Airbnb. Try searching for &quot;Villas in Bali&quot; or &quot;Apartments in New York under $200&quot;.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex gap-4 max-w-3xl mx-auto",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                    msg.role === "user" ? "bg-slate-800 text-white" : "bg-rose-500 text-white"
                  )}
                >
                  {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div
                  className={cn(
                    "flex flex-col gap-1 min-w-0",
                    msg.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "px-5 py-3 rounded-2xl text-sm sm:text-base leading-relaxed shadow-sm",
                      msg.role === "user"
                        ? "bg-slate-800 text-white rounded-tr-none"
                        : "bg-white text-slate-800 border border-slate-100 rounded-tl-none prose prose-sm max-w-none"
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-4 max-w-3xl mx-auto">
                <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={16} />
                </div>
                <div className="bg-white px-5 py-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2 text-slate-500">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">Searching Airbnb...</span>
                </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-500 transition-all shadow-sm"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask TravelPilot..."
                className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 py-2"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
            <div className="text-center mt-2">
                <p className="text-xs text-slate-400">
                    Powered by Gemini & Airbnb MCP
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}