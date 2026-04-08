import hashlib
from unittest.mock import patch

from django.contrib.auth.models import User
from django.core import mail
from django.core.management import call_command
from django.test import TestCase
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APIClient
from decimal import Decimal
from .models import (
    APIKey,
    AuditLog,
    BankAccount,
    BankingConsentLog,
    BankingIntegration,
    BankingTransaction,
    Budget,
    ChartOfAccounts,
    Customer,
    Consolidation,
    ConsolidationEntity,
    DeveloperAPI,
    DeveloperAPIEndpoint,
    DeveloperPortalAPILog,
    DeveloperPortalKeyRequest,
    Entity,
    EntityDepartment,
    EntityRole,
    EntityStaff,
    Expense,
    GeneralLedger,
    Income,
    Invoice,
    IntercompanyEliminationEntry,
    IntercompanyTransaction,
    JournalEntry,
    LedgerPeriod,
    Notification,
    NotificationPreference,
    OAuthApplication,
    PayrollBankPaymentFile,
    PayrollBankOriginatorProfile,
    PayrollComponent,
    PayrollRun,
    PayrollStatutoryReport,
    Payslip,
    RateLimitProfile,
    Role,
    Organization,
    LeaveBalance,
    LeaveRequest,
    LeaveType,
    StaffPayrollComponentAssignment,
    StaffPayrollProfile,
    SystemEvent,
    TeamMember,
    UserProfile,
    Vendor,
    WebhookDelivery,
    Bill,
    Payment,
    AccountingApprovalRecord,
    AccountingApprovalMatrix,
    AccountingApprovalDelegation,
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


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    DEFAULT_FROM_EMAIL='no-reply@atccapital.test',
    APPROVAL_NOTIFICATION_BASE_URL='https://console.atc-capital.test',
)
class AccountingApprovalWorkflowAPITests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username='approval-owner', email='approval-owner@example.com', password='pass')
        self.reviewer = User.objects.create_user(username='approval-reviewer', email='approval-reviewer@example.com', password='pass')
        self.approver = User.objects.create_user(username='approval-approver', email='approval-approver@example.com', password='pass')
        self.delegate = User.objects.create_user(username='approval-delegate', email='approval-delegate@example.com', password='pass')

        self.organization = Organization.objects.create(
            owner=self.owner,
            name='Approval Org',
            slug='approval-org',
            primary_country='US',
            primary_currency='USD',
        )
        self.entity = Entity.objects.create(
            organization=self.organization,
            name='Approval Entity',
            country='US',
            entity_type='corporation',
            status='active',
            local_currency='USD',
            workspace_mode='accounting',
        )
        self.entity.create_default_structure()

        finance_analyst_role, _ = Role.objects.get_or_create(code='FINANCE_ANALYST', defaults={'name': 'Finance Analyst', 'description': 'Finance analyst'})
        cfo_role, _ = Role.objects.get_or_create(code='CFO', defaults={'name': 'Chief Financial Officer', 'description': 'Chief Financial Officer'})
        advisor_role, _ = Role.objects.get_or_create(code='EXTERNAL_ADVISOR', defaults={'name': 'External Advisor', 'description': 'External advisor'})

        self.reviewer_membership = TeamMember.objects.create(organization=self.organization, user=self.reviewer, role=finance_analyst_role, is_active=True)
        self.reviewer_membership.scoped_entities.add(self.entity)
        self.approver_membership = TeamMember.objects.create(organization=self.organization, user=self.approver, role=cfo_role, is_active=True)
        self.approver_membership.scoped_entities.add(self.entity)
        self.delegate_membership = TeamMember.objects.create(organization=self.organization, user=self.delegate, role=advisor_role, is_active=True)
        self.delegate_membership.scoped_entities.add(self.entity)

        self.accountant_role = EntityRole.objects.get(entity=self.entity, name='Accountant')
        self.finance_manager_role = EntityRole.objects.get(entity=self.entity, name='Finance Manager')
        self.entity_cfo_role = EntityRole.objects.get(entity=self.entity, name='CFO')

        EntityStaff.objects.create(
            entity=self.entity,
            user=self.owner,
            employee_id='EMP-AP-OWNER',
            first_name='Prep',
            last_name='Owner',
            email=self.owner.email,
            department=self.accountant_role.department,
            role=self.accountant_role,
            hire_date=timezone.now().date(),
        )
        self.reviewer_staff = EntityStaff.objects.create(
            entity=self.entity,
            user=self.reviewer,
            employee_id='EMP-AP-REVIEW',
            first_name='Review',
            last_name='User',
            email=self.reviewer.email,
            department=self.finance_manager_role.department,
            role=self.finance_manager_role,
            hire_date=timezone.now().date(),
        )
        self.approver_staff = EntityStaff.objects.create(
            entity=self.entity,
            user=self.approver,
            employee_id='EMP-AP-APPROVE',
            first_name='Approve',
            last_name='User',
            email=self.approver.email,
            department=self.entity_cfo_role.department,
            role=self.entity_cfo_role,
            hire_date=timezone.now().date(),
        )
        self.delegate_staff = EntityStaff.objects.create(
            entity=self.entity,
            user=self.delegate,
            employee_id='EMP-AP-DELEGATE',
            first_name='Delegate',
            last_name='User',
            email=self.delegate.email,
            department=self.accountant_role.department,
            role=self.accountant_role,
            hire_date=timezone.now().date(),
        )

        self.vendor = Vendor.objects.create(
            entity=self.entity,
            vendor_code='VEN-AP-001',
            vendor_name='Approval Vendor',
            email='vendor@example.com',
            address='1 Main Street',
            city='New York',
            country='US',
            postal_code='10001',
            currency='USD',
            status='active',
        )
        self.customer = Customer.objects.create(
            entity=self.entity,
            customer_code='CUS-AP-001',
            customer_name='Approval Customer',
            email='customer@example.com',
            address='1 Main Street',
            city='New York',
            country='US',
            postal_code='10001',
            currency='USD',
            status='active',
        )

        NotificationPreference.objects.get_or_create(user=self.reviewer)
        NotificationPreference.objects.get_or_create(user=self.approver)
        NotificationPreference.objects.get_or_create(user=self.delegate)

        self.owner_client = APIClient()
        self.owner_client.force_authenticate(user=self.owner)
        self.reviewer_client = APIClient()
        self.reviewer_client.force_authenticate(user=self.reviewer)
        self.approver_client = APIClient()
        self.approver_client.force_authenticate(user=self.approver)
        self.delegate_client = APIClient()
        self.delegate_client.force_authenticate(user=self.delegate)

    def _create_bill(self, bill_number='BILL-AP-001', bill_date=None):
        bill_date = bill_date or timezone.now().date()
        return Bill.objects.create(
            entity=self.entity,
            vendor=self.vendor,
            bill_number=bill_number,
            bill_date=bill_date,
            due_date=bill_date,
            subtotal=Decimal('1000.00'),
            tax_amount=Decimal('0.00'),
            total_amount=Decimal('1000.00'),
            paid_amount=Decimal('0.00'),
            outstanding_amount=Decimal('1000.00'),
            currency='USD',
            created_by=self.owner,
        )

    def _create_invoice(self):
        return Invoice.objects.create(
            entity=self.entity,
            customer=self.customer,
            invoice_number='INV-AP-001',
            invoice_date=timezone.now().date(),
            due_date=timezone.now().date(),
            subtotal=Decimal('750.00'),
            tax_amount=Decimal('0.00'),
            total_amount=Decimal('750.00'),
            paid_amount=Decimal('0.00'),
            outstanding_amount=Decimal('750.00'),
            currency='USD',
            status='posted',
            created_by=self.owner,
        )

    def _create_bill_matrix(self):
        return AccountingApprovalMatrix.objects.create(
            entity=self.entity,
            name='Bill Approval Matrix',
            object_type='bill',
            minimum_amount=Decimal('0.00'),
            preparer_role=self.accountant_role,
            reviewer_role=self.finance_manager_role,
            approver_role=self.entity_cfo_role,
            require_reviewer=True,
            require_approver=True,
        )

    def _create_payment_matrix(self):
        return AccountingApprovalMatrix.objects.create(
            entity=self.entity,
            name='Payment Approval Matrix',
            object_type='payment',
            minimum_amount=Decimal('0.00'),
            preparer_role=self.accountant_role,
            reviewer_role=self.finance_manager_role,
            approver_role=self.entity_cfo_role,
            require_reviewer=True,
            require_approver=True,
        )

    def test_bill_workflow_api_posts_after_final_approval_and_sends_emails(self):
        bill = self._create_bill()
        self._create_bill_matrix()
        mail.outbox = []

        response = self.owner_client.post(f'/api/bills/{bill.id}/submit/', {}, format='json')
        self.assertEqual(response.status_code, 200)
        bill.refresh_from_db()
        self.assertEqual(bill.approval_status, 'pending_review')
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [self.reviewer.email])
        self.assertIn('Review bill', mail.outbox[0].alternatives[0][0])
        self.assertIn(f'objectType=bill&amp;objectId={bill.id}', mail.outbox[0].alternatives[0][0])

        inbox_response = self.reviewer_client.get('/api/accounting-approval-inbox/', {'entity': self.entity.id})
        self.assertEqual(inbox_response.status_code, 200)
        self.assertEqual(len(inbox_response.data['pending']), 1)
        self.assertEqual(inbox_response.data['pending'][0]['object_type'], 'bill')

        review_response = self.reviewer_client.post(f'/api/bills/{bill.id}/approve/', {'comments': 'Reviewed'}, format='json')
        self.assertEqual(review_response.status_code, 200)
        bill.refresh_from_db()
        self.assertEqual(bill.approval_status, 'pending_approval')
        self.assertEqual(len(mail.outbox), 2)
        self.assertEqual(mail.outbox[1].to, [self.approver.email])

        approval_response = self.approver_client.post(f'/api/bills/{bill.id}/approve/', {'comments': 'Approved'}, format='json')
        self.assertEqual(approval_response.status_code, 200)
        bill.refresh_from_db()
        record = AccountingApprovalRecord.objects.get(object_type='bill', object_id=bill.id)
        self.assertEqual(bill.status, 'posted')
        self.assertEqual(bill.approval_status, 'approved')
        self.assertEqual(record.status, 'approved')
        self.assertEqual(Notification.objects.filter(notification_type='approval_request', related_content_type='bill').count(), 2)

    def test_payment_api_defers_invoice_effects_until_final_approval(self):
        invoice = self._create_invoice()
        payment = Payment.objects.create(
            entity=self.entity,
            invoice=invoice,
            customer=self.customer,
            payment_date=timezone.now().date(),
            amount=Decimal('250.00'),
            payment_method='bank_transfer',
            reference_number='PAY-AP-001',
            created_by=self.owner,
        )
        self._create_payment_matrix()

        submit_response = self.owner_client.post(f'/api/payments/{payment.id}/submit/', {}, format='json')
        self.assertEqual(submit_response.status_code, 200)
        invoice.refresh_from_db()
        self.assertEqual(invoice.paid_amount, Decimal('0.00'))
        self.assertEqual(invoice.outstanding_amount, Decimal('750.00'))

        review_response = self.reviewer_client.post(f'/api/payments/{payment.id}/approve/', {'comments': 'Reviewed'}, format='json')
        self.assertEqual(review_response.status_code, 200)
        invoice.refresh_from_db()
        self.assertEqual(invoice.paid_amount, Decimal('0.00'))

        approval_response = self.approver_client.post(f'/api/payments/{payment.id}/approve/', {'comments': 'Approved'}, format='json')
        self.assertEqual(approval_response.status_code, 200)
        invoice.refresh_from_db()
        payment.refresh_from_db()
        self.assertEqual(payment.approval_status, 'approved')
        self.assertEqual(invoice.paid_amount, Decimal('250.00'))
        self.assertEqual(invoice.outstanding_amount, Decimal('500.00'))
        self.assertEqual(invoice.status, 'partially_paid')

    def test_bill_submit_api_rejects_locked_period(self):
        locked_date = timezone.now().date()
        bill = self._create_bill(bill_number='BILL-LOCK-001', bill_date=locked_date)
        self._create_bill_matrix()
        LedgerPeriod.objects.create(
            entity=self.entity,
            period_name='Locked Month',
            start_date=locked_date.replace(day=1),
            end_date=locked_date.replace(day=28),
            status='closed',
            no_posting_after=locked_date,
            closed_by=self.owner,
        )

        response = self.owner_client.post(f'/api/bills/{bill.id}/submit/', {}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('locked period', response.data['detail'].lower())

    def test_bill_api_allows_delegated_final_approval(self):
        bill = self._create_bill(bill_number='BILL-DELEGATE-001')
        self._create_bill_matrix()
        AccountingApprovalDelegation.objects.create(
            entity=self.entity,
            object_type='bill',
            delegator=self.approver_staff,
            delegate=self.delegate_staff,
            stage='approver',
            minimum_amount=Decimal('0.00'),
            start_date=timezone.now().date(),
            end_date=timezone.now().date(),
            is_active=True,
            created_by=self.owner,
        )

        submit_response = self.owner_client.post(f'/api/bills/{bill.id}/submit/', {}, format='json')
        self.assertEqual(submit_response.status_code, 200)
        review_response = self.reviewer_client.post(f'/api/bills/{bill.id}/approve/', {'comments': 'Reviewed'}, format='json')
        self.assertEqual(review_response.status_code, 200)
        delegated_response = self.delegate_client.post(f'/api/bills/{bill.id}/approve/', {'comments': 'Delegated approval'}, format='json')
        self.assertEqual(delegated_response.status_code, 200)

        bill.refresh_from_db()
        record = AccountingApprovalRecord.objects.get(object_type='bill', object_id=bill.id)
        final_step = record.steps.get(stage='approver')
        self.assertEqual(bill.approval_status, 'approved')
        self.assertEqual(final_step.acted_by, self.delegate)
        self.assertIsNotNone(final_step.delegated_from)

    def test_approval_digest_command_sends_grouped_email(self):
        Notification.objects.create(
            user=self.reviewer,
            organization=self.organization,
            notification_type='approval_request',
            priority='high',
            title='Bill approval required',
            message='BILL-DIGEST-001 is awaiting reviewer approval.',
            related_entity=self.entity,
            related_content_type='bill',
            related_object_id='1',
            action_url='/enterprise/entity/1/approval-inbox',
        )
        Notification.objects.create(
            user=self.reviewer,
            organization=self.organization,
            notification_type='approval_request',
            priority='high',
            title='Payment approval required',
            message='PAY-DIGEST-001 is awaiting approver approval.',
            related_entity=self.entity,
            related_content_type='payment',
            related_object_id='2',
            action_url='/enterprise/entity/1/approval-inbox',
        )

        mail.outbox = []
        call_command('send_approval_notification_digest', hours=48)

        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [self.reviewer.email])
        self.assertIn('Bill approval required', mail.outbox[0].body)
        self.assertIn('Payment approval required', mail.outbox[0].body)
        self.assertIn('Open the full approval inbox', mail.outbox[0].alternatives[0][0])


