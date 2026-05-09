"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { api } from "../../../lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api.register(phone);
      sessionStorage.setItem("cq_phone", phone);
      router.push("/verify-otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start signup");
    }
  }

  return (
    <div className="login-view">
      <Card className="login-card">
        <h1>Create your account</h1>
        <p className="muted">Use the phone number connected to your daily financial activity.</p>
        <form className="stack" onSubmit={submit}>
          <Input label="Phone number" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" required />
          {error ? <p className="error">{error}</p> : null}
          <Button type="submit">Send verification code</Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/login")}>
            I already have an account
          </Button>
        </form>
      </Card>
    </div>
  );
}
