"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { logout as authLogout } from "@/lib/auth";

interface DashboardSidebarProps {
  activeSection: "campaigns" | "history" | "templates";
  setActiveSection: (section: "campaigns" | "history" | "templates") => void;
  isDark: boolean;
}

type SidebarItem = {
  key: DashboardSidebarProps["activeSection"];
  label: string;
  icon: ReactNode;
};

export function DashboardSidebar({
  activeSection,
  setActiveSection,
  isDark,
}: DashboardSidebarProps) {
  const router = useRouter();
  const navItems: SidebarItem[] = [
    {
      key: "campaigns",
      label: "Campaign",
      icon: (
        <>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </>
      ),
    },

    {
      key: "templates",
      label: "Templates",
      icon: (
        <>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </>
      ),
    },

    {
      key: "history",
      label: "History",
      icon: (
        <>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </>
      ),
    },
  ];

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
      <div className="flex h-full flex-col justify-between">
        {/* Top Section */}
        <div>
          {/* Logo Card */}
          <div
            className={`relative mb-8 overflow-hidden rounded-[2rem] border p-6 backdrop-blur-xl ${
              isDark
                ? "border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-2xl shadow-black/30"
                : "border-slate-200 bg-white shadow-xl shadow-slate-200/60"
            }`}
          >
            {/* Glow */}
            <div className="absolute -top-10 right-0 h-32 w-32 rounded-full bg-sky-500/10 blur-3xl" />

            {/* Logo */}
<div className="mb-8 flex justify-center">
  <div className="relative h-64 w-64">
    <Image
      src={
        isDark
          ? "/blackstone_wa_dark.png"
          : "/blackstone_wa_light.png"
      }
      alt="Blackstone Blast logo"
      fill
      className="object-contain"
      priority
    />
  </div>
</div>
          </div>

          {/* Navigation */}
          <nav className="space-y-3">
            {navItems.map((item) => {
              const active = activeSection === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key)}
                  className={`group cursor-pointer relative flex w-full items-center gap-4 overflow-hidden rounded-2xl px-5 py-4 text-left transition-all duration-300 ${
                    active
                      ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-xl shadow-sky-500/20"
                      : isDark
                        ? "border border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {/* Hover Glow */}
                  {!active && (
                    <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="absolute left-0 top-0 h-full w-16 bg-white/5 blur-xl" />
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    className={`relative flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 ${
                      active
                        ? "bg-white/20"
                        : isDark
                          ? "bg-slate-800 text-slate-300 group-hover:bg-slate-700"
                          : "bg-slate-100"
                    }`}
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      {item.icon}
                    </svg>
                  </div>

                  {/* Text */}
                  <div className="relative flex flex-col">
                    <span className="text-sm font-semibold tracking-wide">
                      {item.label}
                    </span>
                  </div>

                  {/* Active Dot */}
                  {active && (
                    <div className="ml-auto h-2.5 w-2.5 rounded-full bg-white shadow-lg shadow-white/50" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div
          className={`mt-8 border-t pt-6 ${
            isDark ? "border-slate-800/80" : "border-slate-200"
          }`}
        >
          <button
            type="button"
            onClick={handleLogout}
            className="
        group cursor-pointer relative w-full overflow-hidden rounded-2xl
        border border-red-500/20
        bg-gradient-to-r from-red-500 to-rose-600
        px-4 py-3.5
        text-sm font-semibold text-white
        shadow-lg shadow-red-500/20
        transition-all duration-300
        hover:scale-[1.02]
        hover:shadow-red-500/40
        active:scale-[0.98]
      "
          >
            <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="absolute -left-10 top-0 h-full w-20 rotate-12 bg-white/10 blur-xl" />
            </div>

            <span className="relative flex items-center justify-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-3l-3-3m3 3l-3 3m3-3H9"
                />
              </svg>
              Logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
