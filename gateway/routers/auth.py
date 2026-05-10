import random
from datetime import timedelta

from fastapi import APIRouter, HTTPException, Request, Response, status
from pydantic import BaseModel, Field

from gateway.core.config import get_settings
from gateway.core.db import db
from gateway.core.security import create_jwt, hash_secret, random_token, token_hash, utc_now, verify_secret

router = APIRouter(prefix="/auth", tags=["auth"])


class PhoneRequest(BaseModel):
    phone_number: str = Field(min_length=7, max_length=20)


class OtpRequest(PhoneRequest):
    purpose: str = Field(pattern="^(signup|login|reset_password)$")


class VerifyOtpRequest(OtpRequest):
    otp: str = Field(min_length=4, max_length=8)


class PasswordRequest(BaseModel):
    password: str = Field(min_length=8, max_length=128)


class PinRequest(BaseModel):
    pin: str = Field(pattern="^[0-9]{4,6}$")
    trust_device: bool = True


class LoginRequest(PhoneRequest):
    password: str = Field(min_length=8, max_length=128)
    device_name: str | None = None
    trust_device: bool = False


class PinLoginRequest(PhoneRequest):
    pin: str = Field(pattern="^[0-9]{4,6}$")
    device_id: str


class OkResponse(BaseModel):
    ok: bool = True


def _set_cookie(response: Response, name: str, value: str, max_age: int) -> None:
    settings = get_settings()
    response.set_cookie(
        name,
        value,
        max_age=max_age,
        httponly=True,
        secure=settings.secure_cookies,
        samesite="lax",
        path="/",
    )


async def _issue_session(user_id: str, response: Response, request: Request, trusted: bool = False, device_name: str | None = None) -> None:
    settings = get_settings()
    refresh = random_token()
    expires_at = utc_now() + timedelta(days=settings.refresh_token_days)
    session = await db.devicesession.create(
        data={
            "userId": user_id,
            "refreshTokenHash": token_hash(refresh),
            "trusted": trusted,
            "deviceName": device_name,
            "ipAddress": request.client.host if request.client else None,
            "userAgent": request.headers.get("user-agent"),
            "expiresAt": expires_at,
        }
    )
    # Access token expires in 3 hours (180 minutes) instead of short default
    access_expires = timedelta(minutes=180)
    access = create_jwt(user_id=user_id, token_type="access", expires_delta=access_expires)
    refresh_jwt = create_jwt(user_id=user_id, token_type="refresh", expires_delta=timedelta(days=settings.refresh_token_days), jti=session.id)
    _set_cookie(response, "access_token", access, int(access_expires.total_seconds()))
    _set_cookie(response, "refresh_token", f"{session.id}.{refresh}.{refresh_jwt}", settings.refresh_token_days * 24 * 60 * 60)


async def _create_otp(phone_number: str, purpose: str, user_id: str | None, *, enforce_cooldown: bool = True) -> None:
    settings = get_settings()
    active = await db.otpchallenge.find_first(
        where={"phoneNumber": phone_number, "purpose": purpose, "consumedAt": None},
        order={"createdAt": "desc"},
    )
    now = utc_now()
    if enforce_cooldown and active and active.resendAvailableAt > now:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Please wait before requesting another code")

    # DEMO: Hardcoded OTP for all requests
    otp = "123456"
    await db.otpchallenge.create(
        data={
            "userId": user_id,
            "phoneNumber": phone_number,
            "otpHash": hash_secret(otp),
            "purpose": purpose,
            "resendAvailableAt": now + timedelta(seconds=settings.otp_resend_seconds),
            "expiresAt": now + timedelta(minutes=settings.otp_expiry_minutes),
        }
    )
    # Development fallback. Replace with an SMS provider adapter before production.
    print(f"OTP for {phone_number}: {otp}")


@router.post("/register", response_model=OkResponse)
async def register(payload: PhoneRequest) -> OkResponse:
    existing = await db.user.find_unique(where={"phoneNumber": payload.phone_number})
    user = existing or await db.user.create(data={"phoneNumber": payload.phone_number})
    await _create_otp(payload.phone_number, "signup", user.id)
    return OkResponse()


