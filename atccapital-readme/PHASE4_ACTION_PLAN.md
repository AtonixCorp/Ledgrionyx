# Phase 4 Action Plan - API Integration & Routing

**Status**: Ready to Start  
**Estimated Duration**: 15-27 hours  
**Complexity**: Medium  
**Date**: December 16, 2025

---

## 🎯 Phase 4 Objectives

1. ✅ Enable all dashboard pages in the application
2. ✅ Connect components to backend API endpoints
3. ✅ Implement authentication-based account type routing
4. ✅ Add loading states and error handling
5. ✅ Prepare for Phase 5 testing

---

## 📋 Task Breakdown

### Task 1: Update App.js Routing (1-2 hours)

**File**: `frontend/src/App.js`

**Changes Required:**

```javascript
// 1. Add imports for new components
import EnterpriseTaxCompliance from './pages/Enterprise/EnterpriseTaxCompliance';
import EnterpriseCashflow from './pages/Enterprise/EnterpriseCashflow';
import EnterpriseRiskExposure from './pages/Enterprise/EnterpriseRiskExposure';
import EnterpriseReports from './pages/Enterprise/EnterpriseReports';
import EnterpriseTeam from './pages/Enterprise/EnterpriseTeam';

// 2. Wrap routes with EnterpriseProvider
<EnterpriseProvider>
  <BrowserRouter>
    {/* Routes here */}
  </BrowserRouter>
</EnterpriseProvider>

// 3. Create enterprise route structure
<Route path="/app/enterprise/org-overview" element={<ProtectedRoute><EnterpriseOrgOverview /></ProtectedRoute>} />
<Route path="/app/enterprise/entities" element={<ProtectedRoute><EnterpriseEntities /></ProtectedRoute>} />
<Route path="/app/enterprise/tax-compliance" element={<ProtectedRoute><EnterpriseTaxCompliance /></ProtectedRoute>} />
<Route path="/app/enterprise/cashflow" element={<ProtectedRoute><EnterpriseCashflow /></ProtectedRoute>} />
<Route path="/app/enterprise/risk-exposure" element={<ProtectedRoute><EnterpriseRiskExposure /></ProtectedRoute>} />
<Route path="/app/enterprise/reports" element={<ProtectedRoute><EnterpriseReports /></ProtectedRoute>} />
<Route path="/app/enterprise/team" element={<ProtectedRoute><EnterpriseTeam /></ProtectedRoute>} />

// 4. Add account type guard (redirect based on user type)
const accountType = authContext.user?.account_type;
if (accountType === 'enterprise' && path.includes('/personal')) redirect('/app/enterprise/org-overview');
if (accountType === 'personal' && path.includes('/enterprise')) redirect('/app/personal/dashboard');
```

**Acceptance Criteria:**
- [ ] All 5 components are importable
- [ ] Routes are accessible at `/app/enterprise/*` paths
- [ ] Authentication guard prevents unauthorized access
- [ ] EnterpriseProvider wraps all enterprise routes
- [ ] Application starts without routing errors

---

### Task 2: Update EnterpriseContext (1-2 hours)

**File**: `frontend/src/context/EnterpriseContext.js`

**Changes Required:**

```javascript
// 1. Add methods to fetch data from API
const fetchOrganizations = async (userId) => {
  try {
    const response = await fetch(`/api/organizations/?user=${userId}`);
    const data = await response.json();
    setOrganizations(data);
  } catch (error) {
    console.error('Failed to load organizations', error);
  }
}

// 2. Add method to select organization
const selectOrganization = async (orgId) => {
  try {
    setCurrentOrganization({...});
    await fetchEntities(orgId);
    await fetchTeamMembers(orgId);
  } catch (error) {
    console.error('Failed to select organization', error);
  }
}

// 3. Add data loading state
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// 4. Call on mount
useEffect(() => {
  if (user) fetchOrganizations(user.id);
}, [user]);
```

**Acceptance Criteria:**
- [ ] Context methods fetch data from `/api/organizations/`
- [ ] Organization selection triggers entity/team loading
- [ ] Loading state is managed properly
- [ ] Error state captures API failures
- [ ] Data persists across component navigation

---

### Task 3: Connect Components to API (6-8 hours)

**For Each Component:** Replace mock data with API calls

#### Tax Compliance
```javascript
useEffect(() => {
  if (currentOrganization) {
    fetch(`/api/compliance-deadlines/?organization_id=${currentOrganization.id}`)
      .then(r => r.json())
      .then(data => setComplianceData(data))
      .catch(e => setError(e.message));
  }
}, [currentOrganization]);
```

**API Endpoints:**
- `GET /api/compliance-deadlines/?organization_id=X`
- `GET /api/compliance-deadlines/upcoming/?organization_id=X`
- `GET /api/compliance-deadlines/overdue/?organization_id=X`

#### Cashflow
**API Endpoints:**
- `GET /api/cashflow-forecasts/?organization_id=X`
- `GET /api/cashflow-forecasts/by_category/?organization_id=X`

