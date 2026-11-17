import { buildProductMenu } from "@/lib/product/product-menu";
import { getProductPages } from "@/lib/server/products-repo";
import { HeaderNav, type HeaderProps } from "./HeaderNav";

/**
 * The site header. It reads the published products (MongoDB, or data/ without one) on the server, so the Products
 * menu lists every category with its products, including products added in /admin; the menu itself is HeaderNav.
 */
export async function Header(props: HeaderProps) {
  const productMenu = buildProductMenu(await getProductPages());
  return <HeaderNav {...props} productMenu={productMenu} />;
}
