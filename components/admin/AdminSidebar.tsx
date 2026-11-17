"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";
import type { Role } from "@/lib/server/models/User";

type NavItem = { label: string; href: string; roles?: readonly Role[]; soon?: boolean };

/** The admin sections. Sections marked `soon` are planned and shown greyed out. */
const NAV: readonly NavItem[] = [
  { label: "Dashboard", href: "/admin/" },
  { label: "Outlets", href: "/admin/outlets/", roles: ["outlets"] },
  { label: "Products", href: "/admin/products/", roles: ["editor"] },
  { label: "Reviews", href: "/admin/reviews/", roles: ["editor"] },
  { label: "Blog", href: "#", roles: ["editor"], soon: true },
  { label: "Users", href: "#", roles: [], soon: true },
];

const canSee = (item: NavItem, role: Role) => role === "admin" || !item.roles || item.roles.includes(role);

export function AdminSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  return <aside className="ad-sidebar">
    <Link href="/admin/" className="ad-brand">Kerala Paints<span>Website admin</span></Link>
    <nav aria-label="Admin">
      <ul>
        {NAV.filter((item) => canSee(item, role)).map((item) => {
          const active = item.href === "/admin/" ? pathname === "/admin" || pathname === "/admin/" : pathname.startsWith(item.href.replace(/\/$/, ""));
          return <li key={item.label}>
            {item.soon
              ? <span className="ad-nav-link ad-nav-link--soon">{item.label}<small>Soon</small></span>
              : <Link className="ad-nav-link" href={item.href} aria-current={active ? "page" : undefined}>{item.label}</Link>}
          </li>;
        })}
      </ul>
    </nav>
    <div className="ad-sidebar-foot">
      <a className="ad-nav-link" href="/" target="_blank" rel="noopener noreferrer">View website ↗</a>
      <form action={logout}><button className="ad-nav-link ad-nav-link--button" type="submit">Sign out</button></form>
    </div>
  </aside>;
}