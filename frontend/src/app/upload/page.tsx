"use client";

import { FormEvent, useState } from "react";

import { Protected } from "../../components/AuthProvider";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { api } from "../../lib/api";

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
    <Protected>
      <div className="page">
        <div className="page-head">
          <div>
            <div className="eyebrow">Structured Evidence Intake</div>
            <h1>Upload evidence</h1>
            <p>Upload images, documents, spreadsheets, video, audio, and other supported binary evidence.</p>
          </div>
        </div>
        <form className="two-column" onSubmit={submit}>
          <Card className="stack">
            <label className="upload-zone">
              <span>
                <strong>{file ? file.name : "Drop evidence file or browse"}</strong>
                <small>jpg, png, webp, pdf, doc, docx, csv, xls, xlsx, mp4, mov, avi, webm, mp3, wav, m4a, bin</small>
              </span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.csv,.xls,.xlsx,.mp4,.mov,.avi,.webm,.mp3,.wav,.m4a,.bin"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </label>
            <label className="field">
              Add Analyst Note
              <textarea
                rows={5}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Customer claims payment was made on April 12."
              />
            </label>
            {error ? <p className="error">{error}</p> : null}
            {jobId ? <p className="success">Evidence accepted. Processing job {jobId}</p> : null}
            <Button type="submit">Submit evidence</Button>
          </Card>
          <Card>
            <h2>Validation pipeline</h2>
            <div className="timeline">
              <p>File type, extension, size, corruption, malware, and duplicate checks run at the gateway.</p>
              <p>Storage remains private infrastructure and is never exposed to users.</p>
              <p>Analyst notes are stored as metadata and never parsed as primary evidence.</p>
            </div>
          </Card>
        </form>
      </div>
    </Protected>
  );
}
