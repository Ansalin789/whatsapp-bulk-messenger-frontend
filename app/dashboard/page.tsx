import DashboardClient from "./dashboard-client";

export const metadata = {
  title: "Bulk WhatsApp Messenger | Dashboard",
  description: "Manage campaigns, templates, and campaign history in the WhatsApp dashboard.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