#### Risk Exposure
**API Endpoints:**
- `GET /api/tax-exposures/?organization_id=X`
- `GET /api/tax-exposures/by_country/?organization_id=X`

#### Reports
**API Endpoints:**
- `GET /api/reports/` - List available reports
- `POST /api/reports/{reportId}/generate/` - Generate with parameters

#### Team
**API Endpoints:**
- `GET /api/team-members/?organization_id=X`
- `POST /api/team-members/` - Add new
- `PATCH /api/team-members/{id}/` - Update role
- `DELETE /api/team-members/{id}/` - Remove

**Acceptance Criteria for Each Component:**
- [ ] Real data loads from API
- [ ] Mock data removed or used as fallback
- [ ] Loading spinner shows while fetching
- [ ] Error message shows on API failure
- [ ] Data updates when filters/selections change

---

### Task 4: Add Loading & Error States (1-2 hours)

**For Each Component:**

```javascript
// 1. Add loading spinner
{loading ? <div className="loading-spinner">Loading...</div> : <YourContent />}

// 2. Add error message
{error && <div className="error-banner">{error}</div>}

// 3. Add retry button
{error && <button onClick={retry}>Retry</button>}
```

**Acceptance Criteria:**
- [ ] Loading spinner appears while fetching
- [ ] Error messages display on API failures
- [ ] Users can retry failed requests
- [ ] Spinners disappear when data loads
- [ ] No errors in console during loading

---

### Task 5: Update AuthContext (1-2 hours)

**File**: `frontend/src/context/AuthContext.js`

**Changes Required:**

```javascript
// 1. Add account_type to user object
const [user, setUser] = useState({
  id: null,
  name: null,
  email: null,
  account_type: 'personal', // or 'enterprise'
});

// 2. Store/restore from localStorage
useEffect(() => {
  const saved = localStorage.getItem('user');
  if (saved) {
    const parsed = JSON.parse(saved);
    setUser(parsed);
  }
}, []);

// 3. Update on login/register
const login = (email, password) => {
  // Make API call
  const response = await fetch('/api/auth/login/', {
    method: 'POST',
    body: JSON.stringify({email, password})
  });
  const data = await response.json();
  setUser({...data.user, account_type: data.user.account_type});
  localStorage.setItem('user', JSON.stringify({...data.user, account_type: data.user.account_type}));
};
```

**Acceptance Criteria:**
- [ ] User object includes account_type
- [ ] account_type persists in localStorage
- [ ] account_type updates on login
- [ ] account_type routes correctly
- [ ] No localStorage errors in console

---

### Task 6: Update Register.js Signup Flow (2-3 hours)

**File**: `frontend/src/pages/Register/Register.js`

**Changes Required:**

```javascript
// 1. Import AccountTypeSelector
import AccountTypeSelector from '../../components/AccountTypeSelector';

// 2. Add account type selection state
const [accountType, setAccountType] = useState(null);
const [showTypeSelector, setShowTypeSelector] = useState(false);

// 3. After email validation, show selector
if (!accountType) {
  return <AccountTypeSelector onSelect={handleAccountTypeSelect} />;
}

// 4. For enterprise, show org creation form
if (accountType === 'enterprise') {
  return (
    <div>
      <h2>Create Your Organization</h2>
      <form onSubmit={handleCreateOrg}>
        <input name="org_name" placeholder="Organization Name" />
        <input name="country" placeholder="Country" />
        <select name="subscription_tier">
          <option>Starter</option>
          <option>Professional</option>
          <option>Enterprise</option>
        </select>
        <button type="submit">Create Organization</button>
      </form>
    </div>
  );
}

// 5. For personal, skip to regular signup
return <PersonalSignupForm />;
```

**Acceptance Criteria:**
- [ ] Account type selector appears after email/password
- [ ] Personal type goes to personal dashboard
- [ ] Enterprise type shows org creation form
- [ ] org_name and country are required
- [ ] Subscription tier defaults to Starter
- [ ] Account created with correct type in database

---

### Task 7: Add Navigation Updates (1 hour)

**Update Sidebar/Navigation:**

```javascript
// For Personal Users
const personalLinks = [
  { path: '/app/personal/dashboard', label: 'Dashboard', icon: 'home' },
  { path: '/app/personal/my-countries', label: 'My Countries', icon: 'globe' },
  { path: '/app/personal/tax-returns', label: 'Tax Returns', icon: 'file' },
  { path: '/app/personal/cashflow', label: 'Cashflow', icon: 'wallet' },
];

// For Enterprise Users
const enterpriseLinks = [
  { path: '/app/enterprise/org-overview', label: 'Organization Overview', icon: 'briefcase' },
  { path: '/app/enterprise/entities', label: 'Entities', icon: 'sitemap' },
  { path: '/app/enterprise/tax-compliance', label: 'Tax Compliance', icon: 'calendar' },
  { path: '/app/enterprise/cashflow', label: 'Cashflow', icon: 'wallet' },
  { path: '/app/enterprise/risk-exposure', label: 'Risk Exposure', icon: 'exclamation' },
  { path: '/app/enterprise/reports', label: 'Reports', icon: 'file' },
  { path: '/app/enterprise/team', label: 'Team', icon: 'users' },
];

// Show based on account_type
const links = user?.account_type === 'enterprise' ? enterpriseLinks : personalLinks;
```

