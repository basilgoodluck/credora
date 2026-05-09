# Credit Quotient

```bash
cp .env.example .env
docker compose up --build
cd frontend
npm install
npm run dev
```

Run Prisma locally after changing the schema:

```bash
prisma generate --schema=prisma/schema.prisma
prisma db push --schema=prisma/schema.prisma
```


# Credit Quotient — Final Architecture

All issues from review resolved:
- Worker imports modules directly, no internal HTTP calls
- Claude only called for ambiguous text and once for reasoning per rescore
- Social mismatch moved into scorer post-computation
- Debounced recompute with Celery countdown=45
- Shared Pydantic models in shared/ package
- Worker owns single atomic DB write at end of pipeline
- Cloudinary unsigned upload preset — frontend uploads directly, no backend credentials
- job_status table added for frontend polling
- Retry policies defined with exponential backoff

---

```
credit-quotient/
│
├── frontend/                          # React → Vercel
│   ├── public/
│   └── src/
│       ├── app/
│       │   ├── (auth)/
│       │   │   └── login/
│       │   │       └── page.tsx       # Google Identity SDK button
│       │   ├── dashboard/
│       │   │   └── page.tsx
│       │   ├── profiles/
│       │   │   ├── page.tsx
│       │   │   └── [id]/
│       │   │       ├── page.tsx       # profile view: scores, history, evidence list
│       │   │       └── evidence/
│       │   │           └── page.tsx   # submit evidence, shows job_status polling
│       │   └── layout.tsx
│       ├── components/
│       │   ├── ui/                    # button, input, card, badge, modal, toast
│       │   ├── profile/
│       │   │   ├── ScoreCard.tsx      # income_stability, repayment_reliability,
│       │   │   │                      # data_confidence, overall_score as gauges
│       │   │   ├── ScoreHistory.tsx   # line chart of overall_score across snapshots
│       │   │   ├── EvidenceList.tsx   # all inputs with source badge, confidence tag,
│       │   │   │                      # flagged items in red with flag_reason
│       │   │   └── Recommendation.tsx # recommended_amount, recommended_term, plain text
│       │   └── evidence/
│       │       ├── ImageUpload.tsx
│       │       │     # camera or file upload
│       │       │     # UPLOAD FLOW:
│       │       │     # 1. user selects file
│       │       │     # 2. POST directly to Cloudinary:
│       │       │     #    https://api.cloudinary.com/v1_1/{CLOUD_NAME}/auto/upload
│       │       │     #    body: FormData { file, upload_preset: CLOUDINARY_UPLOAD_PRESET }
│       │       │     # 3. Cloudinary returns { secure_url, public_id }
│       │       │     # 4. frontend sends secure_url to gateway as file_url field
│       │       │     # No Cloudinary credentials ever touch the backend
│       │       │
│       │       ├── TextPaste.tsx      # textarea for SMS or WhatsApp paste
│       │       ├── ManualEntry.tsx    # amount + type + date + note
│       │       └── JobStatus.tsx      # polls GET /jobs/{job_id} until complete
│       ├── lib/
│       │   ├── api.ts                 # all fetch calls, credentials: include
│       │   ├── auth.ts                # google identity sdk init, token send
│       │   ├── cloudinary.ts
│       │   │     # uploadToCloudinary(file: File) → Promise<string>
│       │   │     # posts directly to Cloudinary unsigned endpoint
│       │   │     # returns secure_url string
│       │   │     # NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
│       │   │     # NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
│       │   │     # both are public env vars — safe to expose in browser
│       │   └── utils.ts
│       └── types/
│           └── index.ts
│
│
├── shared/                            # shared Python package imported by all services
│   │                                  # never runs as a service itself
│   │                                  # installed into each container via pip install -e ./shared
│   ├── models/
│   │   ├── events.py
│   │   │     # NormalizedEvent (Pydantic BaseModel)
│   │   │     # fields:
│   │   │     #   event_type: Literal["income","expense","debt","repayment","unknown"]
│   │   │     #   amount: float | None
│   │   │     #   currency: str = "NGN"
│   │   │     #   date: date | None
│   │   │     #   source: SourceType  (enum defined in enums.py)
│   │   │     #   confidence: float   (0.0–1.0, clamped by validator)
│   │   │     #   raw_text: str | None
│   │   │     #   note: str | None
│   │   │     #   flagged: bool = False
│   │   │     #   flag_reason: str | None = None
│   │   │     #
│   │   │     # validator: confidence must be between 0.0 and 1.0, clamp silently
│   │   │
│   │   ├── scores.py
│   │   │     # ScoreResult (Pydantic BaseModel)
│   │   │     # fields:
│   │   │     #   income_stability: float
│   │   │     #   repayment_reliability: float
│   │   │     #   data_confidence: float
│   │   │     #   overall_score: float
│   │   │     #   grade: Literal["Strong","Moderate","Developing","Insufficient data"]
│   │   │     #   recommended_amount: str | None
│   │   │     #   recommended_term: str | None
│   │   │     #   recommendation: str | None
│   │   │     #   signals: Signals  (see signals.py)
│   │   │
│   │   ├── signals.py
│   │   │     # Signals (Pydantic BaseModel)
│   │   │     # fields:
│   │   │     #   monthly_incomes: list[float]
│   │   │     #   monthly_expenses: list[float]
│   │   │     #   monthly_net: list[float]
│   │   │     #   income_avg: float
│   │   │     #   income_stddev: float
│   │   │     #   income_event_count: int
│   │   │     #   expense_event_count: int
│   │   │     #   total_debts: float
│   │   │     #   total_repayments: float
│   │   │     #   repayment_count: int
│   │   │     #   debt_count: int
│   │   │     #   unresolved_debts: float
│   │   │     #   avg_days_to_repay: float
│   │   │     #   longest_gap_days: int
│   │   │     #   flagged_event_count: int
│   │   │     #   total_event_count: int
│   │   │     #   social_confirmation_count: int
│   │   │     #   social_weight_sum: float
│   │   │     #   months_covered: int
│   │   │     #   active_income_months: int
│   │   │
│   │   └── reasoning.py
│   │         # ReasoningResult (Pydantic BaseModel)
│   │         # fields:
│   │         #   income_reasoning: str
│   │         #   repayment_reasoning: str
│   │         #   confidence_reasoning: str
│   │         #   overall_reasoning: str
│   │         #   recommendation_text: str
│   │
│   ├── enums.py
│   │     # SourceType enum:
│   │     #   TELLER_SLIP, BANK_SMS, OPAY_SCREENSHOT, PALMPAY_SCREENSHOT,
│   │     #   MONIEPOINT_SCREENSHOT, KUDA_SCREENSHOT, WHATSAPP_PASTE,
│   │     #   HANDWRITTEN_RECEIPT, COOPERATIVE_PASSBOOK, MARKET_PERMIT,
│   │     #   BANK_STATEMENT_PDF, MOBILE_MONEY_STATEMENT_PDF,
│   │     #   MANUAL_TEXT, SOCIAL_CONFIRMATION
│   │     #
│   │     # InputType enum:
│   │     #   IMAGE, TEXT_PASTE, MANUAL_ENTRY, PDF, SOCIAL
│   │     #
│   │     # JobStatus enum:
│   │     #   PENDING, PROCESSING, COMPLETE, FAILED
│   │
│   └── setup.py                       # package name: cq_shared
│
│
├── gateway/                           # FastAPI — only public-facing service
│   │                                  # frontend talks only to this
│   │                                  # does NOT do any file handling or processing
│   │                                  # pushes jobs to Redis, reads DB, serves responses
│   │
│   ├── routers/
│   │   ├── auth.py
│   │   │     POST /auth/google
│   │   │           body: { id_token: str }
│   │   │           → verify id_token with google-auth-library using GOOGLE_CLIENT_ID
│   │   │           → decode payload: { sub, email, name, picture }
│   │   │           → upsert User in DB (find by google_id, create if not found)
│   │   │           → create SessionToken record
│   │   │           → set httpOnly cookie: access_token  (JWT, 15min)
│   │   │           → set httpOnly cookie: refresh_token (JWT, 7 days)
│   │   │           → return { user: { id, email, name, role } }
│   │   │
│   │   │     POST /auth/refresh
│   │   │           reads refresh_token cookie
│   │   │           → verify refresh_token JWT
│   │   │           → find SessionToken in DB, check not expired
│   │   │           → issue new access_token cookie
│   │   │           → return { ok: true }
│   │   │
│   │   │     POST /auth/logout
│   │   │           → delete SessionToken from DB
│   │   │           → clear both cookies
│   │   │           → return { ok: true }
│   │   │
│   │   ├── profiles.py
│   │   │     GET  /profiles
│   │   │           → return all worker_profiles where created_by = current user
│   │   │
│   │   │     POST /profiles
│   │   │           body: { full_name, phone_number?, location?, trade_type?, years_active?, id_type?, id_number? }
│   │   │           → create worker_profile, set created_by = current user
│   │   │           → return created profile
│   │   │
│   │   │     GET  /profiles/{id}
│   │   │           → return profile + current scores + latest score_snapshot
│   │   │           → include all score_snapshots in chronological order
│   │   │           → include all input_records with flagged status
│   │   │
│   │   │     PATCH /profiles/{id}
│   │   │           body: any subset of personal info fields
│   │   │           → update worker_profile personal fields only
│   │   │           → does NOT trigger rescore
│   │   │
│   │   ├── evidence.py
│   │   │     POST /profiles/{id}/evidence
│   │   │           body: JSON (not multipart — file already uploaded by frontend)
│   │   │           fields:
│   │   │             input_type: InputType enum
│   │   │             source_type: SourceType enum
│   │   │             file_url: str (optional — Cloudinary secure_url, required for IMAGE and PDF)
│   │   │             raw_content: str (optional — required for TEXT_PASTE and MANUAL_ENTRY)
│   │   │             event_date: date (optional)
│   │   │             amount: float (optional, for MANUAL_ENTRY)
│   │   │             transaction_type: str (optional, for MANUAL_ENTRY)
│   │   │             note: str (optional)
│   │   │
│   │   │           → validate: file_url present if IMAGE or PDF
│   │   │           → validate: raw_content present if TEXT_PASTE or MANUAL_ENTRY
│   │   │           → validate: file_url is a valid Cloudinary URL
│   │   │             (check host matches res.cloudinary.com or {cloud_name}.cloudinary.com)
│   │   │           → create input_record in DB with status PENDING
│   │   │           → create job_status record: { job_id, profile_id, input_record_id, status: PENDING }
│   │   │           → enqueue process_evidence(input_record_id, job_id) on Redis
│   │   │           → return { job_id }
│   │   │
│   │   ├── jobs.py
│   │   │     GET /jobs/{job_id}
│   │   │           → return job_status record: { job_id, status, error?, completed_at? }
│   │   │           → frontend polls this until status is COMPLETE or FAILED
│   │   │
│   │   ├── scoring.py
│   │   │     GET  /profiles/{id}/snapshots
│   │   │           → return all score_snapshots for profile in ascending date order
│   │   │
│   │   │     POST /profiles/{id}/score
│   │   │           → create job_status record
│   │   │           → enqueue recompute_score(profile_id, job_id) with countdown=0
│   │   │           → return { job_id }
│   │   │
│   │   └── social.py
│   │         POST /profiles/{id}/confirmations
│   │               body: { relationship: str, confirms_repayment: bool, statement: str? }
│   │               → create social_confirmation record in DB
│   │               → enqueue recompute_score(profile_id, job_id) with countdown=45
│   │               → return { ok: true }
│   │
│   ├── middleware/
│   │   ├── auth_guard.py
│   │   │     # reads access_token cookie on every request
│   │   │     # decodes JWT using JWT_SECRET
│   │   │     # attaches decoded user to request.state.user
│   │   │     # returns HTTP 401 if cookie missing, expired, or invalid
│   │   │     # excluded routes: POST /auth/google only
│   │   │
│   │   └── role_guard.py
│   │         # decorator applied per route
│   │         # @require_role(Role.AGENT) → 403 if user.role != AGENT
│   │         # evidence submission, profile creation → AGENT only
│   │         # profile read → AGENT (own profiles) or WORKER (own profile)
│   │
│   ├── core/
│   │   ├── config.py                  # env: GOOGLE_CLIENT_ID, JWT_SECRET, DATABASE_URL,
│   │   │                              # REDIS_URL, FRONTEND_URL,
│   │   │                              # CLOUDINARY_CLOUD_NAME (for URL validation only)
│   │   ├── db.py                      # prisma client singleton
│   │   └── exceptions.py
│   ├── Dockerfile
│   └── main.py
│
│
├── worker/                            # Celery — background job orchestrator
│   │                                  # imports pipeline modules directly as Python functions
│   │                                  # NO HTTP calls to internal services
│   │                                  # all processing happens in-process
│   │                                  # one atomic DB write at the very end
│   │
│   ├── pipeline/
│   │   ├── scan.py
│   │   │     # function: scan_evidence(input_record) → list[NormalizedEvent]
│   │   │     #
│   │   │     # FILE DOWNLOAD:
│   │   │     #   if input_record.file_url is set:
│   │   │     #     download file via httpx.get(file_url)
│   │   │     #     Cloudinary secure_url is public HTTPS — no auth required to download
│   │   │     #     store as bytes in memory for processing
│   │   │     #
│   │   │     # SOURCE-BASED ROUTING (no Claude unless necessary):
│   │   │     #
│   │   │     # BANK_SMS or OPAY_SCREENSHOT or PALMPAY_SCREENSHOT:
│   │   │     #   → regex_extractor(raw_content or extracted_text)
│   │   │     #   regex patterns (in order, first match wins):
│   │   │     #     credited|received|you have received → event_type = income
│   │   │     #     debited|paid|sent|transfer to      → event_type = expense
│   │   │     #     amount pattern: (?:NGN|₦)\s*([\d,]+(?:\.\d{2})?)
│   │   │     #     date pattern:   \d{2}[\/\-]\d{2}[\/\-]\d{2,4}
│   │   │     #   confidence: 0.9
│   │   │     #   if regex extracts amount: return NormalizedEvent
│   │   │     #   if regex fails: fall through to Claude
│   │   │     #
│   │   │     # BANK_STATEMENT_PDF or MOBILE_MONEY_STATEMENT_PDF:
│   │   │     #   → download file bytes from Cloudinary URL
│   │   │     #   → pdfplumber.open(BytesIO(file_bytes))
│   │   │     #   → extract_tables() → each row is one event
│   │   │     #   → map columns: date, description, debit, credit
│   │   │     #   → debit → expense, credit → income
│   │   │     #   confidence: 1.0
│   │   │     #   NO Claude call
│   │   │     #
│   │   │     # TELLER_SLIP or HANDWRITTEN_RECEIPT or any IMAGE:
│   │   │     #   → download file bytes from Cloudinary URL
│   │   │     #   → PIL.Image.open(BytesIO(file_bytes))
│   │   │     #   → preprocess: convert to grayscale, threshold 128
│   │   │     #   → pytesseract.image_to_string(preprocessed_image)
│   │   │     #   → try regex on OCR output first
│   │   │     #   → if regex gets amount: confidence = 0.6, return
│   │   │     #   → if regex fails AND word_count < 5: confidence = 0.4, return unknown
│   │   │     #   → if regex fails AND word_count >= 5: send OCR text to Claude
│   │   │     #   confidence after Claude: 0.55
│   │   │     #
│   │   │     # WHATSAPP_PASTE or unstructured TEXT_PASTE:
│   │   │     #   → try regex first
│   │   │     #   → if regex finds at least one amount: use regex result, confidence 0.7
│   │   │     #   → if regex fails: send to Claude, confidence 0.6
│   │   │     #
│   │   │     # MANUAL_TEXT:
│   │   │     #   → parse amount, transaction_type, event_date from structured form fields
│   │   │     #   → no extraction needed, fields already provided by user
│   │   │     #   confidence: 0.3 always
│   │   │     #   NO Claude call
│   │   │     #
│   │   │     # COOPERATIVE_PASSBOOK or MARKET_PERMIT (image of document):
│   │   │     #   → download image bytes from Cloudinary URL
│   │   │     #   → OCR → regex for amounts and dates
│   │   │     #   → each line with amount = one event
│   │   │     #   confidence: 0.5
│   │   │     #
│   │   │     # DEDUPLICATION:
│   │   │     #   before returning events, hash each as md5(source_type + raw_content)
│   │   │     #   check hash against input_record.content_hash in DB
│   │   │     #   if hash already exists for this profile: skip, do not re-extract
│   │   │
│   │   ├── inspect.py
│   │   │     # function: inspect_events(events, profile_id) → list[NormalizedEvent]
│   │   │     #
│   │   │     # DUPLICATE DETECTOR:
│   │   │     #   group events by (amount, date within 1 day)
│   │   │     #   if group has 2+ events with different source_type:
│   │   │     #     flag all in group: flagged=True
│   │   │     #     flag_reason: "Possible duplicate: same amount and date from two sources"
│   │   │     #     reduce each event's confidence by 0.2 (minimum 0.1)
│   │   │     #
│   │   │     # CONTRADICTION DETECTOR:
│   │   │     #   sum income from MANUAL_TEXT events → manual_declared_income
│   │   │     #   sum income from all other sources → evidence_income
│   │   │     #   if both > 0 AND abs(manual - evidence) / evidence > 0.40:
│   │   │     #     flag all MANUAL_TEXT income events
│   │   │     #     flag_reason: "Declared income differs from transaction evidence by >40%"
│   │   │     #     set confidence of those events to 0.1
│   │   │     #   NOTE: 40% threshold is a starting point. Calibrate with real data post-launch.
│   │   │     #
│   │   │     # UNMATCHED REPAYMENT DETECTOR:
│   │   │     #   for each repayment event:
│   │   │     #     check if any debt event exists within 90 days before it
│   │   │     #     if no matching debt found:
│   │   │     #       flag repayment: flagged=True
│   │   │     #       flag_reason: "Repayment recorded but no corresponding debt found"
│   │   │     #       reduce confidence by 0.15
│   │   │     #
│   │   │     # GAP DETECTOR:
│   │   │     #   sort all events by date
│   │   │     #   if profile spans > 60 days:
│   │   │     #     find all consecutive pairs with gap > 30 days
│   │   │     #     return list of GapWarning: { start_date, end_date, days }
│   │   │     #   GapWarnings passed to scorer separately, not attached to events
│   │   │
│   │   ├── score.py
│   │   │     # function: compute_scores(profile_id, events, gap_warnings, social_confirmations)
│   │   │     #           → ScoreResult
│   │   │     #
│   │   │     # TIMELINE:
│   │   │     #   sort events by date ascending
│   │   │     #   group by month: { "2026-01": [...], "2026-02": [...] }
│   │   │     #
│   │   │     # SIGNALS: (see shared/models/signals.py for full field list)
│   │   │     #   compute all signal fields from timeline
│   │   │     #
│   │   │     # INCOME STABILITY:
│   │   │     #   cv = income_stddev / income_avg  (if income_avg == 0: score = 0)
│   │   │     #   consistency:
│   │   │     #     cv <= 0.20 → 1.00
│   │   │     #     cv <= 0.50 → 0.75
│   │   │     #     cv <= 0.80 → 0.50
│   │   │     #     cv <= 1.20 → 0.25
│   │   │     #     cv >  1.20 → 0.00
│   │   │     #   coverage = active_income_months / months_covered
│   │   │     #   volume:
│   │   │     #     income_avg >= 100000 → 1.00
│   │   │     #     income_avg >=  50000 → 0.75
│   │   │     #     income_avg >=  20000 → 0.50
│   │   │     #     income_avg >=   5000 → 0.25
│   │   │     #     else                → 0.00
│   │   │     #   income_stability = (consistency*0.5) + (coverage*0.3) + (volume*0.2)
│   │   │     #   clamp 0.0–1.0
│   │   │     #
│   │   │     # REPAYMENT RELIABILITY:
│   │   │     #   if debt_count == 0 AND repayment_count == 0: score = 0.5
│   │   │     #   else:
│   │   │     #     resolution_rate = min(total_repayments / total_debts, 1.0)
│   │   │     #     speed:
│   │   │     #       avg_days_to_repay <= 7  → 1.00
│   │   │     #       avg_days_to_repay <= 14 → 0.75
│   │   │     #       avg_days_to_repay <= 30 → 0.50
│   │   │     #       avg_days_to_repay <= 60 → 0.25
│   │   │     #       else                    → 0.00
│   │   │     #     social_boost = min(social_weight_sum, 1.0) * 0.10
│   │   │     #     repayment_reliability = (resolution_rate*0.6) + (speed*0.3) + social_boost
│   │   │     #     clamp 0.0–1.0
│   │   │     #
│   │   │     # SOCIAL MISMATCH CHECK (runs here, after repayment score exists):
│   │   │     #   if social_confirmation_count > 0
│   │   │     #   AND repayment_reliability < 0.30
│   │   │     #   AND social_weight_sum > 0.5:
│   │   │     #     mark all social_confirmations as suspicious in DB
│   │   │     #     reduce social_boost to 0.02
│   │   │     #     recalculate repayment_reliability without boosted social
│   │   │     #
│   │   │     # DATA CONFIDENCE:
│   │   │     #   avg_source_confidence = mean(confidence of all non-flagged events)
│   │   │     #   volume_bonus:
│   │   │     #     total_event_count >= 30 → 1.00
│   │   │     #     total_event_count >= 15 → 0.75
│   │   │     #     total_event_count >=  8 → 0.50
│   │   │     #     total_event_count >=  3 → 0.25
│   │   │     #     else                    → 0.00 
│   │   │     #   flag_score = 1.0 - (flagged_event_count / total_event_count)
│   │   │     #   gap_penalty:
│   │   │     #     longest_gap_days > 90 → -0.20
│   │   │     #     longest_gap_days > 60 → -0.10
│   │   │     #     else                  →  0.00
│   │   │     #   data_confidence = (avg_source_confidence*0.5) + (volume_bonus*0.3) + (flag_score*0.2)
│   │   │     #   data_confidence += gap_penalty
│   │   │     #   clamp 0.0–1.0
│   │   │     #
│   │   │     # OVERALL SCORE:
│   │   │     #   overall = (income_stability*0.40) + (repayment_reliability*0.35) + (data_confidence*0.25)
│   │   │     #   clamp 0.0–1.0
│   │   │     #
│   │   │     # GRADE:
│   │   │     #   0.80–1.00 → "Strong"
│   │   │     #   0.60–0.79 → "Moderate"
│   │   │     #   0.40–0.59 → "Developing"
│   │   │     #   0.00–0.39 → "Insufficient data"
│   │   │     #
│   │   │     # RECOMMENDATION:
│   │   │     #   if overall < 0.40:
│   │   │     #     recommended_amount = None
│   │   │     #     recommended_term = None
│   │   │     #     recommendation = "Insufficient data for a loan recommendation."
│   │   │     #   else:
│   │   │     #     max_monthly_payment = income_avg * 0.35
│   │   │     #     term_months:
│   │   │     #       overall >= 0.75 → 6
│   │   │     #       overall >= 0.55 → 3
│   │   │     #       else            → 1
│   │   │     #     recommended_amount = f"₦{max_monthly_payment * term_months:,.0f}"
│   │   │     #     recommended_term = f"{term_months}-month repayment"
│   │   │
│   │   └── reason.py
│   │         # function: generate_reasoning(score_result, signals) → ReasoningResult
│   │         #
│   │         # THIS IS THE ONLY OTHER PLACE CLAUDE IS CALLED
│   │         # called once per recompute — not per evidence item
│   │         #
│   │         # SYSTEM PROMPT:
│   │         #   You are a financial analyst writing credit assessments for informal workers
│   │         #   in developing economies. You receive structured financial signal data and
│   │         #   must explain credit scores in clear, honest, plain English.
│   │         #   Rules:
│   │         #   - Never invent data. Only reason from what is provided.
│   │         #   - Use specific numbers from the signals. Do not be vague.
│   │         #   - If data is limited, say so explicitly. Do not overstate confidence.
│   │         #   - Each explanation: 2–4 sentences maximum.
│   │         #   - No financial jargon.
│   │         #   - Return valid JSON matching the output contract exactly.
│   │         #   - No markdown. No extra keys. No preamble.
│   │         #
│   │         # USER PROMPT:
│   │         #   Signals: {signals.model_dump_json()}
│   │         #   Scores: {score_result.model_dump_json()}
│   │         #   Return JSON: { income_reasoning, repayment_reasoning,
│   │         #                  confidence_reasoning, overall_reasoning,
│   │         #                  recommendation_text }
│   │         #
│   │         # API CALL:
│   │         #   model: claude-sonnet-4-20250514
│   │         #   max_tokens: 800
│   │         #   temperature: 0
│   │         #
│   │         # RETRY POLICY:
│   │         #   max_retries: 3
│   │         #   backoff: exponential — wait 2^attempt seconds (2s, 4s, 8s)
│   │         #   on all retries exhausted: return ReasoningResult with all fields
│   │         #   set to: "Reasoning unavailable. Score computed from submitted evidence."
│   │         #
│   │         # PARSE:
│   │         #   strip markdown fences if present
│   │         #   json.loads()
│   │         #   validate all 5 keys present
│   │         #   if parse fails: return fallback ReasoningResult
│   │         #   never raise — always return a valid ReasoningResult
│   │
│   ├── jobs/
│   │   ├── process_evidence.py
│   │   │     # Celery task: process_evidence(input_record_id: str, job_id: str)
│   │   │     #
│   │   │     # RETRY POLICY:
│   │   │     #   autoretry_for: (Exception,)
│   │   │     #   max_retries: 3
│   │   │     #   retry_backoff: True       (exponential: 2s, 4s, 8s)
│   │   │     #   retry_backoff_max: 30
│   │   │     #
│   │   │     # step 1: update job_status → PROCESSING
│   │   │     # step 2: fetch input_record from DB
│   │   │     # step 3: call scan.scan_evidence(input_record) → events[]
│   │   │     #         (scan downloads file from Cloudinary URL internally if needed)
│   │   │     # step 4: fetch all existing events for this profile from DB
│   │   │     # step 5: call inspect.inspect_events(all_events, profile_id)
│   │   │     #          → updated events[] with flags
│   │   │     # step 6: save updated events back to input_record.extracted_events in DB
│   │   │     # step 7: enqueue recompute_score(profile_id, job_id=None) with countdown=45
│   │   │     #         countdown=45: wait 45 seconds before running
│   │   │     #         if another recompute is already queued for this profile,
│   │   │     #         cancel it and replace with this one (debounce)
│   │   │     # step 8: update job_status → COMPLETE
│   │   │     # on any unrecoverable error: update job_status → FAILED, store error message
│   │   │
│   │   └── recompute_score.py
│   │         # Celery task: recompute_score(profile_id: str, job_id: str | None)
│   │         #
│   │         # RETRY POLICY: same as process_evidence
│   │         #
│   │         # DEBOUNCE LOGIC:
│   │         #   store pending recompute task_id in Redis key: recompute:{profile_id}
│   │         #   on start: check if key exists → if yes, revoke that task, replace with this one
│   │         #   on complete: delete key
│   │         #
│   │         # step 1: fetch all input_records for profile from DB
│   │         # step 2: flatten all extracted_events from all input_records → events[]
│   │         # step 3: fetch gap_warnings from inspector results stored in DB
│   │         # step 4: fetch social_confirmations for profile from DB
│   │         # step 5: call score.compute_scores(profile_id, events, gap_warnings, social_confirmations)
│   │         #          → ScoreResult
│   │         # step 6: call reason.generate_reasoning(score_result, score_result.signals)
│   │         #          → ReasoningResult
│   │         # step 7: SINGLE ATOMIC DB WRITE:
│   │         #          create score_snapshot with all fields from ScoreResult + ReasoningResult
│   │         #          update worker_profile current scores
│   │         #          update worker_profile recommendation fields
│   │         #          all in one DB transaction — if any part fails, nothing is written
│   │         # step 8: if job_id: update job_status → COMPLETE
│   │
│   ├── queue/
│   │   └── celery_app.py
│   │         # broker: redis://redis:6379/0
│   │         # backend: redis://redis:6379/1
│   │         # task_serializer: json
│   │         # result_expires: 3600
│   │         # worker_prefetch_multiplier: 1
│   │         # task_acks_late: True  (task not acknowledged until complete — prevents loss)
│   │
│   ├── core/
│   │   └── config.py                  # DATABASE_URL, REDIS_URL, ANTHROPIC_API_KEY
│   ├── Dockerfile
│   └── main.py
│
│
├── prisma/
│   └── schema.prisma
│
├── docker-compose.yml
├── .env
└── README.md
```

