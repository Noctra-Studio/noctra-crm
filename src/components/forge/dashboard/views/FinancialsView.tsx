"use client";

import {
  FileText,
  Download,
  CheckCircle2,
  Clock,
  DollarSign,
} from "lucide-react";

const invoices = [
  {
    id: "INV-001",
    description: "Design Phase - Month 1",
    amount: "$5,000",
    status: "Paid",
    date: "Nov 1, 2024",
  },
  {
    id: "INV-002",
    description: "Design Phase - Month 2",
    amount: "$5,000",
    status: "Paid",
    date: "Dec 1, 2024",
  },
  {
    id: "INV-003",
    description: "Development Phase - Month 1",
    amount: "$7,500",
    status: "Pending",
    date: "Jan 1, 2025",
  },
];

const contracts = [
  { name: "Master Service Agreement", status: "Signed", date: "Oct 15, 2024" },
  {
    name: "Statement of Work - Phase 1",
    status: "Signed",
    date: "Oct 20, 2024",
  },
  { name: "NDA", status: "Signed", date: "Oct 10, 2024" },
];

export default function FinancialsView() {
  return (
    <div className="h-full">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Financials</h2>
          <p className="text-neutral-300">
            Invoices, contracts, and payment history
          </p>
        </div>

        {/* Invoices */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Invoices
          </h3>
          <div className="rounded-[1.75rem] border border-neutral-800 bg-neutral-900 p-4 sm:p-6">
            <div className="space-y-3">
              {invoices.map((invoice, i) => (
                <div
                  key={i}
                  className="group flex flex-col gap-4 rounded-[1.35rem] border border-neutral-800 bg-neutral-950/50 p-4 transition-colors hover:border-neutral-700 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-1 items-start gap-4">
                    <div className="rounded-2xl bg-neutral-900 p-2">
                      <FileText className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{invoice.id}</p>
                      <p className="text-sm text-neutral-300">
                        {invoice.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <div className="sm:text-right">
                      <p className="text-sm font-medium text-white">
                        {invoice.amount}
                      </p>
                      <p className="text-xs text-neutral-300">{invoice.date}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        invoice.status === "Paid"
                          ? "bg-green-500/10 text-green-400"
                          : invoice.status === "Pending"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-neutral-800 text-neutral-400"
                      }`}>
                      {invoice.status === "Paid" ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Paid
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </span>
                    <button className="rounded-full border border-white/10 p-2 transition-colors hover:bg-neutral-800">
                      <Download className="w-4 h-4 text-neutral-400 group-hover:text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contracts */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Contracts
          </h3>
          <div className="rounded-[1.75rem] border border-neutral-800 bg-neutral-900 p-4 sm:p-6">
            <div className="space-y-3">
              {contracts.map((contract, i) => (
                <div
                  key={i}
                  className="group flex flex-col gap-4 rounded-[1.35rem] border border-neutral-800 bg-neutral-950/50 p-4 transition-colors hover:border-neutral-700 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-1 items-start gap-4">
                    <div className="rounded-2xl bg-neutral-900 p-2">
                      <FileText className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{contract.name}</p>
                      <p className="text-sm text-neutral-300">
                        {contract.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {contract.status}
                    </span>
                    <button className="rounded-full border border-white/10 p-2 transition-colors hover:bg-neutral-800">
                      <Download className="w-4 h-4 text-neutral-400 group-hover:text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