**Acceptance Criteria:**
- [ ] Correct links show for personal users
- [ ] Correct links show for enterprise users
- [ ] Active link highlights current page
- [ ] Navigation works without errors

---

## 🧪 Testing Checklist

### Routing Tests
- [ ] All `/app/enterprise/*` routes load correctly
- [ ] Authentication prevents unauthorized access
- [ ] Redirect works based on account_type
- [ ] No 404 errors on valid routes

### Component Data Loading
- [ ] Tax Compliance loads deadline data
- [ ] Cashflow loads cash position data
- [ ] Risk Exposure loads risk scores
- [ ] Reports shows available reports
- [ ] Team shows members list

### Error Handling
- [ ] Network error shows message
- [ ] 401 Unauthorized redirects to login
- [ ] 403 Forbidden shows permission denied
- [ ] Retry works on API failure

### User Flow
- [ ] Personal user can sign up and access personal dashboard
- [ ] Enterprise user can sign up, create org, access enterprise pages
- [ ] User can switch between personal/enterprise (if supported)
- [ ] Logout clears data and redirects to login

---

## 📝 API Checklist

Before Phase 4, verify backend endpoints:

- [ ] `/api/organizations/` returns list
- [ ] `/api/entities/` filters by org_id
- [ ] `/api/team-members/` filters by org_id
- [ ] `/api/roles/` returns 5 roles
- [ ] `/api/permissions/` returns 13 permissions
- [ ] `/api/compliance-deadlines/` returns list
- [ ] `/api/cashflow-forecasts/` returns forecasts
- [ ] `/api/tax-exposures/` returns exposures
- [ ] `/api/reports/` returns report templates
- [ ] Authentication tokens work correctly

**Test with:**
```bash
curl -H "Authorization: Bearer TOKEN" http://localhost:8000/api/organizations/
```

---

## 🚨 Common Issues & Solutions

### Issue: Components show "No data"
**Solution:** Check that API endpoints return correct data format

### Issue: EnterpriseContext is undefined
**Solution:** Ensure `<EnterpriseProvider>` wraps the route

### Issue: Routing redirects infinitely
**Solution:** Check account_type is set correctly in user object

### Issue: API calls fail with CORS error
**Solution:** Verify backend CORS settings in `settings.py`

### Issue: Loading never stops
**Solution:** Check API response format and error handling

---

## 🔄 Development Workflow

### Step 1: Start Backend
```bash
cd backend
python manage.py runserver
```

### Step 2: Start Frontend
```bash
cd frontend
npm start
```

### Step 3: Test Routing
1. Navigate to `/app/enterprise/org-overview`
2. Verify page loads without errors
3. Check console for API calls

### Step 4: Test Components
1. Open Network tab in DevTools
2. Check API calls are made
3. Verify response format matches expectations

### Step 5: Test Error Handling
1. Stop backend server
2. Try loading a component
3. Verify error message shows

---

## 📊 Progress Tracking

Use this checklist to track Phase 4 progress:

### Week 1
- [ ] Day 1: App.js routing (1-2 hrs)
- [ ] Day 2: EnterpriseContext API methods (1-2 hrs)
- [ ] Day 3: Tax Compliance API integration (1.5 hrs)
- [ ] Day 4: Cashflow API integration (1.5 hrs)

### Week 2
- [ ] Day 1: Risk & Reports API integration (3 hrs)
- [ ] Day 2: Team API integration (1.5 hrs)
- [ ] Day 3: Loading/Error states (1-2 hrs)
- [ ] Day 4: AuthContext updates (1-2 hrs)

### Week 3
- [ ] Day 1: Register signup flow (2-3 hrs)
- [ ] Day 2: Navigation updates (1 hr)
- [ ] Day 3: Testing all components (3-4 hrs)
- [ ] Day 4: Bug fixes and polish (2-3 hrs)

---

## 🎯 Success Criteria for Phase 4

✅ **All Routes Work**
- 7 enterprise pages accessible
- No 404 errors
- Authentication required

✅ **Data Loads from API**
- Real data displayed (not mock)
- Loading states visible
- Error messages on failure

✅ **User Flows Function**
- Personal signup → personal dashboard
- Enterprise signup → org setup → enterprise pages
- Navigation works correctly

✅ **Performance Acceptable**
- Pages load in <2 seconds
- No console errors
- Network requests efficient

✅ **Ready for Phase 5**
- All components functional
- API integration complete
- Testing infrastructure ready

---

## 📞 Questions to Answer

Before starting Phase 4:

1. Should personal users be able to switch to enterprise mode?
2. What's the default subscription tier for new orgs?
3. Should organization creation require verification?
4. Can users belong to multiple organizations?
5. Should team invites be sent via email or in-app?

---

**Phase 4 Start Date**: Ready to begin  
**Estimated Completion**: 15-27 hours of work  
**Next Phase**: Phase 5 - Testing & Optimization

Let's build! 🚀

