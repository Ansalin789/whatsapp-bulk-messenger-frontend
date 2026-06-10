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
            <div
              className={`
    relative overflow-hidden rounded-3xl p-6 mb-8
    ${
      isDark
        ? "bg-gradient-to-r from-[#075E54] via-[#128C7E] to-[#25D366]"
        : "bg-gradient-to-r from-[#128C7E] via-[#25D366] to-[#4ADE80]"
    }
    shadow-2xl
  `}
            >
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

              <div className="relative flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    WhatsApp Bulk Messenger
                  </h1>

                  <p className="mt-2 text-sm text-white/80">
                    Manage campaigns, templates and message delivery from one
                    place.
                  </p>
                </div>

                <div className="hidden md:flex items-center justify-center h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.52 3.48A11.82 11.82 0 0 0 12.06 0C5.42 0 .02 5.4.02 12.04c0 2.12.55 4.18 1.6 6L0 24l6.12-1.6a11.95 11.95 0 0 0 5.94 1.52h.01c6.63 0 12.03-5.4 12.03-12.04 0-3.21-1.25-6.23-3.58-8.4z" />
                  </svg>
                </div>
              </div>
            </div>
            {/* Header with Theme Toggle */}
            <div className="mb-8 flex items-start justify-between gap-8">
              <header className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-1 rounded-full bg-[#25D366]" />

                  <div>
                    <h1
                      className={`
          text-4xl font-bold tracking-tight
          ${isDark ? "text-white" : "text-slate-900"}
        `}
                    >
                      {activeSection === "campaigns" && "Campaign Manager"}
                      {activeSection === "history" && "Campaign Analytics"}
                      {activeSection === "templates" && "Message Templates"}
                    </h1>

                    <p
                      className={`mt-1 text-sm ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {activeSection === "campaigns" &&
                        "Create and launch WhatsApp campaigns instantly."}
                      {activeSection === "history" &&
                        "Monitor delivery reports and campaign performance."}
                      {activeSection === "templates" &&
                        "Build reusable templates for faster communication."}
                    </p>
                  </div>
                </div>
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
                  `inline-flex items-center cursor-pointer gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-300 whitespace-nowrap ` +
                  (isDark
                    ? "border-slate-700 bg-slate-800/80 text-slate-100 hover:bg-slate-700"
                    : "border-slate-300 bg-white text-slate-950 hover:bg-slate-100")
                }
              >
                <span className="inline-flex items-center justify-center">
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
            {activeSection === "campaigns" && (
              <CreateCampaign isDark={isDark} />
            )}

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
