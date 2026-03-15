from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed, NotAuthenticated, PermissionDenied, Throttled, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


def developer_error_code_from_status(status_code):
    return {
        400: 'INVALID_REQUEST',
        401: 'UNAUTHORIZED',
        403: 'FORBIDDEN',
        404: 'NOT_FOUND',
        405: 'METHOD_NOT_ALLOWED',
        409: 'CONFLICT',
        429: 'RATE_LIMIT_EXCEEDED',
    }.get(status_code, 'INTERNAL_ERROR')


def developer_standard_error_payload(*, code, message, details=None):
    return {
        'error': {
            'code': code,
            'message': message,
            'details': details or {},
        }
    }


def developer_standard_error_response(*, code, message, details=None, status_code=status.HTTP_400_BAD_REQUEST):
    return Response(
        developer_standard_error_payload(code=code, message=message, details=details),
        status=status_code,
    )


def normalize_developer_error_response_data(data, status_code):
    if isinstance(data, dict) and 'error' in data:
        return data

    if isinstance(data, dict) and 'detail' in data:
        detail = data.get('detail')
        detail_code = getattr(detail, 'code', None)
        code = {
            'throttled': 'RATE_LIMIT_EXCEEDED',
            'authentication_failed': 'UNAUTHORIZED',
            'not_authenticated': 'UNAUTHORIZED',
            'permission_denied': 'FORBIDDEN',
            'not_found': 'NOT_FOUND',
        }.get(detail_code, developer_error_code_from_status(status_code))
        details = {key: value for key, value in data.items() if key != 'detail'}
        return developer_standard_error_payload(code=code, message=str(detail), details=details)

    if isinstance(data, dict):
        message = 'Request failed.'
        if 'non_field_errors' in data and data['non_field_errors']:
            message = str(data['non_field_errors'][0])
        elif data:
            first_key = next(iter(data))
            first_value = data[first_key]
            if isinstance(first_value, list) and first_value:
                message = f'{first_key}: {first_value[0]}'
            else:
                message = f'{first_key}: {first_value}'
        return developer_standard_error_payload(
            code=developer_error_code_from_status(status_code),
            message=message,
            details=data,
        )

    return developer_standard_error_payload(
        code=developer_error_code_from_status(status_code),
        message=str(data),
        details={},
    )


class DeveloperFacingAPIView(APIView):
    def handle_exception(self, exc):
        if isinstance(exc, ValueError):
            return developer_standard_error_response(
                code='INVALID_REQUEST',
                message=str(exc),
                details={},
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        if isinstance(exc, (AuthenticationFailed, NotAuthenticated, PermissionDenied, Throttled, ValidationError)):
            response = super().handle_exception(exc)
            if response is not None:
                response.data = normalize_developer_error_response_data(response.data, response.status_code)
            return response
        return super().handle_exception(exc)

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        if getattr(response, 'status_code', 200) >= 400 and hasattr(response, 'data'):
            response.data = normalize_developer_error_response_data(response.data, response.status_code)
            response._is_rendered = False
        return response


class StandardizedTokenObtainPairView(DeveloperFacingAPIView, TokenObtainPairView):
    pass


class StandardizedTokenRefreshView(DeveloperFacingAPIView, TokenRefreshView):
    pass