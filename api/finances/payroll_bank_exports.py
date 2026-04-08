import re


BANK_EXPORT_SCHEMES = {
    'csv': {
        'generic': {
            'standard': {
                'label': 'Generic CSV',
                'required_profile_fields': ['default_bank_account_number'],
                'required_originator_fields': ['originator_name'],
                'reference_max_length': 30,
                'extension': 'csv',
            },
        },
        'adp': {
            'workforce_now': {
                'label': 'ADP Workforce Now CSV',
                'required_profile_fields': ['default_bank_account_name', 'default_bank_account_number'],
                'required_originator_fields': ['originator_name', 'originator_identifier'],
                'reference_max_length': 20,
                'extension': 'csv',
            },
        },
    },
    'aba': {
        'generic': {
            'standard': {
                'label': 'Generic ABA',
                'required_profile_fields': ['default_bank_account_number', 'default_bank_routing_number'],
                'required_originator_fields': ['originator_name', 'debit_account_number', 'debit_routing_number'],
                'reference_max_length': 15,
                'extension': 'txt',
            },
        },
        'wells_fargo': {
            'ppd': {
                'label': 'Wells Fargo PPD',
                'required_profile_fields': ['default_bank_account_number', 'default_bank_routing_number'],
                'required_originator_fields': ['originator_name', 'originator_identifier', 'debit_account_number', 'debit_routing_number'],
                'reference_max_length': 10,
                'extension': 'txt',
            },
        },
        'chase': {
            'ppd': {
                'label': 'Chase PPD',
                'required_profile_fields': ['default_bank_account_number', 'default_bank_routing_number'],
                'required_originator_fields': ['originator_name', 'originator_identifier', 'debit_account_number', 'debit_routing_number'],
                'reference_max_length': 12,
                'extension': 'txt',
            },
        },
    },
    'sepa': {
        'generic': {
            'pain.001.001.03': {
                'label': 'Generic SEPA pain.001.001.03',
                'required_profile_fields': ['default_bank_iban', 'default_bank_swift_code'],
                'required_originator_fields': ['originator_name', 'debit_iban', 'debit_swift_code'],
                'reference_max_length': 35,
                'extension': 'xml',
                'xml_namespace': 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.03',
            },
        },
        'deutsche_bank': {
            'pain.001.001.03': {
                'label': 'Deutsche Bank pain.001.001.03',
                'required_profile_fields': ['default_bank_iban', 'default_bank_swift_code'],
                'required_originator_fields': ['originator_name', 'initiating_party_name', 'debit_iban', 'debit_swift_code'],
                'reference_max_length': 35,
                'extension': 'xml',
                'xml_namespace': 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.03',
            },
        },
        'santander': {
            'pain.001.003.03': {
                'label': 'Santander pain.001.003.03',
                'required_profile_fields': ['default_bank_iban', 'default_bank_swift_code'],
                'required_originator_fields': ['originator_name', 'initiating_party_name', 'debit_iban', 'debit_swift_code'],
                'reference_max_length': 35,
                'extension': 'xml',
                'xml_namespace': 'urn:iso:std:iso:20022:tech:xsd:pain.001.003.03',
            },
        },
    },
    'bacs': {
        'generic': {
            'standard': {
                'label': 'Generic BACS',
                'required_profile_fields': ['default_bank_account_number', 'default_bank_sort_code'],
                'required_originator_fields': ['originator_name', 'debit_account_number', 'debit_sort_code'],
                'reference_max_length': 18,
                'extension': 'txt',
            },
        },
        'barclays': {
            'standard': {
                'label': 'Barclays BACS',
                'required_profile_fields': ['default_bank_account_number', 'default_bank_sort_code'],
                'required_originator_fields': ['originator_name', 'originator_identifier', 'debit_account_number', 'debit_sort_code'],
                'reference_max_length': 18,
                'extension': 'txt',
            },
        },
        'hsbc': {
            'standard': {
                'label': 'HSBC BACS',
                'required_profile_fields': ['default_bank_account_number', 'default_bank_sort_code'],
                'required_originator_fields': ['originator_name', 'originator_identifier', 'debit_account_number', 'debit_sort_code'],
                'reference_max_length': 18,
                'extension': 'txt',
            },
        },
    },
}


