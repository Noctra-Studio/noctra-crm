"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Loader2,
  X,
  Send,
} from "lucide-react";
import { approveDeliverable, createTicket } from "./actions";

interface DashboardInterfaceProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  project: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deliverable: any;
}

export default function DashboardInterface({
  project,
  deliverable,
}: DashboardInterfaceProps) {
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [ticketData, setTicketData] = useState({ title: "", description: "" });

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      await approveDeliverable(deliverable.id);
      setShowSuccess(true);
      // Reset success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error(error);
      alert("Error approving deliverable");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createTicket(
        project.id,
        deliverable.id,
        ticketData.title,
        ticketData.description
      );
      setIsChangeModalOpen(false);
      setTicketData({ title: "", description: "" });
      alert(`Ticket Created. Estimated Triage: 24 Hours.`);
    } catch (error) {
      console.error(error);
      alert("Error creating ticket");
    } finally {
      setIsLoading(false);
    }
  };

  if (!project || !deliverable) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-500">
        No active deliverables found.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">
              Release Approved! We&apos;ll proceed to the next phase.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Staging Preview */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/80">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
            <span className="ml-2 text-xs text-neutral-500 font-mono">
              {deliverable.url}
            </span>
          </div>
          <a
            href={deliverable.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors">
            Open in New Tab <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="aspect-video w-full bg-black flex items-center justify-center relative group">
          <iframe
            src={deliverable.url}
            className="w-full h-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity"
            title="Staging Preview"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <a
              href={deliverable.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-black px-6 py-3 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-auto flex items-center gap-2 shadow-xl hover:scale-105">
              View Live Preview <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl backdrop-blur-sm sticky bottom-6 shadow-2xl">
        <div>
          <h3 className="text-white font-medium">{deliverable.title}</h3>
          <p className="text-sm text-neutral-500">
            Status:{" "}
            <span
              className={`uppercase font-bold text-xs ${
                deliverable.status === "approved"
                  ? "text-green-400"
                  : deliverable.status === "changes_requested"
                  ? "text-yellow-400"
                  : "text-blue-400"
              }`}>
              {deliverable.status.replace("_", " ")}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsChangeModalOpen(true)}
            disabled={isLoading || deliverable.status === "approved"}
            className="px-6 py-3 rounded-lg font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <AlertTriangle className="w-4 h-4" /> Request Changes
          </button>
          <button
            onClick={handleApprove}
            disabled={isLoading || deliverable.status === "approved"}
            className="px-6 py-3 rounded-lg font-bold text-black bg-white hover:bg-neutral-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Approve Release
          </button>
        </div>
      </div>

      {/* Change Request Modal */}
      <AnimatePresence>
        {isChangeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  Request Changes
                </h3>
                <button
                  onClick={() => setIsChangeModalOpen(false)}
                  className="text-neutral-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleRequestChanges} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">
                    Feedback Summary
                  </label>
                  <input
                    type="text"
                    value={ticketData.title}
                    onChange={(e) =>
                      setTicketData({ ...ticketData, title: e.target.value })
                    }
                    placeholder="e.g., Navigation link broken"
                    required
                    className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-sm text-white focus:border-white outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase">
                    Detailed Description
                  </label>
                  <textarea
                    value={ticketData.description}
                    onChange={(e) =>
                      setTicketData({
                        ...ticketData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Please describe the issue or change request..."
                    required
                    rows={4}
                    className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-sm text-white focus:border-white outline-none resize-none"
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsChangeModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-white text-black rounded-lg text-sm font-bold hover:bg-neutral-200 transition-colors flex items-center gap-2">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Submit Ticket
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
