import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { listAdminOutlets } from "@/lib/server/outlets-repo";
import { listAdminProducts } from "@/lib/server/products-repo";

export const metadata: Metadata = { title: "Dashboard" };

type DashboardProps = { searchParams: Promise<{ denied?: string }> };

export default async function AdminDashboard({ searchParams }: DashboardProps) {
  const user = await requireUser();
  const { denied } = await searchParams;
  const canOutlets = user.role === "admin" || user.role === "outlets";
  const canProducts = user.role === "admin" || user.role === "editor";
  const [outlets, products] = await Promise.all([canOutlets ? listAdminOutlets() : [], canProducts ? listAdminProducts() : []]);
  const stats = [
    { label: "Outlets on the website", value: outlets.filter((outlet) => outlet.published).length },
    { label: "Factory outlets", value: outlets.filter((outlet) => outlet.published && outlet.type === "factory").length },
    { label: "Authorised dealers", value: outlets.filter((outlet) => outlet.published && outlet.type === "dealer").length },
    { label: "Marked new", value: outlets.filter((outlet) => outlet.isNew).length },
    { label: "Hidden", value: outlets.filter((outlet) => !outlet.published).length },
  ];
  return <>
    <div className="ad-page-head">
      <div>
        <p className="ad-eyebrow">Welcome back</p>
        <h1>{user.name}</h1>
      </div>
    </div>
    {denied && <p className="ad-notice ad-notice--warn">Your account does not have access to that section.</p>}
    {canOutlets && <>
      <ul className="ad-stats">
        {stats.map((stat) => <li key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></li>)}
      </ul>
      <div className="ad-actions-row">
        <Link className="ad-button ad-button--primary" href="/admin/outlets/new/">Add an outlet</Link>
        <Link className="ad-button" href="/admin/outlets/">Manage outlets</Link>
      </div>
    </>}
    {canProducts && <>
      <ul className="ad-stats">
        <li><strong>{products.filter((product) => product.published).length}</strong><span>Product pages live</span></li>
        <li><strong>{products.filter((product) => !product.published).length}</strong><span>Hidden products</span></li>
        <li><strong>{products.filter((product) => !product.hasPackshot).length}</strong><span>Without a packshot</span></li>
      </ul>
      <div className="ad-actions-row">
        <Link className="ad-button ad-button--primary" href="/admin/products/new/">Add a product</Link>
        <Link className="ad-button" href="/admin/products/">Manage products</Link>
      </div>
    </>}
    <section className="ad-panel">
      <h2>Coming next</h2>
      <p>The blog and user management will appear in the sidebar as they are added.</p>
    </section>
  </>;
}