"use client";

import { useEffect, useState } from "react";
import { getAccessToken, getUsername, getUserId } from "@/lib/auth";
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

  parameterFormat: "POSITIONAL";

  components: TemplateComponent[];

  variables: string[];

  createdBy: string;
}

interface TemplatesProps {
  isDark: boolean;
}

export function Templates({ isDark }: TemplatesProps) {

  const [viewOpen, setViewOpen] = useState(false);

const [selectedTemplate, setSelectedTemplate] =
  useState<any>(null);
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

  const [languages, setLanguages] = useState<string[]>(["en_US"]);
  const [languageOption, setLanguageOption] = useState("en_US");

  const [createdBy, setCreatedBy] = useState("");

  const [header, setHeader] = useState("");

  const [body, setBody] = useState("");

  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {},
  );

  const [variableNames, setVariableNames] = useState<Record<string, string>>(
    {},
  );

  const [previewValues, setPreviewValues] = useState<Record<string, string>>(
    {},
  );

  const [isApplied, setIsApplied] = useState(false);

  const [footer, setFooter] = useState("");

  const [buttons, setButtons] = useState<string[]>([]);

  const [templates, setTemplates] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const sectionStyle = isDark
    ? "border-slate-800 bg-slate-900 text-white"
    : "border-slate-200 bg-white text-black";

  const inputStyle = isDark
    ? "bg-slate-800 border-slate-700 text-white"
    : "bg-white border-slate-300 text-black";

  const fetchTemplates = async () => {
    setListLoading(true);
    setListError(null);

    const token = getAccessToken();
    const queryParams = new URLSearchParams();
    if (tenantId) queryParams.append("tenantId", tenantId);
    if (createdBy) queryParams.append("createdBy", createdBy);

    try {
      const response = await fetch(
        `http://localhost:5000/templates/v1/getall?${queryParams.toString()}`,
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
      let list: any[] = [];

      if (resData && resData.success) {
        list = resData.data || [];
      } else if (Array.isArray(resData)) {
        list = resData;
      } else {
        list = resData.data || resData.templates || [];
      }

      setTemplates(list);
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
    fetchTemplates();
  }, [tenantId, createdBy]);

  const extractVariables = (text: string) => {
    const matches = text.match(/{{(.*?)}}/g) || [];

    return matches.map((item) => item.replace(/[{}]/g, ""));
  };
  const handleSave = async () => {
    const normalizedName = templateName.trim();
    const validNamePattern = /^[a-z0-9_]+$/;
    const variables = extractVariables(body);
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

  const hasMarketingWords =
    forbiddenWords.some((word) =>
      body.toLowerCase().includes(word)
    );

  if (hasMarketingWords) {
    setSubmitMessage(
      "Authentication templates cannot contain marketing content."
    );
    return;
  }

  if (variables.length > 3) {
    setSubmitMessage(
      "Authentication templates should use minimal variables."
    );
    return;
  }

  if (body.trim().length < 20) {
    setSubmitMessage(
      "Authentication template content is too short."
    );
    return;
  }
}

// MARKETING VALIDATION

if (category === "MARKETING") {
  const plainTextLength =
    body.replace(/{{(.*?)}}/g, "").trim().length;

  if (plainTextLength < 25) {
    setSubmitMessage(
      "Marketing templates require meaningful promotional content."
    );
    return;
  }

  if (variables.length > 5) {
    setSubmitMessage(
      "Too many variables for a marketing template."
    );
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

  const hasSpam =
    spamWords.some((word) =>
      body.toLowerCase().includes(word)
    );

  if (hasSpam) {
    setSubmitMessage(
      "Marketing template contains restricted promotional wording."
    );
    return;
  }
}

// UTILITY VALIDATION

if (category === "UTILITY") {
  if (body.trim().length < 15) {
    setSubmitMessage(
      "Utility templates must contain meaningful service information."
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

  const hasMarketingContent =
    marketingWords.some((word) =>
      body.toLowerCase().includes(word)
    );

  if (hasMarketingContent) {
    setSubmitMessage(
      "Utility templates should not contain promotional content."
    );
    return;
  }
}

    if (!normalizedName) {
      setSubmitMessage("Template name is required.");
      setTemplateNameError("Template name is required.");
      return;
    }

    if (!validNamePattern.test(normalizedName)) {
      const validationMessage =
        "Template name must contain only lowercase letters, numbers, and underscores.";
      setSubmitMessage(validationMessage);
      setTemplateNameError(validationMessage);
      return;
    }

    setTemplateNameError(null);

  
    if (
      parameterFormat === "POSITIONAL" &&
      variables.some((v) => !/^\d+$/.test(v))
    ) {
      const validationMessage =
        "For POSITIONAL templates, placeholders must use numeric indexes like {{1}}, {{2}}.";
      setSubmitMessage(validationMessage);
      return;
    }

    if (
      parameterFormat === "NAMED" &&
      variables.length > 0 &&
      variables.every((v) => /^\d+$/.test(v))
    ) {
      const validationMessage =
        "For NAMED templates, placeholders must use names like {{customer_name}}, {{order_id}}.";
      setSubmitMessage(validationMessage);
      return;
    }

    if (languages.length === 0) {
      setSubmitMessage("Please select at least one language.");
      return;
    }

    const actualTenantId = getUserId() || "USR00002";

    if (!actualTenantId) {
      setSubmitMessage(
        "Unable to determine tenant ID from the logged-in user.",
      );
      return;
    }

    const components: any[] = [];

    if (header) {
      components.push({
        type: "HEADER",
        format: "TEXT",
        text: header,
      });
    }

    components.push({
      type: "BODY",
      text: body,
      example: {
        body_text: [
          variables.map((variable) => previewValues[variable] || variable),
        ],
      },
    });

    if (footer) {
      components.push({
        type: "FOOTER",
        text: footer,
      });
    }

    if (buttons.length > 0) {
      components.push({
        type: "BUTTONS",
        buttons: buttons.map((btn) => ({
          type: "QUICK_REPLY",
          text: btn,
        })),
      });
    }



    
    const actualCreatedBy = createdBy || getUsername() || "USR00002";

    const payload = {
      tenantId: actualTenantId,
      name: templateName,
      category,
      language: languages.join(","),
      parameterFormat,
      components,
      variables: Object.values(variableNames),
      createdBy: actualTenantId || actualCreatedBy,
    };

    console.log(payload);
    const token = getAccessToken();

    try {
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
      console.log(data);

      setSubmitMessage("Template created successfully.");
      setTemplateName("");
      setHeader("");
      setBody("");
      setVariableNames({});
setPreviewValues({});
setVariableValues({});
setIsApplied(false);
      setFooter("");
      setButtons([]);
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

    Object.entries(variableNames).forEach(([position, variableName]) => {
      preview = preview.replaceAll(
        `{{${position}}}`,
        previewValues[position]
          ? previewValues[position]
          : `{{${variableName}}}`,
      );
    });

    return preview;
  };

useEffect(() => {
  setIsApplied(false);
  setVariableNames({});
  setPreviewValues({});
}, [body]);




  return (
    <div className="space-y-6">
      {/* TOP SECTION */}

      <section className={`rounded-4xl p-6 border ${sectionStyle}`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Saved Templates</h2>

            <p className="text-sm opacity-70 mt-2">Manage WhatsApp templates</p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-xl font-semibold"
          >
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
          ) : templates.length === 0 ? (
            <div className="col-span-full rounded-2xl border p-6 text-center text-sm opacity-70">
              No saved templates yet. Click "Create Template" to add one.
            </div>
          ) : (
           templates.map((template) => {
  const bodyComponent =
    template.components?.find(
      (c: any) => c.type === "BODY"
    );

  const headerComponent =
    template.components?.find(
      (c: any) => c.type === "HEADER"
    );

  const footerComponent =
    template.components?.find(
      (c: any) => c.type === "FOOTER"
    );

  return (
    <div
      key={template.name}
      className={`group relative overflow-hidden rounded-3xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
        isDark
          ? "bg-slate-900 border-slate-700"
          : "bg-white border-slate-200"
      }`}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-cyan-400" />

      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-xl">
              {template.name}
            </h3>

            <div className="flex gap-2 mt-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700">
                {template.category}
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                {template.language}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4 border">
          {headerComponent?.text && (
            <h4 className="font-semibold text-sm">
              {headerComponent.text}
            </h4>
          )}

          <p className="mt-3 text-sm text-slate-600 line-clamp-3">
            {bodyComponent?.text}
          </p>

          {footerComponent?.text && (
            <p className="mt-3 text-xs text-slate-400">
              {footerComponent.text}
            </p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => {
              setSelectedTemplate(template);
              setViewOpen(true);
            }}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold"
          >
            View
          </button>

        
          
        </div>
      </div>
    </div>
  );
})
          )}
        </div>
      </section>


{viewOpen && selectedTemplate && (
  <div className="fixed inset-0 bg-black/60 z-[100] flex justify-center items-center p-5">

    <div className="relative w-full max-w-md">

      <button
        onClick={() => setViewOpen(false)}
        className="absolute -top-5 right-0 text-white text-3xl"
      >
        ×
      </button>  

      <div className="p-3 shadow-2xl">

        <div className="bg-[#e5ddd5] rounded-[32px] p-4 min-h-[550px] relative overflow-hidden">

          <div className="absolute inset-0 opacity-5 bg-[url('https://i.imgur.com/7yUvePI.png')]" />

        <div className="relative z-10">

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

      <p className="text-[12px] text-[#667781]">
        online
      </p>
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
      <rect
        width="12"
        height="10"
        x="3"
        y="7"
        rx="2"
      />
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

  <div className="flex items-start gap-2">

<div className="max-w-[72%] bg-white rounded-[8px] rounded-tl-none px-3 py-2 shadow-sm relative">
    {/* HEADER */}

    {selectedTemplate.components?.find(
      (c: any) => c.type === "HEADER"
    )?.text && (
      <h2 className="font-semibold text-[15px] text-[#111b21] mb-2">
        {
          selectedTemplate.components.find(
            (c: any) => c.type === "HEADER"
          )?.text
        }
      </h2>
    )}

    {/* BODY */}

<div className="text-[14px] leading-6 text-[#111b21] whitespace-pre-line break-words">

  {(
    selectedTemplate.components.find(
      (c: any) => c.type === "BODY"
    )?.text || ""
  )
    .split(/(\{\{\d+\}\})/g)
    .map((part: string, index: number) => {

      const match =
        part.match(/\{\{(\d+)\}\}/);

      if (match) {

        const variableNumber =
          match[1];

        const variableName =
          selectedTemplate.variables?.[
            Number(variableNumber) - 1
          ];

        return (
          <button
            key={index}
            className="inline-flex items-center gap-1 bg-[#e7f3ff] text-[#027eb5] px-2 py-[2px] rounded-md text-[12px] font-medium mx-[2px] hover:bg-[#d8ecff] transition"
          >
            {previewValues[variableNumber] ||
              variableName ||
              `{{${variableNumber}}}`}
          </button>
        );
      }

      return (
        <span key={index}>
          {part}
        </span>
      );
    })}
</div>

    {/* FOOTER */}

    {selectedTemplate.components?.find(
      (c: any) => c.type === "FOOTER"
    )?.text && (
      <p className="text-[12px] text-[#667781] mt-3">
        {
          selectedTemplate.components.find(
            (c: any) => c.type === "FOOTER"
          )?.text
        }
      </p>
    )}

    {/* BUTTONS */}

    <div className="mt-4 border-t border-[#e9edef] pt-2 space-y-2">
      {selectedTemplate.components
        ?.find(
          (c: any) => c.type === "BUTTONS"
        )
        ?.buttons?.map(
          (btn: any, index: number) => (
            <button
              key={index}
              className="w-full text-center text-[#00a884] text-[14px] font-medium py-2 hover:bg-[#f5f6f6] rounded-lg transition"
            >
              {btn.text}
            </button>
          )
        )}
    </div>

    {/* TIME */}

    <div className="flex justify-end items-center mt-1">
      <span className="text-[11px] text-[#667781]">
        12:45 PM
      </span>
    </div>

    {/* MESSAGE TAIL */}

    <div className="absolute top-0 -left-2 w-3 h-3 bg-white clip-tail" />
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
        <div className="fixed inset-0 bg-black/50 z-50 flex  justify-center items-center p-5">
          <div
            className={`w-full overflow-y-scroll scrollbar-thin h-full max-w-6xl  rounded-4xl p-6 ${sectionStyle}`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Create Template</h2>

              <button onClick={() => setOpen(false)} className="text-2xl">
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-[85vh] p-2">
              {" "}
              <div className="space-y-5">
                <input
                  type="text"
                  placeholder="Tenant ID"
                  value={tenantId}
                  disabled
                  readOnly
                  className={`w-full border rounded-xl px-4 py-3 ${inputStyle} bg-slate-100 cursor-not-allowed`}
                />

                <input
                  type="text"
                  placeholder="Template Name (lowercase letters, numbers, underscores only)"
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
                  className={`w-full border rounded-xl px-4 py-3 ${inputStyle}`}
                />
                {templateNameError && (
                  <p className="text-sm text-rose-500 mt-2">
                    {templateNameError}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 ${inputStyle}`}
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
                    className={`w-full border rounded-xl px-4 py-3 ${inputStyle}`}
                  >
                    <option value="POSITIONAL">POSITIONAL</option>
                    <option value="NAMED">NAMED</option>
                  </select>
                </div>

                <p className="text-sm text-slate-500 mt-2">
                  {parameterFormat === "POSITIONAL"
                    ? "Use {{1}}, {{2}}, ... in body and send variables as numeric indexes."
                    : "Use named placeholders like {{customer_name}}, {{order_id}} in body and send variables by name."}
                </p>

                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-3">
                    <select
                      value={languageOption}
                      onChange={(e) => setLanguageOption(e.target.value)}
                      className={`w-full border rounded-xl px-4 py-3 ${inputStyle}`}
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
                      className="bg-sky-500 text-white px-5 py-3 rounded-xl"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang) => (
                      <span
                        key={lang}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-sm text-slate-700"
                      >
                        {lang}
                        <button
                          type="button"
                          onClick={() =>
                            setLanguages(
                              languages.filter((item) => item !== lang),
                            )
                          }
                          className="text-slate-500 hover:text-slate-900"
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
                  className={`w-full border rounded-xl px-4 py-3 ${inputStyle} opacity-80 mt-4`}
                />

                <input
                  type="text"
                  placeholder="Header"
                  value={header}
                  onChange={(e) => setHeader(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 ${inputStyle}`}
                />

                <textarea
                  rows={5}
                  placeholder="Body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 ${inputStyle}`}
                />

                {/* VARIABLE MAPPING */}

                {extractVariables(body).length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Variable Mapping</h3>

                    {extractVariables(body).map((variable) => (
                      <div key={variable} className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={`{{${variable}}}`}
                          readOnly
                          className={`border rounded-xl px-4 py-3 ${inputStyle}`}
                        />

                        <input
                          type="text"
                          placeholder="Enter variable name"
                          value={variableNames[variable] || ""}
                          onChange={(e) =>
                            setVariableNames({
                              ...variableNames,
                              [variable]: e.target.value,
                            })
                          }
                          className={`border rounded-xl px-4 py-3 ${inputStyle}`}
                        />
                      </div>
                    ))}

                    <button
                      type="button"
onClick={() => {
  const hasEmpty =
    Object.values(variableNames).some(
      (item) => !item.trim()
    );

  if (hasEmpty) {
    setSubmitMessage(
      "Please enter all variable names."
    );
    return;
  }

  setSubmitMessage(null);
  setIsApplied(true);
}}                      className="bg-green-600 text-white px-5 py-3 rounded-xl"
                    >
                      Apply
                    </button>
                  </div>
                )}

                {/* PREVIEW VALUES */}

                {isApplied && (
                  <div className="space-y-4 mt-5">
                    <h3 className="font-semibold">Preview Values</h3>

                    {Object.entries(variableNames).map(
                      ([position, variableName]) => (
                        <input
                          key={position}
                          type="text"
                          placeholder={variableName}
                          value={previewValues[position] || ""}
                          onChange={(e) =>
                            setPreviewValues({
                              ...previewValues,
                              [position]: e.target.value,
                            })
                          }
                          className={`w-full border rounded-xl px-4 py-3 ${inputStyle}`}
                        />
                      ),
                    )}
                  </div>
                )}



                <input
                  type="text"
                  placeholder="Footer"
                  value={footer}
                  onChange={(e) => setFooter(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 ${inputStyle}`}
                />

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
                      className={`w-full border rounded-xl px-4 py-3 ${inputStyle}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setButtons([...buttons, ""])}
                  className="bg-blue-500 text-white px-5 py-2 rounded-lg"
                >
                  Add Button
                </button>

                <button
                  onClick={handleSave}
                  disabled={!templateName || !isTemplateNameValid}
                  className={`w-full py-4 rounded-2xl font-bold text-white ${
                    !templateName || !isTemplateNameValid
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  Submit Template
                </button>
                {submitMessage && (
                  <p className="text-sm text-slate-300 mt-2">{submitMessage}</p>
                )}
              </div>
              <div className="flex justify-center">
                <div className="w-full max-w-90 bg-[#ece5dd] rounded-3xl p-4 shadow-2xl">
                  <div className="bg-white rounded-3xl p-5">
                    <h2 className="font-bold text-lg">{header}</h2>

                    <p className="mt-4 text-gray-700 whitespace-pre-line">
                      {getPreviewBody()}
                    </p>

                    <p className="mt-4 text-sm text-gray-500">{footer}</p>

                    <div className="mt-5 space-y-3">
                      {buttons.map((btn, index) => (
                        <button
                          key={index}
                          className="w-full border border-green-500 text-green-600 py-2 rounded-xl"
                        >
                          {btn}
                        </button>
                      ))}
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
