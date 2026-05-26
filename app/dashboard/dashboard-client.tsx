"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, logout as authLogout } from "@/lib/auth";

const campaignHistory = [
  {
    id: "CMP-001",
    name: "Welcome Series",
    sent: "1,420",
    status: "Active",
    lastRun: "Today, 09:10",
  },
  {
    id: "CMP-002",
    name: "Holiday Promo",
    sent: "980",
    status: "Paused",
    lastRun: "May 18, 2026",
  },
  {
    id: "CMP-003",
    name: "Renewal Reminder",
    sent: "540",
    status: "Active",
    lastRun: "Today, 07:42",
  },
];

const templates = [
  {
    title: "Product Launch",
    description: "Announce new features with promo buttons.",
  },
  {
    title: "Order Confirmation",
    description: "Send fast order updates and delivery info.",
  },
  {
    title: "Appointment Reminder",
    description: "Remind customers with date and time details.",
  },
];

export default function DashboardClient() {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [activeSection, setActiveSection] = useState<
    "campaigns" | "history" | "templates"
  >("campaigns");
  const isDark = theme === "dark";
  const cardStyle = isDark
    ? "border-slate-800/70 bg-slate-900/80 text-slate-100 shadow-slate-950/20"
    : "border-slate-200/70 bg-white/90 text-slate-950 shadow-slate-900/10";
  const sectionStyle = isDark
    ? "border-slate-800/70 bg-slate-900/80 shadow-2xl shadow-slate-950/20"
    : "border-slate-200/70 bg-white/90 shadow-xl shadow-slate-900/10";
  const inputStyle = isDark
    ? "border-slate-700 bg-slate-950/80 text-slate-100"
    : "border-slate-300 bg-slate-50 text-slate-950";
  const labelStyle = isDark ? "text-slate-300" : "text-slate-700";
  const mutedText = isDark ? "text-slate-400" : "text-slate-500";

  useEffect(() => {
    const storedTheme =
      typeof window !== "undefined"
        ? window.localStorage.getItem("whatsapp-theme")
        : null;
    if (storedTheme === "light" || storedTheme === "dark") {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/");
    }
  }, [router]);

  const handleLogout = () => {
    authLogout();
    router.replace("/");
  };

  return (
    <div
      className={
        "min-h-screen transition-colors duration-500 " +
        (isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-950")
      }
    >
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside
          className={
            "fixed left-0 top-0 h-screen w-64 border-r p-6 overflow-y-auto " +
            (isDark
              ? "border-slate-800/70 bg-slate-900/80"
              : "border-slate-200/70 bg-white/90")
          }
        >
          <div className="flex flex-col justify-between gap-6 h-full">
            <div>
              <div
                className={
                  "mb-8 rounded-[2rem] border p-5 " +
                  (isDark
                    ? "border-slate-700 bg-slate-950/80"
                    : "border-slate-200/70 bg-slate-100")
                }
              >
                <div className="flex items-center gap-4">
                  <div
                    className={
                      "relative h-40 w-40 overflow-hidden" +
                      (isDark ? "bg-slate-800" : "bg-slate-200")
                    }
                  >
                    <Image
                      src={
                        isDark
                          ? "/blackstone_wa_dark.png"
                          : "/blackstone_wa_light.png"
                      }
                      alt="Blackstone Blast logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  {/* <div>
                <p className={isDark ? "text-xs uppercase tracking-[0.3em] text-sky-400/80" : "text-xs uppercase tracking-[0.3em] text-slate-500"}>BLACKSTONE</p>
                <h1 className={"mt-2 text-xl font-semibold " + (isDark ? "text-white" : "text-slate-950")}>INFOMATICS</h1>
              </div> */}
                </div>
              </div>
              <nav className="space-y-3">
                <button
                  onClick={() => setActiveSection("campaigns")}
                  className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                    activeSection === "campaigns"
                      ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                      : "text-slate-300 hover:bg-slate-800/80"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    Create Campaign
                  </span>
                </button>

                <button
                  onClick={() => setActiveSection("history")}
                  className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                    activeSection === "history"
                      ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                      : "text-slate-300 hover:bg-slate-800/80"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Campaign History
                  </span>
                </button>

                <button
                  onClick={() => setActiveSection("templates")}
                  className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                    activeSection === "templates"
                      ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                      : "text-slate-300 hover:bg-slate-800/80"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Templates
                  </span>
                </button>
              </nav>
            </div>

            <div className="mt-8 border-t border-slate-800/70 pt-6">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-lg bg-slate-800/80 px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-8 py-8">
            {/* Header with Theme Toggle */}
            <div className="mb-8 flex items-start justify-between gap-8">
              <header>
                <p className="text-xs uppercase tracking-[0.3em] text-sky-400/80">
                  WhatsApp Dashboard
                </p>
                <h1
                  className={
                    "mt-3 text-4xl font-semibold " +
                    (isDark ? "text-white" : "text-slate-950")
                  }
                >
                  {activeSection === "campaigns" && "Create Campaign"}
                  {activeSection === "history" && "Campaign History"}
                  {activeSection === "templates" && "Message Templates"}
                </h1>
                <p className={`mt-3 max-w-2xl text-sm leading-6 ${mutedText}`}>
                  {activeSection === "campaigns" &&
                    "Launch a new WhatsApp campaign with broadcast, segment, and timing controls."}
                  {activeSection === "history" &&
                    "View your campaign performance and recent delivery status."}
                  {activeSection === "templates" &&
                    "Manage and create reusable WhatsApp message templates."}
                </p>
              </header>
              <button
                type="button"
                onClick={() => {
                  const nextTheme = isDark ? "light" : "dark";
                  setTheme(nextTheme);
                  if (typeof window !== "undefined") {
                    window.localStorage.setItem("whatsapp-theme", nextTheme);
                  }
                }}
                className={
                  `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-300 whitespace-nowrap ` +
                  (isDark
                    ? "border-slate-700 bg-slate-800/80 text-slate-100 hover:bg-slate-700"
                    : "border-slate-300 bg-white text-slate-950 hover:bg-slate-100")
                }
              >
                <span className="inline-flex h-4 w-4 items-center justify-center">
                  {isDark ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="5" />
                      <path d="M12 1v2" />
                      <path d="M12 21v2" />
                      <path d="M4.22 4.22l1.42 1.42" />
                      <path d="M18.36 18.36l1.42 1.42" />
                      <path d="M1 12h2" />
                      <path d="M21 12h2" />
                      <path d="M4.22 19.78l1.42-1.42" />
                      <path d="M18.36 5.64l1.42-1.42" />
                    </svg>
                  )}
                </span>
                {isDark ? "" : ""}
              </button>
            </div>

            {/* Campaigns Section */}
            {activeSection === "campaigns" && (
              <div className="space-y-6">
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <article
                    className={`rounded-[2rem] p-6 shadow-lg ${cardStyle}`}
                  >
                    <p
                      className={`text-sm uppercase tracking-[0.24em] ${mutedText}`}
                    >
                      Active campaigns
                    </p>
                    <p className="mt-4 text-4xl font-semibold">4</p>
                    <p className={`mt-2 text-sm ${mutedText}`}>
                      Live campaigns running across your audience.
                    </p>
                  </article>
                  <article
                    className={`rounded-[2rem] p-6 shadow-lg ${cardStyle}`}
                  >
                    <p
                      className={`text-sm uppercase tracking-[0.24em] ${mutedText}`}
                    >
                      Messages sent
                    </p>
                    <p className="mt-4 text-4xl font-semibold">3,940</p>
                    <p className={`mt-2 text-sm ${mutedText}`}>
                      Delivered messages from recent campaigns.
                    </p>
                  </article>
                  <article
                    className={`rounded-[2rem] p-6 shadow-lg ${cardStyle}`}
                  >
                    <p
                      className={`text-sm uppercase tracking-[0.24em] ${mutedText}`}
                    >
                      Templates ready
                    </p>
                    <p className="mt-4 text-4xl font-semibold">12</p>
                    <p className={`mt-2 text-sm ${mutedText}`}>
                      Reusable templates stored for quick messaging.
                    </p>
                  </article>
                </section>

                <section className={`rounded-[2rem] p-6 ${sectionStyle}`}>
                  <div className="mb-6">
                    <h2
                      className={
                        isDark
                          ? "text-2xl font-semibold text-white"
                          : "text-2xl font-semibold text-slate-950"
                      }
                    >
                      Campaign details
                    </h2>
                    <p className={`mt-2 text-sm ${mutedText}`}>
                      Configure your new WhatsApp messaging campaign.
                    </p>
                  </div>
                  <form className="space-y-5">
                    <div>
                      <label
                        className={`block text-sm font-medium ${labelStyle}`}
                      >
                        Campaign name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Summer Sale 2026"
                        className={`mt-2 w-full rounded-lg border px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 ${inputStyle}`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium ${labelStyle}`}
                      >
                        Message content
                      </label>
                      <textarea
                        placeholder="Your WhatsApp message here..."
                        rows={5}
                        className={`mt-2 w-full rounded-lg border px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 ${inputStyle}`}
                      ></textarea>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          className={`block text-sm font-medium ${labelStyle}`}
                        >
                          Schedule send
                        </label>
                        <input
                          type="datetime-local"
                          className={`mt-2 w-full rounded-lg border px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 ${inputStyle}`}
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium ${labelStyle}`}
                        >
                          Recipient count
                        </label>
                        <input
                          type="number"
                          placeholder="0"
                          className={`mt-2 w-full rounded-lg border px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 ${inputStyle}`}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
                    >
                      Launch campaign
                    </button>
                  </form>
                </section>
              </div>
            )}

            {/* History Section */}
            {activeSection === "history" && (
              <section
                className={`overflow-hidden rounded-[2rem] ${sectionStyle}`}
              >
                <div
                  className={`border-b px-6 py-5 ${isDark ? "border-slate-800/70 bg-slate-950/80" : "border-slate-200/70 bg-slate-100"}`}
                >
                  <h2
                    className={
                      isDark
                        ? "text-xl font-semibold text-white"
                        : "text-xl font-semibold text-slate-950"
                    }
                  >
                    All campaigns
                  </h2>
                  <p className={`mt-1 text-sm ${mutedText}`}>
                    Track performance and delivery status of all your campaigns.
                  </p>
                </div>
                <div className="min-w-full overflow-x-auto px-6 py-5">
                  <table className="min-w-full border-separate border-spacing-y-3 text-left">
                    <thead>
                      <tr className="text-xs uppercase tracking-[0.3em] text-slate-500">
                        <th className="px-3 py-3">Campaign name</th>
                        <th className="px-3 py-3">Messages sent</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3">Last run</th>
                        <th className="px-3 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaignHistory.map((campaign) => (
                        <tr
                          key={campaign.id}
                          className="rounded-3xl bg-slate-950/80 text-slate-200 shadow-sm"
                        >
                          <td className="px-3 py-4 font-medium text-white">
                            {campaign.name}
                          </td>
                          <td className="px-3 py-4 text-slate-400">
                            {campaign.sent}
                          </td>
                          <td className="px-3 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                campaign.status === "Active"
                                  ? "bg-emerald-500/20 text-emerald-200"
                                  : "bg-amber-500/20 text-amber-200"
                              }`}
                            >
                              {campaign.status}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-slate-400">
                            {campaign.lastRun}
                          </td>
                          <td className="px-3 py-4">
                            <button className="text-sm font-medium text-sky-400 hover:text-sky-300">
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Templates Section */}
            {activeSection === "templates" && (
              <div className="space-y-6">
                <section className={`rounded-[2rem] p-6 ${sectionStyle}`}>
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2
                        className={
                          isDark
                            ? "text-2xl font-semibold text-white"
                            : "text-2xl font-semibold text-slate-950"
                        }
                      >
                        Saved templates
                      </h2>
                      <p className={`mt-2 text-sm ${mutedText}`}>
                        Quick-launch templates for recurring campaigns.
                      </p>
                    </div>
                    <button className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400">
                      Create template
                    </button>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => (
                      <div
                        key={template.title}
                        className={`rounded-[2rem] p-5 shadow-lg ${cardStyle}`}
                      >
                        <p
                          className={
                            isDark
                              ? "font-semibold text-white"
                              : "font-semibold text-slate-950"
                          }
                        >
                          {template.title}
                        </p>
                        <p className={`mt-3 text-sm leading-6 ${mutedText}`}>
                          {template.description}
                        </p>
                        <div className="mt-4 flex gap-3">
                          <button className="flex-1 rounded-lg bg-sky-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-sky-400">
                            Use
                          </button>
                          <button
                            className={
                              "flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition " +
                              (isDark
                                ? "border-slate-700 text-slate-300 hover:border-slate-500"
                                : "border-slate-300 text-slate-700 hover:border-slate-400")
                            }
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={`rounded-[2rem] p-6 ${sectionStyle}`}>
                  <h2
                    className={
                      isDark
                        ? "text-2xl font-semibold text-white"
                        : "text-2xl font-semibold text-slate-950"
                    }
                  >
                    Create new template
                  </h2>
                  <p className={`mt-2 text-sm ${mutedText}`}>
                    Save a reusable template for your campaigns.
                  </p>
                  <form className="mt-6 space-y-5">
                    <div>
                      <label
                        className={`block text-sm font-medium ${labelStyle}`}
                      >
                        Template name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Weekly Newsletter"
                        className={`mt-2 w-full rounded-lg border px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 ${inputStyle}`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium ${labelStyle}`}
                      >
                        Template message
                      </label>
                      <textarea
                        placeholder="Your WhatsApp message template..."
                        rows={5}
                        className={`mt-2 w-full rounded-lg border px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 ${inputStyle}`}
                      ></textarea>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
                    >
                      Save template
                    </button>
                  </form>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
