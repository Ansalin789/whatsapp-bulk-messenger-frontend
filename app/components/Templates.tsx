"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Eye,
  FileText,
  Hash,
  Languages,
  MessageSquareText,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { getAccessToken } from "@/lib/auth";
import { getUserId, getUsername } from "@/utils/authStorage";
import convertNamedToPositional, {
  escapeRegExp,
} from "@/utils/placeholderUtils";
interface Button {
  type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER";

  text: string;

  url?: string;

  phone_number?: string;
}

interface HeaderComponent {
  type: "HEADER";

  format: "TEXT" | "IMAGE" | "VIDEO";

  text?: string;

  example?: {
    header_handle: string[];
  };
}

interface BodyComponent {
  type: "BODY";

  text: string;

  example?: {
    body_text: string[][];
  };
}

interface FooterComponent {
  type: "FOOTER";

  text: string;
}

interface ButtonsComponent {
  type: "BUTTONS";

  buttons: Button[];
}

type TemplateComponent =
  | HeaderComponent
  | BodyComponent
  | FooterComponent
  | ButtonsComponent;

interface TemplatePayload {
  tenantId: string;

  name: string;

  category: "UTILITY" | "MARKETING" | "AUTHENTICATION";

  language: string;

  parameterFormat?: "POSITIONAL" | "NAMED";

  components: TemplateComponent[];

  variables: string[];

  createdBy: string;
}

interface TemplatesProps {
  isDark: boolean;
}