class IntercompanyEngineAPITests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username='ic-owner', email='ic-owner@example.com', password='pass')
        self.organization = Organization.objects.create(
            owner=self.owner,
            name='Intercompany Org',
            slug='intercompany-org',
            primary_country='US',
            primary_currency='USD',
        )
        self.parent_entity = Entity.objects.create(
            organization=self.organization,
            name='Parent HoldCo',
            country='US',
            entity_type='corporation',
            status='active',
            local_currency='USD',
            workspace_mode='accounting',
        )
        self.subsidiary_entity = Entity.objects.create(
            organization=self.organization,
            name='Operating Subsidiary',
            country='US',
            entity_type='subsidiary',
            status='active',
            local_currency='USD',
            workspace_mode='accounting',
            parent_entity=self.parent_entity,
        )

        self.client = APIClient()
        self.client.force_authenticate(user=self.owner)

        self.consolidation = Consolidation.objects.create(
            name='March Consolidation',
            organization=self.organization,
            consolidation_date=timezone.now().date(),
            reporting_currency='USD',
            eliminate_intercompany=True,
        )
        ConsolidationEntity.objects.create(consolidation=self.consolidation, entity=self.parent_entity, ownership_percentage=Decimal('100.0000'))
        ConsolidationEntity.objects.create(consolidation=self.consolidation, entity=self.subsidiary_entity, ownership_percentage=Decimal('100.0000'))

    def test_intercompany_invoice_posts_mirrored_documents_and_is_eliminated_in_consolidation(self):
        response = self.client.post(
            '/api/intercompany-transactions/',
            {
                'organization': self.organization.id,
                'source_entity': self.parent_entity.id,
                'destination_entity': self.subsidiary_entity.id,
                'transaction_type': 'invoice',
                'transaction_date': str(self.consolidation.consolidation_date),
                'due_date': str(self.consolidation.consolidation_date),
                'currency': 'USD',
                'amount': '1500.00',
                'description': 'Shared services allocation',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        transaction_record = IntercompanyTransaction.objects.get(id=response.data['id'])
        self.assertEqual(transaction_record.status, 'posted')
        self.assertIsNotNone(transaction_record.source_invoice_id)
        self.assertIsNotNone(transaction_record.destination_bill_id)
        self.assertIsNotNone(transaction_record.source_journal_entry_id)
        self.assertIsNotNone(transaction_record.destination_journal_entry_id)

        self.assertEqual(Invoice.objects.filter(id=transaction_record.source_invoice_id, status='posted').count(), 1)
        self.assertEqual(Bill.objects.filter(id=transaction_record.destination_bill_id, status='posted').count(), 1)
        self.assertEqual(GeneralLedger.objects.filter(journal_entry_id=transaction_record.source_journal_entry_id).count(), 1)
        self.assertEqual(GeneralLedger.objects.filter(journal_entry_id=transaction_record.destination_journal_entry_id).count(), 1)

        consolidation_response = self.client.post(f'/api/consolidations/{self.consolidation.id}/run_consolidation/')
        self.assertEqual(consolidation_response.status_code, 200)

        self.consolidation.refresh_from_db()
        transaction_record.refresh_from_db()
        self.assertEqual(self.consolidation.status, 'completed')
        self.assertEqual(transaction_record.status, 'eliminated')
        self.assertAlmostEqual(self.consolidation.consolidated_pnl['revenue'], 0.0)
        self.assertAlmostEqual(self.consolidation.consolidated_pnl['expenses'], 0.0)
        self.assertAlmostEqual(self.consolidation.consolidated_balance_sheet['assets'], 0.0)
        self.assertAlmostEqual(self.consolidation.consolidated_balance_sheet['liabilities'], 0.0)
        self.assertEqual(
            IntercompanyEliminationEntry.objects.filter(consolidation=self.consolidation, transaction=transaction_record).count(),
            2,
        )

    def test_intercompany_loan_creates_destination_loan_and_loan_balance_elimination(self):
        response = self.client.post(
            '/api/intercompany-transactions/',
            {
                'organization': self.organization.id,
                'source_entity': self.parent_entity.id,
                'destination_entity': self.subsidiary_entity.id,
                'transaction_type': 'loan',
                'transaction_date': str(self.consolidation.consolidation_date),
                'due_date': str(self.consolidation.consolidation_date),
                'currency': 'USD',
                'amount': '5000.00',
                'transfer_pricing_markup_percent': '5.0000',
                'description': 'Working capital facility',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        transaction_record = IntercompanyTransaction.objects.get(id=response.data['id'])
        self.assertEqual(transaction_record.status, 'posted')
        self.assertIsNotNone(transaction_record.destination_loan_id)
        self.assertEqual(transaction_record.destination_loan.principal_remaining, Decimal('5000.00'))

        consolidation_response = self.client.post(f'/api/consolidations/{self.consolidation.id}/run_consolidation/')
        self.assertEqual(consolidation_response.status_code, 200)

        self.assertEqual(
            IntercompanyEliminationEntry.objects.filter(
                consolidation=self.consolidation,
                transaction=transaction_record,
                elimination_type='loan_balance',
            ).count(),
            1,
        )


class PayrollEngineAPITests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username='payroll-owner', email='payroll-owner@example.com', password='pass')
        self.employee_user = User.objects.create_user(username='payroll-employee', email='employee@example.com', password='pass')

        self.organization = Organization.objects.create(
            owner=self.owner,
            name='Payroll Org',
            slug='payroll-org',
            primary_country='US',
            primary_currency='USD',
        )
        self.entity = Entity.objects.create(
            organization=self.organization,
            name='Payroll Entity',
            country='US',
            entity_type='corporation',
            status='active',
            local_currency='USD',
            workspace_mode='accounting',
        )
        self.department = EntityDepartment.objects.create(entity=self.entity, name='Operations', code='OPS-PAY')
        self.role = EntityRole.objects.create(entity=self.entity, name='Operations Lead', code='ROLE-PAY')
        self.owner_staff = EntityStaff.objects.create(
            entity=self.entity,
            user=self.owner,
            employee_id='EMP-PAY-OWNER',
            first_name='Olive',
            last_name='Owner',
            email='payroll-owner@example.com',
            department=self.department,
            role=self.role,
            employment_type='full_time',
            status='active',
            hire_date=timezone.now().date(),
            salary=Decimal('0.00'),
            currency='USD',
        )
        self.staff_member = EntityStaff.objects.create(
            entity=self.entity,
            user=self.employee_user,
            employee_id='EMP-PAY-001',
            first_name='Pat',
            last_name='Payroll',
            email='employee@example.com',
            department=self.department,
            role=self.role,
            employment_type='full_time',
            status='active',
            hire_date=timezone.now().date(),
            salary=Decimal('120000.00'),
            currency='USD',
        )
        StaffPayrollProfile.objects.create(
            staff_member=self.staff_member,
            entity=self.entity,
            pay_frequency='monthly',
            salary_basis='annual',
            base_salary=Decimal('120000.00'),
            income_tax_rate=Decimal('0.1000'),
            employee_tax_rate=Decimal('0.0500'),
            employer_tax_rate=Decimal('0.0750'),
            default_bank_account_name='Pat Payroll',
            default_bank_account_number='123456789',
            default_bank_routing_number='021000021',
            payment_reference='PAY-PAT',
            statutory_jurisdiction='US',
        )
        self.employer_benefit = PayrollComponent.objects.create(
            entity=self.entity,
            code='MED',
            name='Medical Plan',
            component_type='benefit',
            calculation_type='fixed',
            amount=Decimal('500.00'),
            taxable=False,
            employer_contribution=True,
        )
        self.deduction = PayrollComponent.objects.create(
            entity=self.entity,
            code='RET',
            name='Retirement Deduction',
            component_type='deduction',
            calculation_type='fixed',
            amount=Decimal('200.00'),
            taxable=False,
            employer_contribution=False,
        )
        StaffPayrollComponentAssignment.objects.create(staff_member=self.staff_member, component=self.employer_benefit)
        StaffPayrollComponentAssignment.objects.create(staff_member=self.staff_member, component=self.deduction)

        self.leave_type = LeaveType.objects.create(
            entity=self.entity,
            code='VAC',
            name='Vacation',
            accrual_hours_per_run=Decimal('10.00'),
            max_balance_hours=Decimal('120.00'),
            carryover_limit_hours=Decimal('40.00'),
            is_paid_leave=True,
        )
        self.leave_balance = LeaveBalance.objects.create(
            staff_member=self.staff_member,
            leave_type=self.leave_type,
            opening_balance_hours=Decimal('4.00'),
        )
        self.leave_request = LeaveRequest.objects.create(
            entity=self.entity,
            staff_member=self.staff_member,
            leave_type=self.leave_type,
            start_date=timezone.datetime(2025, 1, 3).date(),
            end_date=timezone.datetime(2025, 1, 4).date(),
            hours_requested=Decimal('8.00'),
            status='approved',
            approved_by=self.owner,
            approved_at=timezone.now(),
        )
        PayrollBankOriginatorProfile.objects.create(
            entity=self.entity,
            originator_name='Payroll Entity LLC',
            originator_identifier='WF-12345',
            originating_bank_name='Wells Fargo',
            debit_account_name='Payroll Operating',
            debit_account_number='987654321',
            debit_routing_number='021000021',
            debit_sort_code='12-34-56',
            debit_iban='DE89370400440532013000',
            debit_swift_code='DEUTDEFF',
            company_entry_description='PAYROLL',
            company_discretionary_data='MONTHLY',
            initiating_party_name='Payroll Entity LLC',
            initiating_party_identifier='INIT-001',
        )
        self.payroll_run = PayrollRun.objects.create(
            organization=self.organization,
            entity=self.entity,
            name='January 2025 Payroll',
            pay_frequency='monthly',
            requested_bank_file_format='aba',
            period_start=timezone.datetime(2025, 1, 1).date(),
            period_end=timezone.datetime(2025, 1, 31).date(),
            payment_date=timezone.datetime(2025, 1, 31).date(),
        )

        self.client = APIClient()
        self.client.force_authenticate(user=self.owner)
        self.employee_client = APIClient()
        self.employee_client.force_authenticate(user=self.employee_user)

    def test_create_payroll_run_defaults_country_specific_bank_format(self):
        response = self.client.post(
            '/api/payroll-runs/',
            {
                'organization': self.organization.id,
                'entity': self.entity.id,
                'name': 'February 2025 Payroll',
                'pay_frequency': 'monthly',
                'period_start': '2025-02-01',
                'period_end': '2025-02-28',
                'payment_date': '2025-02-28',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['requested_bank_file_format'], 'aba')
        self.assertEqual(response.data['requested_bank_institution'], 'wells_fargo')
        self.assertEqual(response.data['requested_bank_export_variant'], 'ppd')
        self.assertEqual(response.data['approval_status'], 'draft')

    def test_process_payroll_run_generates_outputs(self):
        response = self.client.post(f'/api/payroll-runs/{self.payroll_run.id}/process/', {}, format='json')

        self.assertEqual(response.status_code, 200)
        self.payroll_run.refresh_from_db()
        self.assertEqual(self.payroll_run.status, 'processed')
        self.assertEqual(self.payroll_run.employee_count, 1)
        self.assertEqual(self.payroll_run.gross_pay_total, Decimal('10000.00'))
        self.assertEqual(self.payroll_run.employer_benefits_total, Decimal('500.00'))
        self.assertEqual(self.payroll_run.deductions_total, Decimal('200.00'))
        self.assertEqual(self.payroll_run.tax_withholding_total, Decimal('1500.00'))
        self.assertEqual(self.payroll_run.employer_tax_total, Decimal('750.00'))
        self.assertEqual(self.payroll_run.net_pay_total, Decimal('8300.00'))
        self.assertIsNotNone(self.payroll_run.journal_entry)

        payslip = Payslip.objects.get(payroll_run=self.payroll_run, staff_member=self.staff_member)
        self.assertEqual(payslip.net_pay, Decimal('8300.00'))
        self.assertEqual(payslip.leave_accrued_hours, Decimal('10.00'))
        self.assertEqual(payslip.leave_used_hours, Decimal('8.00'))
        self.assertEqual(payslip.leave_balance_hours, Decimal('6.00'))
        self.assertEqual(payslip.line_items.count(), 6)

        self.leave_balance.refresh_from_db()
        self.leave_request.refresh_from_db()
        self.assertEqual(self.leave_balance.current_balance_hours, Decimal('6.00'))
        self.assertEqual(self.leave_request.status, 'processed')
        self.assertEqual(self.leave_request.payroll_run, self.payroll_run)

        self.assertEqual(PayrollStatutoryReport.objects.filter(payroll_run=self.payroll_run).count(), 3)
        payment_file = PayrollBankPaymentFile.objects.get(payroll_run=self.payroll_run)
        self.assertEqual(payment_file.file_format, 'aba')
        self.assertIn('wells_fargo_ppd', payment_file.file_name)
        self.assertIn('PAY-PAT', payment_file.content)
        self.assertIn('830000', payment_file.content)
        self.assertGreater(GeneralLedger.objects.filter(journal_entry=self.payroll_run.journal_entry).count(), 0)

    def test_process_payroll_run_validates_required_bank_fields_for_selected_variant(self):
        originator = PayrollBankOriginatorProfile.objects.get(entity=self.entity)
        originator.debit_iban = ''
        originator.debit_swift_code = ''
        originator.save(update_fields=['debit_iban', 'debit_swift_code', 'updated_at'])

        self.payroll_run.requested_bank_file_format = 'sepa'
        self.payroll_run.requested_bank_institution = 'deutsche_bank'
        self.payroll_run.requested_bank_export_variant = 'pain.001.001.03'
        self.payroll_run.save(update_fields=['requested_bank_file_format', 'requested_bank_institution', 'requested_bank_export_variant', 'updated_at'])

        response = self.client.post(f'/api/payroll-runs/{self.payroll_run.id}/process/', {}, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertIn('Bank export validation failed', response.data['detail'])
        self.assertIn('IBAN', response.data['detail'])
        self.assertIn('SWIFT/BIC', response.data['detail'])

    def test_process_payroll_run_requires_approval_when_matrix_configured(self):
        AccountingApprovalMatrix.objects.create(
            entity=self.entity,
            name='Payroll Approval',
            object_type='payroll_run',
            minimum_amount=Decimal('0.00'),
            approver_role=self.role,
            require_reviewer=False,
            require_approver=True,
        )

        blocked_response = self.client.post(f'/api/payroll-runs/{self.payroll_run.id}/process/', {}, format='json')
        self.assertEqual(blocked_response.status_code, 400)
        self.assertIn('must be fully approved', blocked_response.data['detail'])

        submit_response = self.client.post(f'/api/payroll-runs/{self.payroll_run.id}/submit/', {}, format='json')
        self.assertEqual(submit_response.status_code, 200)
        self.payroll_run.refresh_from_db()
        self.assertEqual(self.payroll_run.approval_status, 'pending_approval')

        approve_response = self.client.post(f'/api/payroll-runs/{self.payroll_run.id}/approve/', {'comments': 'Approved'}, format='json')
        self.assertEqual(approve_response.status_code, 200)
        self.payroll_run.refresh_from_db()
        self.assertEqual(self.payroll_run.approval_status, 'approved')

        process_response = self.client.post(f'/api/payroll-runs/{self.payroll_run.id}/process/', {}, format='json')
        self.assertEqual(process_response.status_code, 200)
        self.payroll_run.refresh_from_db()
        self.assertEqual(self.payroll_run.status, 'processed')

    def test_mark_paid_updates_payroll_run_and_payslip_status(self):
        self.client.post(f'/api/payroll-runs/{self.payroll_run.id}/process/', {}, format='json')

        response = self.client.post(f'/api/payroll-runs/{self.payroll_run.id}/mark_paid/', {}, format='json')

        self.assertEqual(response.status_code, 200)
        self.payroll_run.refresh_from_db()
        self.assertEqual(self.payroll_run.status, 'paid')
        self.assertEqual(Payslip.objects.get(payroll_run=self.payroll_run).status, 'paid')


class BankingIntegrationAutomationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='bank-owner',
            email='bank-owner@example.com',
            password='bank-pass-123',
        )
        self.organization = Organization.objects.create(
            owner=self.user,
            name='Bank Ops LLC',
            slug='bank-ops-llc',
            primary_country='US',
            primary_currency='USD',
        )
        self.entity = Entity.objects.create(
            organization=self.organization,
            name='Bank Ops Entity',
            country='US',
            entity_type='corporation',
            status='active',
            local_currency='USD',
        )
        self.client = APIClient(HTTP_HOST='localhost')
        self.client.force_authenticate(user=self.user)

    def test_consent_sync_and_override_flow_is_auditable(self):
        consent_response = self.client.post(
            '/api/banking-integrations/consent-session/',
            {
                'organization': self.organization.id,
                'entity': self.entity.id,
                'integration_type': 'financial_data',
                'provider_code': 'plaid',
                'provider_name': 'Plaid',
                'redirect_uri': 'http://localhost:3000/firm/integrations',
                'scopes': ['accounts:read', 'transactions:read'],
            },
            format='json',
        )

        self.assertEqual(consent_response.status_code, 201)
        integration_id = consent_response.data['integration']['id']
        state = consent_response.data['state']
        self.assertTrue(BankingConsentLog.objects.filter(integration_id=integration_id, state=state, status='requested').exists())

        complete_response = self.client.post(
            f'/api/banking-integrations/{integration_id}/complete-consent/',
            {
                'state': state,
                'authorization_code': 'demo-auth-code',
                'accounts': [
                    {
                        'account_id': 'acct_001',
                        'name': 'Operating Checking',
                        'bank_name': 'Chase',
                        'account_type': 'business',
                        'currency': 'USD',
                        'balance': '5000.00',
                        'available_balance': '4800.00',
                    }
                ],
                'transactions': [
                    {
                        'external_id': 'txn_001',
                        'account_id': 'acct_001',
                        'date': '2026-03-14',
                        'amount': '-14.25',
                        'currency': 'USD',
                        'merchant': 'Starbucks',
                        'description': 'STARBUCKS STORE 1234',
                        'raw_category': 'food_and_drink',
                    }
                ],
            },
            format='json',
        )

        self.assertEqual(complete_response.status_code, 200)
        integration = BankingIntegration.objects.get(id=integration_id)
        self.assertEqual(integration.status, 'active')
        self.assertTrue(integration.access_token_encrypted)
        self.assertEqual(BankAccount.objects.filter(entity=self.entity, provider_account_id='acct_001').count(), 1)

        banking_transaction = BankingTransaction.objects.get(transaction_id='txn_001')
        self.assertEqual(banking_transaction.normalized_category, 'Food & Beverage')
        self.assertEqual(banking_transaction.dashboard_bucket, 'Operating Expenses')

        override_response = self.client.post(
            f'/api/banking-transactions/{banking_transaction.id}/override-category/',
            {
                'category_name': 'Meals',
                'dashboard_bucket': 'People Ops',
                'explanation': 'Finance team reclassified this merchant.',
            },
            format='json',
        )

        self.assertEqual(override_response.status_code, 200)
        banking_transaction.refresh_from_db()
        self.assertEqual(banking_transaction.normalized_category, 'Meals')
        self.assertEqual(banking_transaction.dashboard_bucket, 'People Ops')
        self.assertTrue(AuditLog.objects.filter(model_name='BankingCategorizationDecision', object_id__isnull=False).exists())
