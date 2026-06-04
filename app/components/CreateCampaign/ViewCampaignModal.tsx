"use client";

import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { getAccessToken } from "@/lib/auth";

interface ViewCampaignModalProps {
  isDark: boolean;
  isOpen: boolean;
  campaignId: string | null;
  onClose: () => void;
}

const formatFailedRow = (row: any, index: number) => {
  if (row == null) {
    return <p className="text-slate-600">No details available.</p>;
  }

  if (typeof row === "object" && !Array.isArray(row)) {
    const rowNumber = row.row ?? row.rowNumber ?? row.index ?? index + 1;
    const reason =
      row.reason ??
      row.error ??
      row.message ??
      row.details ??
      JSON.stringify(row);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-slate-900">Row {rowNumber}</p>
          <span className="rounded-full bg-rose-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-rose-700">
            Error
          </span>
        </div>
        <p className="text-slate-600">{String(reason)}</p>
      </div>
    );
  }

  if (Array.isArray(row)) {
    return (
      <div className="space-y-2">
        <p className="font-semibold text-slate-900">Row {index + 1}</p>
        <p className="text-slate-600">
          {row.map((cell) => String(cell)).join(", ")}
        </p>
      </div>
    );
  }

  return <p className="text-slate-600">{String(row)}</p>;
};

