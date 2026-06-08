"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/auth";
import { CreateCampaignModal } from "./CreateCampaignModal";
import { CampaignList } from "./CampaignList";
import { ViewCampaignModal } from "./ViewCampaignModal";

interface CreateCampaignProps {
  isDark: boolean;
}

export function CreateCampaign({ isDark }: CreateCampaignProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | number>("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 9;
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  const sectionStyle = isDark
    ? "border-slate-800/70 bg-slate-900/80 shadow-2xl shadow-slate-950/20"
    : "border-slate-200/70 bg-white/90 shadow-xl shadow-slate-900/10";
  const mutedText = isDark ? "text-slate-400" : "text-slate-500";

  const fetchCampaigns = async () => {
    setListLoading(true);
    setListError(null);

    const token = getAccessToken();
    const payload: any = { page, limit, search };
    if (status !== "") payload.status = status;

    const queryParams = new URLSearchParams(
      Object.entries(payload).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    try {
      const response = await fetch(`http://localhost:5000/campaign/v1/getall?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

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
        list = resData.data || resData.campaigns || resData.results || resData.list || [];
        total = resData.pagination?.total || resData.total || resData.count || list.length;
      }

      setCampaigns(list);
      setTotalCount(total);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      setListError(err instanceof Error ? err.message : "Failed to load campaigns.");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [page, status, search, refreshKey]);

  const openModal = () => {
    setIsOpen(true);
  };

  const handleCampaignCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleSearchSubmit = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleViewDetails = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setViewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <section className={`rounded-[2rem] p-8 border flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 hover:border-sky-500/30 ${sectionStyle}`}>
        <div className="space-y-2 text-center md:text-left">
          <h2 className={isDark ? "text-2xl font-bold text-white tracking-tight" : "text-2xl font-bold text-slate-950 tracking-tight"}>
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
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Campaign
        </button>
      </section>

      <CampaignList
        isDark={isDark}
        campaigns={campaigns}
        listLoading={listLoading}
        listError={listError}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
        status={status}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onRefresh={fetchCampaigns}
        onViewDetails={handleViewDetails}
        page={page}
        limit={limit}
        totalCount={totalCount}
        onPageChange={setPage}
      />

      <CreateCampaignModal isDark={isDark} isOpen={isOpen} onClose={() => setIsOpen(false)} onCreated={handleCampaignCreated} />
      <ViewCampaignModal isDark={isDark} isOpen={viewModalOpen} campaignId={selectedCampaignId} onClose={() => setViewModalOpen(false)} />
    </div>
  );
}
