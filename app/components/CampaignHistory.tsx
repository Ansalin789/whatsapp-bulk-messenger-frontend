
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

const [overallStats, setOverallStats] =
  useState<any>(null);


  const [campaignLoading, setCampaignLoading] =
    useState(true);

  const [campaignError, setCampaignError] =
    useState<string | null>(null);

  
const [search, setSearch] =
  useState("");

const [statusFilter, setStatusFilter] =
  useState("ALL");

const [runTypeFilter, setRunTypeFilter] =
  useState("ALL");

const [
  campaignPagination,
  setCampaignPagination,
] = useState({
  total: 0,
  page: 1,
  limit: 6,
  totalPages: 1,
});

  
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


const fetchOverallStats =
  async () => {

    try {

      const token =
        getAccessToken();

      const response =
        await fetch(
          "https://apiwhatsapp.blackstoneinfomaticstech.com/campaignrun/v1/overallstats",
          {
            method: "GET",

            headers: {
              "Content-Type":
                "application/json",

              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`,
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

      const result =
        await response.json();

      setOverallStats(result);

    } catch (error) {

      console.error(
        "Overall stats error:",
        error
      );
    }
  };




  const fetchCampaignRuns = async () => {
    setCampaignLoading(true);
    setCampaignError(null);

    try {
      const token = getAccessToken();

      const response = await fetch(
`https://apiwhatsapp.blackstoneinfomaticstech.com/campaignrun/v1/getall?page=${campaignPagination.page}&limit=${campaignPagination.limit}`
   ,     {
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
    
setCampaignPagination((prev) => ({
  ...prev,

  total:
    result.pagination?.total || 0,

  page:
    result.pagination?.page || 1,

  limit:
    result.pagination?.limit || 6,

  totalPages:
    result.pagination?.totalPages || 1,
}));

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

  fetchOverallStats();

}, [campaignPagination.page]);



const filteredCampaigns =
  campaignRuns.filter(
    (campaign) => {

      const matchesSearch =
        campaign.campaignName
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        campaign.templateName
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : campaign.status ===
            statusFilter;

      const matchesRunType =
        runTypeFilter === "ALL"
          ? true
          : campaign.runType ===
            runTypeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRunType
      );
    }
  );

  return (
    <div className="space-y-5">

      {/* METRIC CARDS */}

<section className="grid grid-cols-1 xl:grid-cols-4 gap-4">

  {/* TOTAL CAMPAIGNS */}

 
<div
  className={`rounded-[1.5rem] border p-4 ${
    isDark
      ? "border-slate-800 bg-slate-950/80"
      : "border-slate-200 bg-white"
  }`}
>

  <div className="flex items-center justify-between">

    <div>

      <p className="text-sm text-slate-400">
        Campaigns
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        {overallStats?.campaign?.totalCampaigns || 0}
      </h2>
    </div>

    <div className="rounded-xl bg-sky-500/10 p-3">
      📢
    </div>
  </div>

  <div className="mt-5 space-y-3">

    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">
        Completed
      </span>

      <span className="font-semibold text-emerald-500">
        {overallStats?.campaign?.completedCampaigns || 0}
      </span>
    </div>

    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">
        Draft
      </span>

      <span className="font-semibold text-amber-500">
        {overallStats?.campaign?.draftCampaigns || 0}
      </span>
    </div>

    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">
        Running
      </span>

      <span className="font-semibold text-sky-500">
        {overallStats?.campaign?.runningCampaigns || 0}
      </span>
    </div>

    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">
        Failed
      </span>

      <span className="font-semibold text-rose-500">
        {overallStats?.campaign?.failedCampaigns || 0}
      </span>
    </div>
   
<div className="flex items-center justify-between">
  <span className="text-sm text-slate-400">
    Active
  </span>

  <span className="font-semibold text-cyan-500">
    {overallStats?.campaign?.activeCampaigns || 0}
  </span>
</div>

<div className="flex items-center justify-between">
  <span className="text-sm text-slate-400">
    Scheduled
  </span>

  <span className="font-semibold text-indigo-500">
    {overallStats?.campaign?.scheduledCampaigns || 0}
  </span>
</div>


  </div>
</div>



  {/* MESSAGE SENT */}

<div
  className={`rounded-[1.5rem] border p-4 ${
    isDark
      ? "border-slate-800 bg-slate-950/80"
      : "border-slate-200 bg-white"
  }`}
>

  <div className="flex items-center justify-between">

    <div>

      <p className="text-sm text-slate-400">
        Contacts
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        {overallStats?.contacts?.totalContacts || 0}
      </h2>
    </div>

    <div className="rounded-xl bg-emerald-500/10 p-3">
      👥
    </div>
  </div>

  <div className="mt-5 space-y-3">

    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">
        Sent
      </span>

      <span className="font-semibold text-sky-500">
        {overallStats?.contacts?.sentCount || 0}
      </span>
    </div>

    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">
        Delivered
      </span>

      <span className="font-semibold text-emerald-500">
        {overallStats?.contacts?.deliveredCount || 0}
      </span>
    </div>

    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">
        Pending
      </span>

      <span className="font-semibold text-amber-500">
        {overallStats?.contacts?.pendingCount || 0}
      </span>
    </div>

    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">
        Failed
      </span>

      <span className="font-semibold text-rose-500">
        {overallStats?.contacts?.failedCount || 0}
      </span>
    </div>
   

{/* QUEUED */}

<div className="flex items-center justify-between">

  <span className="text-sm text-slate-400">
    Queued
  </span>

  <span className="font-semibold text-violet-500">
    {overallStats?.contacts?.queuedCount || 0}
  </span>
</div>

{/* READ */}

<div className="flex items-center justify-between">

  <span className="text-sm text-slate-400">
    Read
  </span>

  <span className="font-semibold text-sky-500">
    {overallStats?.contacts?.readCount || 0}
  </span>
</div>




  </div>
</div>



  {/* TOTAL REVENUE */}

 
<div
  className={`rounded-[1.5rem] border p-4 ${
    isDark
      ? "border-slate-800 bg-slate-950/80"
      : "border-slate-200 bg-white"
  }`}
>

  <div className="flex items-center justify-between">

    <div>

      <p className="text-sm text-slate-400">
        Rates
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        {overallStats?.rates?.deliveryRate || 0}%
      </h2>
    </div>

    <div className="rounded-xl bg-violet-500/10 p-3">
      📈
    </div>
  </div>

  <div className="mt-5 space-y-3">

    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">
        Delivery Rate
      </span>

      <span className="font-semibold text-emerald-500">
        {overallStats?.rates?.deliveryRate || 0}%
      </span>
    </div>

    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">
        Read Rate
      </span>

      <span className="font-semibold text-sky-500">
        {overallStats?.rates?.readRate || 0}%
      </span>
    </div>

    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">
        Failure Rate
      </span>

      <span className="font-semibold text-rose-500">
        {overallStats?.rates?.failureRate || 0}%
      </span>
    </div>
  </div>
</div>


<div
  className={`rounded-[1.5rem] border p-4 ${
    isDark
      ? "border-slate-800 bg-slate-950/80"
      : "border-slate-200 bg-white"
  }`}
>

  <div className="flex items-center justify-between">

    <div>

      <p className="text-sm text-slate-400">
        Billing
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        ₹
        {overallStats?.billing?.totalAmount || 0}
      </h2>
    </div>

    <div className="rounded-xl bg-amber-500/10 p-3">
      💰
    </div>
  </div>

  <div className="mt-5 space-y-3">

    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">
        Utility
      </span>

      <span className="font-semibold text-emerald-500">
        ₹
        {overallStats?.billing?.utilityAmount || 0}
      </span>
    </div>

    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">
        Marketing
      </span>

      <span className="font-semibold text-sky-500">
        ₹
        {overallStats?.billing?.marketingAmount || 0}
      </span>
    </div>

    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">
        Authentication
      </span>

      <span className="font-semibold text-violet-500">
        ₹
        {overallStats?.billing?.authenticationAmount || 0}
      </span>
    </div>
   
<div className="mt-4 rounded-xl bg-slate-100/50 p-3">

  <p className="text-xs text-slate-400 mb-3">
    Message Types
  </p>

  <div className="space-y-2">

    <div className="flex items-center justify-between">
      <span className="text-sm">
        Utility
      </span>

      <span className="font-semibold text-emerald-500">
        {overallStats?.billing?.utilityMessages || 0}
      </span>
    </div>

    <div className="flex items-center justify-between">
      <span className="text-sm">
        Marketing
      </span>

      <span className="font-semibold text-sky-500">
        {overallStats?.billing?.marketingMessages || 0}
      </span>
    </div>

    <div className="flex items-center justify-between">
      <span className="text-sm">
        Authentication
      </span>

      <span className="font-semibold text-violet-500">
        {overallStats?.billing?.authenticationMessages || 0}
      </span>
    </div>
  </div>
</div>


  </div>
</div>


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
                ? "text-base font-semibold text-white"
                : "text-base font-semibold text-slate-950"
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

        
<div className="flex flex-col xl:flex-row gap-4 mb-6">

  {/* SEARCH */}

  <div className="flex-1">

    <input
      type="text"
      placeholder="Search campaigns..."
      value={search}
      onChange={(e) =>
        setSearch(
          e.target.value
        )
      }
      className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none ${
        isDark
          ? "bg-slate-900 border-slate-700 text-white"
          : "bg-white border-slate-200 text-black"
      }`}
    />
  </div>

  {/* STATUS */}

  <select
    value={statusFilter}
    onChange={(e) =>
      setStatusFilter(
        e.target.value
      )
    }
    className={`rounded-xl border px-4 py-2.5 text-sm ${
      isDark
        ? "bg-slate-900 border-slate-700 text-white"
        : "bg-white border-slate-200 text-black"
    }`}
  >
    <option value="ALL">
      All Status
    </option>

    <option value="RUNNING">
      Running
    </option>

    <option value="COMPLETED">
      Completed
    </option>

    <option value="DRAFT">
      Draft
    </option>
  </select>

  {/* RUN TYPE */}

  <select
    value={runTypeFilter}
    onChange={(e) =>
      setRunTypeFilter(
        e.target.value
      )
    }
    className={`rounded-xl border px-4 py-2.5 text-sm ${
      isDark
        ? "bg-slate-900 border-slate-700 text-white"
        : "bg-white border-slate-200 text-black"
    }`}
  >
    <option value="ALL">
      All Run Types
    </option>

    <option value="INSTANT">
      Instant
    </option>

    <option value="SCHEDULED">
      Scheduled
    </option>

    <option value="DRAFT">
      Draft
    </option>
  </select>
</div>


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

filteredCampaigns.map((campaign) => (

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
              {campaign.campaignName}
            </h3>

            <p className="mt-1 text-xs text-slate-400 break-all">
              Template:
              {" "}
              {campaign.templateName}
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

        <div className="mt-5 grid grid-cols-3 gap-4">

          <div
            className={`rounded-xl p-4 text-center ${
              isDark
                ? "bg-slate-900"
                : "bg-slate-50"
            }`}
          >
            <h4 className="mt-2 text-[25px] font-bold text-sky-500">
              {campaign.sentCount}
            </h4>
            <p className="text-xs text-slate-600 font-semibold">
              Sent
            </p>

            
          </div>

          <div
            className={`rounded-xl p-4 text-center ${
              isDark
                ? "bg-slate-900"
                : "bg-slate-50"
            }`}
          >
            <h4 className="mt-2 text-[25px] font-bold text-emerald-500">
              {campaign.deliveredCount}
            </h4>
            <p className="text-xs text-slate-600 font-semibold">
              Delivered
            </p>

            
          </div>

          <div
            className={`rounded-xl p-4 text-center ${
              isDark
                ? "bg-slate-900"
                : "bg-slate-50"
            }`}
          >
            <h4 className="mt-2 text-[25px] font-bold text-rose-500">
              {campaign.failedCount}
            </h4>
            <p className="text-xs text-slate-600 font-semibold">
              Failed
            </p>

            
          </div>
        </div>

        {/* SECOND ROW */}

        <div className="mt-4 grid grid-cols-3 gap-4">

          <div
            className={`rounded-xl p-4 text-center ${
              isDark
                ? "bg-slate-900"
                : "bg-slate-50"
            }`}
          >

            <h4 className="mt-2 text-[25px] font-bold text-amber-500">
              {campaign.pendingCount}
            </h4>
            <p className="text-xs text-slate-600 font-semibold">
              Pending
            </p>

            
          </div>

          <div
            className={`rounded-xl p-4 text-center ${
              isDark
                ? "bg-slate-900"
                : "bg-slate-50"
            }`}
          >
            <h4 className="mt-2 text-[25px] font-bold text-violet-500">
              {campaign.readCount}
            </h4>
            <p className="text-xs text-slate-600 font-semibold">
              Read
            </p>

            
          </div>

          <div
            className={`rounded-xl p-4 text-center ${
              isDark
                ? "bg-slate-900"
                : "bg-slate-50"
            }`}
          >
            <h4 className="mt-2 text-[25px] font-bold">
              {campaign.totalContacts}
            </h4>
            <p className="text-xs text-slate-600 font-semibold">
              Contacts
            </p>

            
          </div>
        </div>

        {/* DETAILS */}

        <div className="mt-5 space-y-3 text-sm">

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

      
      </div>
    ))
  )}
</div>



        </div>
      </section>
<div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

  {/* LEFT */}

  <div className="bg-[#0084D1] text-white rounded-xl px-4 py-2.5 text-sm">

    Showing
    {" "}

    <span className="font-semibold">
      {(campaignPagination.page - 1) *
        campaignPagination.limit +
        1}
    </span>

    {" "}to{" "}

    <span className="font-semibold">
      {Math.min(
        campaignPagination.page *
          campaignPagination.limit,

        campaignPagination.total
      )}
    </span>

    {" "}of{" "}

    <span className="font-semibold">
      {campaignPagination.total}
    </span>
  </div>

  {/* RIGHT */}

  <div className="flex items-center gap-3">

    {/* PREVIOUS */}

    <button
      disabled={
        campaignPagination.page === 1
      }
      onClick={() =>
        setCampaignPagination(
          (prev) => ({
            ...prev,
            page:
              prev.page - 1,
          })
        )
      }
      className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
        campaignPagination.page === 1
          ? "cursor-not-allowed bg-slate-200 text-slate-400"
          : "bg-slate-800 text-white hover:bg-slate-700"
      }`}
    >
      Previous
    </button>

    {/* PAGE BUTTONS */}

    <div className="flex items-center gap-2">

      {Array.from({
        length:
          campaignPagination.totalPages,
      }).map((_, index) => {

        const page =
          index + 1;

        return (
          <button
            key={page}
            onClick={() =>
              setCampaignPagination(
                (prev) => ({
                  ...prev,
                  page,
                })
              )
            }
            className={`h-10 w-10 rounded-xl text-sm font-semibold ${
              campaignPagination.page ===
              page
                ? "bg-sky-500 text-white"
                : isDark
                ? "bg-slate-900 text-slate-300"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {page}
          </button>
        );
      })}
    </div>

    {/* NEXT */}

    <button
      disabled={
        campaignPagination.page ===
        campaignPagination.totalPages
      }
      onClick={() =>
        setCampaignPagination(
          (prev) => ({
            ...prev,
            page:
              prev.page + 1,
          })
        )
      }
      className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
        campaignPagination.page ===
        campaignPagination.totalPages
          ? "cursor-not-allowed bg-slate-200 text-slate-400"
          : "bg-sky-500 text-white hover:bg-sky-600"
      }`}
    >
      Next
    </button>
  </div>
</div>

    </div>
  );
}
