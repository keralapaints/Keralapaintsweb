import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireUser } from "@/lib/server/auth";
import { getAdminProduct, listProductKeys } from "@/lib/server/products-repo";

export const metadata: Metadata = { title: "Edit product" };

type EditProductProps = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: EditProductProps) {
  await requireUser(["editor"]);
  const { id } = await params;
  const [product, productKeys] = await Promise.all([getAdminProduct(id), listProductKeys()]);
  if (!product) notFound();
  return <>
    <div className="ad-page-head">
      <div>
        <p className="ad-eyebrow"><Link href="/admin/products/">Products</Link></p>
        <h1>{product.input.name}</h1>
      </div>
      <div className="ad-actions-row">
        <a className="ad-button" href={product.path} target="_blank" rel="noopener noreferrer">View page ↗</a>
        {!product.inRange && <DeleteProductButton id={product.id} label={product.input.name} />}
      </div>
    </div>
    <ProductForm id={product.id} inRange={product.inRange} initial={product.input} productKeys={productKeys} />
  </>;
}