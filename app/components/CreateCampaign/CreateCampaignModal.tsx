"use client";

import { useState } from "react";
import { getAccessToken, getUserId } from "@/lib/auth";

interface CreateCampaignModalProps {
  isDark: boolean;
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateCampaignModal({ isDark, isOpen, onClose, onCreated }: CreateCampaignModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const inputStyle = isDark
    ? "border-slate-700 bg-slate-950/80 text-slate-100 placeholder-slate-600"
    : "border-slate-300 bg-slate-50 text-slate-950 placeholder-slate-400";
  const labelStyle = isDark ? "text-slate-300" : "text-slate-700";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const createdBy = getUserId() || "USR00002";
    const accessToken = getAccessToken();

    const payload = {
      title,
      description,
      status: 1,
      createdBy,
    };

    try {
      const response = await fetch("https://apiwhatsapp.blackstoneinfomaticstech.com/campaign/v1/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let message = "Failed to create campaign";
        try {
          const contentType = response.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            const error = await response.text();
            message = error || message;
          } else {
            const text = await response.text();
            message = text || message;
          }
        } catch {
          message = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(message);
      }

      await response.text();
      setSuccessMessage("Campaign created successfully!");
      setTitle("");
      setDescription("");
      onCreated();

      setTimeout(() => {
        setIsLoading(false);
        setSuccessMessage("");
        onClose();
      }, 1200);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An error occurred while creating the campaign");
      console.error("CreateCampaignModal error:", error);
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      />
      <div
        className={`relative w-full max-w-lg transform rounded-[2rem] border p-8 shadow-2xl transition-all duration-300 ${isDark
          ? "border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100 shadow-slate-950/60"
          : "border-slate-200 bg-white text-slate-950 shadow-slate-900/30"
          }`}
      >
        <button
          onClick={() => onClose()}
          disabled={isLoading}
          className={`absolute right-6 top-6 rounded-full p-2 transition-all duration-200 hover:bg-slate-500/10 active:scale-90 ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-black"}`}
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Create WhatsApp Campaign</h2>
          <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Configure details for your new broadcasting campaign.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={`block text-sm font-medium ${labelStyle}`}>Campaign name (Title)</label>
            <input
              type="text"
              placeholder="e.g., Festival Offer Campaign"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`mt-2 w-full rounded-xl border px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 ${inputStyle}`}
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${labelStyle}`}>Message content (Description)</label>
            <textarea
              placeholder="Your WhatsApp message here..."
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`mt-2 w-full rounded-xl border px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 ${inputStyle}`}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-500/10">
            <button
              type="button"
              onClick={() => onClose()}
              disabled={isLoading}
              className={`rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 active:scale-95 ${isDark ? "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-black"} disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                "Launch campaign"
              )}
            </button>
          </div>
        </form>

        {successMessage && (
          <div className={`mt-6 rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${isDark ? "border border-emerald-300/30 bg-emerald-500/10 text-emerald-100" : "border border-emerald-200/50 bg-emerald-50 text-emerald-900"}`}>
            <span className="text-emerald-400 font-bold">✓</span>
            <p className="font-medium">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className={`mt-6 rounded-xl px-4 py-3 text-sm ${isDark ? "border border-red-300/30 bg-red-500/10 text-red-100" : "border border-red-200/50 bg-red-50 text-red-900"}`}>
            <div className="flex items-center gap-2">
              <span className="text-red-400 font-bold">✗</span>
              <p className="font-medium">Error</p>
            </div>
            <p className={`mt-1 pl-4 ${isDark ? "text-red-200" : "text-red-700"}`}>{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