---

## File upload flow — Cloudinary unsigned preset

```
User selects file (image or PDF)
    ↓
frontend/lib/cloudinary.ts
    POST https://api.cloudinary.com/v1_1/{CLOUD_NAME}/auto/upload
    body: FormData {
      file: <file bytes>,
      upload_preset: CLOUDINARY_UPLOAD_PRESET   ← unsigned preset, no API secret needed
    }
    ↓
Cloudinary returns { secure_url, public_id, ... }
    ↓
frontend stores secure_url in component state
    ↓
user fills in remaining evidence fields and submits
    ↓
frontend POST /profiles/{id}/evidence
    body: JSON {
      input_type,
      source_type,
      file_url: secure_url,    ← Cloudinary URL, not the file itself
      ...other fields
    }
    ↓
gateway saves input_record with file_url = secure_url
enqueues process_evidence job
    ↓
worker downloads file via httpx.get(file_url)   ← plain HTTPS, no auth needed
passes bytes to scanner pipeline
```

---

## Service ports and access rules

| Service    | Port | Accessible by                                        |
|------------|------|------------------------------------------------------|
| gateway    | 8000 | frontend only                                        |
| worker     | none | Redis queue only                                     |
| postgres   | 5432 | gateway, worker                                      |
| redis      | 6379 | gateway (enqueue), worker                            |
| Cloudinary | —    | frontend (upload via unsigned preset), worker (download via HTTPS URL) |

