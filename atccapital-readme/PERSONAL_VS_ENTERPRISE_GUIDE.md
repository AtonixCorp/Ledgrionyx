# Personal vs Enterprise Dashboard Implementation Guide

## Overview

This document outlines the complete implementation of Atonix Capital's dual-mode dashboard system supporting both **Personal** and **Enterprise** users with different data structures, workflows, and access patterns.

---

## Architecture

### Core Concept: Account Type Segregation

Users select an account type during registration:
- **Personal**: Single user, simplified experience
- **Enterprise**: Multi-user, multi-entity, role-based

### Data Model

```
User (Django)
├── UserProfile (account_type: personal|enterprise)
├── Organizations (if enterprise)
│   ├── Entities
│   ├── TeamMembers (with Roles & Permissions)
│   ├── TaxExposures
│   ├── ComplianceDeadlines
│   └── CashflowForecasts
└── Personal Financial Data (if personal)
    ├── Expenses
    ├── Income
    └── Budgets
```

---

## Backend Implementation

### 1. Models (`backend/finances/models.py`)

**New Models:**

| Model | Purpose | Key Fields |
|-------|---------|-----------|
| `UserProfile` | User account metadata | `account_type`, `country`, `phone`, `avatar_color` |
| `Organization` | Enterprise org container | `owner`, `name`, `slug`, `primary_currency`, `primary_country` |
| `Entity` | Legal business unit | `organization`, `country`, `entity_type`, `status`, `registration_number` |
| `Role` | Permission bundle | `code`, `name`, `permissions` (M2M) |
| `Permission` | Granular access control | `code` (unique identifier) |
| `TeamMember` | User-Org relationship | `user`, `organization`, `role`, `scoped_entities` |
| `TaxExposure` | Tax obligation tracking | `entity`, `country`, `tax_type`, `status`, `amounts` |
| `ComplianceDeadline` | Deadline tracking | `entity`, `deadline_type`, `status`, `responsible_user` |
| `CashflowForecast` | Cashflow projections | `entity`, `month`, `category`, `amounts` |
| `AuditLog` | Change tracking | `action`, `model_name`, `object_id`, `changes` |

**Updated Models:**

- `Expense`, `Income`, `Budget`: Added `entity` FK (nullable) for enterprise scope

### 2. Permissions System

**Role Hierarchy:**

```python
ROLE_ORG_OWNER (5)          # Full access, billing
  ├─ ROLE_CFO (4)            # All except billing
  ├─ ROLE_FINANCE_ANALYST (3) # View/edit data
  ├─ ROLE_VIEWER (2)          # Read-only
  └─ ROLE_EXTERNAL_ADVISOR (1) # Scoped access
```

**Permission Matrix:**

| Permission | Owner | CFO | Analyst | Viewer | Advisor |
|-----------|-------|-----|---------|--------|---------|
| `view_org_overview` | ✓ | ✓ | ✓ | ✓ | ✗ |
| `manage_org_settings` | ✓ | ✗ | ✗ | ✗ | ✗ |
| `manage_billing` | ✓ | ✗ | ✗ | ✗ | ✗ |
| `manage_team` | ✓ | ✓ | ✗ | ✗ | ✗ |
| `view_entities` | ✓ | ✓ | ✓ | ✓ | ✗ |
| `edit_entity` | ✓ | ✓ | ✓ | ✗ | ✗ |
| `view_tax_compliance` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `view_reports` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `export_reports` | ✓ | ✓ | ✓ | ✗ | ✗ |

### 3. Permission Utilities (`backend/finances/permissions.py`)

```python
# Check permission
PermissionChecker.user_has_permission(user, org, 'view_org_overview')

# Check role
PermissionChecker.user_has_role(user, org, 'CFO')

# Check entity access
PermissionChecker.user_can_access_entity(user, org, entity)

# Use decorators
@require_permission('view_org_overview')
@require_role('CFO')
@require_organization_access
def my_view(request):
    ...
```

### 4. ViewSets (`backend/finances/enterprise_views.py`)

**Key ViewSets:**

- `OrganizationViewSet`: CRUD + overview dashboard
- `EntityViewSet`: CRUD + hierarchy
- `TeamMemberViewSet`: User management
- `TaxExposureViewSet`: Tax tracking + grouped queries
- `ComplianceDeadlineViewSet`: Deadline management
- `CashflowForecastViewSet`: Cashflow planning
- `RoleViewSet`: Role definitions (read-only)
- `AuditLogViewSet`: Audit trail (read-only)

**Key Endpoints:**

