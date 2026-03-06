import { ReactNode } from "react";
import { AlertTriangle, AlertCircle, Lightbulb } from "lucide-react";

export function H1({ children }: { children: ReactNode }) {
  return <h1 className="text-3xl font-bold text-white mb-2">{children}</h1>;
}

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xl font-semibold text-white mt-10 mb-4 border-b border-white/5 pb-2">
      {children}
    </h2>
  );
}

export function H3({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-base font-semibold text-white/80 mt-6 mb-2">
      {children}
    </h3>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="text-sm text-white/60 leading-7 mb-4">{children}</p>;
}

export function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="bg-white/10 text-emerald-400 px-1.5 py-0.5 rounded text-xs font-mono mx-1">
      {children}
    </code>
  );
}

export function CodeBlock({ children }: { children: ReactNode }) {
  return (
    <pre className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-xs font-mono text-white/70 overflow-x-auto mb-6 custom-scrollbar">
      <code>{children}</code>
    </pre>
  );
}

export function List({ children }: { children: ReactNode }) {
  return <ul className="space-y-2 mb-6 ml-4">{children}</ul>;
}

export function ListItem({ children }: { children: ReactNode }) {
  return (
    <li className="text-sm text-white/60 leading-relaxed flex items-start gap-3">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 shrink-0 mt-2" />
      <span>{children}</span>
    </li>
  );
}

// Callouts
export function Tip({ children }: { children: ReactNode }) {
  return (
    <div className="border-l-2 border-emerald-500 bg-emerald-500/5 p-4 rounded-r-lg mb-6 flex gap-3">
      <Lightbulb className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
      <div className="text-sm text-emerald-100/80 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export function Warning({ children }: { children: ReactNode }) {
  return (
    <div className="border-l-2 border-yellow-400/50 bg-yellow-400/5 p-4 rounded-r-lg mb-6 flex gap-3">
      <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
      <div className="text-sm text-yellow-100/80 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export function Danger({ children }: { children: ReactNode }) {
  return (
    <div className="border-l-2 border-red-400/50 bg-red-400/5 p-4 rounded-r-lg mb-6 flex gap-3">
      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
      <div className="text-sm text-red-100/80 leading-relaxed">{children}</div>
    </div>
  );
}
