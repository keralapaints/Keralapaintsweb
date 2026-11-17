import type { Metadata } from "next";
import "@/components/admin/admin.css";

export const metadata: Metadata = {
  title: { default: "Admin | Kerala Paints", template: "%s | Kerala Paints Admin" },
  robots: { index: false, follow: false },
};

/** Everything under /admin: the dashboard's own look, outside the public site's header and footer. */
export default function AdminRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="ad-root">{children}</div>;
}