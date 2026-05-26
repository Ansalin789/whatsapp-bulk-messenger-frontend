"use client";

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

interface TemplatesProps {
  isDark: boolean;
}

export function Templates({ isDark }: TemplatesProps) {
  const sectionStyle = isDark
    ? "border-slate-800/70 bg-slate-900/80 shadow-2xl shadow-slate-950/20"
    : "border-slate-200/70 bg-white/90 shadow-xl shadow-slate-900/10";
  const cardStyle = isDark
    ? "border-slate-800/70 bg-slate-900/80 text-slate-100 shadow-slate-950/20"
    : "border-slate-200/70 bg-white/90 text-slate-950 shadow-slate-900/10";
  const inputStyle = isDark
    ? "border-slate-700 bg-slate-950/80 text-slate-100"
    : "border-slate-300 bg-slate-50 text-slate-950";
  const labelStyle = isDark ? "text-slate-300" : "text-slate-700";
  const mutedText = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <div className="space-y-6">
      <section className={`rounded-[2rem] p-6 border ${sectionStyle}`}>
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
              className={`rounded-[2rem] p-5 shadow-lg border ${cardStyle}`}
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

      <section className={`rounded-[2rem] p-6 border ${sectionStyle}`}>
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
            <label className={`block text-sm font-medium ${labelStyle}`}>
              Template name
            </label>
            <input
              type="text"
              placeholder="e.g., Weekly Newsletter"
              className={`mt-2 w-full rounded-lg border px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 ${inputStyle}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${labelStyle}`}>
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
  );
}
