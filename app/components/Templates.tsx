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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
            templates.map((template) => (
              <div
                key={template.name || template.title}
                className={`border rounded-2xl p-5 ${sectionStyle}`}
              >
                <h3 className="font-bold text-lg">
                  {template.name || template.title}
                </h3>

                {template.category && (
                  <p className="mt-2 text-xs uppercase opacity-70">
                    Category: {template.category}
                  </p>
                )}

                <p className="mt-2 text-sm opacity-70">
                  {template.description ||
                    template.footer ||
                    "WhatsApp message template"}
                </p>

                <div className="flex gap-3 mt-4">
                  <button className="bg-sky-500 text-white px-4 py-2 rounded-lg">
                    Use
                  </button>

                  <button className="border px-4 py-2 rounded-lg">Edit</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

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
