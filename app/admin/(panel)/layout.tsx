import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { requireUser } from "@/lib/server/auth";
import { ROLE_LABELS } from "@/lib/server/models/User";

/** The signed-in admin: sidebar navigation beside the page. */
export default async function AdminPanelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();
  return <div className="ad-shell">
    <AdminSidebar role={user.role} />
    <div className="ad-main">
      <header className="ad-topbar">
        <span className="ad-topbar-user">{user.name}<small>{ROLE_LABELS[user.role]}</small></span>
      </header>
      <main className="ad-content">{children}</main>
    </div>
  </div>;
}