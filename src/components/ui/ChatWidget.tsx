"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Terminal,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { CentralBrainLogo } from "@/components/ui/CentralBrainLogo";
import { readNoctraResponse } from "@/lib/ai/read-noctra-response";

const providerLabel: Record<string, string> = {
  anthropic: "Anthropic",
  gemini: "Gemini",
  openai: "OpenAI",
};

export function ChatWidget({
  variant = "floating",
}: {
  variant?: "floating" | "headerAction";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ id: string; role: string; content: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [routeMeta, setRouteMeta] = useState<{
    provider?: string;
    model?: string;
    complexity?: string;
    mode?: string;
  } | null>(null);
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

      setRouteMeta({
        provider: response.headers.get("x-noctra-provider") || undefined,
        model: response.headers.get("x-noctra-model") || undefined,
        complexity: response.headers.get("x-noctra-complexity") || undefined,
        mode: response.headers.get("x-noctra-mode") || undefined,
      });

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      };
      setMessages((prev) => [...prev, aiMessage]);

      await readNoctraResponse(response, (content) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMessage.id ? { ...m, content } : m,
          ),
        );
      });
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content:
            "No pude procesar tu consulta ahora mismo. Intenta nuevamente en unos segundos.",
        },
      ]);
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

  const TriggerButton =
    variant === "headerAction" ? (
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/70 transition-colors hover:bg-white/5 hover:text-white shrink-0"
        aria-label="Abrir Asistente AI">
        <Sparkles className="w-5 h-5" />
      </button>
    ) : (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-[0_4px_25px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-colors z-[9000]">
        {isOpen ? <X size={20} strokeWidth={2.5} /> : <Sparkles size={20} strokeWidth={2.5} />}
      </motion.button>
    );

  return (
    <div
      className={
        variant === "headerAction"
          ? "relative flex items-center justify-center"
          : "fixed bottom-4 right-4 z-[9000] hidden md:flex flex-col items-end font-mono"
      }>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed ${variant === "floating" ? "bottom-[4.5rem] right-4" : "top-16 left-4 right-4"} w-[calc(100vw-2rem)] h-[70vh] md:max-w-[400px] max-h-[600px] mx-auto rounded-xl bg-[#050505] border border-white/5 shadow-2xl flex flex-col overflow-hidden text-sm z-[9000]`}>
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
                    {routeMeta?.provider
                      ? `${providerLabel[routeMeta.provider] || routeMeta.provider} · ${routeMeta.mode === "clarification" ? "aclarando" : routeMeta.complexity || "listo"}`
                      : "Modelo optimizado"}
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
              className="p-3 border-t border-neutral-800 bg-black flex gap-2 shrink-0">
              <input
                className="flex-1 bg-transparent text-white placeholder-neutral-700 focus:outline-none text-sm font-mono min-w-0"
                value={input || ""}
                onChange={handleInputChange}
                placeholder="Pregunta o pide ayuda..."
              />
              <button
                type="submit"
                disabled={isLoading || !(input || "").trim()}
                className="text-neutral-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0">
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher */}
      {TriggerButton}
    </div>
  );
}
