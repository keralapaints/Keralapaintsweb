import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getCurrentUser } from "@/lib/server/auth";
import { BRAND_LOGO } from "@/lib/preload";

export const metadata: Metadata = { title: "Sign in" };

type LoginPageProps = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (await getCurrentUser()) redirect("/admin/");
  const { next } = await searchParams;
  return <main className="ad-login">
    <div className="ad-login-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="ad-login-logo" src={BRAND_LOGO} alt="Kerala Paints" width={820} height={500} />
      <h1>Website admin</h1>
      <p>Sign in to manage outlets and website content.</p>
      <LoginForm next={next ?? "/admin/"} />
    </div>
  </main>;
}