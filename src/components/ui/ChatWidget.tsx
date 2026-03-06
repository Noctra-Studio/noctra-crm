"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Terminal,
  Brain,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { CentralBrainLogo } from "@/components/ui/CentralBrainLogo";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ id: string; role: string; content: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input?.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("API request failed");

      // Read the stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      };
      setMessages((prev) => [...prev, aiMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith('0:"')) {
              // Extract text from data stream format: 0:"text"\n
              const match = line.match(/^0:"(.*)"\s*$/);
              if (match) {
                const text = match[1]
                  .replace(/\\n/g, "\n")
                  .replace(/\\r/g, "\r")
                  .replace(/\\t/g, "\t")
                  .replace(/\\"/g, '"')
                  .replace(/\\\\/g, "\\");
                aiResponse += text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMessage.id ? { ...m, content: aiResponse } : m,
                  ),
                );
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-[9000] flex flex-col items-end font-mono">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 right-4 w-[calc(100vw-2rem)] h-[70vh] max-w-[400px] max-h-[600px] rounded-xl bg-[#050505] border border-white/5 shadow-2xl flex flex-col overflow-hidden text-sm z-[9000]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-gradient-to-r from-emerald-500/10 to-blue-500/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex-none">
                  <CentralBrainLogo isThinking={isLoading} />
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-[11px] font-bold tracking-wider flex items-center gap-1">
                    CEREBRO CENTRAL
                    <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                  </span>
                  <span className="text-neutral-500 text-[9px] uppercase tracking-tighter font-mono">
                    Modelo Optimizado
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-500 hover:text-white transition-colors p-2">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-neutral-600">
                  <Terminal className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-xs tracking-widest uppercase opacity-50">
                    System Online
                  </p>
                  <p className="text-xs opacity-30 mt-1">Awaiting input...</p>
                </div>
              )}
              {messages.map((m: any) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}>
                  <div
                    className={`max-w-[85%] rounded-lg p-3 text-sm ${
                      m.role === "user"
                        ? "bg-white text-black"
                        : "bg-neutral-900 border border-neutral-800 text-neutral-300"
                    }`}>
                    {m.role === "user" ? (
                      m.content
                    ) : (
                      <div className="prose prose-invert prose-p:leading-relaxed prose-pre:p-0 text-sm max-w-none text-neutral-400">
                        <ReactMarkdown
                          components={{
                            strong: ({ node, ...props }) => (
                              <span
                                className="font-bold text-white"
                                {...props}
                              />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul
                                className="list-disc pl-4 space-y-1 mt-2 mb-4"
                                {...props}
                              />
                            ),
                            li: ({ node, ...props }) => (
                              <li
                                className="marker:text-neutral-600"
                                {...props}
                              />
                            ),
                            p: ({ node, ...props }) => (
                              <p className="mb-4 last:mb-0" {...props} />
                            ),
                          }}>
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="text-neutral-600 text-xs animate-pulse pl-5">
                    Processing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="p-3 border-t border-neutral-800 bg-black flex gap-2">
              <input
                className="flex-1 bg-transparent text-white placeholder-neutral-700 focus:outline-none text-sm font-mono"
                value={input || ""}
                onChange={handleInputChange}
                placeholder="Enter command..."
              />
              <button
                type="submit"
                disabled={isLoading || !(input || "").trim()}
                className="text-neutral-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:bg-neutral-200 transition-colors z-[9000]">
        {isOpen ? <X size={20} /> : <Terminal size={20} />}
      </motion.button>
    </div>
  );
}
