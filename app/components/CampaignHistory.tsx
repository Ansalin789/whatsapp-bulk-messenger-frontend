"use client";

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

interface CampaignHistoryProps {
  isDark: boolean;
}

export function CampaignHistory({ isDark }: CampaignHistoryProps) {
  const sectionStyle = isDark
    ? "border-slate-800/70 bg-slate-900/80 shadow-2xl shadow-slate-950/20"
    : "border-slate-200/70 bg-white/90 shadow-xl shadow-slate-900/10";

  const cardStyle = isDark
    ? "bg-slate-900/80 border border-slate-800/70 text-white"
    : "bg-white border border-slate-200/70 text-slate-950";

  const mutedText = isDark ? "text-slate-400" : "text-slate-500";

  // Temporary translation helper
  const t = (text: string) => text;

  return (
    <div className="space-y-6">
      {/* Metric stats cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article
          className={`rounded-[2rem] p-6 shadow-lg transition-transform hover:scale-[1.01] ${cardStyle}`}
        >
          <p className={`text-sm uppercase tracking-[0.24em] ${mutedText}`}>
            {t("Active campaigns")}
          </p>

          <p className="mt-4 text-4xl font-semibold">4</p>

          <p className={`mt-2 text-sm ${mutedText}`}>
            {t("Live campaigns running across your audience.")}
          </p>
        </article>

        <article
          className={`rounded-[2rem] p-6 shadow-lg transition-transform hover:scale-[1.01] ${cardStyle}`}
        >
          <p className={`text-sm uppercase tracking-[0.24em] ${mutedText}`}>
            {t("Messages sent")}
          </p>

          <p className="mt-4 text-4xl font-semibold">3,940</p>

          <p className={`mt-2 text-sm ${mutedText}`}>
            {t("Delivered messages from recent campaigns.")}
          </p>
        </article>

        <article
          className={`rounded-[2rem] p-6 shadow-lg transition-transform hover:scale-[1.01] ${cardStyle}`}
        >
          <p className={`text-sm uppercase tracking-[0.24em] ${mutedText}`}>
            {t("Templates ready")}
          </p>

          <p className="mt-4 text-4xl font-semibold">12</p>

          <p className={`mt-2 text-sm ${mutedText}`}>
            {t("Reusable templates stored for quick messaging.")}
          </p>
        </article>
      </section>

      {/* Campaign table */}
      <section
        className={`overflow-hidden rounded-[2rem] border ${sectionStyle}`}
      >
        <div
          className={`border-b px-6 py-5 ${
            isDark
              ? "border-slate-800/70 bg-slate-950/80"
              : "border-slate-200/70 bg-slate-100"
          }`}
        >
          <h2
            className={
              isDark
                ? "text-xl font-semibold text-white"
                : "text-xl font-semibold text-slate-950"
            }
          >
            {t("All campaigns")}
          </h2>

          <p className={`mt-1 text-sm ${mutedText}`}>
            {t(
              "Track performance and delivery status of all your campaigns."
            )}
          </p>
        </div>

        <div className="min-w-full overflow-x-auto px-6 py-5">
          <table className="min-w-full border-separate border-spacing-y-3 text-left">
            <thead>
              <tr className="text-xs uppercase tracking-[0.3em] text-slate-500">
                <th className="px-3 py-3">{t("Campaign name")}</th>
                <th className="px-3 py-3">{t("Messages sent")}</th>
                <th className="px-3 py-3">{t("Status")}</th>
                <th className="px-3 py-3">{t("Last run")}</th>
                <th className="px-3 py-3">{t("Action")}</th>
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
                      {t(campaign.status)}
                    </span>
                  </td>

                  <td className="px-3 py-4 text-slate-400">
                    {campaign.lastRun}
                  </td>

                  <td className="px-3 py-4">
                    <button className="text-sm font-medium text-sky-400 hover:text-sky-300">
                      {t("View")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}