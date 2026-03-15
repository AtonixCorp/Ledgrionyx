from django.contrib.auth import get_user_model
from django.utils.text import slugify
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from rest_framework_simplejwt.tokens import RefreshToken

from .developer_portal_common import DeveloperFacingAPIView
from .models import Organization, UserProfile, ACCOUNT_TYPE_ENTERPRISE, ACCOUNT_TYPE_PERSONAL


User = get_user_model()


class RegisterView(DeveloperFacingAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        payload = request.data or {}
        email = (payload.get("email") or "").strip().lower()
        password = payload.get("password") or ""
        username = (payload.get("username") or email).strip()
        account_type = (payload.get("account_type") or ACCOUNT_TYPE_ENTERPRISE).strip()
        country = (payload.get("country") or "").strip()
        phone = (payload.get("phone") or "").strip()
        org_name = (payload.get("org_name") or "").strip()
        tax_type = (payload.get("tax_type") or "").strip() or None
        tax_rate = payload.get("tax_rate")

        if not email:
            return Response({"email": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not password:
            return Response({"password": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not username:
            return Response({"username": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"username": "A user with this username already exists."}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({"email": "A user with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, email=email, password=password)

        # Create profile so the frontend starts from real stored values (no mock).
        profile = UserProfile.objects.create(
            user=user,
            account_type=account_type if account_type in [ACCOUNT_TYPE_PERSONAL, ACCOUNT_TYPE_ENTERPRISE] else ACCOUNT_TYPE_ENTERPRISE,
            country=country,
            phone=phone,
        )

        if tax_type in [UserProfile.TAX_TYPE_CORPORATE, UserProfile.TAX_TYPE_PERSONAL, UserProfile.TAX_TYPE_VAT]:
            profile.tax_type = tax_type

        if tax_rate is not None and tax_rate != "":
            try:
                profile.tax_rate = float(tax_rate)
            except (TypeError, ValueError):
                pass
        profile.save(update_fields=['tax_type', 'tax_rate', 'updated_at'])

        # Optional: create a first organization for enterprise accounts.
        if account_type == ACCOUNT_TYPE_ENTERPRISE and org_name:
            base_slug = slugify(org_name) or f"org-{user.id}"
            slug_candidate = base_slug
            suffix = 1
            while Organization.objects.filter(slug=slug_candidate).exists():
                suffix += 1
                slug_candidate = f"{base_slug}-{suffix}"

            Organization.objects.create(
                owner=user,
                name=org_name,
                slug=slug_candidate,
                primary_country=country or "Unknown",
            )

        refresh = RefreshToken.for_user(user)
        profile = getattr(user, 'profile', None)
        return Response(
            {
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "account_type": getattr(profile, 'account_type', ACCOUNT_TYPE_PERSONAL),
                    "country": getattr(profile, 'country', ''),
                    "phone": getattr(profile, 'phone', ''),
                    "tax_type": getattr(profile, 'tax_type', UserProfile.TAX_TYPE_CORPORATE),
                    "tax_rate": float(getattr(profile, 'tax_rate', 0) or 0),
                },
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class MeView(DeveloperFacingAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "account_type": getattr(profile, 'account_type', ACCOUNT_TYPE_PERSONAL),
                "country": getattr(profile, 'country', ''),
                "phone": getattr(profile, 'phone', ''),
                "tax_type": getattr(profile, 'tax_type', UserProfile.TAX_TYPE_CORPORATE),
                "tax_rate": float(getattr(profile, 'tax_rate', 0) or 0),
            }
        )

    def patch(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        payload = request.data or {}

        if payload.get('first_name') is not None:
            user.first_name = str(payload.get('first_name') or '').strip()
        if payload.get('last_name') is not None:
            user.last_name = str(payload.get('last_name') or '').strip()
        user.save(update_fields=['first_name', 'last_name'])

        if profile is None:
            profile = UserProfile.objects.create(user=user)

        if payload.get('country') is not None:
            profile.country = str(payload.get('country') or '').strip()
        if payload.get('phone') is not None:
            profile.phone = str(payload.get('phone') or '').strip()

        tax_type = payload.get('tax_type')
        if tax_type in [UserProfile.TAX_TYPE_CORPORATE, UserProfile.TAX_TYPE_PERSONAL, UserProfile.TAX_TYPE_VAT]:
            profile.tax_type = tax_type

        if payload.get('tax_rate') is not None and payload.get('tax_rate') != '':
            try:
                profile.tax_rate = float(payload.get('tax_rate'))
            except (TypeError, ValueError):
                return Response({"tax_rate": "Must be a number."}, status=status.HTTP_400_BAD_REQUEST)

        profile.save()
        return self.get(request)
