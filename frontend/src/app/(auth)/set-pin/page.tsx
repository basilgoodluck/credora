"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Protected } from "../../../components/AuthProvider";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { api } from "../../../lib/api";

export default function SetPinPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      if (pin) await api.setPin(pin, true);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to set PIN");
    }
  }

  return (
    <Protected>
      <div className="login-view">
        <Card className="login-card">
          <h1>Device PIN</h1>
          <p className="muted">Add a 4-6 digit PIN for faster access on this device.</p>
          <form className="stack" onSubmit={submit}>
            <Input label="PIN" value={pin} onChange={(event) => setPin(event.target.value)} inputMode="numeric" pattern="[0-9]{4,6}" />
            {error ? <p className="error">{error}</p> : null}
            <Button type="submit">Finish setup</Button>
            <Button type="button" variant="secondary" onClick={() => router.push("/dashboard")}>
              Skip for now
            </Button>
          </form>
        </Card>
      </div>
    </Protected>
  );
}
