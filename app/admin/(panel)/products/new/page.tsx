import type { Metadata } from "next";
import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { emptyProduct } from "@/lib/admin/product-form";
import { requireUser } from "@/lib/server/auth";
import { listProductKeys } from "@/lib/server/products-repo";

export const metadata: Metadata = { title: "Add a product" };

export default async function NewProductPage() {
  await requireUser(["editor"]);
  return <>
    <div className="ad-page-head">
      <div>
        <p className="ad-eyebrow"><Link href="/admin/products/">Products</Link></p>
        <h1>Add a product</h1>
      </div>
    </div>
    <ProductForm initial={emptyProduct()} productKeys={await listProductKeys()} />
  </>;
}