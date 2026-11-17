import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteOutletButton } from "@/components/admin/DeleteOutletButton";
import { OutletForm } from "@/components/admin/OutletForm";
import { requireUser } from "@/lib/server/auth";
import { getAdminOutlet, listDistricts } from "@/lib/server/outlets-repo";

export const metadata: Metadata = { title: "Edit outlet" };

type EditOutletProps = { params: Promise<{ id: string }> };

export default async function EditOutletPage({ params }: EditOutletProps) {
  await requireUser(["outlets"]);
  const { id } = await params;
  const [outlet, districts] = await Promise.all([getAdminOutlet(id), listDistricts()]);
  if (!outlet) notFound();
  return <>
    <div className="ad-page-head">
      <div>
        <p className="ad-eyebrow"><Link href="/admin/outlets/">Outlets</Link></p>
        <h1>{outlet.name ?? `Factory outlet – ${outlet.place}`}</h1>
      </div>
      <DeleteOutletButton id={outlet.id} label={outlet.name ?? outlet.place} />
    </div>
    <OutletForm outlet={outlet} districts={districts} />
  </>;
}