FIELD_LABELS = {
    'originator_name': 'originator name',
    'originator_identifier': 'originator identifier',
    'debit_account_number': 'debit account number',
    'debit_routing_number': 'debit routing number',
    'debit_iban': 'debit IBAN',
    'debit_swift_code': 'debit SWIFT/BIC',
    'debit_sort_code': 'debit sort code',
    'initiating_party_name': 'initiating party name',
    'default_bank_account_name': 'account name',
    'default_bank_account_number': 'account number',
    'default_bank_routing_number': 'routing number',
    'default_bank_iban': 'IBAN',
    'default_bank_swift_code': 'SWIFT/BIC',
    'default_bank_sort_code': 'sort code',
}


FIELD_PATTERNS = {
    'debit_routing_number': re.compile(r'^\d{9}$'),
    'debit_sort_code': re.compile(r'^(\d{2}-?\d{2}-?\d{2})$'),
    'debit_swift_code': re.compile(r'^[A-Z0-9]{8}([A-Z0-9]{3})?$'),
    'debit_iban': re.compile(r'^[A-Z]{2}[0-9A-Z]{13,32}$'),
    'default_bank_routing_number': re.compile(r'^\d{9}$'),
    'default_bank_sort_code': re.compile(r'^(\d{2}-?\d{2}-?\d{2})$'),
    'default_bank_swift_code': re.compile(r'^[A-Z0-9]{8}([A-Z0-9]{3})?$'),
    'default_bank_iban': re.compile(r'^[A-Z]{2}[0-9A-Z]{13,32}$'),
}


def list_bank_export_options(country_code=None):
    results = []
    for file_format, institutions in BANK_EXPORT_SCHEMES.items():
        result = {
            'file_format': file_format,
            'institutions': [],
        }
        for institution_code, variants in institutions.items():
            result['institutions'].append({
                'institution_code': institution_code,
                'variants': [
                    {'variant_code': variant_code, **variant_config}
                    for variant_code, variant_config in variants.items()
                ],
            })
        results.append(result)
    return results


def resolve_bank_export_scheme(file_format, institution_code='', variant_code=''):
    formats = BANK_EXPORT_SCHEMES.get(file_format) or BANK_EXPORT_SCHEMES['csv']
    institution = institution_code if institution_code in formats else 'generic'
    variants = formats[institution]
    variant = variant_code if variant_code in variants else next(iter(variants.keys()))
    resolved = dict(variants[variant])
    resolved.update({
        'file_format': file_format if file_format in BANK_EXPORT_SCHEMES else 'csv',
        'institution_code': institution,
        'variant_code': variant,
    })
    return resolved


def validate_bank_export_profiles(payslips, originator_profile, scheme):
    errors = []
    required_fields = scheme.get('required_profile_fields', [])
    required_originator_fields = scheme.get('required_originator_fields', [])
    reference_max_length = scheme.get('reference_max_length', 35)

    originator_missing = []
    originator_invalid = []
    for field_name in required_originator_fields:
        value = getattr(originator_profile, field_name, '') if originator_profile else ''
        if not value:
            originator_missing.append(FIELD_LABELS.get(field_name, field_name))
            continue
        pattern = FIELD_PATTERNS.get(field_name)
        if pattern and not pattern.match(str(value).upper()):
            originator_invalid.append(FIELD_LABELS.get(field_name, field_name))
    if originator_missing or originator_invalid:
        issues = []
        if originator_missing:
            issues.append(f"missing {', '.join(originator_missing)}")
        if originator_invalid:
            issues.append(f"invalid {', '.join(originator_invalid)}")
        errors.append(f"Originator profile: {'; '.join(issues)}")

    for payslip in payslips:
        profile = payslip.payroll_profile
        missing = []
        invalid = []
        for field_name in required_fields:
            value = getattr(profile, field_name, '') if profile else ''
            if not value:
                missing.append(FIELD_LABELS.get(field_name, field_name))
                continue
            pattern = FIELD_PATTERNS.get(field_name)
            if pattern and not pattern.match(str(value).upper()):
                invalid.append(FIELD_LABELS.get(field_name, field_name))
        if len((payslip.bank_payment_reference or '')) > reference_max_length:
            invalid.append(f'reference longer than {reference_max_length} characters')
        if missing or invalid:
            issues = []
            if missing:
                issues.append(f"missing {', '.join(missing)}")
            if invalid:
                issues.append(f"invalid {', '.join(invalid)}")
            errors.append(f"{payslip.staff_member.full_name}: {'; '.join(issues)}")

    if errors:
        raise ValueError(
            f"Bank export validation failed for {scheme['label']}: " + ' | '.join(errors)
        )