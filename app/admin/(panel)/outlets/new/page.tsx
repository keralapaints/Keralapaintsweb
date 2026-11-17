import type { Metadata } from "next";
import Link from "next/link";
import { OutletForm } from "@/components/admin/OutletForm";
import { requireUser } from "@/lib/server/auth";
import { listDistricts } from "@/lib/server/outlets-repo";

export const metadata: Metadata = { title: "Add an outlet" };

export default async function NewOutletPage() {
  await requireUser(["outlets"]);
  return <>
    <div className="ad-page-head">
      <div>
        <p className="ad-eyebrow"><Link href="/admin/outlets/">Outlets</Link></p>
        <h1>Add an outlet</h1>
      </div>
    </div>
    <OutletForm districts={await listDistricts()} />
  </>;
}