@router.post("/send-otp", response_model=OkResponse)
async def send_otp(payload: OtpRequest) -> OkResponse:
    user = await db.user.find_unique(where={"phoneNumber": payload.phone_number})
    if payload.purpose != "signup" and not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    await _create_otp(payload.phone_number, payload.purpose, user.id if user else None)
    return OkResponse()


@router.post("/verify-otp", response_model=OkResponse)
async def verify_otp(payload: VerifyOtpRequest, response: Response) -> OkResponse:
    challenge = await db.otpchallenge.find_first(
        where={"phoneNumber": payload.phone_number, "purpose": payload.purpose, "consumedAt": None},
        order={"createdAt": "desc"},
    )
    if not challenge or challenge.expiresAt < utc_now():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Code expired")
    if challenge.attempts >= challenge.maxAttempts:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many attempts")
    if not verify_secret(payload.otp, challenge.otpHash):
        await db.otpchallenge.update(where={"id": challenge.id}, data={"attempts": {"increment": 1}})
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid code")

    await db.otpchallenge.update(where={"id": challenge.id}, data={"consumedAt": utc_now()})
    user = await db.user.find_unique(where={"phoneNumber": payload.phone_number})
    if not user:
        user = await db.user.create(data={"phoneNumber": payload.phone_number})
    otp_token = create_jwt(user_id=user.id, token_type="otp", expires_delta=timedelta(minutes=10))
    _set_cookie(response, "otp_token", otp_token, 10 * 60)
    return OkResponse()


@router.post("/set-password", response_model=OkResponse)
async def set_password(payload: PasswordRequest, request: Request, response: Response) -> OkResponse:
    from gateway.core.security import decode_jwt

    token = request.cookies.get("otp_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="OTP verification required")
    user_id = decode_jwt(token, "otp")["sub"]
    await db.user.update(where={"id": user_id}, data={"passwordHash": hash_secret(payload.password)})
    response.delete_cookie("otp_token", path="/")
    await _issue_session(user_id, response, request)
    return OkResponse()


@router.post("/set-pin", response_model=OkResponse)
async def set_pin(payload: PinRequest, request: Request) -> OkResponse:
    user_id = request.state.user["id"]
    await db.user.update(where={"id": user_id}, data={"pinHash": hash_secret(payload.pin)})
    if payload.trust_device:
        refresh = request.cookies.get("refresh_token")
        if refresh:
            session_id = refresh.split(".", 1)[0]
            await db.devicesession.update(where={"id": session_id}, data={"trusted": True})
    return OkResponse()


@router.post("/login", response_model=OkResponse)
async def login(payload: LoginRequest, request: Request, response: Response) -> OkResponse:
    user = await db.user.find_unique(where={"phoneNumber": payload.phone_number})
    if not user or not verify_secret(payload.password, user.passwordHash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid phone number or password")
    await _issue_session(user.id, response, request, trusted=payload.trust_device, device_name=payload.device_name)
    return OkResponse()


@router.post("/refresh", response_model=OkResponse)
async def refresh(request: Request, response: Response) -> OkResponse:
    raw = request.cookies.get("refresh_token")
    if not raw:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")
    try:
        session_id, refresh_secret, _jwt = raw.split(".", 2)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token") from exc

    session = await db.devicesession.find_unique(where={"id": session_id})
    if not session or session.revokedAt or session.expiresAt < utc_now() or session.refreshTokenHash != token_hash(refresh_secret):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    # Send a new access token (also 3 hours)
    access_expires = timedelta(minutes=180)
    access = create_jwt(user_id=session.userId, token_type="access", expires_delta=access_expires)
    _set_cookie(response, "access_token", access, int(access_expires.total_seconds()))
    await db.devicesession.update(where={"id": session.id}, data={"lastSeenAt": utc_now()})
    return OkResponse()


@router.post("/logout", response_model=OkResponse)
async def logout(request: Request, response: Response) -> OkResponse:
    raw = request.cookies.get("refresh_token")
    if raw:
        session_id = raw.split(".", 1)[0]
        await db.devicesession.update(where={"id": session_id}, data={"revokedAt": utc_now()})
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return OkResponse()