"use client";

import { useState } from "react";
import { User, Mail, Lock, Globe, Camera } from "lucide-react";

export default function SettingsView() {
  const [displayName, setDisplayName] = useState("John Doe");
  const [jobTitle, setJobTitle] = useState("CEO");
  const [language, setLanguage] = useState<"en" | "es">("en");

  const handleSaveChanges = () => {
    // Save logic here
    alert("Changes saved! (Demo)");
  };

  return (
    <div className="h-full pb-28 md:pb-20">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
          <p className="text-neutral-300">
            Manage your profile and preferences
          </p>
        </div>

        {/* Profile Section */}
        <div className="rounded-[1.75rem] border border-neutral-800 bg-neutral-900 p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile
          </h3>

          <div className="space-y-6">
            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Company Logo / Profile Photo
              </label>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-neutral-700 bg-neutral-800 transition-colors group hover:border-neutral-600">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                  />
                  <div className="text-center">
                    <Camera className="w-6 h-6 text-neutral-300 mx-auto mb-1" />
                    <p className="text-xs text-neutral-300">Upload</p>
                  </div>
                </div>
                <div className="text-sm text-neutral-300">
                  <p>Drag & drop or click to upload</p>
                  <p className="text-xs mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-white/20 focus:border-white/20 outline-none transition-all"
                placeholder="Your name"
              />
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Job Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-white/20 focus:border-white/20 outline-none transition-all"
                placeholder="e.g., CEO, Product Manager"
              />
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="rounded-[1.75rem] border border-neutral-800 bg-neutral-900 p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Account Security
          </h3>

          <div className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value="client@example.com"
                  disabled
                  className="w-full bg-neutral-950/50 border border-neutral-800 rounded-lg px-4 py-3 text-neutral-300 cursor-not-allowed"
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              </div>
              <p className="text-xs text-neutral-300 mt-2">
                Email cannot be changed
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Password
              </label>
              <button className="px-4 py-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors w-full md:w-auto">
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-[1.75rem] border border-neutral-800 bg-neutral-900 p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Preferences
          </h3>

          <div className="space-y-6">
            {/* Language Toggle */}
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-3">
                Language
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    language === "en"
                      ? "bg-white text-black"
                      : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white"
                  }`}>
                  English
                </button>
                <button
                  onClick={() => setLanguage("es")}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    language === "es"
                      ? "bg-white text-black"
                      : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white"
                  }`}>
                  Español
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mobile-safe-x fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] md:inset-x-auto md:bottom-6 md:right-6">
        <button
          onClick={handleSaveChanges}
          className="w-full rounded-2xl bg-white px-6 py-3 font-medium text-black shadow-2xl transition-colors hover:bg-neutral-200 md:w-auto"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
