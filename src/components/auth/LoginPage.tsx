"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(
        loginError.message === "Invalid login credentials"
          ? "Invalid credentials. Please verify your email and password."
          : loginError.message,
      );
      setIsLoading(false);
    } else {
      router.push("/"); // Default redirect for login
      router.refresh();
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] text-white font-sans p-6 selection:bg-white selection:text-black">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[340px] space-y-12">
        {/* Header */}
        <div className="flex flex-col items-center space-y-8">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img
              src="/noctra-navbar-dark.svg"
              alt="Noctra Studio"
              className="h-8 w-auto"
            />
          </Link>
          <div className="space-y-2 text-center">
            <h1 className="text-xl font-bold tracking-tight">Client Portal</h1>
            <p className="text-xs text-white/40 uppercase tracking-widest font-mono">
              Secure Access Required
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-white transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded px-10 py-3.5 text-sm outline-none focus:border-white/30 transition-all placeholder:text-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-white transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded px-10 py-3.5 text-sm outline-none focus:border-white/30 transition-all placeholder:text-white/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors">
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded border border-red-500/20 bg-red-500/5 text-red-500 text-[10px] font-mono uppercase tracking-widest text-center">
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black font-bold uppercase tracking-widest text-[10px] py-4 rounded hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-50">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Verify & Access"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-12 text-center space-y-2">
          <p className="text-[9px] font-mono text-white/10 uppercase tracking-[0.3em]">
            &copy; 2026 Noctra Studio
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/"
              className="text-[9px] font-mono text-white/20 hover:text-white/40 uppercase tracking-widest transition-colors">
              Back to Site
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
