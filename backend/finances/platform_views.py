import json
import logging
import secrets

from django.conf import settings
from django.db import connections
from django.db.utils import OperationalError
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .developer_portal_common import developer_standard_error_response


def _database_health():
    try:
        connections['default'].cursor()
        return 'ok'
    except OperationalError:
        return 'error'


def _extract_platform_token(request):
    authorization = request.headers.get('Authorization', '')
    if authorization.startswith('Bearer '):
        return authorization.split(' ', 1)[1].strip()
    return request.headers.get('X-Platform-Token', '').strip()


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def health_check(request):
    database_status = _database_health()
    response_status = status.HTTP_200_OK if database_status == 'ok' else status.HTTP_503_SERVICE_UNAVAILABLE
    return Response(
        {
            'status': 'ok' if database_status == 'ok' else 'degraded',
            'service': 'atc-capital-backend',
            'environment': settings.DEPLOYMENT_ENVIRONMENT,
            'version': settings.APP_VERSION,
            'timestamp': timezone.now().isoformat(),
            'checks': {
                'database': database_status,
            },
        },
        status=response_status,
    )


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def ingest_platform_event(request):
    configured_token = settings.PLATFORM_EVENT_TOKEN
    provided_token = _extract_platform_token(request)
    if not configured_token or not secrets.compare_digest(provided_token, configured_token):
        return developer_standard_error_response(
            code='UNAUTHORIZED',
            message='Unauthorized platform event publisher.',
            details={},
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    payload = request.data if isinstance(request.data, dict) else {}
    required_fields = ['event_type', 'source', 'environment', 'status']
    missing_fields = [field for field in required_fields if not payload.get(field)]
    if missing_fields:
        return developer_standard_error_response(
            code='INVALID_REQUEST',
            message=f'Missing required fields: {", ".join(missing_fields)}',
            details={'missing_fields': missing_fields},
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    logger = logging.getLogger(settings.PLATFORM_EVENT_LOGGER)
    logger.info(
        'platform_event %s',
        json.dumps(
            {
                'event_type': payload['event_type'],
                'source': payload['source'],
                'environment': payload['environment'],
                'status': payload['status'],
                'service': payload.get('service', 'unknown'),
                'version': payload.get('version', settings.APP_VERSION),
                'metadata': payload.get('metadata', {}),
                'received_at': timezone.now().isoformat(),
            },
            sort_keys=True,
        ),
    )

    return Response({'accepted': True}, status=status.HTTP_202_ACCEPTED)