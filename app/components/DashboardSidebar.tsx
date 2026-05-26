"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { logout as authLogout } from "@/lib/auth";

interface DashboardSidebarProps {
  activeSection: "campaigns" | "history" | "templates";
  setActiveSection: (section: "campaigns" | "history" | "templates") => void;
  isDark: boolean;
}

export function DashboardSidebar({
  activeSection,
  setActiveSection,
  isDark,
}: DashboardSidebarProps) {
  const router = useRouter();

  const handleLogout = () => {
    authLogout();
    router.replace("/");
  };

  return (
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
                  "relative h-40 w-40 overflow-hidden " +
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
  );
}
