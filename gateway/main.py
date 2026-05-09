from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request

from gateway.core.config import get_settings
from gateway.core.db import connect_db, disconnect_db
from gateway.middleware.auth_guard import AuthGuardMiddleware
from gateway.routers import auth, cases, evidence, jobs, me, scoring


@asynccontextmanager
async def lifespan(_: FastAPI):
    await connect_db()
    yield
    await disconnect_db()


settings = get_settings()
app = FastAPI(title="Credit Quotient Gateway", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)
app.add_middleware(AuthGuardMiddleware)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "same-origin"
    return response


@app.get("/health")
async def health():
    return {"ok": True}


app.include_router(auth.router)
app.include_router(me.router)
app.include_router(cases.router)
app.include_router(evidence.router)
app.include_router(jobs.router)
app.include_router(scoring.router)
