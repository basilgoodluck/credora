```markdown
# Credora – AI Credit Scoring for Informal Workers

Credora is an end‑to‑end credit scoring platform that enables underbanked individuals to build a financial identity using everyday evidence – bank SMS, payment screenshots, WhatsApp chats, receipts, PDF statements, and more. A vision‑language model (Qwen2.5‑VL‑7B) runs on AMD GPUs (via ROCm) to extract financial events, which are then cross‑checked, scored, and presented as a transparent, portable credit profile.

> 🏆 Built for the **AMD Hackathon 2025**

---

## 🧠 How It Works

1. **Upload evidence** – Any format (image, PDF, CSV, text)  
2. **AI extraction** – Qwen2.5‑VL‑7B extracts amounts, dates, transaction types  
3. **Cross‑check** – Detects duplicates, contradictions, and fraud flags  
4. **Scoring** – Produces stability, repayment, and confidence scores  
5. **Output** – A shareable credit profile + loan recommendation  

---

## 🛠️ Tech Stack

| Component       | Technology                                               |
|----------------|----------------------------------------------------------|
| **Backend API**  | FastAPI (Python), Prisma ORM, JWT auth                  |
| **Async worker** | Celery, Redis                                            |
| **Database**     | PostgreSQL                                               |
| **AI Server**    | vLLM + ROCm (AMD GPU), Qwen2.5‑VL‑7B‑Instruct           |
| **Frontend**     | Next.js 16 (React), Tailwind CSS                        |
| **Infrastructure** | Docker Compose, Caddy (HTTPS), Cloudinary (direct uploads) |

---

## 🚀 Quick Start (Production on a VPS)

All services run in Docker. The `vllm` service uses **AMD ROCm** – ensure your host has ROCm installed and the `rocm/vllm:rocm6.4.1_vllm_0.10.1_20250909` image is available.

```bash
# Clone the repository
git clone https://github.com/basilgoodluck/credora.git
cd credora

# Copy environment variables
cp .env.example .env
# Edit .env – add HF_TOKEN, JWT_SECRET, etc.

# Build and start everything
docker compose up -d --build

# Seed the database (demo data)
docker compose run --rm seed
```

Your API will be available at `http://<your-server-ip>:8000`.  
For HTTPS, Caddy is included – set `FRONTEND_URL=https://credora.basilgoodluck.com` and ensure DNS points to your droplet.

---

## ⚙️ Environment Variables (`.env`)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis URL for Celery broker |
| `JWT_SECRET` | Secret for JWT signing |
| `FRONTEND_URL` | Frontend origin (CORS, e.g. `https://credora-psi.vercel.app`) |
| `STORAGE_ROOT` | Path to private file storage |
| `HF_TOKEN` | Hugging Face token (gated Qwen model) |
| `VLLM_ENDPOINT` | Internal vLLM endpoint (`http://vllm:8001/v1`) |
| `VLLM_API_KEY` | API key for vLLM (must match `token-abc123`) |
| `NEXT_PUBLIC_API_URL` | Frontend env – public API URL (e.g. `https://credora.basilgoodluck.com`) |
| `NEXT_PUBLIC_CLOUDINARY_*` | Cloudinary unsigned upload preset |

---

## 🧪 Development (Local, without vLLM)

For local testing you can skip the `vllm` service and use a mocked extraction.

```bash
# Start only the core services
docker compose up -d postgres redis gateway worker

# Or run locally with Python virtual environment
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn gateway.main:app --reload
```

---

## 📦 Project Structure (Selected)

```
credora/
├── gateway/                 # FastAPI backend
│   ├── routers/             # endpoints: auth, evidence, jobs, profiles
│   ├── middleware/          # auth guard, CORS
│   └── main.py
├── worker/                  # Celery tasks
│   ├── pipeline/            # scan, cross_check, score, reason
│   ├── jobs/                # process_evidence, recompute_score
│   └── utils/               # vLLM client
├── shared/                  # Pydantic models, enums (used by both)
├── frontend/                # Next.js app
│   ├── app/                 # pages (dashboard, upload, login…)
│   └── components/          # Header, Footer, AuthProvider
├── prisma/                  # database schema
├── docker/                  # Dockerfiles
├── scripts/                 # seed_demo.py
└── docker-compose.yml
```

---

## 🌐 Deployment Notes (AMD GPU)

- The `vllm` service uses the official ROCm image. Verify your GPU is visible: `docker run --rm --device=/dev/kfd --device=/dev/dri rocm/vllm rocminfo`
- On first start, the model (≈15GB) will be downloaded into `vllm_cache` volume.
- If vLLM crashes with `unrecognized arguments: serve`, the command in `docker-compose.yml` already uses `python -m vllm.entrypoints.openai.api_server` – that is correct.

---

## 🙌 Acknowledgements

- [AMD ROCm](https://rocm.docs.amd.com/) for GPU acceleration
- [vLLM](https://vllm.readthedocs.io/) for high‑throughput LLM serving
- [Qwen2.5-VL](https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct) for vision‑language understanding
- FastAPI, Celery, Next.js communities

---

## 📄 License

MIT © Basil Goodluck
```
