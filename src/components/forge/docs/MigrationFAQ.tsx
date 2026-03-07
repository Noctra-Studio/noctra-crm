"use client";

interface FAQItem {
  _key: string;
  question: string;
  answer: string;
}

export default function MigrationFAQ({ items }: { items: FAQItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <details
          key={item._key}
          className="group border border-slate-700/60 bg-slate-800/30 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 text-white font-medium">
            {item.question}
            <span className="shrink-0 transition duration-300 group-open:-rotate-180">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-slate-400"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </summary>

          <div className="px-4 pb-4 text-sm text-slate-300 leading-relaxed border-t border-slate-700/30 pt-4">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