export function ViewCampaignModal({
  isDark,
  isOpen,
  campaignId,
  onClose,
}: ViewCampaignModalProps) {
  const [viewLoading, setViewLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [viewError, setViewError] = useState("");
  const [templateError, setTemplateError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [campaignRunId, setCampaignRunId] = useState("");
  const [viewStep, setViewStep] = useState<"selectTemplate" | "uploadContacts">(
    "selectTemplate",
  );
  const [nextLoading, setNextLoading] = useState(false);
  const [nextError, setNextError] = useState("");
  const [uploadMethod] = useState<"file" | "paste">("file");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [manualContacts, setManualContacts] = useState("");
  const [contacts, setContacts] = useState<string[]>([]);
  const [uploadedContacts, setUploadedContacts] = useState<
    { id?: string; value: string }[]
  >([]);
  const [uploadStats, setUploadStats] = useState<{
    message?: string;
    totalRows?: number;
    successCount?: number;
    failedCount?: number;
    missingColumns?: string | string[];
    failedRows?: any[];
  } | null>(null);
  const [showFailedDetails, setShowFailedDetails] = useState(false);
  const [launchPopupOpen, setLaunchPopupOpen] = useState(false);
  const [launchLoading, setLaunchLoading] = useState(false);
  const [launchError, setLaunchError] = useState("");
  const [scheduleAt, setScheduleAt] = useState("");
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [contactMessage, setContactMessage] = useState("");
  const [contactError, setContactError] = useState("");

  const parseResponseBody = async (response: Response) => {
    try {
      return await response.json();
    } catch {
      const text = await response.text();
      return text || null;
    }
  };

  const sectionStyle = isDark
    ? "border-slate-800 bg-slate-900 text-white"
    : "border-slate-200 bg-white text-slate-900";
  const modalStyle = isDark
    ? "border-slate-800 bg-slate-950/95 text-white backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.25)]"
    : "border-white/40 bg-white/90 text-slate-900 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.25)]";

  const resetState = () => {
    setTemplates([]);
    setSelectedCampaign(null);
    setSelectedTemplate(null);
    setCampaignRunId("");
    setViewStep("selectTemplate");
    setNextError("");
    setUploadFile(null);
    setUploadComplete(false);
    setManualContacts("");
    setContacts([]);
    setUploadedContacts([]);
    setUploadStats(null);
    setLaunchPopupOpen(false);
    setLaunchLoading(false);
    setLaunchError("");
    setScheduleAt("");
    setToast(null);
    setContactMessage("");
    setContactError("");
    setShowFailedDetails(false);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      resetState();
      return;
    }

    if (!campaignId) {
      setViewError("Missing campaign ID.");
      return;
    }

    const fetchDetails = async () => {
      setViewLoading(true);
      setTemplateError("");
      setViewError("");

      const token = getAccessToken();

      try {
        const campaignResponse = await fetch(
          `https://apiwhatsapp.blackstoneinfomaticstech.com/campaign/v1/${campaignId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!campaignResponse.ok) {
          throw new Error(
            `Failed to fetch campaign (${campaignResponse.status})`,
          );
        }

        const campaignData = await parseResponseBody(campaignResponse);
        if (typeof campaignData === "string") {
          throw new Error(
            `Failed to parse campaign response: ${campaignData}`,
          );
        }
        setSelectedCampaign(campaignData?.data || campaignData);

        const templateResponse = await fetch(
          "https://apiwhatsapp.blackstoneinfomaticstech.com/templates/v1/getall?status=APPROVED",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!templateResponse.ok) {
          throw new Error(
            `Failed to fetch templates (${templateResponse.status})`,
          );
        }

        const templateData = await parseResponseBody(templateResponse);
        if (typeof templateData === "string") {
          throw new Error(
            `Failed to parse templates response: ${templateData}`,
          );
        }
        setTemplates(templateData?.data || []);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load data";
        setViewError(message);
        setTemplateError(message);
      } finally {
        setViewLoading(false);
      }
    };

    fetchDetails();
  }, [campaignId, isOpen]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleClose = () => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    onClose();
    resetState();
  };

  const parseContactsFromFile = async (file: File): Promise<string[]> => {
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      throw new Error(
        "Unsupported file type. Please upload an .xlsx or .xls file.",
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) return [];

    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<any>(worksheet, {
      header: 1,
      blankrows: false,
    });

    return rows
      .filter(Array.isArray)
      .map((row) =>
        row.map((cell) => String(cell ?? "").trim()).filter(Boolean),
      )
      .map((columns) => columns[0] ?? "")
      .filter(Boolean);
  };

  const handleContinueToUpload = async () => {
    if (!selectedCampaign || !selectedTemplate) {
      setNextError("Please select a campaign and template before continuing.");
      return;
    }

    setNextError("");
    setNextLoading(true);

    const campaignIdValue = selectedCampaign._id || selectedCampaign.id;
    const templateId = selectedTemplate.id || selectedTemplate._id;

    try {
      const response = await fetch(
        "https://apiwhatsapp.blackstoneinfomaticstech.com/campaignrun/v1/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAccessToken()}`,
          },
          body: JSON.stringify({ campaignId: campaignIdValue, templateId }),
        },
      );

      if (!response.ok) {
        let message = `Failed to create campaign run (${response.status})`;
        try {
          const errorBody = await response.json();
          message = errorBody.message || errorBody.error || message;
        } catch {
          // ignore parse failures
        }
        throw new Error(message);
      }

      const runData = await parseResponseBody(response);
      if (typeof runData === "string") {
        throw new Error(`Invalid campaign run response: ${runData}`);
      }
      const newRunId =
        runData?.data?._id ||
        runData?.data?.id ||
        runData?.id ||
        runData?.runId ||
        runData?.campaignRunId ||
        "";
      setCampaignRunId(String(newRunId));
      setViewStep("uploadContacts");
      setUploadComplete(false);
      setContactMessage("");
      setContactError("");
    } catch (error) {
      setNextError(
        error instanceof Error
          ? error.message
          : "Unable to continue to upload contacts.",
      );
      console.error("Campaign run creation error:", error);
    } finally {
      setNextLoading(false);
    }
  };

  const parseNumericStat = (value: any, fallback: number) => {
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  };

  const normalizeMissingColumns = (value: any): string[] => {
    if (Array.isArray(value)) {
      return value
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    if (typeof value === "string" && value.trim() !== "") {
      return value
        .split(/[\n,;]+/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  };

  const handleContactUpload = async () => {
    setContactError("");
    setContactMessage("");

    const rows =
      uploadMethod === "file"
        ? contacts
        : manualContacts
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);

    if (rows.length === 0) {
      setContactError("Please provide at least one contact before uploading.");
      return;
    }
    if (!campaignRunId) {
      setContactError("Campaign run ID is missing.");
      return;
    }

    setNextLoading(true);

    try {
      const uploadUrl = `https://apiwhatsapp.blackstoneinfomaticstech.com/campaigncontact/v1/${campaignRunId}/upload`;
      let response: Response;

      if (uploadFile) {
        const formData = new FormData();
        formData.append("file", uploadFile);
        response = await fetch(uploadUrl, {
          method: "POST",
          headers: { Authorization: `Bearer ${getAccessToken()}` },
          body: formData,
        });
      } else {
        response = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAccessToken()}`,
          },
          body: JSON.stringify({ contacts: rows }),
        });
      }

      if (!response.ok) {
        let message = `Failed to upload contacts (${response.status})`;
        try {
          const payload = await response.json();
          message = payload.message || payload.error || message;
        } catch {
          const text = await response.text();
          if (text) message = text;
        }
        throw new Error(message);
      }

      const result = await parseResponseBody(response);
      if (typeof result === "string") {
        throw new Error(`Invalid upload response: ${result}`);
      }
      const payloadData = result?.data || result?.contacts || result;
      let uploadedItems: { id?: string; value: string }[] = [];

      if (Array.isArray(payloadData)) {
        uploadedItems = payloadData.map((item: any) => ({
          id: typeof item === "object" ? item._id || item.id : undefined,
          value:
            typeof item === "string"
              ? item
              : item.phone ||
                item.contact ||
                item.number ||
                item.value ||
                JSON.stringify(item),
        }));
      }

      if (uploadedItems.length === 0) {
        uploadedItems = rows.map((value) => ({ value }));
      }

      const uploadSummary = {
        message:
          result?.message ||
          `Uploaded ${uploadedItems.length} contact${uploadedItems.length === 1 ? "" : "s"}.`,
        totalRows: parseNumericStat(result?.totalRows, uploadedItems.length),
        successCount: parseNumericStat(
          result?.successCount,
          uploadedItems.length,
        ),
        failedCount: parseNumericStat(result?.failedCount, 0),
        missingColumns: normalizeMissingColumns(result?.missingColumns),
        failedRows: Array.isArray(result?.failedRows) ? result.failedRows : [],
      };

      setUploadedContacts(uploadedItems);
      setUploadStats(uploadSummary);
      setContactMessage(
        uploadSummary.message || "Contacts uploaded successfully.",
      );
      setUploadComplete(true);
      setContacts([]);
      setUploadFile(null);
      setManualContacts("");
    } catch (error) {
      setContactError(
        error instanceof Error ? error.message : "Failed to upload contacts.",
      );
    } finally {
      setNextLoading(false);
    }
  };

  const handleDeleteFile = async () => {
    setContactError("");
    setContactMessage("");

    if (!campaignRunId) {
      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setContacts([]);
      setUploadComplete(false);
      setUploadedContacts([]);
      setContactMessage("Excel file removed locally.");
      return;
    }

    setNextLoading(true);

    try {
      const response = await fetch(
        `https://apiwhatsapp.blackstoneinfomaticstech.com/campaigncontact/v1/${campaignRunId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getAccessToken()}` },
        },
      );

      if (!response.ok) {
        let message = `Failed to delete uploaded contacts (${response.status})`;
        try {
          const payload = await response.json();
          message = payload.message || payload.error || message;
        } catch {
          const text = await response.text();
          if (text) message = text;
        }
        throw new Error(message);
      }

      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setContacts([]);
      setUploadedContacts([]);
      setUploadComplete(false);
      setContactMessage("Uploaded contacts deleted successfully.");
    } catch (error) {
      setContactError(
        error instanceof Error
          ? error.message
          : "Failed to delete uploaded contacts.",
      );
    } finally {
      setNextLoading(false);
    }
  };

  const handleNextAfterUpload = () => {
    if (!uploadComplete) {
      setContactError("Upload contacts before continuing to the next step.");
      return;
    }
    setNextError("");
    setLaunchError("");
    setScheduleAt("");
    setLaunchPopupOpen(true);
  };

  const formatToUTCDateTime = (localDateTime: string) => {
    if (!localDateTime) return "";
    const localDate = new Date(localDateTime);
    return localDate.toISOString();
  };

  const handleLaunchCampaign = async (options?: { scheduledAt?: string }) => {
    if (!campaignRunId) {
      setLaunchError("Missing campaign run ID.");
      return;
    }

    setLaunchError("");
    setLaunchLoading(true);

    try {
      const launchUrl = `https://apiwhatsapp.blackstoneinfomaticstech.com/campaignrun/v1/${campaignRunId}/launch`;
      const payload = options?.scheduledAt
        ? { runType: "SCHEDULED", scheduledAt: options.scheduledAt }
        : { runType: "INSTANT" };

      const response = await fetch(launchUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let message = `Failed to launch campaign run (${response.status})`;
        try {
          const body = await response.json();
          message = body.message || body.error || message;
        } catch {
          const text = await response.text();
          if (text) message = text;
        }
        throw new Error(message);
      }

      setToast({
        type: "success",
        message: "Campaign launched successfully.",
      });
      setLaunchPopupOpen(false);
      setLaunchLoading(false);
      setContactMessage("Campaign launch request sent successfully.");
      setViewLoading(false);
      setViewStep("selectTemplate");

      toastTimerRef.current = window.setTimeout(() => {
        onClose();
      }, 2200);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to launch the campaign run.";
      setLaunchError(message);
      setToast({ type: "error", message });
    } finally {
      setLaunchLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentStep = viewStep === "selectTemplate" ? 1 : 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div
        className={`relative z-10 w-full max-w-7xl max-h-[90vh] overflow-y-auto rounded-[2rem] border p-8 ${modalStyle}`}
      >
        <button
          onClick={handleClose}
          className={`absolute right-5 top-2 rounded-full p-1 transition ${isDark ? "hover:bg-slate-800 cursor-pointer text-slate-400 hover:text-white" : "hover:bg-slate-100 cursor-pointer text-slate-500 hover:text-slate-900 p-2"}`}
        >
          ✕
        </button>

        {toast && (
          <div
            className={`mb-6 rounded-3xl border px-5 py-4 text-sm ${
              toast.type === "success"
                ? isDark
                  ? "border-emerald-300/30 bg-emerald-500/10 text-emerald-100"
                  : "border-emerald-300/30 bg-emerald-50 text-emerald-900"
                : isDark
                  ? "border-rose-300/30 bg-rose-500/10 text-rose-100"
                  : "border-rose-300/30 bg-rose-50 text-rose-900"
            }`}
          >
            {toast.message}
          </div>
        )}

        {viewLoading ? (
          <div className="py-10 text-center">
            <p className={isDark ? "text-slate-400" : "text-slate-500"}>
              Loading campaign...
            </p>
          </div>
        ) : viewError ? (
          <div className="py-10 text-center">
            <p className="text-red-400">{viewError}</p>
          </div>
        ) : selectedCampaign ? (
          <div className="space-y-6">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">
                    Campaign Configuration
                  </h2>
                  <p
                    className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Configure and launch your WhatsApp campaign
                  </p>
                </div>

                <div
                  className={`rounded-2xl px-4 py-2 text-sm ${
                    isDark
                      ? "bg-slate-800 text-slate-300"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {templates.length} Templates
                </div>
              </div>

              <div className="mt-8 flex items-center">
                {[
                  { step: 1, title: "Template" },
                  { step: 2, title: "Contacts" },
                  { step: 3, title: "Launch" },
                ].map((item, index) => (
                  <div key={item.step} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold transition-all
            ${
              currentStep >= item.step
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                : isDark
                  ? "bg-slate-800 text-slate-400"
                  : "bg-slate-200 text-slate-500"
            }`}
                      >
                        {currentStep > item.step ? "✓" : item.step}
                      </div>

                      <span className="mt-2 text-xs font-medium">
                        {item.title}
                      </span>
                    </div>

                    {index !== 2 && (
                      <div
                        className={`mx-4 h-1 flex-1 rounded-full ${
                          currentStep > item.step
                            ? "bg-emerald-500"
                            : isDark
                              ? "bg-slate-800"
                              : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            {viewStep === "selectTemplate" ? (
              <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 cursor-pointer gap-5">
                  {templates.map((template, index) => (
                    <div
                      key={template.id || index}
                      onClick={() => setSelectedTemplate(template)}
                      className={`group relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                        selectedTemplate?.id === template.id
                          ? "ring-2 ring-emerald-500 shadow-xl shadow-emerald-500/20"
                          : ""
                      }
${
  isDark
    ? " border-slate-700 bg-gradient-to-br from-slate-900 to-slate-950 hover:border-sky-500/40"
    : " border-slate-200 bg-gradient-to-br from-white to-slate-50 hover:border-sky-300"
}`}
                    >
                      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-sky-500/10 blur-3xl" />
                      <div className="flex flex-wrap items-center gap-10 w-full">
                        <span className="rounded-sm border bg-sky-500/10 px-3 py-1 text-[10px] font-medium text-sky-400">
                          {template.category}
                        </span>
                        <span
                          className={`rounded-sm border px-3 py-1 text-[10px] font-medium ${template.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400" : template.status === "PENDING" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"}`}
                        >
                          {template.status}
                        </span>
                      </div>
                      <div className="justify-between h-full flex flex-col p-2 py-3">
                        <div className="mt-5">
                          <h4 className="font-semibold text-base">
                            {template.name}
                          </h4>
                          <p
                            className={`mt-3 line-clamp-4 text-xs leading-6 ${
                              isDark ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            {template.components?.find(
                              (c: any) => c.type === "BODY",
                            )?.text || "No preview available"}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTemplate(template);
                              setPreviewOpen(true);
                            }}
                            className={`rounded-lg border px-3 py-1 cursor-pointer text-xs font-semibold transition ${
                              isDark
                                ? "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            Preview
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTemplate(template);
                            }}
                            className={`rounded-lg px-3 py-1 text-xs cursor-pointer font-semibold text-white transition-all duration-300 ${
                              selectedTemplate?.id === template.id
                                ? "bg-emerald-500 hover:scale-105 shadow-lg shadow-emerald-500/20"
                                : "bg-gradient-to-r from-sky-500 to-indigo-500 hover:scale-105 hover:brightness-110"
                            }`}
                          >
                            {selectedTemplate?.id === template.id
                              ? "Selected ✓"
                              : "Select"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  className={`
    sticky top-0 h-fit rounded-3xl border p-6
    ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-slate-50"}
  `}
                >
                  <h3 className="text-lg font-semibold">Campaign Summary</h3>

                  <div className="mt-6 space-y-5 ">
                    <div className="flex flex-1 justify-between">
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Campaign Name
                      </p>

                      <p className="-mt-1 font-medium text-[14px]">
                        {selectedCampaign?.campaignName ||
                          selectedCampaign?.name ||
                          "Campaign"}
                      </p>
                    </div>

                    <div className="flex flex-1 justify-between">
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Template Name
                      </p>

                      <p className="-mt-1 font-medium text-[14px]">
                        {selectedTemplate?.name || "Not selected"}
                      </p>
                    </div>

                    <div className="flex flex-1 justify-between">
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Status
                      </p>

                      <span className="-mt-1 inline-flex rounded-md border bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                        {selectedTemplate ? "Ready" : "Waiting"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div
                  className={`rounded-[2rem] border p-6 ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">Upload Contacts</h3>
                      <p
                        className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
                      >
                        Use the campaign run ID to upload contacts directly
                        inside this modal.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
                    <div className="space-y-4">
                      <div className="space-y-3 border border-dashed p-4 rounded-xl border-slate-200 bg-slate-50">
                        <label className="block text-sm font-medium text-slate-700">
                          Excel file
                        </label>
                        <div className="w-full">
                          <label
                            htmlFor="contact-upload"
                            className={`group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-8 transition-all duration-300
      ${
        isDark
          ? "border-slate-700 bg-slate-900/60 hover:border-violet-500 hover:bg-slate-900"
          : "border-slate-300 bg-gradient-to-br from-white to-slate-50 hover:border-violet-400 hover:shadow-lg"
      }`}
                          >
                            <div
                              className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl
        ${
          isDark
            ? "bg-violet-500/10 text-violet-400"
            : "bg-violet-100 text-violet-600"
        }`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-7 w-7"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                                />
                              </svg>
                            </div>

                            <h3
                              className={`text-base font-semibold ${
                                isDark ? "text-white" : "text-slate-900"
                              }`}
                            >
                              Upload Contact File
                            </h3>

                            <p
                              className={`mt-1 text-sm ${
                                isDark ? "text-slate-400" : "text-slate-500"
                              }`}
                            >
                              Drag & drop or click to browse
                            </p>

                            <span
                              className={`mt-3 rounded-full px-3 py-1 text-xs font-medium
        ${
          isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
        }`}
                            >
                              Supports .xlsx & .xls
                            </span>

                            {uploadFile && (
                              <div
                                className={`mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm
          ${
            isDark
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-emerald-50 text-emerald-700"
          }`}
                              >
                                ✓ {uploadFile.name}
                              </div>
                            )}
                          </label>

                          <input
                            id="contact-upload"
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] ?? null;
                              setUploadFile(file);
                              setContactError("");
                              setContactMessage("");

                              if (file) {
                                parseContactsFromFile(file)
                                  .then((rows) => setContacts(rows))
                                  .catch((err) => {
                                    console.error(
                                      "Failed to parse upload file:",
                                      err,
                                    );
                                    setContacts([]);
                                    setContactError(
                                      "Unable to parse the selected file. Please use an Excel file (.xlsx or .xls).",
                                    );
                                  });
                              } else {
                                setContacts([]);
                              }
                            }}
                          />
                        </div>
                        <p className="text-xs text-slate-500">
                          One contact per row. The first populated column is
                          used.
                        </p>
                      </div>

                      {contactError && (
                        <p className="text-sm text-red-500">{contactError}</p>
                      )}
                      {contactMessage && (
                        <p className="text-sm text-emerald-600">
                          {contactMessage}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={handleContactUpload}
                          disabled={nextLoading}
                          className="rounded-lg bg-gradient-to-r from-emerald-600 to-green-500 cursor-pointer px-2 py-2 text-xs font-semibold text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {nextLoading ? "Uploading..." : "Upload contacts"}
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteFile}
                          className="rounded-lg border border-red-300 bg-red-50 cursor-pointer px-2 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          Delete file
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                      {uploadedContacts.length === 0 &&
                      contacts.length === 0 ? (
                        <p>No contacts loaded yet.</p>
                      ) : (
                        <div className="space-y-3 overflow-y-scroll max-h-full scrollbar-none">
                          <div>
                            <p className="font-semibold">Preview</p>
                          </div>
                          <div className="text-[10px] text-slate-700 space-y-1">
                            <div className="flex justify-between">
                              <p className="font-medium">Total Contacts</p>
                              <p className="text-slate-500">
                                {uploadStats?.totalRows ??
                                  (uploadedContacts.length > 0
                                    ? uploadedContacts.length
                                    : contacts.length)}
                              </p>
                            </div>
                            <div className="flex justify-between">
                              <p className="font-medium">Success Counts</p>
                              <p className="mt-1 text-slate-500">
                                {uploadStats?.successCount ??
                                  (uploadedContacts.length > 0
                                    ? uploadedContacts.length
                                    : contacts.length)}
                              </p>
                            </div>
                            <div className="flex justify-between">
                              <p className="font-medium">Failed Counts</p>
                              <p className="mt-1 text-slate-500">
                                {uploadStats?.failedCount ?? 0}
                              </p>
                            </div>
                          </div>

                          {uploadStats?.failedCount ||
                          uploadStats?.failedRows?.length ||
                          uploadStats?.missingColumns?.length ? (
                            <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-slate-900 shadow-sm">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <p className="font-semibold text-[11px] text-slate-900">
                                    Failed Upload Details
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowFailedDetails((prev) => !prev)
                                  }
                                  className="inline-flex items-center rounded-lg border border-rose-200 bg-white px-2 py-1 text-[11px] font-semibold text-rose-700 transition hover:bg-rose-100"
                                >
                                  {showFailedDetails ? "Hide" : "Show"}
                                </button>
                              </div>

                              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-rose-200 bg-white p-2">
                                  <p className="text-[11px] text-rose-600">
                                    Failed rows
                                  </p>
                                  <p className="mt-2 text-sm font-semibold text-slate-900">
                                    {uploadStats?.failedCount ?? 0}
                                  </p>
                                </div>
                                <div className="rounded-2xl border border-amber-200 bg-white p-2">
                                  <p className="text-[11px] text-amber-600">
                                    Missing columns
                                  </p>
                                  <p className="mt-2 text-xs text-slate-700">
                                    {Array.isArray(
                                      uploadStats?.missingColumns,
                                    ) && uploadStats.missingColumns.length
                                      ? uploadStats.missingColumns.join(", ")
                                      : "None"}
                                  </p>
                                </div>
                              </div>
                              {showFailedDetails && (
                                <div className="mt-4 space-y-3">
                                  <p className="text-[11px] font-semibold text-slate-900">
                                    Error details
                                  </p>
                                  {uploadStats?.failedRows?.length ? (
                                    <div className="space-y-3">
                                      {uploadStats.failedRows.map(
                                        (row, index) => (
                                          <div
                                            key={index}
                                            className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                                          >
                                            {formatFailedRow(row, index)}
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-slate-600 text-[10px]">
                                      No detailed failed rows available.
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div
              className={`sticky bottom-0
border-t
backdrop-blur-2xl
shadow-[0_-10px_30px_rgba(0,0,0,0.05)] flex items-center justify-between rounded-2xl border p-5 backdrop-blur-xl ${isDark ? "border-slate-700 bg-slate-900/80" : "border-slate-200 bg-white/80"}`}
            >
              <div>
                <p className="font-semibold">
                  {selectedTemplate
                    ? selectedTemplate.name
                    : "No template selected"}
                </p>
                <p
                  className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  Continue to next step after selecting template
                </p>
              </div>
              <div className="flex flex-col items-end gap-3">
                {nextError && (
                  <p className="text-xs text-red-400">{nextError}</p>
                )}
                {viewStep === "uploadContacts" ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setViewStep("selectTemplate")}
                      className="rounded-lg cursor-pointer border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNextAfterUpload}
                      disabled={!uploadComplete}
                      className="rounded-lg cursor-pointer bg-gradient-to-r from-emerald-500 to-green-500 px-5 py-2 text-sm font-bold text-white shadow-lg transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleContinueToUpload}
                    disabled={!selectedTemplate || nextLoading}
                    className="rounded-2xl cursor-pointer bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {nextLoading ? "Preparing upload..." : "Next Step →"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {launchPopupOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setLaunchPopupOpen(false)}
          />
          <div
            className={`relative z-10 w-full max-w-md rounded-[1.5rem] border p-6 shadow-2xl ${isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">Launch Campaign</p>
                <p className="mt-1 text-sm text-slate-500">
                  Run ID:{" "}
                  <span className="font-mono text-xs text-slate-700">
                    {campaignRunId}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLaunchPopupOpen(false)}
                className="rounded-full bg-slate-200/80 px-2 py-1 text-sm text-slate-700 transition hover:bg-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm text-slate-700">
              {launchError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-red-700">
                  {launchError}
                </div>
              ) : null}
              <p>
                Select one of the options below to launch your campaign run
                immediately or schedule it for later.
              </p>

              <div className="space-y-3">
                <div
                  onClick={() => handleLaunchCampaign()}
                  className="group cursor-pointer rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-5 transition-all hover:scale-[1.02] hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900">
                        ⚡ Send Immediately
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        Launch campaign and start delivery now.
                      </p>
                    </div>

                    <div className="text-2xl transition-transform group-hover:translate-x-1">
                      →
                    </div>
                  </div>
                </div>

                <div
                  className={`
      rounded-3xl border p-5
      ${
        isDark
          ? "border-slate-700 bg-slate-900"
          : "border-slate-200 bg-slate-50"
      }
    `}
                >
                  <div className="mb-4">
                    <h4 className="font-semibold">📅 Schedule Campaign</h4>

                    <p className="mt-1 text-sm text-slate-500">
                      Choose when messages should be delivered.
                    </p>
                  </div>

                  <input
                    type="datetime-local"
                    value={scheduleAt}
                    onChange={(e) => {
                      setScheduleAt(e.target.value);
                      setLaunchError("");
                    }}
                    className={`
        w-full rounded-2xl border px-4 py-3 text-sm outline-none
        ${
          isDark ? "border-slate-700 bg-slate-950" : "border-slate-300 bg-white"
        }
      `}
                  />

                  <button
                    onClick={() => {
                      if (!scheduleAt) {
                        setLaunchError("Please choose a schedule time first.");
                        return;
                      }

                      handleLaunchCampaign({
                        scheduledAt: formatToUTCDateTime(scheduleAt),
                      });
                    }}
                    disabled={launchLoading}
                    className="mt-4 w-full rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 py-3 font-semibold text-white shadow-lg transition hover:brightness-110"
                  >
                    {launchLoading ? "Scheduling..." : "Schedule Campaign"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewOpen && selectedTemplate && (
        <div className="fixed inset-0 bg-black/60 z-[80] flex justify-center items-center p-5">
          <div className="relative w-full max-w-2xl">
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute -top-5 right-0 text-white text-3xl"
            >
              ×
            </button>

            <div className="p-3 shadow-2xl">
              <div className="bg-[#e5ddd5] rounded-[32px] p-4 min-h-[550px] relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-[url('https://i.imgur.com/7yUvePI.png')]" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between bg-[#f0f2f5] px-4 py-3 border-b border-[#d1d7db] -mx-4 -mt-4 mb-4 rounded-t-[28px]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-300">
                        <img
                          src="https://i.pravatar.cc/100"
                          alt="profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-medium text-[#111b21]">
                          {selectedTemplate.createdBy || "Unknown User"}
                        </h3>
                        <p className="text-[12px] text-[#667781]">online</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 text-[#54656f]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14"
                        />
                        <rect width="12" height="10" x="3" y="7" rx="2" />
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="5" r="1.8" />
                        <circle cx="12" cy="12" r="1.8" />
                        <circle cx="12" cy="19" r="1.8" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="max-w-[72%] bg-white rounded-[8px] rounded-tl-none px-3 py-2 shadow-sm relative">
                      {selectedTemplate.components?.find(
                        (c: any) => c.type === "HEADER",
                      )?.text && (
                        <h2 className="font-semibold text-[15px] text-[#111b21] mb-2">
                          {
                            selectedTemplate.components.find(
                              (c: any) => c.type === "HEADER",
                            )?.text
                          }
                        </h2>
                      )}

                      <div className="text-[14px] leading-6 text-[#111b21] whitespace-pre-line break-words">
                        {(
                          selectedTemplate.components.find(
                            (c: any) => c.type === "BODY",
                          )?.text || ""
                        )
                          .split(/(\{\{\d+\}\})/g)
                          .map((part: string, index: number) => {
                            const match = part.match(/\{\{(\d+)\}\}/);
                            if (match) {
                              const variableNumber = match[1];
                              const variableName =
                                selectedTemplate.variables?.[
                                  Number(variableNumber) - 1
                                ];
                              return (
                                <button
                                  key={index}
                                  className="inline-flex items-center gap-1 bg-[#e7f3ff] text-[#027eb5] px-2 py-[2px] rounded-md text-[12px] font-medium mx-[2px] hover:bg-[#d8ecff] transition"
                                >
                                  {variableName || `{{${variableNumber}}}`}
                                </button>
                              );
                            }
                            return <span key={index}>{part}</span>;
                          })}
                      </div>

                      {selectedTemplate.components?.find(
                        (c: any) => c.type === "FOOTER",
                      )?.text && (
                        <p className="text-[12px] text-[#667781] mt-3">
                          {
                            selectedTemplate.components.find(
                              (c: any) => c.type === "FOOTER",
                            )?.text
                          }
                        </p>
                      )}

                      <div className="mt-4 border-t border-[#e9edef] pt-2 space-y-2">
                        {selectedTemplate.components
                          ?.find((c: any) => c.type === "BUTTONS")
                          ?.buttons?.map((btn: any, index: number) => (
                            <button
                              key={index}
                              className="w-full text-center text-[#00a884] text-[14px] font-medium py-2 hover:bg-[#f5f6f6] rounded-lg transition"
                            >
                              {btn.text}
                            </button>
                          ))}
                      </div>

                      <div className="flex justify-end items-center mt-1">
                        <span className="text-[11px] text-[#667781]">
                          12:45 PM
                        </span>
                      </div>

                      <div className="absolute top-0 -left-2 w-3 h-3 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
