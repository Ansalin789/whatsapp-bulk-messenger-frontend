"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login as authLogin, logout as authLogout, isAuthenticated as checkIsAuthenticated, initializeAuth, getAccessToken } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const isDark = theme === "dark";

  useEffect(() => {
    const storedTheme = typeof window !== "undefined" ? window.localStorage.getItem("whatsapp-theme") : null;
    if (storedTheme === "light" || storedTheme === "dark") {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
    if (checkIsAuthenticated()) {
      setAccessToken(getAccessToken());
      setSubmitted(true);
      setRedirecting(true);
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    try {
      // Call login with username and password
      const result = await authLogin(username, password);

      if (result.success && result.data) {
        setAccessToken(result.data.accessToken);
        setSubmitted(true);
        setRedirecting(true);
        setAuthError(null);
        router.replace("/dashboard");
        console.log("✓ Login successful");
        // console.log("• Access Token:", result.data.accessToken.substring(0, 20) + "...");
        // console.log("• Refresh Token:", result.data.refreshToken.substring(0, 20) + "...");
        console.log("• Access Expires In:", Math.floor(result.data.accessExp / 60000), "minutes");
        console.log("• Refresh Expires In:", Math.floor(result.data.refreshExp / 60000), "minutes");
      } else {
        setAuthError(result.error || "Login failed");
        console.error("✗ Login failed:", result.error);
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "An error occurred");
      console.error("✗ Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authLogout();
    setAccessToken(null);
    setSubmitted(false);
    setUsername("");
    setPassword("");
    setAuthError(null);
    console.log("✓ Logged out successfully");
  };

  return (
    <div
      className={
        "relative min-h-screen overflow-hidden transition-colors duration-500 " +
        (isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-950")
      }
    >
      <div className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-32 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div
        className={
          "pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t transition-colors duration-500 " +
          (isDark
            ? "from-slate-950 via-slate-950/80 to-transparent"
            : "from-slate-100 via-slate-100/70 to-transparent")
        }
      />

      <main className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-12 sm:px-10 lg:flex-row lg:items-center lg:gap-14">
        <div className="absolute -right-10 top-5 z-20">
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
              "inline-flex items-center gap-2 cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-300 " +
              (isDark
                ? "border-slate-700 bg-slate-900/95 text-slate-100 hover:bg-slate-800"
                : "border-slate-300 bg-white/95 text-slate-950 hover:bg-slate-100")
            }
          >
            <span className="inline-flex h-4 w-4 items-center justify-center">
              {isDark ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            {isDark ? "Light mode" : "Dark mode"}
          </button>
        </div>
        <section className="mb-10 max-w-2xl space-y-8 lg:mb-0 lg:flex-1">
          <div className={
            "inline-flex items-center gap-3 rounded-full px-4 py-2 text-sm shadow-sm backdrop-blur-sm transition-all duration-300 " +
            (isDark
              ? "border border-white/10 bg-white/5 text-slate-200 shadow-slate-500/10"
              : "border border-slate-200/70 bg-white/90 text-slate-950 shadow-slate-300/20")
          }>
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Advanced login experience
          </div>

          <div className="space-y-4">
            <p className={isDark ? "text-sm uppercase tracking-[0.28em] text-slate-400" : "text-sm uppercase tracking-[0.28em] text-slate-500"} style={{transition: "color 300ms"}}>Bulk WhatsApp Messenger</p>
            <h1 className={isDark ? "text-4xl font-semibold leading-tight text-white sm:text-5xl" : "text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl"} style={{transition: "color 300ms"}}>
              Secure access to your messaging dashboard
            </h1>
            <p className={isDark ? "max-w-xl text-base leading-8 text-slate-300" : "max-w-xl text-base leading-8 text-slate-600"} style={{transition: "color 300ms"}}>
              Log in with confidence and manage your campaigns from a modern, secure control center with powerful workflow features built for fast messaging.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className={
              "rounded-3xl p-5 shadow-lg backdrop-blur-xl transition-all duration-300 " +
              (isDark
                ? "border border-white/10 bg-white/5 shadow-slate-950/20"
                : "border border-slate-200/60 bg-slate-50 shadow-slate-900/5")
            }>
              <p className={isDark ? "text-sm font-semibold text-white" : "text-sm font-semibold text-slate-950"}>Fast onboarding</p>
              <p className={isDark ? "mt-2 text-sm text-slate-300" : "mt-2 text-sm text-slate-600"}>Get started quickly with a clean login flow designed for business users.</p>
            </div>
            <div className={
              "rounded-3xl p-5 shadow-lg backdrop-blur-xl transition-all duration-300 " +
              (isDark
                ? "border border-white/10 bg-white/5 shadow-slate-950/20"
                : "border border-slate-200/60 bg-slate-50 shadow-slate-900/5")
            }>
              <p className={isDark ? "text-sm font-semibold text-white" : "text-sm font-semibold text-slate-950"}>Enterprise-ready</p>
              <p className={isDark ? "mt-2 text-sm text-slate-300" : "mt-2 text-sm text-slate-600"}>Secure password entry and polished UI for professional campaign managers.</p>
            </div>
          </div>
        </section>

        <section className="lg:w-[420px]">
          <div
            className={
              "rounded-[2rem] p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 " +
              (isDark
                ? "border border-white/10 bg-slate-900/95 shadow-slate-950/40"
                : "border border-slate-200/70 bg-white/95 shadow-slate-900/10")
            }
          >
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <p className={isDark ? "text-sm uppercase tracking-[0.24em] text-slate-400" : "text-sm uppercase tracking-[0.24em] text-slate-500"} style={{transition: "color 300ms"}}>
                  Welcome back
                </p>
                <h2 className={isDark ? "mt-3 text-2xl font-semibold text-white" : "mt-3 text-2xl font-semibold text-slate-950"} style={{transition: "color 300ms"}}>
                  Sign in to continue
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className={isDark ? "rounded-3xl bg-slate-800/80 px-4 py-2 text-xs font-medium text-slate-300" : "rounded-3xl bg-slate-100/80 px-4 py-2 text-xs font-medium text-slate-950"} style={{transition: "all 300ms"}}>
                  Secure login
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block text-sm transition-colors duration-300" style={{color: isDark ? "#cbd5e1" : "#475569"}}>
                <span className="mb-2 block text-sm font-medium transition-colors duration-300" style={{color: isDark ? "#cbd5e1" : "#64748b"}}>Username</span>
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="your.username"
                  className={
                    "w-full rounded-3xl px-4 py-3 text-sm outline-none transition-all duration-300 focus:ring-2 " +
                    (isDark
                      ? "border border-slate-700 bg-slate-950/90 text-slate-100 focus:border-sky-400 focus:ring-sky-500/20"
                      : "border border-slate-300 bg-slate-50 text-slate-950 focus:border-sky-500 focus:ring-sky-200")
                  }
                  required
                />
              </label>

              <label className="block text-sm transition-colors duration-300" style={{color: isDark ? "#cbd5e1" : "#475569"}}>
                <span className="mb-2 block text-sm font-medium transition-colors duration-300" style={{color: isDark ? "#cbd5e1" : "#64748b"}}>Password</span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className={
                      "w-full rounded-3xl px-4 py-3 pr-12 text-sm outline-none transition-all duration-300 focus:ring-2 " +
                      (isDark
                        ? "border border-slate-700 bg-slate-950/90 text-slate-100 focus:border-sky-400 focus:ring-sky-500/20"
                        : "border border-slate-300 bg-slate-50 text-slate-950 focus:border-sky-500 focus:ring-sky-200")
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className={"absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 transition-all duration-300 " + (isDark ? "text-slate-300 hover:bg-slate-800/80 hover:text-slate-100" : "text-slate-500 hover:bg-slate-200 hover:text-slate-900")}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4.5-7 11-7 11 7 11 7-4.5 7-11 7S1 12 1 12Z" />
                        <path d="M7.6 7.6a7 7 0 0 1 8.8 8.8" />
                        <path d="M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4.5-7 11-7 11 7 11 7-4.5 7-11 7S1 12 1 12Z" />
                        <circle cx="12" cy="12" r="3.5" />
                      </svg>
                    )}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-sky-500 via-slate-900 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-sky-500/20 transition hover:scale-[1.01] hover:shadow-sky-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="inline-flex h-4 w-4 items-center justify-center">
                  {isLoading ? (
                    <svg className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" className="opacity-25" />
                      <path className="opacity-75" d="M4 12a8 8 0 018-8v0a8 8 0 018 8" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  )}
                </span>
                {isLoading ? "Signing in..." : "Sign in securely"}
              </button>
            </form>



            {authError && (
              <div className={
                "mt-6 rounded-3xl px-4 py-4 text-sm shadow-inner transition-all duration-300 " +
                (isDark
                  ? "border border-red-300/30 bg-red-500/10 text-red-100 shadow-red-500/10"
                  : "border border-red-200/50 bg-red-50 text-red-900 shadow-red-200/10")
              }>
                <p className="font-medium">Authentication Error</p>
                <p className={`mt-1 ${isDark ? "text-red-200" : "text-red-700"}`}>{authError}</p>
              </div>
            )}

            {submitted && accessToken ? (
              <div className="mt-6 space-y-4">
                <div className={
                  "rounded-3xl px-4 py-4 text-sm shadow-inner transition-all duration-300 " +
                  (isDark
                    ? "border border-emerald-300/30 bg-emerald-500/10 text-emerald-100 shadow-emerald-500/10"
                    : "border border-emerald-200/50 bg-emerald-50 text-emerald-900 shadow-emerald-200/10")
                }>
                  <p className="font-medium">✓ Successfully authenticated</p>
                  {/* <p className={`mt-2 text-xs break-all ${isDark ? "text-emerald-200/80" : "text-emerald-700/80"}`}>
                    <strong>Access Token:</strong> {accessToken.substring(0, 30)}...
                  </p> */}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-3xl bg-slate-200 px-4 py-2 text-xs font-medium text-slate-950 transition hover:bg-slate-300"
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