```
GET  /api/organizations/
GET  /api/organizations/{id}/overview/
POST /api/organizations/

GET  /api/entities/?organization_id=1
POST /api/entities/
GET  /api/entities/{id}/hierarchy/

GET  /api/tax-exposures/?organization_id=1
GET  /api/tax-exposures/by_country/?organization_id=1

GET  /api/compliance-deadlines/?organization_id=1
GET  /api/compliance-deadlines/upcoming/?organization_id=1
GET  /api/compliance-deadlines/overdue/?organization_id=1

GET  /api/cashflow-forecasts/?organization_id=1
GET  /api/cashflow-forecasts/by_category/?organization_id=1

GET  /api/team-members/?organization_id=1
POST /api/team-members/

GET  /api/audit-logs/?organization_id=1
```

### 5. Serializers (`backend/finances/serializers.py`)

**Key Serializers:**

- `UserProfileSerializer` - User metadata
- `OrganizationSerializer` - Org data
- `EntitySerializer` / `EntityDetailSerializer` - Entity data with hierarchy
- `RoleSerializer` / `PermissionSerializer` - Role/permission definitions
- `TeamMemberSerializer` - Team member data
- `TaxExposureSerializer` - Tax exposure
- `ComplianceDeadlineSerializer` - Deadlines
- `CashflowForecastSerializer` - Cashflow data
- `OrgOverviewSerializer` - Dashboard summary
- `PersonalDashboardSerializer` - Personal dashboard summary

---

## Frontend Implementation

### 1. Routing Structure

```
/                     # Landing (public)
/login                # Login (public)
/register             # Register → Account Type Selector (public)

/app/personal/        # Personal dashboard & views
├─ /dashboard         # Personal overview
├─ /my-countries      # Countries managed
├─ /tax-focus         # Tax details
├─ /cashflow          # Monthly flows
├─ /assets            # Assets & liabilities
├─ /insights          # AI insights
└─ /settings          # Settings

/app/enterprise/      # Enterprise dashboard & views
├─ /org-overview      # Executive dashboard
├─ /entities          # Entity management
├─ /tax-compliance    # Compliance tracking
├─ /cashflow          # Consolidated cashflow
├─ /risk-exposure     # Risk analysis
├─ /reports           # Reporting
├─ /team              # Team management
└─ /settings          # Org settings
```

### 2. Context API

**EnterpriseContext** (`frontend/src/context/EnterpriseContext.js`):

```javascript
{
  // State
  organizations,
  currentOrganization,
  entities,
  teamMembers,
  currentUserRole,
  orgOverview,
  taxExposures,
  complianceDeadlines,
  cashflowData,
  
  // Constants
  ROLES,
  PERMISSIONS,
  
  // Methods
  fetchOrganizations(),
  fetchOrgOverview(orgId),
  fetchEntities(orgId),
  fetchTeamMembers(orgId),
  fetchTaxExposures(orgId),
  fetchComplianceDeadlines(orgId),
  fetchCashflowData(orgId),
  hasPermission(code),
  hasRole(roleCode),
  switchOrganization(org),
  createOrganization(data),
  createEntity(data),
  addTeamMember(data),
}
```

### 3. Components

**Key Components:**

| Component | Location | Purpose |
|-----------|----------|---------|
| `AccountTypeSelector` | `/components/AccountTypeSelector.js` | Account type choice UI |
| `EnterpriseOrgOverview` | `/pages/Enterprise/EnterpriseOrgOverview.js` | Exec dashboard |
| `EnterpriseEntities` | `/pages/Enterprise/EnterpriseEntities.js` | Entity management |
| `EnterpriseTaxCompliance` | `/pages/Enterprise/EnterpriseTaxCompliance.js` | Compliance tracking |
| `EnterpriseCashflow` | `/pages/Enterprise/EnterpriseCashflow.js` | Consolidated cashflow |
| `EnterpriseRiskExposure` | `/pages/Enterprise/EnterpriseRiskExposure.js` | Risk dashboard |
| `EnterpriseReports` | `/pages/Enterprise/EnterpriseReports.js` | Reporting interface |
| `EnterpriseTeam` | `/pages/Enterprise/EnterpriseTeam.js` | Team management |
| `OrganizationSelector` | `/components/OrganizationSelector.js` | Org switcher |

### 4. App.js Updates

```javascript
import { EnterpriseProvider } from './context/EnterpriseContext';

<AuthProvider>
  <FinanceProvider>
    <EnterpriseProvider>
      <Router>
        {/* Personal routes */}
        {/* Enterprise routes */}
      </Router>
    </EnterpriseProvider>
  </FinanceProvider>
</AuthProvider>
```

---

## Implementation Checklist