No scanner, inspector, scorer, reasoning ports.
They are Python modules inside the worker process, not separate HTTP services.

---

## Claude API usage — exactly two call sites

| Where                      | When                                        | Cost                        |
|----------------------------|---------------------------------------------|-----------------------------|
| worker/pipeline/scan.py    | only when regex fails on ambiguous text     | per ambiguous evidence item |
| worker/pipeline/reason.py  | once per recompute_score job                | once per rescore            |

Every structured source (PDF, bank SMS, mobile money SMS, manual entry) uses zero Claude calls.
Debounce on recompute means 10 rapid uploads = 1 reasoning call, not 10.

---

## Environment variables

```bash
# gateway + worker
DATABASE_URL=postgresql://user:pass@localhost:5432/creditquotient
REDIS_URL=redis://localhost:6379

# gateway only
GOOGLE_CLIENT_ID=your_google_client_id
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name     # used for URL validation only, not upload

# worker only
ANTHROPIC_API_KEY=your_anthropic_key

# frontend only (public env vars — safe to expose in browser)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset_name
```

---

## JobStatus table (schema.prisma)

```prisma
model JobStatus {
  id             String    @id @default(uuid())
  profileId      String    @map("profile_id")
  inputRecordId  String?   @map("input_record_id")
  status         String    @default("PENDING")  // PENDING | PROCESSING | COMPLETE | FAILED
  error          String?
  completedAt    DateTime? @map("completed_at")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  @@map("job_statuses")
}
```

---

## What changed from previous version

| Was                                         | Now                                                          |
|---------------------------------------------|--------------------------------------------------------------|
| Gateway uploads file to S3 using boto3      | Frontend uploads directly to Cloudinary using unsigned preset |
| Gateway holds AWS credentials               | Gateway holds no file storage credentials at all             |
| Worker downloads from S3 using boto3        | Worker downloads from Cloudinary HTTPS URL using httpx       |
| storage.py in gateway                       | Deleted — gateway does no file handling                      |
| S3_BUCKET, S3_REGION, AWS_ACCESS_KEY in env | Replaced with NEXT_PUBLIC_CLOUDINARY_* in frontend only      |