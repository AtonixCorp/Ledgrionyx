import hashlib
from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import TestCase
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APIClient
from decimal import Decimal
from .models import (
    APIKey,
    AuditLog,
    BankAccount,
    BankingTransaction,
    Budget,
    ChartOfAccounts,
    Customer,
    DeveloperAPI,
    DeveloperAPIEndpoint,
    DeveloperPortalAPILog,
    DeveloperPortalKeyRequest,
    Entity,
    Expense,
    GeneralLedger,
    Income,
    JournalEntry,
    OAuthApplication,
    RateLimitProfile,
    Organization,
    SystemEvent,
    TeamMember,
    UserProfile,
    Vendor,
    WebhookDelivery,
)


class ExpenseModelTest(TestCase):
    def test_create_expense(self):
        expense = Expense.objects.create(
            description="Test Expense",
            amount=Decimal("50.00"),
            category="Food",
            date=timezone.now().date()
        )
        self.assertEqual(expense.description, "Test Expense")
        self.assertEqual(expense.amount, Decimal("50.00"))


class IncomeModelTest(TestCase):
    def test_create_income(self):
        income = Income.objects.create(
            source="Test Income",
            amount=Decimal("1000.00"),
            date=timezone.now().date()
        )
        self.assertEqual(income.source, "Test Income")
        self.assertEqual(income.amount, Decimal("1000.00"))


class BudgetModelTest(TestCase):
    def test_create_budget(self):
        budget = Budget.objects.create(
            category="Food",
            limit=Decimal("500.00"),
            spent=Decimal("200.00")
        )
        self.assertEqual(budget.remaining, Decimal("300.00"))
        self.assertEqual(budget.percentage_used, 40.0)


class PlatformIntegrationViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_endpoint_is_public(self):
        response = self.client.get('/api/health/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'ok')
        self.assertEqual(response.data['checks']['database'], 'ok')

    @override_settings(PLATFORM_EVENT_TOKEN='test-platform-token')
    def test_platform_event_requires_token(self):
        response = self.client.post(
            '/api/platform/events/',
            {'event_type': 'deployment', 'source': 'bitbucket', 'environment': 'dev', 'status': 'succeeded'},
            format='json',
        )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data['error']['code'], 'UNAUTHORIZED')

    @override_settings(PLATFORM_EVENT_TOKEN='test-platform-token')
    def test_platform_event_accepts_valid_payload(self):
        response = self.client.post(
            '/api/platform/events/',
            {
                'event_type': 'deployment',
                'source': 'bitbucket',
                'environment': 'dev',
                'status': 'succeeded',
                'service': 'backend',
            },
            format='json',
            HTTP_AUTHORIZATION='Bearer test-platform-token',
        )

        self.assertEqual(response.status_code, 202)
        self.assertTrue(response.data['accepted'])


