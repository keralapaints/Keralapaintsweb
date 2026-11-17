import type { Metadata } from "next";
import Link from "next/link";
import { ProductTable } from "@/components/admin/ProductTable";
import { requireUser } from "@/lib/server/auth";
import { listAdminProducts } from "@/lib/server/products-repo";

export const metadata: Metadata = { title: "Products" };

const SAVED: Record<string, string> = {
  added: "Product added. Its page is live (if “Show on the website” is ticked).",
  updated: "Product saved. The website is updated.",
  deleted: "Product deleted. Its page is no longer on the website.",
};

type ProductsAdminProps = { searchParams: Promise<{ saved?: string }> };

export default async function ProductsAdminPage({ searchParams }: ProductsAdminProps) {
  await requireUser(["editor"]);
  const [{ saved }, products] = await Promise.all([searchParams, listAdminProducts()]);
  return <>
    <div className="ad-page-head">
      <div>
        <p className="ad-eyebrow">Product pages</p>
        <h1>Products</h1>
      </div>
      <div className="ad-actions-row">
        <a className="ad-button" href="/products/" target="_blank" rel="noopener noreferrer">View products ↗</a>
        <Link className="ad-button ad-button--primary" href="/admin/products/new/">Add a product</Link>
      </div>
    </div>
    {saved && SAVED[saved] && <p className="ad-notice" role="status">{SAVED[saved]}</p>}
    {products.length === 0 && <p className="ad-notice ad-notice--warn">No products in the database yet. Run <code>npm run products:import</code> once to copy the current product pages in.</p>}
    <ProductTable products={products} />
  </>;
}