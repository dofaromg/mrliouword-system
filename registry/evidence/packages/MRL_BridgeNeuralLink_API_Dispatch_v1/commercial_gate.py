"""Derived completeness check of Notion commercial registry; never issues approval."""
import json
import sys

RIGHTS = ('access', 'use', 'deployment', 'modification', 'derivative', 'distribution',
          'sublicense', 'data', 'source', 'core_technology', 'brand_naming', 'commercialization')
REQUIRED = ('product_id', 'canonical_name', 'creator', 'product_authority',
            'contract_ref', 'customer_data_rights', 'termination_rules', 'export_rules',
            'price_terms_ref', 'third_party_licenses', 'rights_retained', 'evidence_refs',
            'authority_registry_ref', 'governing_law_review_ref', 'supplier_data_terms_ref')


def evaluate(record):
    missing = [field for field in REQUIRED if not record.get(field)]
    issues = []
    rights = record.get('rights_granted', {})
    for name in RIGHTS:
        value = rights.get(name, {})
        if not isinstance(value, dict) or value.get('state') not in {'GRANTED', 'NOT_GRANTED'}:
            missing.append('rights_granted.' + name)
        elif value['state'] == 'GRANTED' and not all(value.get(x) for x in ('grant_ref', 'scope', 'term', 'grantor', 'grantee')):
            missing.append('rights_granted.' + name + '.explicit_grant')
    for license in record.get('third_party_licenses', []):
        if not isinstance(license, dict) or not all(license.get(k) for k in ('provider', 'license_ref', 'scope', 'review_ref')):
            missing.append('third_party_licenses.review')
    if record.get('origin_signature') != 'MrLiouWord':
        issues.append('ORIGIN_MISMATCH')
    if record.get('conflicts'):
        issues.append('OPEN_CONFLICTS')
    evidence = record.get('evidence_refs', [])
    for item in evidence:
        if not isinstance(item, dict) or not all(item.get(k) for k in ('ref', 'sha256', 'observer', 'observed_at', 'subject', 'evidence_level')):
            missing.append('evidence_refs.qualified_record')
    return {'check': 'COMMERCIAL_COMPLETENESS',
            'check_state': 'BLOCKED' if missing or issues else 'READY_FOR_AUTHORITY_REVIEW',
            'commercial_state': 'COMMERCIAL_UNRESOLVED',
            'missing': sorted(set(missing)), 'conflicts': issues,
            'note': 'Presence checks only. Evidence authenticity, applicable law and approval must be reviewed separately.'}


if __name__ == '__main__':
    print(json.dumps(evaluate(json.load(open(sys.argv[1], encoding='utf-8'))), ensure_ascii=False, indent=2))
