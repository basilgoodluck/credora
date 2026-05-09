from collections.abc import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from gateway.core.security import decode_jwt

PUBLIC_EXACT = {
    "/health",
    "/openapi.json",
    "/auth/register",
    "/auth/send-otp",
    "/auth/verify-otp",
    "/auth/set-password",
    "/auth/login",
    "/auth/login/pin",
    "/auth/refresh",
    "/auth/logout",
}
PUBLIC_PREFIXES = ("/docs", "/redoc")


class AuthGuardMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable[[Request], Response]) -> Response:
        if request.method == "OPTIONS" or request.url.path in PUBLIC_EXACT or request.url.path.startswith(PUBLIC_PREFIXES):
            return await call_next(request)

        token = request.cookies.get("access_token") or request.headers.get("Authorization", "").removeprefix("Bearer ").strip()
        if not token:
            return JSONResponse({"detail": "Unauthorized"}, status_code=401)

        try:
            payload = decode_jwt(token, "access")
        except Exception:
            return JSONResponse({"detail": "Unauthorized"}, status_code=401)

        request.state.user = {"id": payload["sub"]}
        return await call_next(request)
