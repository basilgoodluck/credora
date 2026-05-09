"use client";

import { Protected, useAuth } from "../../components/AuthProvider";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <Protected>
      <div className="page mobile-page">
        <div className="page-head">
          <div>
            <div className="eyebrow">Security Controls</div>
            <h1>Settings</h1>
            <p>Account and device access.</p>
          </div>
        </div>
        <Card className="stack">
          <div className="details">
            <div>
              <dt>Phone number</dt>
              <dd>{user?.phone_number}</dd>
            </div>
            <div>
              <dt>Account</dt>
              <dd>One financial identity</dd>
            </div>
          </div>
          <Button variant="danger" onClick={logout}>
            Secure logout
          </Button>
        </Card>
      </div>
    </Protected>
  );
}
