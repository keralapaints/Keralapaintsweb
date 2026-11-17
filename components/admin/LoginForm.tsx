"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return <form action={action} className="ad-form ad-login-form">
    <input type="hidden" name="next" value={next} />
    <label className="ad-field">
      <span>Email</span>
      <input name="email" type="email" autoComplete="username" required defaultValue={state.email} autoFocus />
    </label>
    <label className="ad-field">
      <span>Password</span>
      <input name="password" type="password" autoComplete="current-password" required />
    </label>
    {state.error && <p className="ad-error" role="alert">{state.error}</p>}
    <button className="ad-button ad-button--primary" type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
  </form>;
}