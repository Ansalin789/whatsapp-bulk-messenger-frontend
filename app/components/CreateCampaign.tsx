"use client";

import { useState, useEffect } from "react";
import { getUserId, getAccessToken } from "@/lib/auth";

interface CreateCampaignProps {
  isDark: boolean;
}

export function CreateCampaign({ isDark }: CreateCampaignProps) {
  // Modal toggle state
  const [isOpen, setIsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form input states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Campaign list states
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // Campaign list filtering states
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | number>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [totalCount, setTotalCount] = useState(0);

  // Tailwind CSS themed design tokens
  const sectionStyle = isDark
    ? "border-slate-800/70 bg-slate-900/80 shadow-2xl shadow-slate-950/20"
    : "border-slate-200/70 bg-white/90 shadow-xl shadow-slate-900/10";
  const cardStyle = isDark
    ? "border-slate-800/70 bg-slate-900/80 text-slate-100 shadow-slate-950/20"
    : "border-slate-200/70 bg-white/90 text-slate-950 shadow-slate-900/10";
  const inputStyle = isDark
    ? "border-slate-700 bg-slate-950/80 text-slate-100 placeholder-slate-600"
    : "border-slate-300 bg-slate-50 text-slate-950 placeholder-slate-400";
  const labelStyle = isDark ? "text-slate-300" : "text-slate-700";
  const mutedText = isDark ? "text-slate-400" : "text-slate-500";

  // Fetch campaign history list from API
const fetchCampaigns = async () => {
  setListLoading(true);
  setListError(null);

  const token = getAccessToken();

  const payload: any = {
    page,
    limit,
    search,
  };

  if (status !== "") {
    payload.status = status;
  }

  // Convert payload to query params
  const queryParams = new URLSearchParams(
    Object.entries(payload).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  try {
    const response = await fetch(
      `http://localhost:5000/campaign/v1/getall?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const resData = await response.json();

    let list: any[] = [];
    let total = 0;

    if (resData && resData.success) {
      list = resData.data || [];
      total = resData.pagination?.total ?? list.length;
    } else if (Array.isArray(resData)) {
      list = resData;
      total = resData.length;
    } else if (resData) {
      list =
        resData.data ||
        resData.campaigns ||
        resData.results ||
        resData.list ||
        [];

      total =
        resData.pagination?.total ||
        resData.total ||
        resData.count ||
        list.length;
    }

    setCampaigns(list);
    setTotalCount(total);
  } catch (err) {
    console.error("Error fetching campaigns:", err);

    setListError(
      err instanceof Error
        ? err.message
        : "Failed to load campaigns."
    );
  } finally {
    setListLoading(false);
  }
};

  // Trigger fetch when parameters or refreshKey changes
  useEffect(() => {
    fetchCampaigns();
  }, [page, status, search, refreshKey]);

  // Handle open modal with fresh state
  const openModal = () => {
    setTitle("");
    setDescription("");
    setErrorMessage("");
    setSuccessMessage("");
    setIsOpen(true);
  };

  // Submit new campaign
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
      const response = await fetch("http://localhost:5000/campaign/v1/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = "Failed to create campaign";
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const error = await response.json();
            errorMessage = error.message || error.error || errorMessage;
          } else {
            const textError = await response.text();
            errorMessage = textError || errorMessage;
          }
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      setSuccessMessage("Campaign created successfully!");
      setRefreshKey((prev) => prev + 1);

      // Reset form
      setTitle("");
      setDescription("");

      console.log("Campaign created:", data);

      // Auto close modal after successful campaign creation
      setTimeout(() => {
        setIsOpen(false);
        setSuccessMessage("");
      }, 1500);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "An error occurred while creating the campaign"
      );
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Form bounds
  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="space-y-6">


      {/* Campaign Details Activation Banner */}
      <section className={`rounded-[2rem] p-8 border flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 hover:border-sky-500/30 ${sectionStyle}`}>
        <div className="space-y-2 text-center md:text-left">
          <h2
            className={
              isDark
                ? "text-2xl font-bold text-white tracking-tight"
                : "text-2xl font-bold text-slate-950 tracking-tight"
            }
          >
            Launch a New Campaign
          </h2>
          <p className={`text-sm ${mutedText} max-w-md`}>
            Reach your subscribers instantly. Compose personalized WhatsApp messages, broadcast templates, and track delivery in real time.
          </p>
        </div>
        <button
          onClick={openModal}
          className="relative inline-flex items-center cursor-pointer gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-indigo-500/35 hover:brightness-110 active:scale-95 whitespace-nowrap"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Campaign
        </button>
      </section>

      {/* Custom self-contained Campaigns Grid section */}
      <section className={`rounded-[2rem] p-6 border transition-all duration-300 ${sectionStyle}`}>
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              className={
                isDark
                  ? "text-xl font-bold text-white tracking-tight"
                  : "text-xl font-bold text-slate-950 tracking-tight"
              }
            >
              Recent Campaigns
            </h2>
            <p className={`mt-1 text-sm ${mutedText}`}>
              Manage and track the real-time status of all your launched WhatsApp broadcasts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearch(searchInput);
                setPage(1);
              }}
              className="relative"
            >
              <input
                type="text"
                placeholder="Search..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className={`rounded-xl border pl-9 pr-4 py-2 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 ${
                  isDark
                    ? "border-slate-700 bg-slate-950/80 text-white placeholder-slate-500"
                    : "border-slate-300 bg-white text-slate-900 placeholder-slate-400"
                }`}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                </svg>
              </span>
            </form>

            {/* Status dropdown */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className={`rounded-xl border px-3 py-2 text-sm outline-none transition cursor-pointer focus:border-sky-400 ${
                isDark ? "border-slate-700 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-900"
              }`}
            >
              <option value="">All Status</option>
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => fetchCampaigns()}
              className={`rounded-xl border p-2 text-sm transition hover:scale-105 active:scale-95 cursor-pointer ${
                isDark ? "border-slate-700 bg-slate-900 text-slate-300 hover:text-white" : "border-slate-300 bg-white text-slate-770 hover:text-slate-900"
              }`}
              title="Refresh list"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={`w-4 h-4 ${listLoading ? 'animate-spin' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content body - Custom Grid Layout */}
        <div className="mt-2">
          {listLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`h-48 w-full animate-pulse rounded-[2rem] ${
                    isDark ? "bg-slate-950/45 border border-slate-800/50" : "bg-slate-200/35 border border-slate-200/50"
                  }`}
                />
              ))}
            </div>
          ) : listError ? (
            <div className="py-8 text-center">
              <p className="text-red-400 font-semibold mb-2">Error loading campaigns</p>
              <p className={`text-sm mb-4 ${mutedText}`}>{listError}</p>
              <button
                onClick={() => fetchCampaigns()}
                className="rounded-xl bg-sky-500 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-sky-400 cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="py-12 text-center max-w-sm mx-auto">
              <div className={`inline-flex rounded-full p-4 mb-4 ${isDark ? "bg-slate-950 text-slate-700" : "bg-slate-100 text-slate-400"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className={`font-semibold text-lg ${isDark ? "text-white" : "text-slate-900"}`}>No campaigns found</h3>
              <p className={`mt-2 text-sm ${mutedText} mb-5`}>
                Launch a new broadcast to see your campaigns listed here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
              {campaigns.map((campaign, index) => {
                const s = String(campaign.status).toUpperCase();
                let statusLabel = "Inactive";
                let statusClass = "bg-slate-500/10 text-slate-400 border border-slate-500/20";
                
                if (campaign.status === 1 || s === "ACTIVE" || s === "1" || campaign.status === true) {
                  statusLabel = "Active";
                  statusClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                } else if (s === "PAUSED") {
                  statusLabel = "Paused";
                  statusClass = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                }

                const formattedDate = campaign.createdAt 
                  ? new Date(campaign.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : null;

                return (
                  <article
                    key={campaign._id || campaign.id || index}
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border p-6 transition-all duration-300 hover:-translate-y-1 ${
                      isDark 
                        ? "border-slate-800 bg-slate-950/40 text-slate-200 shadow-lg hover:shadow-sky-500/5 hover:border-sky-500/30" 
                        : "border-slate-200 bg-slate-50/50 text-slate-800 shadow-md hover:shadow-lg hover:border-sky-400/50"
                    }`}
                  >
                    {/* Top Row with Status Badges and Megaphone Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-2.5 rounded-2xl ${
                        isDark ? "bg-slate-900 text-sky-400" : "bg-white text-sky-600 shadow-sm border border-slate-100"
                      }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                        </svg>
                      </div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold border ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold tracking-tight transition-colors duration-200 ${
                        isDark ? "text-white group-hover:text-sky-400" : "text-slate-950 group-hover:text-sky-600"
                      }`}>
                        {campaign.title || "Untitled Campaign"}
                      </h3>
                      {campaign.description && (
                        <p className={`mt-2 text-sm leading-relaxed line-clamp-3 ${mutedText}`}>
                          {campaign.description}
                        </p>
                      )}
                    </div>

                    {/* Footer Row */}
                    <div className={`mt-6 pt-4 border-t flex items-center justify-between text-xs ${
                      isDark ? "border-slate-900" : "border-slate-200/60"
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <span className={mutedText}>By:</span>
                        <span className="font-semibold">{campaign.createdBy || "System"}</span>
                      </div>
                      {formattedDate && (
                        <time className={`font-medium ${mutedText}`}>
                          {formattedDate}
                        </time>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!listLoading && !listError && totalCount > 0 && (
          <div className={`mt-4 border-t pt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${
            isDark ? "border-slate-800" : "border-slate-200"
          }`}>
            <p className={`text-xs ${mutedText}`}>
              Showing <span className="font-semibold text-sky-500">{(page - 1) * limit + 1}</span> to{" "}
              <span className="font-semibold text-sky-500">{Math.min(page * limit, totalCount)}</span> of{" "}
              <span className="font-semibold text-sky-500">{totalCount}</span> campaigns
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`rounded-xl px-4 py-2 text-xs font-semibold border transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 ${
                  isDark ? "border-slate-700 bg-slate-900 text-slate-300 hover:text-white" : "border-slate-300 bg-white text-slate-750 hover:bg-slate-50"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`rounded-xl px-4 py-2 text-xs font-semibold border transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 ${
                  isDark ? "border-slate-700 bg-slate-900 text-slate-300 hover:text-white" : "border-slate-300 bg-white text-slate-750 hover:bg-slate-50"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300">
          {/* Blur Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300"
            onClick={() => {
              if (!isLoading) setIsOpen(false);
            }}
          />

          {/* Modal Card */}
          <div
            className={`relative w-full max-w-lg transform rounded-[2rem] border p-8 shadow-2xl transition-all duration-300 ${isDark
              ? "border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100 shadow-slate-950/60"
              : "border-slate-200 bg-white text-slate-950 shadow-slate-900/30"
              }`}
          >
            {/* Close Icon Button */}
            <button
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className={`absolute right-6 top-6 rounded-full p-2 transition-all duration-200 hover:bg-slate-500/10 active:scale-90 ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-black"
                }`}
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Heading */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Create WhatsApp Campaign</h2>
              <p className={`mt-2 text-sm ${mutedText}`}>
                Configure details for your new broadcasting campaign.
              </p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={`block text-sm font-medium ${labelStyle}`}>
                  Campaign name (Title)
                </label>
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
                <label className={`block text-sm font-medium ${labelStyle}`}>
                  Message content (Description)
                </label>
                <textarea
                  placeholder="Your WhatsApp message here..."
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`mt-2 w-full rounded-xl border px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 ${inputStyle}`}
                  required
                ></textarea>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-500/10">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className={`rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 active:scale-95 ${isDark
                    ? "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-black"
                    } disabled:opacity-50`}
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

            {/* Toast-style Messages inside Modal */}
            {successMessage && (
              <div
                className={`mt-6 rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${isDark
                  ? "border border-emerald-300/30 bg-emerald-500/10 text-emerald-100"
                  : "border border-emerald-200/50 bg-emerald-50 text-emerald-900"
                  }`}
              >
                <span className="text-emerald-400 font-bold">✓</span>
                <p className="font-medium">{successMessage}</p>
              </div>
            )}

            {errorMessage && (
              <div
                className={`mt-6 rounded-xl px-4 py-3 text-sm ${isDark
                  ? "border border-red-300/30 bg-red-500/10 text-red-100"
                  : "border border-red-200/50 bg-red-50 text-red-900"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-bold">✗</span>
                  <p className="font-medium">Error</p>
                </div>
                <p className={`mt-1 pl-4 ${isDark ? "text-red-200" : "text-red-700"}`}>
                  {errorMessage}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
