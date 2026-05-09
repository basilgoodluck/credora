"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "../../../components/AuthProvider";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { api } from "../../../lib/api";

export default function SetPasswordPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api.setPassword(password);
      setUser(await api.me());
      router.push("/set-pin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to set password");
    }
  }

  return (
    <div className="login-view">
      <Card className="login-card">
        <h1>Set password</h1>
        <p className="muted">Use a strong password to protect your financial identity.</p>
        <form className="stack" onSubmit={submit}>
          <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
          {error ? <p className="error">{error}</p> : null}
          <Button type="submit">Continue</Button>
        </form>
      </Card>
    </div>
  );
}
