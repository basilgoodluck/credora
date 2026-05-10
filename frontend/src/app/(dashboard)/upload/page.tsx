"use client";

import { FormEvent, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { api } from "../../../lib/api";

const TEXT_MAIN = "#0B1220";
const TEXT_MUTED = "#2c4a3e";
const ACCENT = "#28ebc0";
const BORDER = "rgba(0,0,0,0.08)";
const EASE = "cubic-bezier(0.25,0.46,0.45,0.94)";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [jobId, setJobId] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setJobId("");
    if (!file) {
      setError("Select an evidence file to continue.");
      return;
    }
    const form = new FormData();
    form.append("file", file);
    if (note.trim()) form.append("note", note.trim());
    try {
      const response = await api.uploadEvidence(form);
      setJobId(response.job_id);
      setFile(null);
      setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload evidence");
    }
  }

  return (
    <div style={{ padding: "1rem", width: "100%" }}>
      <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {/* Left column – upload form */}
        <Card style={{ background: "#fff", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "1.5rem",
              border: `2px dashed ${BORDER}`,
              borderRadius: 12,
              cursor: "pointer",
              textAlign: "center",
              transition: `border-color 0.2s ${EASE}, background 0.2s ${EASE}`,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.background = "rgba(40,235,192,0.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.background = "transparent"; }}
          >
            <span>
              <strong style={{ color: TEXT_MAIN, display: "block", marginBottom: "0.5rem" }}>{file ? file.name : "Drop evidence file or browse"}</strong>
              <small style={{ color: TEXT_MUTED }}>jpg, png, webp, pdf, doc, docx, csv, xls, xlsx, mp4, mov, avi, webm, mp3, wav, m4a, bin</small>
            </span>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.csv,.xls,.xlsx,.mp4,.mov,.avi,.webm,.mp3,.wav,.m4a,.bin"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              style={{ display: "none" }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem", color: TEXT_MAIN, fontSize: "0.8rem", fontWeight: 500 }}>
            Add Analyst Note
            <textarea
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Customer claims payment was made on April 12."
              style={{
                background: "rgba(0,0,0,0.03)",
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                padding: "0.7rem",
                color: TEXT_MAIN,
                fontSize: "0.8rem",
                fontFamily: "inherit",
                resize: "none",
              }}
            />
          </label>

          {error && <p style={{ color: "#ff6b6b", margin: 0, fontSize: "0.8rem" }}>{error}</p>}
          {jobId && <p style={{ color: ACCENT, margin: 0, fontSize: "0.8rem" }}>Evidence accepted. Processing job {jobId}</p>}
          <Button type="submit">Submit evidence</Button>
        </Card>

        {/* Right column – info */}
        <Card style={{ background: "#fff" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: TEXT_MAIN, margin: "0 0 0.8rem" }}>Validation pipeline</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <p style={{ color: TEXT_MUTED, fontSize: "0.8rem", margin: 0 }}>File type, extension, size, corruption, malware, and duplicate checks run at the gateway.</p>
            <p style={{ color: TEXT_MUTED, fontSize: "0.8rem", margin: 0 }}>Storage remains private infrastructure and is never exposed to users.</p>
            <p style={{ color: TEXT_MUTED, fontSize: "0.8rem", margin: 0 }}>Analyst notes are stored as metadata and never parsed as primary evidence.</p>
          </div>
        </Card>
      </form>
    </div>
  );
}