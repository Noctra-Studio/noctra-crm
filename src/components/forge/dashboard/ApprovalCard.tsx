"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Loader2,
  ExternalLink,
  Plus,
  ListChecks,
  Check as CheckIcon,
} from "lucide-react";
import Image from "next/image";

import { DashboardData } from "@/types/dashboard";

interface ApprovalCardProps {
  deliverable?: DashboardData["deliverable"] | null;
}

export default function ApprovalCard({ deliverable }: ApprovalCardProps) {
  const [status, setStatus] = useState<"pending" | "approved" | "changes">(
    "pending"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isUpdatesModalOpen, setIsUpdatesModalOpen] = useState(false);

  const handleApprove = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Show success animation
    setShowSuccess(true);

    // After animation, update status
    setTimeout(() => {
      setStatus("approved");
      setIsSubmitting(false);
      setShowSuccess(false);
    }, 1500);
  };

  const handleRequestChanges = () => {
    setStatus("changes");
  };

  if (!deliverable) {
    return (
      <div className="group bg-gradient-to-b from-zinc-900 to-black border border-white/5 rounded-lg overflow-hidden h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
          <CheckIcon className="w-8 h-8 text-zinc-500" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">All Caught Up</h3>
        <p className="text-sm text-zinc-400 max-w-xs">
          No pending deliverables requiring your approval at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-[1.9rem] border border-white/6 bg-gradient-to-b from-zinc-900 to-black transition-colors duration-500 hover:border-white/18">
      <div className="grid flex-1 min-h-0 grid-cols-1 items-stretch lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="order-2 flex h-full flex-col p-5 sm:p-6 lg:order-1">
          <div className="shrink-0 pb-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                  Action Required
                </h3>
                <p className="text-2xl font-bold text-white">
                  {deliverable.title}
                </p>
              </div>
            </div>

            {/* Element Info */}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {deliverable.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700 text-xs">
                {tag}
              </span>
            ))}
          </div>

          <div className="shrink-0 py-4">
            <button
              onClick={() => setIsUpdatesModalOpen(true)}
              className="flex items-center gap-2 text-sm text-zinc-400 underline decoration-zinc-700 underline-offset-4 transition-colors hover:text-white"
            >
              <ListChecks className="w-4 h-4" />
              View {deliverable.version_updates.length} updates in this version
            </button>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => setIsFeedbackOpen(!isFeedbackOpen)}
              className="flex items-center gap-2 py-2 text-sm text-neutral-400 transition-colors hover:text-white"
            >
              <Plus className="w-4 h-4" />
              Add specific feedback/notes
            </button>
          </div>

          <AnimatePresence mode="wait">
            {status === "pending" && (
              <motion.div
                key="pending"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-h-0 my-4">
                <AnimatePresence initial={false}>
                  {isFeedbackOpen && (
                    <motion.div
                      key="feedback-form"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: 1,
                        transition: { duration: 0.3 },
                      }}
                      exit={{
                        opacity: 0,
                        transition: { duration: 0.2 },
                      }}
                      className="flex h-full flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-neutral-400 block">
                          Feedback
                        </label>
                        <button
                          onClick={() => setIsFeedbackOpen(false)}
                          className="text-xs text-neutral-300 hover:text-white transition-colors">
                          Cancel
                        </button>
                      </div>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Add your feedback here..."
                        className="h-44 w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4 text-white outline-none transition-all placeholder:text-neutral-700 focus:border-white/50 focus:ring-1 focus:ring-white/50 sm:h-full"
                        autoFocus
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {status === "pending" && (
              <motion.div
                key="pending-buttons"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="shrink-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <motion.button
                    onClick={handleApprove}
                    disabled={isSubmitting || showSuccess}
                    animate={{
                      backgroundColor: showSuccess ? "#10b981" : "#ffffff",
                      scale: showSuccess ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 font-medium text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting && !showSuccess ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : showSuccess ? (
                      <>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}>
                          <Check className="w-5 h-5 text-white" />
                        </motion.div>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Approve
                      </>
                    )}
                  </motion.button>
                  <button
                    onClick={handleRequestChanges}
                    className="rounded-2xl border border-zinc-700 px-4 py-3 font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
                  >
                    Request Changes
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Approved/Changes States */}
          <AnimatePresence mode="wait">
            {status === "approved" && (
              <motion.div
                key="approved"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="shrink-0 rounded-3xl border border-green-500/20 bg-green-500/10 p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-lg font-medium text-green-400 mb-2">
                  Approved!
                </p>
                <p className="text-sm text-neutral-400">
                  The team has been notified.
                </p>
              </motion.div>
            )}

            {status === "changes" && (
              <motion.div
                key="changes"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="shrink-0 space-y-4">
                <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                  <p className="text-sm font-medium text-yellow-400 mb-2">
                    Changes Requested
                  </p>
                  <p className="text-xs text-neutral-400">
                    Your feedback has been sent to the team.
                  </p>
                </div>
                {feedback && (
                  <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-4">
                    <p className="text-xs text-neutral-300 mb-2">
                      Your feedback:
                    </p>
                    <p className="text-sm text-white">{feedback}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="order-1 min-h-[320px] p-2 sm:min-h-[420px] lg:order-2 lg:min-h-0">
          <div className="group relative h-full w-full overflow-hidden rounded-[1.5rem] bg-neutral-900">
            <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full border border-amber-500/50 bg-black/25 px-3 py-1.5 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-sm text-amber-500 font-medium">
                Pending Review
              </span>
            </div>

            <Image
              src={deliverable.preview_image_url}
              alt="Live Preview"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 z-10 flex items-end justify-center bg-gradient-to-t from-black via-black/20 to-transparent p-5 sm:items-center sm:bg-black/60 sm:opacity-0 sm:transition-opacity sm:duration-300 sm:group-hover:opacity-100">
              <a
                href="https://staging.noctra.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-transform duration-300 hover:scale-105 sm:translate-y-4 sm:transform sm:group-hover:translate-y-0"
              >
                <ExternalLink className="w-4 h-4" />
                Open Live Preview
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Updates Modal */}
      <AnimatePresence>
        {isUpdatesModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUpdatesModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal Content */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
                onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-1">
                    Updates in {deliverable.title}
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Recent changes to this deliverable
                  </p>
                </div>

                {/* Updates List */}
                <div className="space-y-3 mb-6">
                  {deliverable.version_updates.map((update, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                        <CheckIcon className="w-3 h-3 text-green-400" />
                      </div>
                      <span className="text-zinc-300">{update.task}</span>
                    </div>
                  ))}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setIsUpdatesModalOpen(false)}
                  className="w-full py-2 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm transition-colors">
                  Close
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