class DeveloperPortalViewTests(TestCase):
    def setUp(self):
        self.client = APIClient(HTTP_HOST='localhost')

    def test_root_landing_page_renders_nasa_style_public_portal(self):
        response = self.client.get('/')

        self.assertEqual(response.status_code, 200)
        content = response.content.decode('utf-8')
        self.assertIn('ATC Capital APIs', content)
        self.assertIn('Request API key', content)
        self.assertIn('Search APIs', content)

    def test_api_catalog_list_returns_seeded_results(self):
        response = self.client.get('/developer/apis')

        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data['results']), 1)
        self.assertIn('available_filters', response.data)
        self.assertTrue(any(item['slug'] == 'markets' for item in response.data['available_filters']['categories']))
        self.assertTrue(response.data['results'][0]['rate_limit_profile'])

    def test_api_search_requires_query(self):
        response = self.client.get('/developer/search')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['error']['code'], 'INVALID_REQUEST')
        self.assertEqual(response.data['error']['details']['field'], 'q')

    def test_api_search_returns_matching_seeded_entry(self):
        response = self.client.get('/developer/search', {'q': 'market'})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['query'], 'market')
        self.assertTrue(any(item['slug'] == 'market-data-api' for item in response.data['results']))

    def test_api_detail_returns_seeded_endpoints(self):
        response = self.client.get('/developer/apis/market-data-api')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['slug'], 'market-data-api')
        self.assertTrue(response.data['versions'])
        self.assertTrue(response.data['endpoints'])

    def test_public_api_aliases_return_catalog_detail_and_endpoint_data(self):
        api_response = self.client.get('/apis')
        detail_response = self.client.get('/apis/market-data-api')
        endpoint_list_response = self.client.get('/apis/market-data-api/endpoints')

        self.assertEqual(api_response.status_code, 200)
        self.assertEqual(detail_response.status_code, 200)
        self.assertEqual(endpoint_list_response.status_code, 200)
        self.assertEqual(detail_response.data['slug'], 'market-data-api')
        self.assertTrue(endpoint_list_response.data['endpoints'])

        endpoint_id = endpoint_list_response.data['endpoints'][0]['id']
        endpoint_detail_response = self.client.get(f'/apis/market-data-api/endpoints/{endpoint_id}')
        self.assertEqual(endpoint_detail_response.status_code, 200)
        self.assertEqual(endpoint_detail_response.data['api']['slug'], 'market-data-api')
        self.assertEqual(endpoint_detail_response.data['endpoint']['id'], endpoint_id)

        self.assertGreaterEqual(DeveloperPortalAPILog.objects.filter(path='/apis').count(), 1)
        self.assertGreaterEqual(DeveloperPortalAPILog.objects.filter(path='/apis/market-data-api').count(), 1)
        endpoint_log = DeveloperPortalAPILog.objects.filter(path=f'/apis/market-data-api/endpoints/{endpoint_id}').first()
        self.assertIsNotNone(endpoint_log)
        self.assertEqual(endpoint_log.endpoint_id, endpoint_id)

    def test_docs_aliases_return_catalog_documents(self):
        list_response = self.client.get('/docs/apis')
        detail_response = self.client.get('/docs/apis/market-data-api')

        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(detail_response.status_code, 200)
        self.assertTrue(any(item['slug'] == 'market-data-api' for item in list_response.data['results']))
        self.assertEqual(detail_response.data['slug'], 'market-data-api')

    def test_api_detail_returns_standard_not_found_error(self):
        response = self.client.get('/developer/apis/does-not-exist')

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data['error']['code'], 'NOT_FOUND')

    def test_docs_and_status_endpoints_are_public(self):
        auth_response = self.client.get('/developer/docs/authentication')
        errors_response = self.client.get('/developer/docs/errors')
        status_response = self.client.get('/developer/status')
        public_status_response = self.client.get('/status')

        self.assertEqual(auth_response.status_code, 200)
        self.assertEqual(auth_response.data['slug'], 'authentication')
        self.assertEqual(errors_response.status_code, 200)
        self.assertEqual(errors_response.data['slug'], 'errors')
        self.assertEqual(status_response.status_code, 200)
        self.assertEqual(status_response.data['service'], 'developer-portal')
        self.assertIn('uptime_seconds', status_response.data)
        self.assertEqual(public_status_response.status_code, 200)
        self.assertEqual(public_status_response.data['version'], status_response.data['version'])
        self.assertTrue(any(component['name'] == 'database' for component in status_response.data['components']))

    def test_key_request_requires_identity_fields(self):
        response = self.client.post('/developer/keys/request', {'email': 'dev@example.com'}, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['error']['code'], 'INVALID_REQUEST')
        self.assertIn('first_name', response.data['error']['details']['missing_fields'])
        self.assertIn('last_name', response.data['error']['details']['missing_fields'])

    def test_key_request_creates_user_profile_org_and_api_key(self):
        response = self.client.post(
            '/developer/keys/request',
            {
                'first_name': 'Ato',
                'last_name': 'Developer',
                'email': 'developer@atc-capital.test',
                'organization': 'ATC Developer Lab',
                'intended_use': 'Build a portfolio sync integration.',
            },
            format='json',
            REMOTE_ADDR='127.0.0.1',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['developer']['email'], 'developer@atc-capital.test')
        self.assertIn('.', response.data['api_key']['api_key'])
        self.assertEqual(response.data['api_key']['environment'], 'sandbox')
        self.assertEqual(response.data['api_key']['rate_limit_profile']['name'], 'STANDARD')

        user = User.objects.get(email='developer@atc-capital.test')
        self.assertTrue(UserProfile.objects.filter(user=user).exists())

        organization = Organization.objects.get(owner=user, name='ATC Developer Lab')
        request_record = DeveloperPortalKeyRequest.objects.get(email='developer@atc-capital.test')
        application = OAuthApplication.objects.get(pk=request_record.application_id)

        self.assertEqual(request_record.status, 'generated')
        self.assertEqual(request_record.organization, organization)
        self.assertEqual(application.organization, organization)
        self.assertEqual(application.environment, 'sandbox')
        self.assertEqual(application.source_metadata['source'], 'developer_portal')
        self.assertEqual(request_record.source_metadata['ip_address'], '127.0.0.1')
        self.assertEqual(request_record.rate_limit_profile.name, 'STANDARD')

        request_log = DeveloperPortalAPILog.objects.filter(path='/developer/keys/request', key_request=request_record).first()
        self.assertIsNotNone(request_log)
        self.assertEqual(request_log.rate_limit_profile.name, 'STANDARD')

    def test_public_key_register_accepts_name_payload(self):
        response = self.client.post(
            '/keys/register',
            {
                'name': 'Jane Portal',
                'email': 'jane.portal@example.com',
                'organization': 'Portal Labs',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['developer']['first_name'], 'Jane')
        self.assertEqual(response.data['developer']['last_name'], 'Portal')
        self.assertEqual(response.data['api_key']['status'], 'ACTIVE')
        self.assertTrue(DeveloperPortalKeyRequest.objects.filter(email='jane.portal@example.com').exists())

    def test_rate_limit_profiles_are_seeded(self):
        standard = RateLimitProfile.objects.get(name='STANDARD')
        partner = RateLimitProfile.objects.get(name='PARTNER')
        market_api = DeveloperAPI.objects.get(slug='market-data-api')

        self.assertEqual(standard.requests_per_minute, 60)
        self.assertEqual(partner.requests_per_day, 100000)
        self.assertEqual(market_api.rate_limit_profile, standard)

    def test_jwt_token_endpoint_uses_standard_error_envelope(self):
        response = self.client.post(
            '/api/auth/token/',
            {
                'username': 'missing-user',
                'password': 'wrong-password',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data['error']['code'], 'UNAUTHORIZED')


@override_settings(ATC_API_ENVIRONMENT='sandbox')
class CoreFinancialAPIV1Tests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='v1-owner',
            email='v1-owner@example.com',
            password='strong-pass-123',
        )
        self.organization = Organization.objects.create(
            owner=self.user,
            name='ATC Demo LLC',
            slug='atc-demo-llc',
            primary_country='US',
            primary_currency='USD',
        )
        self.entity = Entity.objects.create(
            organization=self.organization,
            name='ATC Demo LLC',
            country='US',
            entity_type='corporation',
            status='active',
            local_currency='USD',
        )
        self.client = APIClient(HTTP_HOST='localhost')
        self.client.force_authenticate(user=self.user)

    def _issue_api_token(self, scopes, *, client_id='scoped-client', client_secret='scoped-secret'):
        app = OAuthApplication.objects.create(
            organization=self.organization,
            name='Scoped Client',
            client_id=client_id,
            client_secret_hash=hashlib.sha256(client_secret.encode()).hexdigest(),
            scopes=scopes,
            environment='sandbox',
            created_by=self.user,
            updated_by=self.user,
            source_metadata={'source': 'test'},
        )
        auth_client = APIClient(HTTP_HOST='localhost')
        token_response = auth_client.post(
            '/v1/auth/token',
            {
                'client_id': app.client_id,
                'client_secret': client_secret,
                'grant_type': 'client_credentials',
            },
            format='json',
        )
        self.assertEqual(token_response.status_code, 200)
        return token_response.data['access_token']

    def test_api_key_lifecycle(self):
        create_response = self.client.post(
            '/v1/api-keys',
            {
                'name': 'Integration Key',
                'scopes': ['ledger:write', 'reports:read'],
            },
            format='json',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )

        self.assertEqual(create_response.status_code, 201)
        self.assertIn('client_secret', create_response.data)
        self.assertIn('api_key', create_response.data)
        self.assertEqual(create_response.data['environment'], 'sandbox')
        self.assertEqual(create_response.data['scopes'], ['ledger:write', 'reports:read'])

        list_response = self.client.get(
            '/v1/api-keys',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.data), 1)

        rotate_response = self.client.post(
            f"/v1/api-keys/{create_response.data['id']}/rotate",
            {},
            format='json',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(rotate_response.status_code, 200)
        self.assertIn('client_secret', rotate_response.data)
        self.assertIn('api_key', rotate_response.data)
        self.assertNotEqual(rotate_response.data['client_secret'], create_response.data['client_secret'])

        revoke_response = self.client.post(
            f"/v1/api-keys/{create_response.data['id']}/revoke",
            {},
            format='json',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(revoke_response.status_code, 200)
        self.assertEqual(revoke_response.data['status'], 'revoked')

        application = OAuthApplication.objects.get(pk=int(create_response.data['id'].split('_', 1)[1]))
        self.assertFalse(application.is_active)

    def test_cli_login_refresh_and_me_endpoints(self):
        create_response = self.client.post(
            '/v1/api-keys',
            {
                'name': 'CLI Integration Key',
                'scopes': ['reports:read'],
            },
            format='json',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(create_response.status_code, 201)

        public_client = APIClient(HTTP_HOST='localhost')
        login_response = public_client.post(
            '/auth/cli-login',
            {
                'api_key': create_response.data['api_key'],
                'organization_id': f'org_{self.organization.pk}',
            },
            format='json',
        )
        self.assertEqual(login_response.status_code, 200)
        self.assertEqual(login_response.data['organization_id'], f'org_{self.organization.pk}')
        self.assertEqual(login_response.data['user']['email'], self.user.email)

        access_token = login_response.data['access_token']
        token_hash = hashlib.sha256(access_token.encode()).hexdigest()
        self.assertTrue(APIKey.objects.filter(token_hash=token_hash, source_metadata__source='cli_login').exists())

        me_response = public_client.get(
            '/auth/me',
            HTTP_AUTHORIZATION=f'Bearer {access_token}',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(me_response.status_code, 200)
        self.assertEqual(me_response.data['organization']['name'], self.organization.name)

        refresh_response = public_client.post(
            '/auth/refresh',
            {'api_key': create_response.data['api_key']},
            format='json',
        )
        self.assertEqual(refresh_response.status_code, 200)
        self.assertNotEqual(refresh_response.data['access_token'], access_token)

        self.assertTrue(
            AuditLog.objects.filter(
                organization=self.organization,
                model_name='CLIAuthSession',
            ).count() >= 2
        )

    def test_cli_login_returns_standard_errors(self):
        public_client = APIClient(HTTP_HOST='localhost')

        missing_response = public_client.post('/auth/cli-login', {}, format='json')
        self.assertEqual(missing_response.status_code, 400)
        self.assertEqual(missing_response.data['error']['code'], 'INVALID_REQUEST')

        invalid_key_response = public_client.post(
            '/auth/cli-login',
            {
                'api_key': 'invalid-key',
                'organization_id': f'org_{self.organization.pk}',
            },
            format='json',
        )
        self.assertEqual(invalid_key_response.status_code, 401)
        self.assertEqual(invalid_key_response.data['error']['code'], 'INVALID_API_KEY')

    def test_openapi_and_redoc_endpoints_are_served(self):
        public_client = APIClient(HTTP_HOST='localhost')

        schema_response = public_client.get('/v1/openapi.yaml')
        self.assertEqual(schema_response.status_code, 200)
        self.assertIn('openapi: 3.0.3', schema_response.content.decode('utf-8'))
        self.assertIn('/auth/cli-login', schema_response.content.decode('utf-8'))

        docs_response = public_client.get('/v1/docs')
        self.assertEqual(docs_response.status_code, 200)
        self.assertIn('redoc', docs_response.content.decode('utf-8').lower())

        swagger_response = public_client.get('/v1/swagger')
        self.assertEqual(swagger_response.status_code, 200)
        self.assertIn('swagger-ui', swagger_response.content.decode('utf-8').lower())

    def test_v1_errors_use_standard_error_envelope(self):
        public_client = APIClient(HTTP_HOST='localhost')
        token_response = public_client.post(
            '/v1/auth/token',
            {
                'client_id': 'missing',
                'client_secret': 'missing',
                'grant_type': 'password',
            },
            format='json',
        )
        self.assertEqual(token_response.status_code, 400)
        self.assertEqual(token_response.data['error']['code'], 'INVALID_REQUEST')

        masked_response = self.client.post(
            '/v1/bank-accounts',
            {
                'provider': 'plaid',
                'provider_account_id': 'pld_err',
                'name': 'Unsafe Account',
                'currency': 'USD',
                'account_number_masked': '123456789',
            },
            format='json',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(masked_response.status_code, 400)
        self.assertEqual(masked_response.data['error']['code'], 'INVALID_REQUEST')
        self.assertIn('Full account numbers', masked_response.data['error']['message'])

    def test_token_exchange_and_bank_import_post_ledger_entries(self):
        app = OAuthApplication.objects.create(
            organization=self.organization,
            name='Sandbox Client',
            client_id='sandbox-client-001',
            client_secret_hash=hashlib.sha256('wrong-secret'.encode()).hexdigest(),
            scopes=['banking:write'],
            environment='sandbox',
            created_by=self.user,
            updated_by=self.user,
            source_metadata={'source': 'test'},
        )

        auth_client = APIClient(HTTP_HOST='localhost')
        token_response = auth_client.post(
            '/v1/auth/token',
            {
                'client_id': app.client_id,
                'client_secret': 'secret-123',
                'grant_type': 'client_credentials',
            },
            format='json',
        )

        self.assertEqual(token_response.status_code, 401)

        app.client_secret_hash = hashlib.sha256('bank-secret'.encode()).hexdigest()
        app.save(update_fields=['client_secret_hash', 'updated_at'])

        token_response = auth_client.post(
            '/v1/auth/token',
            {
                'client_id': app.client_id,
                'client_secret': 'bank-secret',
                'grant_type': 'client_credentials',
            },
            format='json',
        )
        self.assertEqual(token_response.status_code, 200)

        bank_account_response = self.client.post(
            '/v1/bank-accounts',
            {
                'provider': 'plaid',
                'provider_account_id': 'pld_123',
                'name': 'Operating Account',
                'currency': 'USD',
                'account_number_masked': '****1234',
            },
            format='json',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(bank_account_response.status_code, 201)

        bearer_client = APIClient(HTTP_HOST='localhost')
        import_payload = {
            'transactions': [
                {
                    'external_id': 'txn_001',
                    'date': '2026-03-14',
                    'amount': -250.00,
                    'currency': 'USD',
                    'description': 'Vendor Payment',
                }
            ]
        }
        import_response = bearer_client.post(
            f"/v1/bank-accounts/{bank_account_response.data['id']}/transactions",
            import_payload,
            format='json',
            HTTP_AUTHORIZATION=f"Bearer {token_response.data['access_token']}",
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
            HTTP_X_IDEMPOTENCY_KEY='bank-import-001',
        )

        self.assertEqual(import_response.status_code, 201)
        self.assertEqual(import_response.data['imported_count'], 1)
        self.assertEqual(JournalEntry.objects.count(), 1)
        self.assertEqual(GeneralLedger.objects.count(), 1)

        repeat_response = bearer_client.post(
            f"/v1/bank-accounts/{bank_account_response.data['id']}/transactions",
            import_payload,
            format='json',
            HTTP_AUTHORIZATION=f"Bearer {token_response.data['access_token']}",
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
            HTTP_X_IDEMPOTENCY_KEY='bank-import-001',
        )
        self.assertEqual(repeat_response.status_code, 201)
        self.assertEqual(JournalEntry.objects.count(), 1)
        self.assertEqual(GeneralLedger.objects.count(), 1)

    def test_api_key_scopes_are_enforced_for_v1_views(self):
        token = self._issue_api_token(['reports:read'], client_id='reports-only', client_secret='reports-only-secret')
        bearer_client = APIClient(HTTP_HOST='localhost')

        allowed_response = bearer_client.get(
            '/v1/reports/trial-balance',
            HTTP_AUTHORIZATION=f'Bearer {token}',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(allowed_response.status_code, 200)

        forbidden_response = bearer_client.get(
            '/v1/accounts',
            HTTP_AUTHORIZATION=f'Bearer {token}',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(forbidden_response.status_code, 403)
        self.assertEqual(forbidden_response.data['error']['code'], 'INSUFFICIENT_SCOPE')
        self.assertIn('accounts:read', forbidden_response.data['error']['message'])

    def test_bank_account_linking_masks_numbers_and_supports_listing(self):
        rejected_response = self.client.post(
            '/v1/bank-accounts',
            {
                'provider': 'plaid',
                'provider_account_id': 'pld_reject',
                'name': 'Unsafe Account',
                'currency': 'USD',
                'account_number_masked': '123456789',
            },
            format='json',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(rejected_response.status_code, 400)

        create_response = self.client.post(
            '/v1/bank-accounts',
            {
                'provider': 'plaid',
                'provider_account_id': 'pld_masked',
                'name': 'Treasury Account',
                'currency': 'USD',
                'account_number_masked': '1234',
                'verification_status': 'verified',
            },
            format='json',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(create_response.status_code, 201)
        self.assertEqual(create_response.data['account_number_masked'], '****1234')
        self.assertEqual(create_response.data['verification_status'], 'verified')

        linked_account = BankAccount.objects.get(provider_account_id='pld_masked')
        self.assertEqual(linked_account.account_number, '****1234')

        list_response = self.client.get(
            '/v1/bank-accounts',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(list_response.data[0]['provider'], 'plaid')
        self.assertEqual(list_response.data[0]['verification_status'], 'verified')

    def test_roles_and_team_member_invitation_and_deactivation(self):
        roles_response = self.client.get(
            '/v1/roles',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(roles_response.status_code, 200)
        self.assertTrue(any(role['code'] == 'CFO' for role in roles_response.data))

        permissions_response = self.client.get(
            '/v1/permissions',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(permissions_response.status_code, 200)
        self.assertTrue(any(permission['code'] == 'manage_team' for permission in permissions_response.data))

        create_member_response = self.client.post(
            '/v1/team-members/invitations',
            {
                'email': 'advisor@example.com',
                'first_name': 'Ada',
                'last_name': 'Advisor',
                'role_code': 'EXTERNAL_ADVISOR',
                'scoped_entity_ids': [f'ent_{self.entity.pk}'],
            },
            format='json',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(create_member_response.status_code, 201)
        self.assertEqual(create_member_response.data['role']['code'], 'EXTERNAL_ADVISOR')
        self.assertEqual(len(create_member_response.data['scoped_entities']), 1)
        self.assertEqual(create_member_response.data['invitation_status'], 'pending')
        self.assertIsNone(create_member_response.data['accepted_at'])

        members_response = self.client.get(
            '/v1/team-members',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(members_response.status_code, 200)
        self.assertEqual(len(members_response.data), 1)
        self.assertEqual(members_response.data[0]['invitation_status'], 'pending')
        self.assertEqual(TeamMember.objects.count(), 1)

        deactivate_response = self.client.post(
            f"/v1/team-members/{create_member_response.data['id']}/deactivate",
            {},
            format='json',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(deactivate_response.status_code, 200)
        self.assertFalse(deactivate_response.data['is_active'])

    def test_historical_financials_import_balances_into_retained_earnings(self):
        payload = {
            'as_of_date': '2025-12-31',
            'currency': 'USD',
            'reference': 'HIST-2025',
            'balance_sheet': [
                {
                    'account_code': '1000',
                    'account_name': 'Cash',
                    'account_type': 'asset',
                    'side': 'debit',
                    'amount': 1000,
                },
                {
                    'account_code': '2000',
                    'account_name': 'Accounts Payable',
                    'account_type': 'liability',
                    'side': 'credit',
                    'amount': 400,
                },
                {
                    'account_code': '3000',
                    'account_name': 'Owner Equity',
                    'account_type': 'equity',
                    'side': 'credit',
                    'amount': 200,
                },
            ],
            'profit_and_loss': [
                {
                    'account_code': '4000',
                    'account_name': 'Service Revenue',
                    'account_type': 'revenue',
                    'amount': 600,
                },
                {
                    'account_code': '5000',
                    'account_name': 'Operating Expense',
                    'account_type': 'expense',
                    'amount': 200,
                },
            ],
        }

        response = self.client.post(
            '/v1/migration/historical-financials',
            payload,
            format='json',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
            HTTP_X_IDEMPOTENCY_KEY='historical-001',
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['retained_earnings_direction'], 'credit')
        self.assertEqual(response.data['retained_earnings_amount'], 400.0)
        self.assertEqual(JournalEntry.objects.count(), 1)
        self.assertEqual(GeneralLedger.objects.count(), 3)

        repeat_response = self.client.post(
            '/v1/migration/historical-financials',
            payload,
            format='json',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
            HTTP_X_IDEMPOTENCY_KEY='historical-001',
        )
        self.assertEqual(repeat_response.status_code, 201)
        self.assertEqual(JournalEntry.objects.count(), 1)
        self.assertEqual(GeneralLedger.objects.count(), 3)

    def test_balance_sheet_and_cash_flow_reports_are_ledger_driven(self):
        customer = Customer.objects.create(
            entity=self.entity,
            customer_code='CUS-REPORT',
            customer_name='Reports Customer',
            email='reports@example.com',
            address='123 Main St',
            city='New York',
            country='US',
            postal_code='10001',
            currency='USD',
            status='active',
        )

        invoice_response = self.client.post(
            '/v1/invoices',
            {
                'customer_id': f'cus_{customer.pk}',
                'issue_date': '2026-03-15',
                'due_date': '2026-03-20',
                'currency': 'USD',
                'line_items': [
                    {
                        'description': 'Reporting services',
                        'quantity': 1,
                        'unit_price': 1000,
                    }
                ],
            },
            format='json',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
            HTTP_X_IDEMPOTENCY_KEY='reports-invoice-001',
        )
        self.assertEqual(invoice_response.status_code, 201)

        bank_account_response = self.client.post(
            '/v1/bank-accounts',
            {
                'provider': 'plaid',
                'provider_account_id': 'pld_report',
                'name': 'Reporting Cash',
                'currency': 'USD',
                'account_number_masked': '****4321',
            },
            format='json',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(bank_account_response.status_code, 201)

        payment_response = self.client.post(
            f"/v1/invoices/{invoice_response.data['id']}/payments",
            {
                'payment_date': '2026-03-16',
                'amount': 1000,
                'currency': 'USD',
                'payment_method': 'bank_transfer',
                'bank_account_id': bank_account_response.data['id'],
            },
            format='json',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
            HTTP_X_IDEMPOTENCY_KEY='reports-payment-001',
        )
        self.assertEqual(payment_response.status_code, 201)

        balance_sheet_response = self.client.get(
            '/v1/reports/balance-sheet?as_of_date=2026-03-31&currency=USD',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(balance_sheet_response.status_code, 200)
        self.assertTrue(any(line['account_code'] == '1000' for line in balance_sheet_response.data['assets']))

        cash_flow_response = self.client.get(
            '/v1/reports/cash-flow?from_date=2026-03-01&to_date=2026-03-31&currency=USD',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(cash_flow_response.status_code, 200)
        self.assertTrue(any(line['section'] == 'operating' for line in cash_flow_response.data['lines']))
        self.assertNotEqual(cash_flow_response.data['net_cash_flow'], 0.0)

    def test_bills_and_bill_payments_post_to_ledger(self):
        vendor = Vendor.objects.create(
            entity=self.entity,
            vendor_code='VEN-001',
            vendor_name='Office Vendor',
            email='vendor@example.com',
            address='1 Market St',
            city='New York',
            country='US',
            postal_code='10001',
            currency='USD',
            status='active',
        )

        bill_response = self.client.post(
            '/v1/bills',
            {
                'vendor_id': f'ven_{vendor.pk}',
                'issue_date': '2026-03-15',
                'due_date': '2026-03-30',
                'currency': 'USD',
                'line_items': [
                    {
                        'description': 'Hosting services',
                        'quantity': 2,
                        'unit_price': 150,
                    }
                ],
            },
            format='json',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
            HTTP_X_IDEMPOTENCY_KEY='bill-create-001',
        )
        self.assertEqual(bill_response.status_code, 201)
        self.assertEqual(bill_response.data['status'], 'posted')
        self.assertEqual(JournalEntry.objects.count(), 1)
        self.assertEqual(GeneralLedger.objects.count(), 1)

        bank_account_response = self.client.post(
            '/v1/bank-accounts',
            {
                'provider': 'plaid',
                'provider_account_id': 'pld_bill',
                'name': 'Payables Account',
                'currency': 'USD',
                'account_number_masked': '****7777',
            },
            format='json',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(bank_account_response.status_code, 201)

        payment_response = self.client.post(
            f"/v1/bills/{bill_response.data['id']}/payments",
            {
                'payment_date': '2026-03-20',
                'amount': 300,
                'currency': 'USD',
                'payment_method': 'bank_transfer',
                'bank_account_id': bank_account_response.data['id'],
            },
            format='json',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
            HTTP_X_IDEMPOTENCY_KEY='bill-pay-001',
        )
        self.assertEqual(payment_response.status_code, 201)
        self.assertEqual(payment_response.data['status'], 'paid')
        self.assertEqual(JournalEntry.objects.count(), 2)
        self.assertEqual(GeneralLedger.objects.count(), 2)

    @patch('finances.v1_views.urlopen')
    def test_webhook_delivery_execution_and_signing(self, mocked_urlopen):
        mocked_response = mocked_urlopen.return_value.__enter__.return_value
        mocked_response.status = 200
        mocked_response.read.return_value = b'{"ok":true}'

        webhook_response = self.client.post(
            '/v1/webhooks/endpoints',
            {
                'url': 'https://client.example.com/webhooks',
                'events': ['invoice.created'],
            },
            format='json',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(webhook_response.status_code, 201)

        customer = Customer.objects.create(
            entity=self.entity,
            customer_code='CUS-001',
            customer_name='Acme Corp',
            email='billing@acme.com',
            address='123 Main St',
            city='New York',
            country='US',
            postal_code='10001',
            currency='USD',
            status='active',
        )

        invoice_response = self.client.post(
            '/v1/invoices',
            {
                'customer_id': f'cus_{customer.pk}',
                'issue_date': '2026-03-15',
                'due_date': '2026-03-30',
                'currency': 'USD',
                'line_items': [
                    {
                        'description': 'Consulting services',
                        'quantity': 10,
                        'unit_price': 100,
                    }
                ],
            },
            format='json',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
            HTTP_X_IDEMPOTENCY_KEY='invoice-webhook-001',
        )
        self.assertEqual(invoice_response.status_code, 201)
        self.assertEqual(mocked_urlopen.call_count, 1)

        request_obj = mocked_urlopen.call_args.args[0]
        self.assertEqual(request_obj.full_url, 'https://client.example.com/webhooks')
        self.assertEqual(request_obj.headers['X-atc-event'], 'invoice.created')
        self.assertTrue(request_obj.headers['X-atc-signature-sha256'].startswith('sha256='))

        delivery = WebhookDelivery.objects.get()
        self.assertEqual(delivery.status, 'delivered')
        self.assertEqual(delivery.response_status, 200)

    @patch('finances.v1_views.urlopen')
    def test_reconciliation_matching_exposes_events_and_supports_replay(self, mocked_urlopen):
        mocked_response = mocked_urlopen.return_value.__enter__.return_value
        mocked_response.status = 200
        mocked_response.read.return_value = b'{"ok":true}'

        webhook_response = self.client.post(
            '/v1/webhooks/endpoints',
            {
                'url': 'https://client.example.com/reconciliation-webhooks',
                'events': ['reconciliation.matched'],
            },
            format='json',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(webhook_response.status_code, 201)

        bank_account_response = self.client.post(
            '/v1/bank-accounts',
            {
                'provider': 'plaid',
                'provider_account_id': 'pld_reconcile',
                'name': 'Reconciliation Account',
                'currency': 'USD',
                'account_number_masked': '****9999',
            },
            format='json',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(bank_account_response.status_code, 201)

        import_response = self.client.post(
            f"/v1/bank-accounts/{bank_account_response.data['id']}/transactions",
            {
                'transactions': [
                    {
                        'external_id': 'txn_reconcile_001',
                        'date': '2026-03-14',
                        'amount': -250.00,
                        'currency': 'USD',
                        'description': 'Vendor Payment',
                        'raw_data': {'source': 'plaid'},
                    }
                ]
            },
            format='json',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
            HTTP_X_IDEMPOTENCY_KEY='bank-reconcile-001',
        )
        self.assertEqual(import_response.status_code, 201)
        self.assertEqual(BankingTransaction.objects.count(), 1)

        cash_account = ChartOfAccounts.objects.create(
            entity=self.entity,
            account_code='1010',
            account_name='Ops Cash',
            account_type='asset',
            currency='USD',
            status='active',
        )
        expense_account = ChartOfAccounts.objects.create(
            entity=self.entity,
            account_code='5100',
            account_name='Vendor Expense',
            account_type='expense',
            currency='USD',
            status='active',
        )
        journal_entry = JournalEntry.objects.create(
            entity=self.entity,
            entry_type='manual',
            reference_number='REC-001',
            description='Reconciliation candidate',
            posting_date=timezone.datetime(2026, 3, 14).date(),
            status='posted',
            created_by=self.user,
            approved_by=self.user,
            approved_at=timezone.now(),
        )
        GeneralLedger.objects.create(
            entity=self.entity,
            debit_account=expense_account,
            credit_account=cash_account,
            debit_amount=Decimal('250.00'),
            credit_amount=Decimal('250.00'),
            description='Reconciliation candidate',
            reference_number='REC-001',
            posting_date=timezone.datetime(2026, 3, 14).date(),
            journal_entry=journal_entry,
            posting_status='posted',
        )

        bank_transaction_id = import_response.data['transactions'][0]['id']
        match_response = self.client.post(
            '/v1/reconciliation/matches',
            {
                'bank_transaction_id': bank_transaction_id,
                'ledger_entry_id': f'je_{journal_entry.pk}',
                'match_type': 'exact',
            },
            format='json',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(match_response.status_code, 201)
        self.assertEqual(match_response.data['status'], 'reconciled')
        self.assertGreaterEqual(mocked_urlopen.call_count, 1)

        transactions_response = self.client.get(
            f"/v1/bank-accounts/{bank_account_response.data['id']}/transactions?status=reconciled",
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(transactions_response.status_code, 200)
        self.assertEqual(len(transactions_response.data), 1)
        self.assertEqual(transactions_response.data[0]['matched_ledger_entry_id'], f'je_{journal_entry.pk}')

        events_response = self.client.get(
            '/v1/events?event_type=reconciliation.matched',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(events_response.status_code, 200)
        self.assertEqual(len(events_response.data), 1)
        self.assertEqual(SystemEvent.objects.count(), 2)

        replay_response = self.client.post(
            f"/v1/webhooks/events/{events_response.data[0]['id']}/replay",
            {},
            format='json',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(replay_response.status_code, 200)
        self.assertEqual(replay_response.data['replayed_count'], 1)
        self.assertGreaterEqual(mocked_urlopen.call_count, 2)

        deliveries_response = self.client.get(
            '/v1/webhooks/deliveries',
            HTTP_X_ORGANIZATION_ID=f'org_{self.organization.pk}',
        )
        self.assertEqual(deliveries_response.status_code, 200)
        self.assertGreaterEqual(len(deliveries_response.data), 2)
