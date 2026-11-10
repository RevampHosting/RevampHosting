import { Suspense } from "react";
import { AdminLoading, AdminPageHeader, NotConfigured } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import { readSiteSettings } from "@/lib/data/settings";
import { isSupabaseConfigured } from "@/lib/env";
import { SettingsForm } from "./settings-form";

export const metadata = { title: "Website Settings" };

export default function SettingsPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Settings />
    </Suspense>
  );
}

async function Settings() {
  await requireAdmin();
  if (!isSupabaseConfigured()) return <NotConfigured />;
  const settings = await readSiteSettings();
  return (
    <>
      <AdminPageHeader title="Website Settings" description="Update the company information shown across your website." />
      <SettingsForm settings={settings} />
    </>
  );
}