export function Templates({ isDark }: TemplatesProps) {
  const [viewOpen, setViewOpen] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const [tenantId, setTenantId] = useState("");

  const [templateName, setTemplateName] = useState("");
  const [templateNameError, setTemplateNameError] = useState<string | null>(
    null,
  );
  const isTemplateNameValid = /^[a-z0-9_]+$/.test(templateName.trim());

  const [category, setCategory] = useState("UTILITY");

  const [parameterFormat, setParameterFormat] = useState<
    "POSITIONAL" | "NAMED"
  >("POSITIONAL");

  const [hasVariables, setHasVariables] = useState(false);

  const [languages, setLanguages] = useState<string[]>(["en_US"]);
  const [languageOption, setLanguageOption] = useState("en_US");

  const [createdBy, setCreatedBy] = useState("");

  const [header, setHeader] = useState("");

  const [body, setBody] = useState("");

  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {},
  );

  const [search, setSearch] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [previewValues, setPreviewValues] = useState<Record<string, string>>(
    {},
  );

  const [footer, setFooter] = useState("");

  const [variableMode, setVariableMode] = useState<
    "WITH_VARIABLES" | "WITHOUT_VARIABLES"
  >("WITHOUT_VARIABLES");
  const [mediaType, setMediaType] = useState<string>("");
  const [buttons, setButtons] = useState<string[]>([]);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [mediaId, setMediaId] = useState<string>("");
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string>("");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const headerComponent = selectedTemplate?.components?.find(
    (c: any) => c.type === "HEADER",
  );

  const isMediaTemplate =
    headerComponent?.format === "IMAGE" || headerComponent?.format === "VIDEO";

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name?.toLowerCase().includes(search.toLowerCase()) ||
      template.category?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "ALL" ? true : template.category === categoryFilter;

    const matchesStatus =
      statusFilter === "ALL" ? true : template.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sectionStyle = isDark
    ? "border-slate-800 bg-slate-900 text-white"
    : "border-slate-200 bg-white text-black";

  const inputStyle = isDark
    ? "bg-slate-800 border-slate-700 text-white"
    : "bg-white border-slate-300 text-black";

  const fetchTemplates = async () => {
    console.log("fetchTemplates called", {
      tenantId,
      createdBy,
      page: pagination.page,
      limit: pagination.limit,
      categoryFilter,
      statusFilter,
      search,
    });
    setListLoading(true);
    setListError(null);

    const token = getAccessToken();
    const queryParams = new URLSearchParams();
    if (tenantId) queryParams.append("tenantId", tenantId);
    if (createdBy) queryParams.append("createdBy", createdBy);

    try {
      const response = await fetch(
        `http://localhost:5000/templates/v1/getall?page=${pagination.page}&limit=${pagination.limit}&${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `HTTP Error: ${response.status} ${response.statusText}`,
        );
      }

      const resData = await response.json();
      console.log("fetchTemplates response data", resData);
      let list: any[] = [];

      if (resData && resData.success) {
        list = resData.data || [];
      } else if (Array.isArray(resData)) {
        list = resData;
      } else {
        list = resData.data || resData.templates || [];
      }

      setTemplates(list);
      setPagination({
        total: resData.pagination?.total || 0,

        page: resData.pagination?.page || 1,

        limit: resData.pagination?.limit || 10,

        totalPages: resData.pagination?.totalPages || 1,

        hasNextPage: resData.pagination?.hasNextPage || false,

        hasPreviousPage: resData.pagination?.hasPreviousPage || false,
      });
    } catch (err) {
      console.error("Error fetching templates:", err);
      setListError(
        err instanceof Error ? err.message : "Failed to load templates.",
      );
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (!createdBy) {
      const currentUser = getUsername();
      if (currentUser) {
        setCreatedBy(currentUser);
      }
    }

    if (!tenantId) {
      const currentUserId = getUserId();
      if (currentUserId) {
        setTenantId(currentUserId);
      }
    }
  }, [createdBy, tenantId]);

  useEffect(() => {
    console.log("useEffect fetchTemplates dependency change", {
      tenantId,
      createdBy,
      page: pagination.page,
    });
    fetchTemplates();
  }, [tenantId, createdBy, pagination.page]);

  useEffect(() => {
    return () => {
      if (mediaPreviewUrl) {
        URL.revokeObjectURL(mediaPreviewUrl);
      }
    };
  }, [mediaPreviewUrl]);

  const handleMediaUpload = async (file: File) => {
    console.log("handleMediaUpload called", {
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      mediaType,
      currentMediaId: mediaId,
      tenantId,
    });
    if (!file) return;
    if (!mediaType) {
      console.log("handleMediaUpload error: missing mediaType");
      setMediaError("Please select a media type first");
      return;
    }

    setMediaLoading(true);
    setMediaError(null);

    const token = getAccessToken();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mediaType", mediaType);

    const tenant = tenantId || getUserId() || "USR00002";

    if (!tenant) {
      setMediaError("Tenant ID missing");
      setMediaLoading(false);
      return;
    }

    formData.append("tenantId", tenant);
    console.log("handleMediaUpload form values", {
      mediaType,
      tenant,
      hasToken: !!token,
    });

    try {
      const response = await fetch(
        "http://localhost:5000/templatemedia/v1/upload",
        {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        },
      );
      console.log(
        "handleMediaUpload response status",
        response.status,
        response.statusText,
      );

      if (!response.ok) {
        let errorMessage = "Failed to upload media";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // ignore parse error
        }
        console.log("handleMediaUpload failed", errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Media upload response:", data);

      const uploadedMediaId =
        data?.data?.id ||
        data?.data?._id ||
        data?.data?.mediaId ||
        data?.id ||
        data?._id ||
        data?.mediaId;

      console.log("UPLOADED MEDIA ID", uploadedMediaId, { raw: data });

      if (uploadedMediaId) {
        setMediaId(uploadedMediaId);
        setUploadedFileName(file.name);
        setMediaError(null);
      } else {
        console.log("handleMediaUpload: no media id found in response", data);
        setMediaError("No media id received");
      }
    } catch (error) {
      console.error("Media upload error:", error);
      setMediaError(
        error instanceof Error ? error.message : "Failed to upload media",
      );
    } finally {
      setMediaLoading(false);
    }
  };

  const extractVariables = (text: string) => {
    const matches = text.match(/{{(.*?)}}/g) || [];

    return matches.map((item) => item.replace(/[{}]/g, ""));
  };

  const bodyPlaceholders = Array.from(new Set(extractVariables(body)));
  const showNoVariableWarning =
    variableMode === "WITHOUT_VARIABLES" && bodyPlaceholders.length > 0;

  const handleSave = async () => {
    console.log("handleSave called", {
      templateName,
      category,
      parameterFormat,
      variableMode,
      hasVariables,
      mediaType,
      mediaId,
      languages,
      footer,
      buttons,
      body,
      header,
    });
    const normalizedName = templateName.trim();
    const validNamePattern = /^[a-z0-9_]+$/;
    const variables = extractVariables(body);
    const hasBodyVariables = variables.length > 0;

    if (variableMode === "WITHOUT_VARIABLES" && hasBodyVariables) {
      console.log(
        "handleSave validation failed: body contains placeholders while in WITHOUT_VARIABLES mode",
        {
          variables,
        },
      );
      setSubmitMessage(
        "Remove placeholders from the body or switch to With Variables.",
      );
      return;
    }

    // ===============================
    // CATEGORY VALIDATIONS
    // ===============================

    // AUTHENTICATION VALIDATION

    if (category === "AUTHENTICATION") {
      const forbiddenWords = [
        "offer",
        "discount",
        "sale",
        "buy",
        "coupon",
        "deal",
        "cashback",
        "free",
      ];
      if (variableMode === "WITH_VARIABLES" && variables.length > 0) {
        const missingPreview = variables.some((v) => !previewValues[v]?.trim());
        if (missingPreview) {
          console.log("handleSave validation failed: missing preview values", {
            variables,
            previewValues,
          });
          setSubmitMessage(
            "Please fill in all preview values before submitting.",
          );
          return;
        }
      }
      const hasMarketingWords = forbiddenWords.some((word) =>
        body.toLowerCase().includes(word),
      );

      if (hasMarketingWords) {
        console.log(
          "handleSave validation failed: authentication contains marketing words",
          { body },
        );
        setSubmitMessage(
          "Authentication templates cannot contain marketing content.",
        );
        return;
      }

      if (variables.length > 3) {
        console.log(
          "handleSave validation failed: too many authentication variables",
          { variables },
        );
        setSubmitMessage(
          "Authentication templates should use minimal variables.",
        );
        return;
      }

      if (body.trim().length < 20) {
        console.log(
          "handleSave validation failed: authentication body too short",
          { bodyLength: body.trim().length },
        );
        setSubmitMessage("Authentication template content is too short.");
        return;
      }
    }

    // MARKETING VALIDATION

    if (category === "MARKETING") {
      const plainTextLength = body.replace(/{{(.*?)}}/g, "").trim().length;

      if (plainTextLength < 25) {
        console.log("handleSave validation failed: marketing body too short", {
          plainTextLength,
        });
        setSubmitMessage(
          "Marketing templates require meaningful promotional content.",
        );
        return;
      }

      if (variables.length > 5) {
        console.log(
          "handleSave validation failed: too many marketing variables",
          { variables },
        );
        setSubmitMessage("Too many variables for a marketing template.");
        return;
      }

      const spamWords = [
        "free money",
        "earn now",
        "winner",
        "click here",
        "100% free",
        "guaranteed profit",
      ];

      const hasSpam = spamWords.some((word) =>
        body.toLowerCase().includes(word),
      );

      if (hasSpam) {
        console.log("handleSave validation failed: marketing spam words", {
          body,
        });
        setSubmitMessage(
          "Marketing template contains restricted promotional wording.",
        );
        return;
      }
    }

    // UTILITY VALIDATION

    if (category === "UTILITY") {
      if (body.trim().length < 15) {
        console.log("handleSave validation failed: utility body too short", {
          bodyLength: body.trim().length,
        });
        setSubmitMessage(
          "Utility templates must contain meaningful service information.",
        );
        return;
      }

      const marketingWords = [
        "discount",
        "offer",
        "sale",
        "coupon",
        "buy now",
        "limited offer",
      ];

      const hasMarketingContent = marketingWords.some((word) =>
        body.toLowerCase().includes(word),
      );

      if (hasMarketingContent) {
        console.log(
          "handleSave validation failed: utility contains promotional content",
          { body },
        );
        setSubmitMessage(
          "Utility templates should not contain promotional content.",
        );
        return;
      }
    }

    if (!normalizedName) {
      console.log("handleSave validation failed: missing templateName");
      setSubmitMessage("Template name is required.");
      setTemplateNameError("Template name is required.");
      return;
    }

    if (!validNamePattern.test(normalizedName)) {
      const validationMessage =
        "Template name must contain only lowercase letters, numbers, and underscores.";
      console.log("handleSave validation failed: invalid templateName", {
        normalizedName,
      });
      setSubmitMessage(validationMessage);
      setTemplateNameError(validationMessage);
      return;
    }

    setTemplateNameError(null);

    // When parameterFormat is POSITIONAL we accept either numeric placeholders
    // or named placeholders entered by the user — named placeholders will be
    // converted to positional form before sending. Therefore do not reject
    // non-numeric placeholders here.

    if (
      hasVariables &&
      parameterFormat === "NAMED" &&
      variables.some((v) => /^\d+$/.test(v))
    ) {
      console.log("handleSave validation failed: named variables invalid", {
        variables,
      });
      setSubmitMessage(
        "For NAMED templates, placeholders must use names like {{customer_name}}.",
      );
      return;
    }

    if (
      variableMode === "WITH_VARIABLES" &&
      variables.length > 0 &&
      variables.some((v) => !previewValues[v]?.trim())
    ) {
      console.log(
        "handleSave validation failed: missing preview values before submit",
        {
          variables,
          previewValues,
        },
      );
      setSubmitMessage(
        "Please enter sample values for all variables before submitting.",
      );
      return;
    }

    if (languages.length === 0) {
      console.log("handleSave validation failed: no languages selected");
      setSubmitMessage("Please select at least one language.");
      return;
    }

    const actualTenantId = getUserId() || "USR00002";

    if (!actualTenantId) {
      console.log("handleSave failed: missing actualTenantId", {
        currentTenantId: actualTenantId,
      });
      setSubmitMessage(
        "Unable to determine tenant ID from the logged-in user.",
      );
      return;
    }

    const components: any[] = [];
    // Capture ordered variables from body when converting named -> positional
    let varsOrderForPayload: string[] = [];
    const headerVariables =
      variableMode === "WITH_VARIABLES"
        ? Array.from(new Set(extractVariables(header)))
        : [];
    const bodyVariables =
      variableMode === "WITH_VARIABLES"
        ? Array.from(new Set(extractVariables(body)))
        : [];
    const footerVariables =
      variableMode === "WITH_VARIABLES"
        ? Array.from(new Set(extractVariables(footer)))
        : [];
    const allVariables = Array.from(
      new Set([...headerVariables, ...bodyVariables, ...footerVariables]),
    );

    const headerExample =
      headerVariables.length > 0
        ? headerVariables.map(
            (variable) =>
              previewValues[variable]?.trim() || `sample_${variable}`,
          )
        : undefined;

    const needsMediaHeader =
      mediaType === "IMAGE" ||
      mediaType === "VIDEO" ||
      mediaType === "DOCUMENT";

    if (mediaType === "TEXT" && header.trim()) {
      components.push({
        type: "HEADER",
        format: "TEXT",
        text: header,
      });
    }
    if (needsMediaHeader && mediaId) {
      components.push({
        type: "HEADER",
        format: mediaType,
        example: {
          header_handle: [mediaId],
        },
      });
    }

    const bodyComponent: any = {
      type: "BODY",
      text: body,
    };

    // If using WITH_VARIABLES and POSITIONAL format, convert named placeholders
    // to positional using the shared utility and capture ordered variables.
    if (variableMode === "WITH_VARIABLES" && bodyVariables.length > 0) {
      if (parameterFormat === "POSITIONAL") {
        const result = convertNamedToPositional(body, previewValues);
        bodyComponent.text = result.text;
        if (result.exampleBodyText) {
          bodyComponent.example = { body_text: result.exampleBodyText };
        }
        varsOrderForPayload = result.variables || [];
      } else {
        bodyComponent.example = {
          body_text_named_params: bodyVariables.map((variable) => ({
            param_name: variable,
            example: previewValues[variable]?.trim() || `sample_${variable}`,
          })),
        };
      }
    }

    components.push(bodyComponent);

    if (footer) {
      components.push({
        type: "FOOTER",
        text: footer,
      });
    }

    if (buttons.length > 0) {
      components.push({
        type: "BUTTONS",
        buttons: buttons.map((btn) => ({ type: "QUICK_REPLY", text: btn })),
      });
    }

    const actualCreatedBy = createdBy || getUsername() || "USR00002";
    console.log("CURRENT MEDIA ID", mediaId);
    if (
      (mediaType === "IMAGE" ||
        mediaType === "VIDEO" ||
        mediaType === "DOCUMENT") &&
      uploadedFileName &&
      !mediaId
    ) {
      setSubmitMessage("Please upload media first.");
      return;
    }
    const payloadVariables =
      variableMode === "WITH_VARIABLES"
        ? varsOrderForPayload.length > 0
          ? varsOrderForPayload
          : allVariables
        : [];

    const payload: any = {
      tenantId: actualTenantId,
      name: templateName,
      category,
      language: languages.join(","),
      components,
      variables: payloadVariables,
      createdBy: actualTenantId || actualCreatedBy,
    };

    payload.parameterFormat = parameterFormat;

    console.log("handleSave payload", payload);

    // Add mediaId if available
    const needsMedia =
      mediaType === "IMAGE" ||
      mediaType === "VIDEO" ||
      mediaType === "DOCUMENT";

    if (needsMedia && mediaId) {
      payload.mediaId = mediaId;
    }

    console.log(payload);
    const token = getAccessToken();

    try {
      console.log("handleSave sending create request", { payload });
      const response = await fetch(
        "http://localhost:5000/templates/v1/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        },
      );

      console.log(
        "handleSave create response status",
        response.status,
        response.statusText,
      );
      if (!response.ok) {
        let errorMessage = `Failed to create template (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // ignore parse error
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("handleSave create success response", data);

      setSubmitMessage("Template created successfully.");
      setTemplateName("");
      setHeader("");
      setBody("");
      setPreviewValues({});
      setVariableValues({});
      setFooter("");
      setButtons([]);
      setMediaId("");
      setUploadedFileName("");
      setMediaPreviewUrl("");
      setMediaType("");
      setCategory("UTILITY");
      setLanguages(["en_US"]);
      setLanguageOption("en_US");

      await fetchTemplates();

      setTimeout(() => {
        setOpen(false);
        setSubmitMessage(null);
      }, 1400);
    } catch (error) {
      console.error(error);
      setSubmitMessage(
        error instanceof Error ? error.message : "Failed to save template.",
      );
    }
  };

  const getPreviewBody = () => {
    let preview = body;
    console.log("getPreviewBody called", { body, previewValues, variableMode });

    if (variableMode === "WITH_VARIABLES") {
      Array.from(new Set(extractVariables(body))).forEach((variable) => {
        const value = previewValues[variable] || variable;
        const re = new RegExp(
          "{{\\s*" + escapeRegExp(variable) + "\\s*}}",
          "g",
        );
        preview = preview.replace(re, value);
      });
    }

    console.log("getPreviewBody result", preview);
    return preview;
  };

  useEffect(() => {
    const variables = extractVariables(body);
    console.log("body changed, extracted variables", { body, variables });
    setHasVariables(variables.length > 0);
    setPreviewValues({});
  }, [body]);

  return (
    <div className="space-y-6">
      {/* TOP SECTION */}

      <section className={`rounded-4xl p-6 border ${sectionStyle}`}>
        <div className="flex flex-col xl:flex-row gap-4 mb-6">
          {/* SEARCH */}

          <div className="flex-1">
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full rounded-2xl border px-5 py-3 text-sm outline-none ${
                isDark
                  ? "bg-slate-900 border-slate-700 text-white"
                  : "bg-white border-slate-200 text-black"
              }`}
            />
          </div>

          {/* CATEGORY */}

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`rounded-2xl border px-5 py-3 text-sm ${
              isDark
                ? "bg-slate-900 border-slate-700 text-white"
                : "bg-white border-slate-200 text-black"
            }`}
          >
            <option value="ALL">All Categories</option>

            <option value="UTILITY">Utility</option>

            <option value="MARKETING">Marketing</option>

            <option value="AUTHENTICATION">Authentication</option>
          </select>

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`rounded-2xl border px-5 py-3 text-sm ${
              isDark
                ? "bg-slate-900 border-slate-700 text-white"
                : "bg-white border-slate-200 text-black"
            }`}
          >
            <option value="ALL">All Status</option>

            <option value="PENDING">Pending</option>

            <option value="APPROVED">Approved</option>

            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Saved Templates</h2>

            <p className="text-sm opacity-70 mt-2">Manage WhatsApp templates</p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="
    flex items-center gap-3
    hover:bg-white
    bg-slate-50
    border border-slate-200
    text-slate-800
    cursor-pointer
    px-5 py-3
    rounded-2xl
    font-semibold
    hover:shadow-sm
    shadow-md
    transition-all duration-300
  "
          >
            <span
              className="
    flex items-center justify-center
    h-8 w-8
    rounded-xl
    bg-white
    text-[#25D366]
    shadow-sm
    border border-slate-200
  "
            >
              ➕
            </span>
            Create Template
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {listLoading ? (
            <div className="col-span-full rounded-2xl border p-6 text-center text-sm opacity-70">
              Loading templates...
            </div>
          ) : listError ? (
            <div className="col-span-full rounded-2xl border p-6 text-center text-sm text-rose-600">
              {listError}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="col-span-full rounded-2xl border p-6 text-center text-sm opacity-70">
              No saved templates yet. Click "Create Template" to add one.
            </div>
          ) : (
            filteredTemplates.map((template) => {
              const bodyComponent = template.components?.find(
                (c: any) => c.type === "BODY",
              );

              const headerComponent = template.components?.find(
                (c: any) => c.type === "HEADER",
              );

              const footerComponent = template.components?.find(
                (c: any) => c.type === "FOOTER",
              );

              return (
                <div className="rounded-3xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300">
                  {/* Phone Header */}
                  <div className="flex flex-col justify-between h-full">
                    <div className="bg-[#075E54] p-4 px-6 text-white flex justify-between">
                      <div>
                        <h3 className="font-semibold text-xs">
                          {template.name}
                        </h3>
                        <p className="text-xs opacity-80 mt-2">
                          {template.language}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold bg-green-700/90 text-[11px] rounded-lg py-0.5 px-3">
                          {template.status}
                        </h3>
                        <p className="text-[11px] opacity-80 text-center mt-1">
                          {template.components?.[0]?.format}
                        </p>
                      </div>
                    </div>

                    {/* Chat Preview */}
                    <div
                      className="
      flex items-center gap-2
      border border-green-200
      bg-green-50
      px-4 py-2
      text-green-700
      font-medium
      hover:bg-green-100
      transition-all
    "
                    >
                      <div className="h-56 p-3 overflow-hidden">
                        <div className="bg-[#DCF8C6] mr-auto max-w-[70%] rounded-2xl p-4 shadow">
                          <h4 className="font-semibold text-sm">
                            {headerComponent?.text}
                          </h4>

                          <p className="text-xs mt-2 line-clamp-5">
                            {bodyComponent?.text}
                          </p>

                          <p className="text-[12px] mt-3 text-gray-500">
                            {footerComponent?.text}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedTemplate(template);
                          setViewOpen(true);
                        }}
                        className="
    flex items-center gap-1
    hover:bg-white
    bg-slate-50
    border border-slate-200
    text-slate-800
    cursor-pointer
    px-5 py-3
    rounded-2xl
    font-semibold
    hover:shadow-sm
    shadow-md
    transition-all duration-300
    "
                      >
                        👁️
                        <span>Preview</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* LEFT */}

        <div className="bg-[#0084D1] text-white rounded-2xl px-5 py-3 text-sm">
          Showing{" "}
          <span className="font-semibold">
            {(pagination.page - 1) * pagination.limit + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold">
            {Math.min(
              pagination.page * pagination.limit,

              pagination.total,
            )}
          </span>{" "}
          of <span className="font-semibold">{pagination.total}</span>
        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-3">
          {/* PREVIOUS */}

          <button
            disabled={pagination.page === 1}
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: prev.page - 1,
              }))
            }
            className={`rounded-2xl px-5 py-2.5 text-sm font-medium ${
              pagination.page === 1
                ? "cursor-not-allowed bg-slate-200 text-slate-400"
                : "bg-slate-800 text-white hover:bg-slate-700"
            }`}
          >
            Previous
          </button>

          {/* PAGE BUTTONS */}

          <div className="flex items-center gap-2">
            {Array.from({
              length: pagination.totalPages,
            }).map((_, index) => {
              const page = index + 1;

              return (
                <button
                  key={page}
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page,
                    }))
                  }
                  className={`h-10 w-10 rounded-xl text-sm font-semibold ${
                    pagination.page === page
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
            disabled={pagination.page === pagination.totalPages}
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: prev.page + 1,
              }))
            }
            className={`rounded-2xl px-5 py-2.5 text-sm font-medium ${
              pagination.page === pagination.totalPages
                ? "cursor-not-allowed bg-slate-200 text-slate-400"
                : "bg-sky-500 text-white hover:bg-sky-600"
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {viewOpen && selectedTemplate && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-5">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setViewOpen(false)}
              className="absolute cursor-pointer -top-5 right-0 text-white text-3xl"
            >
              ×
            </button>

            <div className="p-3 shadow-2xl">
              <div className="flex h-162.5 flex-col overflow-hidden rounded-4xl bg-[#e5ddd5] p-4">
                {" "}
                <div className="absolute inset-0 opacity-5 bg-[url('https://i.imgur.com/7yUvePI.png')]" />
                <div className="relative z-10 flex flex-col h-full">
                  {/* WHATSAPP TOP HEADER */}

                  <div className="flex items-center justify-between bg-[#f0f2f5] px-4 py-3 border-b border-[#d1d7db] -mx-4 -mt-4 mb-4 rounded-t-[28px]">
                    {/* LEFT */}

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

                    {/* RIGHT ICONS */}

                    <div className="flex items-center gap-5 text-[#54656f]">
                      {/* VIDEO */}

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

                      {/* SEARCH */}

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

                      {/* MENU */}

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

                  {/* MESSAGE */}

                  {/* MESSAGE PREVIEW */}
                  <div className="flex-1 overflow-y-auto scrollbar-none pt-4">
                    <div className="flex justify-center">
                      <div className="w-full max-w-[320px] -ml-16 bg-white rounded-2xl overflow-hidden shadow-md">
                        {/* TEMPLATE IMAGE */}
                        {isMediaTemplate && (
                          <div className="relative h-55 w-full bg-gray-200">
                            <img
                              src={
                                selectedTemplate.imageUrl ||
                                "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a"
                              }
                              alt="template"
                              className="w-full h-full object-cover"
                            />

                            {/* Video Play Icon */}
                            {headerComponent?.format === "VIDEO" && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-14 h-14 bg-black/50 rounded-full flex items-center justify-center">
                                  ▶
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* CONTENT */}
                        <div className="p-4">
                          {/* HEADER */}
                          {selectedTemplate.components?.find(
                            (c: any) => c.type === "HEADER",
                          )?.text && (
                            <h2 className="font-semibold text-[16px] text-[#111b21] mb-2">
                              {
                                selectedTemplate.components.find(
                                  (c: any) => c.type === "HEADER",
                                )?.text
                              }
                            </h2>
                          )}

                          {/* BODY */}
                          <div className="text-[14px] leading-6 text-[#111b21] whitespace-pre-line">
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
                                    <span
                                      key={index}
                                      className="mx-0.5 inline-flex rounded-md bg-[#e7f3ff] px-2 py-0.5 text-[12px] font-medium text-[#027eb5]"
                                    >
                                      {previewValues[variableNumber] ||
                                        variableName ||
                                        `{{${variableNumber}}}`}
                                    </span>
                                  );
                                }

                                return <span key={index}>{part}</span>;
                              })}
                          </div>

                          {/* FOOTER */}
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

                          {/* BUTTONS */}
                          <div className="mt-4 pt-3 space-y-2">
                            {selectedTemplate.components
                              ?.find((c: any) => c.type === "BUTTONS")
                              ?.buttons?.map((btn: any, index: number) => (
                                <button
                                  key={index}
                                  className="w-full border rounded-lg py-2 text-[#00a884] font-medium hover:bg-[#f5f6f6]"
                                >
                                  {btn.text}
                                </button>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CHAT INPUT */}
                  <div className="mt-auto bg-[#f0f2f5] rounded-2xl p-2">
                    <div className="flex items-center gap-2">
                      {/* Emoji */}
                      <button className="text-[#54656f] text-xl">😊</button>

                      {/* Input */}
                      <div className="flex-1 bg-white rounded-full px-4 py-2 shadow-sm">
                        <input
                          type="text"
                          placeholder="Type a message"
                          className="w-full outline-none text-sm bg-transparent"
                        />
                      </div>

                      {/* Send Button */}
                      <button className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white shadow">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M2 21L23 12 2 3v7l15 2-15 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP */}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div
            className={`relative z-10 flex w-full max-w-7xl max-h-[92vh] flex-col overflow-hidden rounded-4xl border shadow-2xl ${sectionStyle}`}
          >
            <div className="relative overflow-hidden border-b border-white/10 bg-linear-to-r from-[#128C7E] via-[#25D366] to-[#20BD5A] px-6 py-6 sm:px-8">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-10 left-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

              <div className="relative flex items-start justify-between gap-6">
                <div className="max-w-3xl space-y-4 text-white">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur-sm">
                    <Sparkles className="h-4 w-4" />
                    WhatsApp Template Builder
                  </div>

                  <div>
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                      Create Template
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm text-white/85 sm:text-base">
                      Build a reusable message template with structured header,
                      body, footer, and quick-reply actions that match the
                      dashboard’s WhatsApp-first style.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs font-medium text-white/95">
                    <span className="inline-flex items-center gap-2 rounded-full bg-black/15 px-3 py-2 backdrop-blur-sm">
                      <BadgeCheck className="h-4 w-4" />
                      Tenant {tenantId || "loading..."}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-black/15 px-3 py-2 backdrop-blur-sm">
                      <MessageSquareText className="h-4 w-4" />
                      Preview sync
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-black/15 px-3 py-2 backdrop-blur-sm">
                      <FileText className="h-4 w-4" />
                      Policy-aware fields
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full cursor-pointer border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"
                  aria-label="Close template editor"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid flex-1 gap-6 overflow-y-auto p-6 sm:p-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
              <div className="space-y-6">
                <section
                  className={`rounded-[1.75rem] border p-5 shadow-sm ${isDark ? "border-slate-700/80 bg-slate-950/60" : "border-slate-200 bg-white"}`}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-2xl bg-[#25D366]/10 p-3 text-[#25D366]">
                      <Hash className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Template Basics</h3>
                      <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Name it, classify it, and define the parameter format.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Tenant ID"
                      value={tenantId}
                      disabled
                      readOnly
                      className={`w-full rounded-2xl border px-4 py-3 ${inputStyle} cursor-not-allowed opacity-90`}
                    />

                    <input
                      type="text"
                      placeholder="Template name (lowercase letters, numbers, underscores only)"
                      value={templateName}
                      onChange={(e) => {
                        const normalized = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9_]/g, "_");
                        setTemplateName(normalized);
                        setTemplateNameError(null);
                      }}
                      pattern="[a-z0-9_]+"
                      title="Use lowercase letters, numbers, and underscores only"
                      className={`w-full rounded-2xl border px-4 py-3 ${inputStyle}`}
                    />
                    {templateNameError && (
                      <p className="flex items-center gap-2 text-sm text-rose-500">
                        <AlertTriangle className="h-4 w-4" />
                        {templateNameError}
                      </p>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={`w-full rounded-2xl border px-4 py-3 ${inputStyle}`}
                      >
                        <option value="UTILITY">UTILITY</option>
                        <option value="MARKETING">MARKETING</option>
                        <option value="AUTHENTICATION">AUTHENTICATION</option>
                      </select>

                      <select
                        value={parameterFormat}
                        onChange={(e) =>
                          setParameterFormat(
                            e.target.value as "POSITIONAL" | "NAMED",
                          )
                        }
                        className={`w-full rounded-2xl border px-4 py-3 ${inputStyle}`}
                      >
                        <option value="POSITIONAL">POSITIONAL</option>
                        <option value="NAMED">NAMED</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium">Template Type</label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => setVariableMode("WITHOUT_VARIABLES")}
                          className={`rounded-2xl px-4 py-4 text-left text-sm font-semibold transition-all ${variableMode === "WITHOUT_VARIABLES"
                              ? "border border-[#25D366]/30 bg-[#25D366]/10 text-[#128C7E] shadow-sm"
                              : isDark
                                ? "border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-600"
                                : "border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                            }`}
                        >
                          <div className="mb-1 text-xs uppercase tracking-[0.2em] opacity-70">
                            Simple
                          </div>
                          <div>Without Variables</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setVariableMode("WITH_VARIABLES")}
                          className={`rounded-2xl px-4 py-4 text-left text-sm font-semibold transition-all ${variableMode === "WITH_VARIABLES"
                              ? "border border-sky-400/40 bg-sky-500/10 text-sky-600 shadow-sm"
                              : isDark
                                ? "border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-600"
                                : "border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                            }`}
                        >
                          <div className="mb-1 text-xs uppercase tracking-[0.2em] opacity-70">
                            Dynamic
                          </div>
                          <div>With Variables</div>
                        </button>
                      </div>
                      {variableMode === "WITH_VARIABLES" && (
                        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          {parameterFormat === "POSITIONAL"
                            ? "Use {{1}}, {{2}} placeholders and sample values below."
                            : "Use named placeholders like {{customer_name}} and {{order_id}}."}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Languages className="h-4 w-4 text-[#25D366]" />
                        <label className="text-sm font-medium">Languages</label>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <select
                          value={languageOption}
                          onChange={(e) => setLanguageOption(e.target.value)}
                          className={`w-full rounded-2xl border px-4 py-3 ${inputStyle}`}
                        >
                          <option value="en_US">en_US</option>
                          <option value="hi_IN">hi_IN</option>
                          <option value="es_ES">es_ES</option>
                          <option value="fr_FR">fr_FR</option>
                          <option value="de_DE">de_DE</option>
                          <option value="pt_BR">pt_BR</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => {
                            if (!languages.includes(languageOption)) {
                              setLanguages([...languages, languageOption]);
                            }
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#25D366]/20 transition hover:brightness-110"
                        >
                          <Plus className="h-4 w-4" />
                          Add
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {languages.map((lang) => (
                          <span
                            key={lang}
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${isDark ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"}`}
                          >
                            {lang}
                            <button
                              type="button"
                              onClick={() =>
                                setLanguages(
                                  languages.filter((item) => item !== lang),
                                )
                              }
                              className="text-slate-500 transition hover:text-slate-900"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <input
                      type="text"
                      readOnly
                      placeholder="Created By"
                      value={createdBy}
                      className={`w-full rounded-2xl border px-4 py-3 ${inputStyle} opacity-80`}
                    />
                  </div>
                </section>

                <section
                  className={`rounded-[1.75rem] border p-5 shadow-sm ${isDark ? "border-slate-700/80 bg-slate-950/60" : "border-slate-200 bg-white"}`}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-500">
                      <MessageSquareText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Message Content</h3>
                      <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Define the header, body, footer, and buttons that show
                        in the final template.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <select
                      value={mediaType}
                      onChange={(e) => {
                        setMediaType(e.target.value);
                        setMediaId("");
                        setUploadedFileName("");
                        setMediaPreviewUrl("");
                        setMediaError(null);
                      }}
                      className={`w-full rounded-2xl border px-4 py-3 ${inputStyle}`}
                    >
                      <option value="">Select Header Type</option>
                      <option value="TEXT">TEXT</option>
                      <option value="IMAGE">IMAGE</option>
                      <option value="DOCUMENT">DOCUMENT</option>
                      <option value="VIDEO">VIDEO</option>
                    </select>

                    {mediaType === "TEXT" && (
                      <input
                        type="text"
                        placeholder="Header"
                        value={header}
                        onChange={(e) => setHeader(e.target.value)}
                        className={`w-full rounded-2xl border px-4 py-3 ${inputStyle}`}
                      />
                    )}

                    {(mediaType === "IMAGE" ||
                      mediaType === "VIDEO" ||
                      mediaType === "DOCUMENT") && (
                      <div className={`rounded-2xl border p-4 ${isDark ? "border-slate-700 bg-slate-900/70" : "border-slate-200 bg-slate-50"}`}>
                        <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                          <Eye className="h-4 w-4 text-[#25D366]" />
                          Upload header media
                        </div>
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];

                            if (file) {
                              const previewUrl = URL.createObjectURL(file);
                              setMediaPreviewUrl(previewUrl);
                              handleMediaUpload(file);
                            }
                          }}
                          className={`w-full rounded-2xl border px-4 py-3 ${inputStyle}`}
                        />

                        {uploadedFileName && (
                          <p className={`mt-3 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                            Selected file: {uploadedFileName}
                          </p>
                        )}
                        {mediaLoading && (
                          <p className="mt-2 text-sm text-slate-400">Uploading...</p>
                        )}

                        {mediaError && (
                          <p className="mt-2 text-sm text-rose-500">{mediaError}</p>
                        )}

                        {mediaId && (
                          <p className="mt-2 text-sm text-emerald-500">
                            File uploaded successfully
                          </p>
                        )}
                      </div>
                    )}

                    <textarea
                      rows={6}
                      placeholder="Body"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className={`w-full rounded-2xl border px-4 py-3 ${inputStyle}`}
                    />

                    {showNoVariableWarning && (
                      <p className="rounded-2xl border border-amber-300/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-600">
                        You selected &quot;Without Variables&quot;, but the body contains
                        placeholders. Remove them or switch to &quot;With Variables&quot;.
                      </p>
                    )}

                    {variableMode === "WITH_VARIABLES" &&
                      Array.from(new Set(extractVariables(body))).length > 0 && (
                        <div className={`rounded-2xl border p-4 ${isDark ? "border-slate-700 bg-slate-900/70" : "border-slate-50 bg-slate-50"}`}>
                          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                            <Hash className="h-4 w-4 text-sky-500" />
                            Preview values
                          </div>

                          <div className="space-y-3">
                            {Array.from(new Set(extractVariables(body))).map(
                              (variable) => (
                                <input
                                  key={variable}
                                  type="text"
                                  placeholder={`Sample value for {{${variable}}}`}
                                  value={previewValues[variable] || ""}
                                  onChange={(e) =>
                                    setPreviewValues({
                                      ...previewValues,
                                      [variable]: e.target.value,
                                    })
                                  }
                                  className={`w-full rounded-2xl border px-4 py-3 ${inputStyle}`}
                                />
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    <input
                      type="text"
                      placeholder="Footer"
                      value={footer}
                      onChange={(e) => setFooter(e.target.value)}
                      className={`w-full rounded-2xl border px-4 py-3 ${inputStyle}`}
                    />

                    <div className={`space-y-3 rounded-2xl border p-4 ${isDark ? "border-slate-700 bg-slate-900/70" : "border-slate-200 bg-slate-50"}`}>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h4 className="text-sm font-semibold">Buttons</h4>
                          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            Add quick replies for the template footer.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setButtons([...buttons, ""])}
                          className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600"
                        >
                          <Plus className="h-4 w-4" />
                          Add button
                        </button>
                      </div>

                      <div className="space-y-3">
                        {buttons.map((btn, index) => (
                          <input
                            key={index}
                            type="text"
                            value={btn}
                            onChange={(e) => {
                              const updated = [...buttons];

                              updated[index] = e.target.value;

                              setButtons(updated);
                            }}
                            placeholder={`Button ${index + 1}`}
                            className={`w-full rounded-2xl border px-4 py-3 ${inputStyle}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <div className={`rounded-[1.75rem] border p-5 shadow-sm ${isDark ? "border-slate-700/80 bg-slate-950/60" : "border-slate-200 bg-white"}`}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">Ready to submit</h3>
                      <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Review the preview panel before saving the template.
                      </p>
                    </div>

                    <button
                      onClick={handleSave}
                      disabled={!templateName || !isTemplateNameValid}
                      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white transition-all ${!templateName || !isTemplateNameValid
                          ? "cursor-not-allowed bg-slate-400"
                          : "bg-linear-to-r from-[#128C7E] to-[#25D366] shadow-lg shadow-[#25D366]/20 hover:brightness-110"
                        }`}
                    >
                      <Sparkles className="h-4 w-4" />
                      Submit Template
                    </button>
                  </div>

                  {submitMessage && (
                    <p className="mt-4 rounded-2xl border border-slate-500/10 bg-slate-500/5 px-4 py-3 text-sm">
                      {submitMessage}
                    </p>
                  )}
                </div>
              </div>

              <div className="lg:sticky lg:top-0">
                <div className={`rounded-4xl border p-4 shadow-xl ${isDark ? "border-slate-700/80 bg-slate-950/70" : "border-slate-200 bg-slate-100"}`}>
                  <div className="mb-4 flex items-center justify-between gap-3 px-2 pt-1">
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Live Preview
                      </p>
                      <h3 className="mt-1 text-lg font-semibold">WhatsApp message</h3>
                    </div>

                    <span className="rounded-full bg-[#25D366]/10 px-3 py-1 text-xs font-semibold text-[#128C7E]">
                      Real-time
                    </span>
                  </div>

                  <div className="rounded-4xl bg-[#E5DDD5] p-4 shadow-inner">
                    <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-2xl">
                      <div className="bg-[#075E54] px-4 py-4 text-white">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h4 className="text-sm font-semibold">
                              {templateName || "New Template"}
                            </h4>
                            <p className="mt-1 text-xs text-white/80">
                              {category} • {languages.join(", ")}
                            </p>
                          </div>
                          <div className="rounded-full bg-black/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                            {mediaType || "HEADER"}
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#ECE5DD] px-4 py-5">
                        <div className="max-w-[92%] rounded-3xl rounded-tl-md bg-white px-4 py-3 shadow-sm">
                          {mediaType === "TEXT" && header && (
                            <h4 className="mb-2 text-sm font-semibold text-[#111b21]">
                              {header}
                            </h4>
                          )}

                          {(mediaType === "IMAGE" ||
                            mediaType === "VIDEO" ||
                            mediaType === "DOCUMENT") && (
                            <div className="mb-3 overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
                              {mediaType === "IMAGE" && mediaPreviewUrl ? (
                                <img
                                  src={mediaPreviewUrl}
                                  alt={uploadedFileName || "Selected header media preview"}
                                  className="h-44 w-full object-cover"
                                />
                              ) : mediaType === "VIDEO" && mediaPreviewUrl ? (
                                <video
                                  src={mediaPreviewUrl}
                                  controls
                                  className="h-44 w-full bg-black object-contain"
                                />
                              ) : (
                                <div className="flex h-44 w-full items-center justify-center px-4">
                                  {uploadedFileName || "Uploaded header media will appear here"}
                                </div>
                              )}
                            </div>
                          )}

                          <p className="whitespace-pre-line text-sm leading-6 text-[#111b21]">
                            {getPreviewBody() || "Your template body preview will appear here."}
                          </p>

                          {footer && (
                            <p className="mt-3 text-xs text-[#667781]">
                              {footer}
                            </p>
                          )}

                          {buttons.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {buttons.map((btn, index) => (
                                <button
                                  key={index}
                                  className="w-full rounded-2xl border border-[#25D366]/30 px-4 py-2.5 text-sm font-medium text-[#128C7E] transition hover:bg-[#f5f6f6]"
                                >
                                  {btn || `Button ${index + 1}`}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
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
