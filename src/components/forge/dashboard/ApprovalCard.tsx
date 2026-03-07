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
    <div className="group bg-gradient-to-b from-zinc-900 to-black border border-white/5 hover:border-white/20 rounded-lg overflow-hidden h-full flex flex-col transition-colors duration-500">
      {/* Two Column Layout - No padding, flush layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 min-h-0 items-stretch">
        {/* Left Column: Actions */}
        <div className="flex flex-col h-full p-6">
          {/* Header - Now inside Left Column */}
          <div className="flex-shrink-0 pb-4">
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

          {/* Updates Trigger Button */}
          <div className="flex-shrink-0 py-4">
            <button
              onClick={() => setIsUpdatesModalOpen(true)}
              className="text-sm text-zinc-400 hover:text-white underline decoration-zinc-700 underline-offset-4 cursor-pointer transition-colors flex items-center gap-2">
              <ListChecks className="w-4 h-4" />
              View {deliverable.version_updates.length} updates in this version
            </button>
          </div>

          {/* Feedback Trigger - Moved Up */}
          <div className="flex-shrink-0">
            <button
              onClick={() => setIsFeedbackOpen(!isFeedbackOpen)}
              className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-2 py-2">
              <Plus className="w-4 h-4" />
              Add specific feedback/notes
            </button>
          </div>

          {/* Flex-1 Spacer / Textarea Container - "Fill the Void" */}
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
                      className="h-full flex flex-col">
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
                        className="w-full h-full bg-zinc-950/50 border border-zinc-800 rounded-lg p-4 text-white placeholder:text-neutral-700 focus:ring-1 focus:ring-white/50 focus:border-white/50 outline-none transition-all resize-none"
                        autoFocus
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons - Pinned to Bottom */}
          <AnimatePresence mode="wait">
            {status === "pending" && (
              <motion.div
                key="pending-buttons"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-shrink-0">
                <div className="flex items-center gap-3">
                  <motion.button
                    onClick={handleApprove}
                    disabled={isSubmitting || showSuccess}
                    animate={{
                      backgroundColor: showSuccess ? "#10b981" : "#ffffff",
                      scale: showSuccess ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    className="bg-white text-black px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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
                    className="border border-zinc-700 text-zinc-300 px-4 py-2 rounded-md font-medium hover:bg-zinc-800 transition-colors">
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
                className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center flex-shrink-0">
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
                className="space-y-4 flex-shrink-0">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
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

        {/* Right Column: Live Preview - FULL HEIGHT with Padding */}
        <div className="relative h-full w-full overflow-hidden min-h-[400px] lg:min-h-0 p-2">
          <div className="relative w-full h-full rounded-lg overflow-hidden group bg-neutral-900">
            {/* Phase Indicator -> Status Badge */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/50 bg-transparent backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-sm text-amber-500 font-medium">
                Pending Review
              </span>
            </div>

            {/* Preview Image */}
            <Image
              src={deliverable.preview_image_url}
              alt="Live Preview"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
              <a
                href="https://staging.noctra.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-6 rounded-full bg-white text-black font-medium text-sm flex items-center gap-2 hover:scale-105 transition-transform transform translate-y-4 group-hover:translate-y-0 duration-300">
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
                className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl w-full max-w-md relative"
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
