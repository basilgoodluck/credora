"use client";

import { FormEvent, useState, useRef } from "react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { api } from "../../../lib/api";

const TEXT_MAIN = "#0B1220";
const TEXT_MUTED = "#2c4a3e";
const ACCENT = "#28ebc0";
const BORDER = "rgba(0,0,0,0.08)";
const EASE = "cubic-bezier(0.25,0.46,0.45,0.94)";

// Simple Modal Component
function InfoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          maxWidth: "500px",
          width: "90%",
          padding: "1.5rem",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          animation: "fadeInUp 0.3s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: "1.25rem", fontWeight: 600, margin: "0 0 0.5rem", color: TEXT_MAIN }}>
          Validation pipeline
        </h3>
        <hr style={{ margin: "0.5rem 0 1rem", borderColor: BORDER }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
              <span style={{ fontSize: "1.5rem" }}>🔍</span>
              <strong style={{ color: TEXT_MAIN }}>Gateway checks</strong>
            </div>
            <p style={{ color: TEXT_MUTED, margin: 0, fontSize: "0.85rem" }}>File type, extension, size, corruption, malware, and duplicate checks run at the gateway.</p>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
              <span style={{ fontSize: "1.5rem" }}>💾</span>
              <strong style={{ color: TEXT_MAIN }}>Private storage</strong>
            </div>
            <p style={{ color: TEXT_MUTED, margin: 0, fontSize: "0.85rem" }}>Storage remains private infrastructure and is never exposed to users.</p>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
              <span style={{ fontSize: "1.5rem" }}>📝</span>
              <strong style={{ color: TEXT_MAIN }}>Analyst notes</strong>
            </div>
            <p style={{ color: TEXT_MUTED, margin: 0, fontSize: "0.85rem" }}>Analyst notes are stored as metadata and never parsed as primary evidence.</p>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
              <span style={{ fontSize: "1.5rem" }}>🤖</span>
              <strong style={{ color: TEXT_MAIN }}>AI extraction</strong>
            </div>
            <p style={{ color: TEXT_MUTED, margin: 0, fontSize: "0.85rem" }}>Qwen2.5‑VL‑7B runs on AMD GPU to extract transactions from images, PDFs, and SMS logs.</p>
          </div>
        </div>
        <Button onClick={onClose} style={{ marginTop: "1.5rem", width: "100%" }}>Got it</Button>
      </div>
    </div>
  );
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [jobId, setJobId] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setJobId("");
    if (!file) {
      setError("Select an evidence file to continue.");
      return;
    }
    setIsSubmitting(true);
    const form = new FormData();
    form.append("file", file);
    if (note.trim()) form.append("note", note.trim());
    try {
      const response = await api.uploadEvidence(form);
      setJobId(response.job_id);
      setFile(null);
      setNote("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload evidence");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).style.borderColor = ACCENT;
    (e.currentTarget as HTMLElement).style.background = "rgba(40,235,192,0.05)";
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).style.borderColor = BORDER;
    (e.currentTarget as HTMLElement).style.background = "transparent";
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
    (e.currentTarget as HTMLElement).style.borderColor = BORDER;
    (e.currentTarget as HTMLElement).style.background = "transparent";
  };

  return (
    <div style={{ padding: "1rem", width: "100%" }}>
      <InfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {/* Left column – upload form */}
        <Card style={{ background: "#fff", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div
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
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <span>
              <strong style={{ color: TEXT_MAIN, display: "block", marginBottom: "0.5rem" }}>
                {file ? file.name : "Drop evidence file or click to browse"}
              </strong>
              <small style={{ color: TEXT_MUTED }}>
                jpg, png, webp, pdf, doc, docx, csv, xls, xlsx, mp4, mov, avi, webm, mp3, wav, m4a, bin
              </small>
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.csv,.xls,.xlsx,.mp4,.mov,.avi,.webm,.mp3,.wav,.m4a,.bin"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              style={{ display: "none" }}
            />
          </div>

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
          {jobId && (
            <div style={{ background: "rgba(40,235,192,0.1)", borderRadius: 8, padding: "0.75rem", textAlign: "center" }}>
              <span style={{ color: ACCENT, fontWeight: 500 }}>✓ Evidence accepted</span>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.7rem", color: TEXT_MUTED }}>Job ID: {jobId}</p>
            </div>
          )}
          <Button type="submit" disabled={isSubmitting} style={{ position: "relative" }}>
            {isSubmitting ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <span className="spinner" style={{
                  display: "inline-block",
                  width: "1rem",
                  height: "1rem",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin 0.6s linear infinite"
                }} />
                Processing...
              </span>
            ) : (
              "Submit evidence"
            )}
          </Button>
        </Card>

        {/* Right column – interactive info card with modal trigger */}
        <Card style={{ background: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: 600, color: TEXT_MAIN, margin: "0 0 0.5rem" }}>
              How your evidence is processed
            </h2>
            <p style={{ color: TEXT_MUTED, fontSize: "0.8rem", margin: "0 0 1rem" }}>
              From upload to AI extraction — we handle it all.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", color: TEXT_MAIN, fontWeight: "bold" }}>1</div>
                <span style={{ color: TEXT_MAIN }}>Gateway security checks</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", color: TEXT_MAIN, fontWeight: "bold" }}>2</div>
                <span style={{ color: TEXT_MAIN }}>Private encrypted storage</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", color: TEXT_MAIN, fontWeight: "bold" }}>3</div>
                <span style={{ color: TEXT_MAIN }}>Qwen2.5-VL-7B AI extraction (via AMD GPU)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", color: TEXT_MAIN, fontWeight: "bold" }}>4</div>
                <span style={{ color: TEXT_MAIN }}>Cross‑check with existing events</span>
              </div>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsModalOpen(true)}
            style={{ marginTop: "1.5rem", borderColor: ACCENT, color: ACCENT }}
          >
            Learn more
          </Button>
        </Card>
      </form>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}