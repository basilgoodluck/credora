"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { api } from "../../../lib/api";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  useEffect(() => setPhone(sessionStorage.getItem("cq_phone") || ""), []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api.verifyOtp(phone, otp, "signup");
      router.push("/set-password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify code");
    }
  }

  return (
    <div className="login-view">
      <Card className="login-card">
        <h1>Verify phone</h1>
        <p className="muted">Enter the one-time code sent to your phone.</p>
        <form className="stack" onSubmit={submit}>
          <Input label="Phone number" value={phone} onChange={(event) => setPhone(event.target.value)} required />
          <Input label="Verification code" value={otp} onChange={(event) => setOtp(event.target.value)} inputMode="numeric" required />
          {error ? <p className="error">{error}</p> : null}
          <Button type="submit">Verify</Button>
        </form>
      </Card>
    </div>
  );
}
