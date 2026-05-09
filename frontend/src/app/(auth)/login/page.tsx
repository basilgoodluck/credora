"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "../../../components/AuthProvider";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { api } from "../../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api.login(phone, password);
      setUser(await api.me());
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    }
  }

  return (
    <div className="login-view">
      <Card className="login-card">
        <h1>Welcome back</h1>
        <p className="muted">Sign in with your phone number and password.</p>
        <form className="stack" onSubmit={submit}>
          <Input label="Phone number" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" required />
          <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
          {error ? <p className="error">{error}</p> : null}
          <Button type="submit">Enter dashboard</Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/signup")}>
            Create account
          </Button>
        </form>
      </Card>
    </div>
  );
}
