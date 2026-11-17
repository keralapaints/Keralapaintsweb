import type { Metadata } from "next";
import Link from "next/link";
import { OutletTable } from "@/components/admin/OutletTable";
import { requireUser } from "@/lib/server/auth";
import { listAdminOutlets } from "@/lib/server/outlets-repo";

export const metadata: Metadata = { title: "Outlets" };

const SAVED: Record<string, string> = {
  added: "Outlet added. The website is updated.",
  updated: "Outlet saved. The website is updated.",
  deleted: "Outlet deleted. The website is updated.",
};

type OutletsAdminProps = { searchParams: Promise<{ saved?: string }> };

export default async function OutletsAdminPage({ searchParams }: OutletsAdminProps) {
  await requireUser(["outlets"]);
  const [{ saved }, outlets] = await Promise.all([searchParams, listAdminOutlets()]);
  return <>
    <div className="ad-page-head">
      <div>
        <p className="ad-eyebrow">Find an Outlet page</p>
        <h1>Outlets</h1>
      </div>
      <div className="ad-actions-row">
        <a className="ad-button" href="/outlets/" target="_blank" rel="noopener noreferrer">View page ↗</a>
        <Link className="ad-button ad-button--primary" href="/admin/outlets/new/">Add an outlet</Link>
      </div>
    </div>
    {saved && SAVED[saved] && <p className="ad-notice" role="status">{SAVED[saved]}</p>}
    <OutletTable outlets={outlets} />
  </>;
}