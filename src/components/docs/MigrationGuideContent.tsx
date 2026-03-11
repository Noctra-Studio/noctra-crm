"use client";

import { PortableText, PortableTextComponents } from "@portabletext/react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import Image from "next/image";

const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }: any) => (
      <div className="my-6 rounded-xl overflow-hidden border border-slate-700">
        <Image
          src={value.asset.url}
          alt={value.alt || ""}
          width={800}
          height={450}
          className="w-full object-cover"
        />
        {value.caption && (
          <p className="text-center text-sm text-slate-500 py-2 bg-slate-900">
            {value.caption}
          </p>
        )}
      </div>
    ),

    codeBlock: ({ value }: any) => (
      <div className="my-6 rounded-xl overflow-hidden border border-slate-700">
        {value.filename && (
          <div className="bg-slate-800 px-4 py-2 text-sm text-slate-400 border-b border-slate-700 font-mono">
            {value.filename}
          </div>
        )}
        <SyntaxHighlighter
          language={value.language || "text"}
          style={vscDarkPlus}
          customStyle={{ margin: 0, borderRadius: 0 }}>
          {value.code}
        </SyntaxHighlighter>
      </div>
    ),

    calloutBox: ({ value }: any) => {
      const styles: Record<string, any> = {
        tip: {
          bg: "bg-blue-950/40",
          border: "border-blue-800/40",
          title: "text-blue-400",
          icon: "💡",
        },
        warning: {
          bg: "bg-amber-950/40",
          border: "border-amber-800/40",
          title: "text-amber-400",
          icon: "⚠️",
        },
        error: {
          bg: "bg-red-950/40",
          border: "border-red-800/40",
          title: "text-red-400",
          icon: "❌",
        },
        info: {
          bg: "bg-slate-800/40",
          border: "border-slate-700/40",
          title: "text-slate-300",
          icon: "ℹ️",
        },
      };
      const s = styles[value.type] || styles.info;
      return (
        <div className={`my-6 p-4 ${s.bg} border ${s.border} rounded-xl`}>
          <p className={`${s.title} text-sm`}>
            <span className="mr-2">{s.icon}</span>
            {value.content}
          </p>
        </div>
      );
    },

    table: ({ value }: any) => (
      <div className="my-8 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/30">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800/50">
            <tr>
              {value.rows?.[0]?.cells?.map((cell: string, i: number) => (
                <th
                  key={i}
                  className="py-4 px-5 text-slate-300 font-semibold border-b border-slate-800">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {value.rows?.slice(1).map((row: any, i: number) => (
              <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                {row.cells?.map((cell: string, j: number) => (
                  <td
                    key={j}
                    className="py-4 px-5 text-slate-300 align-top leading-relaxed">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },

  block: {
    normal: ({ children }: any) => (
      <p className="text-slate-300 mb-4 leading-relaxed">{children}</p>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-xl font-semibold text-white mt-8 mb-4">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-lg font-medium text-white mt-6 mb-3">{children}</h3>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-violet-500 pl-4 my-4 text-slate-400 italic">
        {children}
      </blockquote>
    ),
  },

  marks: {
    code: ({ children }: any) => (
      <code className="bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ),
    strong: ({ children }: any) => (
      <strong className="text-white font-semibold">{children}</strong>
    ),
    link: ({ children, value }: any) => (
      <a
        href={value.href}
        className="text-violet-400 hover:text-violet-300 underline"
        target="_blank"
        rel="noopener noreferrer">
        {children}
      </a>
    ),
  },

  list: {
    bullet: ({ children }: any) => (
      <ul className="my-4 space-y-2 list-none pl-0">{children}</ul>
    ),
    number: ({ children }: any) => (
      <ol className="my-4 space-y-2 list-decimal pl-5 text-slate-300">
        {children}
      </ol>
    ),
  },

  listItem: {
    bullet: ({ children }: any) => (
      <li className="flex gap-2 text-slate-300">
        <span className="text-violet-400 mt-1 flex-shrink-0">•</span>
        <span>{children}</span>
      </li>
    ),
  },
};

export default function MigrationGuideContent({ content }: { content: any[] }) {
  return <PortableText value={content} components={portableTextComponents} />;
}
