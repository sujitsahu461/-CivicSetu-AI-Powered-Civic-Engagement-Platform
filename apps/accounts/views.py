from django.conf import settings
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenVerifyView

from apps.accounts.serializers import (
    AuthResponseSerializer,
    CaptchaResponseSerializer,
    ForgotPasswordSerializer,
    LoginSerializer,
    LogoutSerializer,
    RefreshTokenSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    TokenPairSerializer,
    UserSerializer,
)
from apps.accounts.services import TokenService


class CaptchaView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        tags=["Authentication"],
        responses={200: CaptchaResponseSerializer},
        summary="Generate a new cryptographic CAPTCHA challenge",
    )
    def get(self, request):
        from apps.accounts.captcha import create_captcha
        return Response(create_captcha(), status=status.HTTP_200_OK)


class RegisterView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_scope = "auth"

    @extend_schema(
        tags=["Authentication"],
        request=RegisterSerializer,
        responses={201: AuthResponseSerializer},
        summary="Register a citizen or authority account",
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = TokenService.issue_tokens(user)
        return Response(
            {"user": UserSerializer(user).data, "tokens": tokens},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_scope = "auth"

    @extend_schema(
        tags=["Authentication"],
        request=LoginSerializer,
        responses={200: AuthResponseSerializer},
        summary="Login with email, password, and optional captcha",
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        tokens = TokenService.issue_tokens(user)
        return Response({"user": UserSerializer(user).data, "tokens": tokens})


class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        tags=["Authentication"],
        request=RefreshTokenSerializer,
        responses={200: TokenPairSerializer},
        summary="Refresh JWT access token",
    )
    def post(self, request):
        serializer = RefreshTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data["tokens"])


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Authentication"],
        request=LogoutSerializer,
        responses={205: OpenApiResponse(description="Refresh token blacklisted.")},
        summary="Logout by blacklisting the refresh token",
    )
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        TokenService.blacklist_refresh_token(serializer.validated_data["refresh"])
        return Response(status=status.HTTP_205_RESET_CONTENT)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Authentication"],
        responses={200: UserSerializer},
        summary="Get the authenticated user profile",
    )
    def get(self, request):
        return Response(UserSerializer(request.user).data)


class ForgotPasswordView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_scope = "auth"

    @extend_schema(
        tags=["Authentication"],
        request=ForgotPasswordSerializer,
        responses={200: OpenApiResponse(description="Password reset email queued if the account exists.")},
        summary="Request a password reset email",
    )
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        result = serializer.save() or {}
        detail_msg = "If the account exists, a password reset email has been processed."
        response_data = {
            "detail": detail_msg,
            "message": detail_msg,
            "sent": result.get("sent", False),
        }
        if result.get("smtp_error"):
            response_data["smtp_error"] = result["smtp_error"]
        if getattr(settings, "DEBUG", False) or not result.get("sent"):
            if result.get("reset_url"):
                response_data["reset_url"] = result["reset_url"]

        return Response(response_data, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_scope = "auth"

    @extend_schema(
        tags=["Authentication"],
        request=ResetPasswordSerializer,
        responses={200: OpenApiResponse(description="Password reset completed.")},
        summary="Confirm password reset with uid and token",
    )
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            "detail": "Password has been reset successfully.",
            "message": "Password has been reset successfully.",
        })


class VerifyTokenView(TokenVerifyView):
    @extend_schema(tags=["Authentication"], summary="Verify a JWT token")
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class QuickSwitchRoleView(APIView):
    """Seamlessly switch active user session between Citizen, Authority, and SuperAdmin portals."""

    permission_classes = [AllowAny]

    @extend_schema(
        tags=["Authentication"],
        responses={200: AuthResponseSerializer},
        summary="Quick switch active portal role",
    )
    def post(self, request):
        if not settings.DEBUG:
            raise PermissionDenied("Role switching is strictly disabled in production environments.")

        from django.contrib.auth import get_user_model
        from django.db.models import Q

        User = get_user_model()
        target_role = str(request.data.get("role", "CITIZEN")).upper()
        target_email = request.data.get("email")

        user = None
        if target_email:
            user = User.objects.filter(email__iexact=target_email, is_active=True).first()

        if not user:
            # Match current user's name if authenticated
            req_user = request.user if request.user and request.user.is_authenticated else None
            if req_user and hasattr(req_user, "full_name") and req_user.full_name:
                user = User.objects.filter(role=target_role, full_name__iexact=req_user.full_name, is_active=True).first()

            if not user:
                if target_role == "CITIZEN":
                    user = User.objects.filter(role=target_role, is_active=True).filter(
                        Q(email="smartsujit7334@gmail.com") | Q(email="citizen@civicsetu.gov.in")
                    ).first() or User.objects.filter(role=target_role, is_active=True).first()
                elif target_role == "AUTHORITY":
                    user = User.objects.filter(role=target_role, is_active=True).filter(
                        Q(email="kaushikpradhan@gmail.com")
                        | Q(email="kaushikpradhan123@gmail.com")
                        | Q(email="officer@civicsetu.gov.in")
                    ).first() or User.objects.filter(role=target_role, is_active=True).first()
                elif target_role == "SUPER_ADMIN":
                    user = User.objects.filter(role=target_role, is_active=True).filter(
                        Q(email="admin@civicsetu.gov.in")
                        | Q(email="sujitkumarsahu7334@gmail.com")
                        | Q(email="kaushikpradhan@gmail.com")
                    ).first() or User.objects.filter(role=target_role, is_active=True).first()

        if not user:
            return Response({"detail": f"No active user found for role {target_role}"}, status=status.HTTP_404_NOT_FOUND)

        tokens = TokenService.issue_tokens(user)
        return Response({"user": UserSerializer(user).data, "tokens": tokens})

