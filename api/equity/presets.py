PROVIDER_PRESETS = {
    'payroll': [
        {
            'key': 'gusto',
            'provider_name': 'Gusto',
            'base_url': 'https://api.gusto-demo.com/',
            'auth_scheme': 'Bearer',
            'endpoint_path': 'v1/equity/payroll-events',
            'default_headers': {'Accept': 'application/json'},
            'adapter_settings': {'timeout_seconds': 15, 'supports_withholding_sync': True},
            'setup_notes': 'Use your payroll event ingestion endpoint and a bearer API token from the provider.',
        },
        {
            'key': 'adp_workforce_now',
            'provider_name': 'ADP Workforce Now',
            'base_url': 'https://api.adp.com/',
            'auth_scheme': 'Bearer',
            'endpoint_path': 'hr/v2/workers/equity-events',
            'default_headers': {'Accept': 'application/json'},
            'adapter_settings': {'timeout_seconds': 20, 'supports_withholding_sync': True},
            'setup_notes': 'Use the ADP OAuth access token and map employee IDs to ADP worker IDs.',
        },
        {
            'key': 'rippling',
            'provider_name': 'Rippling',
            'base_url': 'https://api.rippling.com/',
            'auth_scheme': 'Bearer',
            'endpoint_path': 'platform/v1/equity/payroll-sync',
            'default_headers': {'Accept': 'application/json'},
            'adapter_settings': {'timeout_seconds': 15},
            'setup_notes': 'Use a Rippling platform token and point to your internal payroll sync endpoint.',
        },
    ],
    'payment': [
        {
            'key': 'stripe',
            'provider_name': 'Stripe',
            'base_url': 'https://api.stripe.com/',
            'auth_scheme': 'Bearer',
            'endpoint_path': 'v1/payment_intents',
            'default_headers': {'Accept': 'application/json'},
            'adapter_settings': {'timeout_seconds': 15, 'content_type': 'application/json'},
            'setup_notes': 'Use a secret key and adapt payload mapping to your exercise-payment intake service or Stripe proxy.',
        },
        {
            'key': 'wise',
            'provider_name': 'Wise Platform',
            'base_url': 'https://api.transferwise.com/',
            'auth_scheme': 'Bearer',
            'endpoint_path': 'v1/equity/exercise-payments',
            'default_headers': {'Accept': 'application/json'},
            'adapter_settings': {'timeout_seconds': 20},
            'setup_notes': 'Use a Wise platform token and a payout endpoint that accepts equity exercise payment requests.',
        },
        {
            'key': 'paystack',
            'provider_name': 'Paystack',
            'base_url': 'https://api.paystack.co/',
            'auth_scheme': 'Bearer',
            'endpoint_path': 'transaction/initialize',
            'default_headers': {'Accept': 'application/json'},
            'adapter_settings': {'timeout_seconds': 15},
            'setup_notes': 'Use your Paystack secret key and map the exercise payment payload into an initialized transaction.',
        },
    ],
}


def get_provider_presets(adapter_type: str | None = None):
    if adapter_type:
        return PROVIDER_PRESETS.get(adapter_type, [])
    return PROVIDER_PRESETS