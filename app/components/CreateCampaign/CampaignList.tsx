"use client";
import { PiRocketLaunchFill } from "react-icons/pi";

interface CampaignListProps {
  isDark: boolean;
  campaigns: any[];
  listLoading: boolean;
  listError: string | null;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: () => void;
  status: string | number;
  onStatusChange: (value: string) => void;
  onRefresh: () => void;
  onViewDetails: (campaignId: string) => void;
  page: number;
  limit: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function CampaignList({
  isDark,
  campaigns,
  listLoading,
  listError,
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  status,
  onStatusChange,
  onRefresh,
  onViewDetails,
  page,
  limit,
  totalCount,
  onPageChange,
}: CampaignListProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const startIndex = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, totalCount);

  // Theme tokens
  const surface = isDark
    ? "bg-slate-900 border-slate-800"
    : "bg-white border-slate-200";
  const mutedText = isDark ? "text-slate-400" : "text-slate-500";
  const inputClass = isDark
    ? "border-[#2A3942] bg-[#202C33] text-white placeholder-slate-500 focus:border-[#25D366] focus:ring-[#25D366]/20"
    : "border-[#D9FDD3] bg-[#F7FFF9] text-slate-900 placeholder-slate-400 focus:border-[#25D366] focus:ring-[#25D366]/20";
  const iconBtnClass = isDark
    ? "border-slate-700 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
    : "border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50";

  return (
    <section
      className={`
    rounded-[32px]
    border
    p-8
    backdrop-blur-xl
    shadow-2xl
    ${isDark ? "bg-[#111B21]/95 border-[#202C33]" : "bg-white border-[#E5E7EB]"}
  `}
    >
      {/* ── Header ── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
      <h2
        className={`font-bold tracking-tight text-2xl ${
          isDark ? "text-white" : "text-slate-900"
        }`}
      >
        Campaign Manager
      </h2>

      <p className={`mt-1 text-sm ${mutedText}`}>
        Monitor and manage all WhatsApp campaigns.
      </p>
    </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSearchSubmit();
            }}
            className="relative"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${mutedText}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search…"
              value={searchInput}
              onChange={(e) => onSearchInputChange(e.target.value)}
              className={`rounded-lg border pl-8 pr-3 py-1.5 text-sm outline-none transition focus:ring-2 w-44 ${inputClass}`}
            />
          </form>

          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className={`rounded-lg border px-2.5 py-1.5 text-sm outline-none transition cursor-pointer focus:ring-2 ${inputClass}`}
          >
            <option value="">All status</option>
            <option value={1}>Active</option>
            <option value={0}>Inactive</option>
          </select>

          {/* Refresh */}
          <button
            type="button"
            onClick={onRefresh}
            title="Refresh"
            className={`rounded-lg border p-1.5 transition cursor-pointer ${iconBtnClass}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className={`w-4 h-4 ${listLoading ? "animate-spin" : ""}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      {listLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`h-44 rounded-xl animate-pulse ${isDark ? "bg-slate-800" : "bg-slate-100"}`}
            />
          ))}
        </div>
      ) : listError ? (
        <div className="py-10 text-center">
          <p className="text-sm font-medium text-red-400 mb-1">
            Failed to load campaigns
          </p>
          <p className={`text-xs mb-4 ${mutedText}`}>{listError}</p>
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-lg bg-sky-500 px-4 py-2 text-xs font-medium text-white hover:bg-sky-400 transition cursor-pointer"
          >
            Try again
          </button>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="py-14 text-center">
          <div
            className={`inline-flex rounded-xl p-3 mb-3 ${isDark ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <p
            className={`font-medium text-sm ${isDark ? "text-white" : "text-slate-900"}`}
          >
            No campaigns found
          </p>
          <p className={`mt-1 text-xs ${mutedText}`}>
            Launch a broadcast to see campaigns here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign, index) => {
            const statusText = String(campaign.status).toUpperCase();
            let statusLabel = "Inactive";
            let statusClass = isDark
              ? "bg-slate-700/60 text-slate-400"
              : "bg-slate-100 text-slate-500";

            if (
              [1, "1", true].includes(campaign.status) ||
              statusText === "ACTIVE"
            ) {
              statusLabel = "Active";
              statusClass = isDark
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-emerald-50 text-emerald-600";
            } else if (statusText === "PAUSED") {
              statusLabel = "Paused";
              statusClass = isDark
                ? "bg-amber-500/10 text-amber-400"
                : "bg-amber-50 text-amber-600";
            }

            const formattedDate = campaign.createdAt
              ? new Date(campaign.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : null;

            const cardBg = isDark
              ? "bg-slate-800/60 border-slate-700/60 hover:border-slate-600"
              : "bg-slate-50 border-slate-200 hover:border-slate-300";

            return (
              <article
                key={campaign._id || campaign.id || index}
                className={`group flex flex-col rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 ${cardBg}`}
              >
                {/* Top row: icon + badge */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`rounded-lg p-2 ${isDark ? "bg-slate-700 text-sky-400" : "bg-white text-sky-500 border border-slate-200"}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                      />
                    </svg>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}
                  >
                    {statusLabel}
                  </span>
                </div>

                {/* Title + description */}
                <div className="flex-1 mb-4">
                  <h3
                    className={`font-semibold text-sm leading-snug mb-1.5 ${isDark ? "text-white" : "text-slate-900"}`}
                  >
                    {campaign.title || "Untitled Campaign"}
                  </h3>
                  {campaign.description && (
                    <p
                      className={`text-xs leading-relaxed line-clamp-2 ${mutedText}`}
                    >
                      {campaign.description}
                    </p>
                  )}
                </div>

                {/* Footer: meta + action */}
                <div
                  className={`flex items-center justify-between pt-3 border-t ${isDark ? "border-slate-700/60" : "border-slate-200"}`}
                >
                  <div className="min-w-0">
                    <p className={`text-xs truncate ${mutedText}`}>
                      {campaign.createdBy || "Admin"}
                      {formattedDate && (
                        <span className="opacity-60"> · {formattedDate}</span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onViewDetails(campaign._id || campaign.id)}
                    className={`ml-3 shrink-0 inline-flex items-center gap-2 rounded-lg cursor-pointer px-4 py-2 text-xs font-semibold transition-all duration-200 shadow-sm ${
                      isDark
                        ? "bg-gradient-to-r from-sky-500/20 via-sky-500/15 to-cyan-500/10 text-sky-100 shadow-sky-500/20 hover:-translate-y-0.5 hover:shadow-sky-500/40"
                        : "bg-gradient-to-r from-sky-100 via-slate-50 to-cyan-100 text-sky-700 shadow-sky-200 hover:-translate-y-0.5 hover:shadow-sky-300/30"
                    } active:scale-[0.97]`}
                  >
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-500/30" />
                    Launch Campaign <PiRocketLaunchFill />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {!listLoading && !listError && totalCount > 0 && (
        <div
          className={`mt-5 pt-4 border-t flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${isDark ? "border-slate-800" : "border-slate-200"}`}
        >
          <p className={`text-xs ${mutedText}`}>
            Showing{" "}
            <span
              className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}
            >
              {startIndex}–{endIndex}
            </span>{" "}
            of{" "}
            <span
              className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}
            >
              {totalCount}
            </span>{" "}
            campaigns
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${iconBtnClass}`}
            >
              ← Prev
            </button>
            <span className={`text-xs tabular-nums ${mutedText}`}>
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${iconBtnClass}`}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
