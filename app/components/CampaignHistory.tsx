
"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/auth";

interface CampaignHistoryProps {
  isDark: boolean;
}

export function CampaignHistory({
  isDark,
}: CampaignHistoryProps) {
  const [campaignRuns, setCampaignRuns] =
    useState<any[]>([]);

  const [campaignLoading, setCampaignLoading] =
    useState(true);

  const [campaignError, setCampaignError] =
    useState<string | null>(null);

  const sectionStyle = isDark
    ? "border-slate-800/70 bg-slate-900/80 shadow-2xl shadow-slate-950/20"
    : "border-slate-200/70 bg-white/90 shadow-xl shadow-slate-900/10";

  const cardStyle = isDark
    ? "bg-slate-900/80 border border-slate-800/70 text-white"
    : "bg-white border border-slate-200/70 text-slate-950";

  const mutedText = isDark
    ? "text-slate-400"
    : "text-slate-500";

  const t = (text: string) => text;

  const fetchCampaignRuns = async () => {
    setCampaignLoading(true);
    setCampaignError(null);

    try {
      const token = getAccessToken();

      const response = await fetch(
        "http://localhost:5000/campaignrun/v1/getall",
        {
          method: "GET",
          headers: {
            "Content-Type":
              "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const result = await response.json();

      setCampaignRuns(result.data || []);
    } catch (error) {
      console.error(error);

      setCampaignError(
        error instanceof Error
          ? error.message
          : "Failed to load campaign runs"
      );
    } finally {
      setCampaignLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignRuns();
  }, []);

  return (
    <div className="space-y-6">

      {/* METRIC CARDS */}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <article
          className={`rounded-[2rem] p-6 shadow-lg transition-transform hover:scale-[1.01] ${cardStyle}`}
        >
          <p
            className={`text-sm uppercase tracking-[0.24em] ${mutedText}`}
          >
            {t("Total Campaigns")}
          </p>

          <p className="mt-4 text-4xl font-semibold">
            {campaignRuns.length}
          </p>

          <p
            className={`mt-2 text-sm ${mutedText}`}
          >
            {t(
              "Campaign runs available in history."
            )}
          </p>
        </article>

        <article
          className={`rounded-[2rem] p-6 shadow-lg transition-transform hover:scale-[1.01] ${cardStyle}`}
        >
          <p
            className={`text-sm uppercase tracking-[0.24em] ${mutedText}`}
          >
            {t("Messages Sent")}
          </p>

          <p className="mt-4 text-4xl font-semibold">
            {campaignRuns.reduce(
              (acc, item) =>
                acc + (item.sentCount || 0),
              0
            )}
          </p>

          <p
            className={`mt-2 text-sm ${mutedText}`}
          >
            {t(
              "Messages successfully sent."
            )}
          </p>
        </article>

        <article
          className={`rounded-[2rem] p-6 shadow-lg transition-transform hover:scale-[1.01] ${cardStyle}`}
        >
          <p
            className={`text-sm uppercase tracking-[0.24em] ${mutedText}`}
          >
            {t("Completed")}
          </p>

          <p className="mt-4 text-4xl font-semibold">
            {
              campaignRuns.filter(
                (item) =>
                  item.status ===
                  "COMPLETED"
              ).length
            }
          </p>

          <p
            className={`mt-2 text-sm ${mutedText}`}
          >
            {t(
              "Successfully completed campaigns."
            )}
          </p>
        </article>
      </section>

      {/* CAMPAIGN TABLE */}

      <section
        className={`overflow-hidden rounded-[2rem] border ${sectionStyle}`}
      >
        <div
          className={`border-b px-6 py-5 ${
            isDark
              ? "border-slate-800/70 bg-slate-950/80"
              : "border-slate-200/70 bg-slate-100"
          }`}
        >
          <h2
            className={
              isDark
                ? "text-xl font-semibold text-white"
                : "text-xl font-semibold text-slate-950"
            }
          >
            {t("All campaigns")}
          </h2>

          <p
            className={`mt-1 text-sm ${mutedText}`}
          >
            {t(
              "Track performance and delivery status of all your campaigns."
            )}
          </p>
        </div>

        <div className="min-w-full overflow-x-auto px-6 py-5">

        


<div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">

  {campaignLoading ? (

    <div className="col-span-full py-20 text-center text-slate-400">
      Loading campaigns...
    </div>

  ) : campaignError ? (

    <div className="col-span-full py-20 text-center text-rose-400">
      {campaignError}
    </div>

  ) : campaignRuns.length === 0 ? (

    <div className="col-span-full py-20 text-center text-slate-400">
      No campaigns found.
    </div>

  ) : (

    campaignRuns.map((campaign) => (

      <div
        key={campaign.id}
        className={`rounded-[2rem] border p-6 transition-all hover:-translate-y-1 hover:shadow-xl ${
          isDark
            ? "border-slate-800 bg-slate-950/70"
            : "border-slate-200 bg-white"
        }`}
      >

        {/* TOP */}

        <div className="flex items-start justify-between gap-3">

          <div>
            <h3 className="text-lg font-semibold break-all">
              {campaign.campaignId}
            </h3>

            <p className="mt-1 text-xs text-slate-400 break-all">
              Template:
              {" "}
              {campaign.templateId}
            </p>
          </div>

          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              campaign.status === "COMPLETED"
                ? "bg-emerald-100 text-emerald-700"
                : campaign.status === "RUNNING"
                ? "bg-amber-100 text-amber-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {campaign.status}
          </span>
        </div>

        {/* METRICS */}

        <div className="mt-6 grid grid-cols-3 gap-4">

          <div
            className={`rounded-2xl p-4 text-center ${
              isDark
                ? "bg-slate-900"
                : "bg-slate-50"
            }`}
          >
            <p className="text-xs text-slate-400">
              Sent
            </p>

            <h4 className="mt-2 text-xl font-bold text-sky-500">
              {campaign.sentCount}
            </h4>
          </div>

          <div
            className={`rounded-2xl p-4 text-center ${
              isDark
                ? "bg-slate-900"
                : "bg-slate-50"
            }`}
          >
            <p className="text-xs text-slate-400">
              Delivered
            </p>

            <h4 className="mt-2 text-xl font-bold text-emerald-500">
              {campaign.deliveredCount}
            </h4>
          </div>

          <div
            className={`rounded-2xl p-4 text-center ${
              isDark
                ? "bg-slate-900"
                : "bg-slate-50"
            }`}
          >
            <p className="text-xs text-slate-400">
              Failed
            </p>

            <h4 className="mt-2 text-xl font-bold text-rose-500">
              {campaign.failedCount}
            </h4>
          </div>
        </div>

        {/* SECOND ROW */}

        <div className="mt-4 grid grid-cols-3 gap-4">

          <div
            className={`rounded-2xl p-4 text-center ${
              isDark
                ? "bg-slate-900"
                : "bg-slate-50"
            }`}
          >
            <p className="text-xs text-slate-400">
              Pending
            </p>

            <h4 className="mt-2 text-xl font-bold text-amber-500">
              {campaign.pendingCount}
            </h4>
          </div>

          <div
            className={`rounded-2xl p-4 text-center ${
              isDark
                ? "bg-slate-900"
                : "bg-slate-50"
            }`}
          >
            <p className="text-xs text-slate-400">
              Read
            </p>

            <h4 className="mt-2 text-xl font-bold text-violet-500">
              {campaign.readCount}
            </h4>
          </div>

          <div
            className={`rounded-2xl p-4 text-center ${
              isDark
                ? "bg-slate-900"
                : "bg-slate-50"
            }`}
          >
            <p className="text-xs text-slate-400">
              Contacts
            </p>

            <h4 className="mt-2 text-xl font-bold">
              {campaign.totalContacts}
            </h4>
          </div>
        </div>

        {/* DETAILS */}

        <div className="mt-6 space-y-3 text-sm">

          <div className="flex items-center justify-between">
            <span className="text-slate-400">
              Run Type
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                campaign.runType ===
                "SCHEDULED"
                  ? "bg-indigo-100 text-indigo-700"
                  : campaign.runType ===
                    "INSTANT"
                  ? "bg-sky-100 text-sky-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {campaign.runType}
            </span>
          </div>

          <div className="flex items-center justify-between gap-5">
            <span className="text-slate-400">
              Started
            </span>

            <span className="text-right text-xs">
              {campaign.startedAt
                ? new Date(
                    campaign.startedAt
                  ).toLocaleString()
                : "-"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-5">
            <span className="text-slate-400">
              Completed
            </span>

            <span className="text-right text-xs">
              {campaign.completedAt
                ? new Date(
                    campaign.completedAt
                  ).toLocaleString()
                : "-"}
            </span>
          </div>
        </div>

        {/* BUTTON */}

        <button className="mt-6 w-full rounded-2xl bg-sky-500 py-3 text-sm font-semibold text-white transition hover:bg-sky-600">
          View Campaign
        </button>
      </div>
    ))
  )}
</div>



        </div>
      </section>
    </div>
  );
}