### Phase 1: Data & Backend (✓ COMPLETED)
- [x] Create all database models
- [x] Create serializers
- [x] Implement permission system
- [x] Create ViewSets and endpoints
- [x] Update URLs routing

### Phase 2: Frontend Context & Auth
- [ ] Create `EnterpriseContext`
- [ ] Update `AuthContext` with account_type
- [ ] Create `AccountTypeSelector` component
- [ ] Update `Register.js` to branch based on account type
- [ ] Create organization onboarding flow

### Phase 3: Enterprise Dashboard Components
- [ ] `EnterpriseOrgOverview` - Executive dashboard
- [ ] `EnterpriseEntities` - Entity CRUD & hierarchy
- [ ] `EnterpriseTaxCompliance` - Tax/compliance calendar
- [ ] `EnterpriseCashflow` - Consolidated cashflow
- [ ] `EnterpriseRiskExposure` - Risk analysis
- [ ] `EnterpriseReports` - Reporting templates
- [ ] `EnterpriseTeam` - Team & role management

### Phase 4: Personal Dashboard Refinement
- [ ] Update personal dashboard tone (plain language)
- [ ] Simplify personal dashboard sections
- [ ] Add "My Countries" view
- [ ] Refactor financial sections for personal voice

### Phase 5: Integration & Testing
- [ ] Database migrations
- [ ] Seed data (test organizations, roles)
- [ ] API integration tests
- [ ] Role-based access control tests
- [ ] End-to-end user journeys

### Phase 6: Documentation
- [ ] API documentation
- [ ] User guides (personal vs enterprise)
- [ ] Role/permission reference
- [ ] Deployment checklist

---

## Key Workflows

### Personal User Journey

```
Signup (Personal)
   ↓
Dashboard Overview
   ├─ My Countries → Tax jurisdiction view
   ├─ Tax & Returns → Filing status
   ├─ Cashflow → Monthly income/expenses
   ├─ Assets → Net position
   └─ Insights → AI-driven recommendations
```

### Enterprise User Journey

```
Signup (Enterprise)
   ↓
Create Organization
   ├─ Enter org details
   ├─ Create primary entity
   └─ Invite team members
   ↓
Org Overview Dashboard
   ├─ Executive metrics
   ├─ Tax exposure by country
   ├─ Compliance status
   └─ Quick actions
   ↓
Entities & Countries
   ├─ View entity hierarchy
   ├─ Manage entity data
   └─ Assign entities to users
   ↓
Tax & Compliance
   ├─ Filing deadlines calendar
   ├─ Compliance status cards
   └─ Export compliance data
   ↓
Reports & Exports
   ├─ Multi-entity tax summary
   ├─ P&L reports
   ├─ Compliance status export
   └─ Executive PDF
```

---

## API Query Examples

### Get Organization Overview

```javascript
GET /api/organizations/1/overview/?organization_id=1
```

Response:
```json
{
  "total_assets": 500000,
  "total_liabilities": 150000,
  "net_position": 350000,
  "total_tax_exposure": 45000,
  "active_jurisdictions": 5,
  "active_entities": 12,
  "pending_tax_returns": 3,
  "missing_data_entities": 0,
  "tax_exposure_by_country": {
    "United States": 25000,
    "United Kingdom": 12000,
    "Canada": 8000
  }
}
```

### Get Tax Exposures by Country

```javascript
GET /api/tax-exposures/by_country/?organization_id=1
```

Response:
```json
{
  "United States": {
    "total": 25000,
    "count": 3,
    "entities": ["US Corp", "US LLC"]
  },
  "Canada": {
    "total": 8000,
    "count": 1,
    "entities": ["Canada Sub"]
  }
}
```

---

## Security Considerations

1. **Permission Checks**: Always check permissions before exposing data
2. **Entity Scoping**: Ensure external advisors can only see scoped entities
3. **Audit Logging**: Log all sensitive operations
4. **Token Scoping**: Include organization context in JWT claims
5. **Rate Limiting**: Implement on sensitive endpoints

---

## Deployment Steps

1. **Migrations**
   ```bash
   python manage.py makemigrations finances
   python manage.py migrate
   ```

2. **Seed Default Roles**
   ```python
   from finances.models import Role
   Role.get_or_create_default_roles()
   ```

3. **Environment Variables**
   ```
   ACCOUNT_TYPE_ENABLED=true
   ENTERPRISE_FEATURES_ENABLED=true
   ```

4. **Frontend Build**
   ```bash
   cd frontend && npm run build
   ```

---

## Support & References

- Django REST Framework: https://www.django-rest-framework.org/
- React Context API: https://react.dev/reference/react/createContext
- Role-Based Access Control Pattern: https://en.wikipedia.org/wiki/Role-based_access_control

