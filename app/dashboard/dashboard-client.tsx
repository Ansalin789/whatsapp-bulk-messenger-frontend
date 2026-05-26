"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { DashboardSidebar } from "@/app/components/DashboardSidebar";
import { CreateCampaign } from "@/app/components/CreateCampaign";
import { CampaignHistory } from "@/app/components/CampaignHistory";
import { Templates } from "@/app/components/Templates";

export default function DashboardClient() {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [activeSection, setActiveSection] = useState<
    "campaigns" | "history" | "templates"
  >("campaigns");
  const isDark = theme === "dark";

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

  return (
    <div
      className={
        "min-h-screen transition-colors duration-500 " +
        (isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-950")
      }
    >
      <div className="flex h-screen">
        {/* Sidebar */}
        <DashboardSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isDark={isDark}
        />

        {/* Main Content */}
        <main className="ml-64 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-8 py-8">
            {/* Header with Theme Toggle */}
            <div className="mb-8 flex items-start justify-between gap-8">
              <header>
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
                <p className={`mt-3 max-w-2xl text-sm leading-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
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
              </button>
            </div>

            {/* Campaigns Section */}
            {activeSection === "campaigns" && <CreateCampaign isDark={isDark} />}

            {/* History Section */}
            {activeSection === "history" && <CampaignHistory isDark={isDark} />}

            {/* Templates Section */}
            {activeSection === "templates" && <Templates isDark={isDark} />}
          </div>
        </main>
      </div>
    </div>
  );
}
