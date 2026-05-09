"use client";

import { Protected, useAuth } from "../../components/AuthProvider";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";

export default function UsersPage() {
  const { user } = useAuth();
  return (
    <Protected>
      <div className="page">
        <div className="page-head"><div><div className="eyebrow">Workspace Identity</div><h1>Users</h1><p>Current account access and verified identity status.</p></div></div>
        <Card>
          <div className="mini-list">
            <div><span>{user?.full_name || "Amina Balogun"}<small>{user?.phone_number}</small></span><Badge tone="good">KYC verified</Badge></div>
            <div><span>Role</span><strong>Account owner</strong></div>
            <div><span>Country</span><strong>Nigeria</strong></div>
            <div><span>Account state</span><strong>Active</strong></div>
          </div>
        </Card>
      </div>
    </Protected>
  );
}
