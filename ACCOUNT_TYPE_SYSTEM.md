# Atonix Capital - Account Type System

## ✅ Complete Implementation

**Status**: Phase 4 Complete - Account Type System Live  
**Date**: December 16, 2025

---

## 🎯 Overview

The system now supports **TWO account types** with intelligent detection and separate dashboards:

| Account Type | Email Domain | Default Dashboard | Features |
|--------------|--------------|-------------------|----------|
| **Personal** | Gmail, Yahoo, Outlook, etc. | `/dashboard` | Personal financial management |
| **Enterprise** | Custom domains (company.com) | `/app/enterprise/org-overview` | Multi-entity, team, compliance |

---

## 📋 How It Works

### Step 1️⃣: Registration Process

User registers with email → **System auto-detects account type** → User confirms/changes → User enters profile details → Account created with account_type stored

#### Email Detection Rules:

**Personal Domains** (Auto-detect as "Personal"):
- ✉️ gmail.com
- ✉️ yahoo.com
- ✉️ outlook.com
- ✉️ hotmail.com
- ✉️ aol.com
- ✉️ protonmail.com
- ✉️ icloud.com

**Everything Else** → Detected as "Enterprise"

### Step 2️⃣: 3-Step Registration Flow

```
Step 1: Email Entry
├─ User enters email
├─ System detects type automatically
└─ Continue to next step

Step 2: Account Type Confirmation
├─ Display detected type to user
├─ Show visual selector (Personal 👤 / Enterprise 🏢)
├─ User can change if desired
└─ Continue to details

Step 3: Profile Details
├─ Full name, country, phone
├─ IF Enterprise: Also ask for Organization Name
├─ Password setup
└─ Create Account

Result: Account created with account_type
└─ Auto-redirect to appropriate dashboard
```

### Step 3️⃣: Login & Dashboard Routing

**After Login:**

```
User logs in with credentials
         ↓
Account loaded with account_type
         ↓
    ┌────┴────┐
    ↓         ↓
Personal   Enterprise
 User       User
    ↓         ↓
Redirect   Redirect
  to         to
/dashboard  /app/enterprise/
           org-overview
```

**Access Control:**

- 🚫 Personal user tries to access `/app/enterprise/*` → Redirected to `/dashboard`
- 🚫 Enterprise user tries to access `/dashboard` → Redirected to `/app/enterprise/org-overview`

---

## 🔧 Technical Implementation

### 1. AuthContext Changes

**File**: `frontend/src/context/AuthContext.js`

**New Features:**
- `detectAccountType(email)` - Detects personal vs enterprise domains
- `account_type` stored in user object
- `account_type` persisted in localStorage
- Both `login()` and `register()` set account_type

**Code Example:**
```javascript
const detectAccountType = (email) => {
  const personalDomains = ['gmail.com', 'yahoo.com', 'outlook.com', ...];
  const domain = email.split('@')[1]?.toLowerCase();
  return personalDomains.includes(domain) ? 'personal' : 'enterprise';
};

// In register/login:
const mockUser = {
  id: Date.now(),
  name: name,
  email: email,
  account_type: account_type || detectAccountType(email)
};
```

### 2. Register.js Changes

**File**: `frontend/src/pages/Register/Register.js`

**New Features:**
- 3-step registration flow (step state management)
- Email auto-detection display
- Account type selector integration
- Conditional "Organization Name" field for enterprise users
- Smart redirect after signup

**Step Logic:**
```javascript
const [step, setStep] = useState(1); // 1: email, 2: type, 3: details

if (step === 1) {
  // Show email entry
  // On submit: detect type, move to step 2
}

if (step === 2) {
  // Show account type selector (AccountTypeSelector component)
  // User can confirm or change
  // On select: move to step 3
}

// step === 3
// Show profile form with conditional organization name
// On submit: register and redirect based on account_type
```

### 3. App.js Changes

**File**: `frontend/src/App.js`

**New Features:**
- `AccountTypeRoute` wrapper component
- Account type-based routing logic
- Redirects preventing cross-type access
- Wrapped enterprise routes with guard

**Protection Logic:**
```javascript
const AccountTypeRoute = ({ children, requiredType }) => {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const userAccountType = user?.account_type;

  if (requiredType === 'personal' && userAccountType === 'enterprise') {
    return <Navigate to="/app/enterprise/org-overview" replace />;
  }
  if (requiredType === 'enterprise' && userAccountType === 'personal') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};
```

---

## 👤 Personal Dashboard

### Route
`/dashboard`

### Access
- ✅ Users with `account_type: 'personal'`
- 🚫 Enterprise users redirected to `/app/enterprise/org-overview`

### Features
- Personal expense/income tracking
- Tax calculation for individual
- Financial planning tools
- Achievements and insights

### Components
- Dashboard.js
- Expenses.js
- Income.js
- Budget.js
- Analytics.js
- FinancialDNA.js
- And more...

---

## 🏢 Enterprise Dashboard

### Routes
```
/app/enterprise/org-overview       ← Home/Overview
/app/enterprise/entities           ← Manage business entities
/app/enterprise/tax-compliance     ← Compliance calendar
/app/enterprise/cashflow           ← Treasury management
/app/enterprise/risk-exposure      ← Risk analysis
/app/enterprise/reports            ← Report generation
/app/enterprise/team               ← Team management
```

### Access
- ✅ Users with `account_type: 'enterprise'`
- 🚫 Personal users redirected to `/dashboard`

### Features
- Multi-entity management
- Team collaboration
- Compliance tracking
- Risk analysis
- Report generation
- Treasury management

### Components
- EnterpriseOrgOverview.js
- EnterpriseEntities.js
- EnterpriseTaxCompliance.js
- EnterpriseCashflow.js
- EnterpriseRiskExposure.js
- EnterpriseReports.js
- EnterpriseTeam.js

---

## 🧪 Testing the System

### Test Case 1: Personal Account Creation

```
1. Visit /register
2. Enter email: john@gmail.com
3. System shows: "Detected as Personal"
4. Confirm account type
5. Enter: Name, Country, Phone, Password
6. Click "Create Account"
7. Redirected to: /dashboard ✅
8. View personal dashboard
```

### Test Case 2: Enterprise Account Creation

```
1. Visit /register
2. Enter email: admin@mycompany.com
3. System shows: "Detected as Business/Enterprise"
4. Confirm account type
5. Enter: Name, Organization Name, Country, Phone, Password
6. Click "Create Account"
7. Redirected to: /app/enterprise/org-overview ✅
8. View enterprise dashboard
```

### Test Case 3: Manual Account Type Override

```
1. Visit /register
2. Enter email: john@gmail.com
3. System auto-detects: Personal
4. CHANGE to: Enterprise (click selector)
5. "Organization Name" field appears
6. Fill in all details
7. Create Account
8. Redirected to: /app/enterprise/org-overview ✅
```

### Test Case 4: Cross-Type Access Prevention

```
Login as PERSONAL user:
1. Try to access: /app/enterprise/org-overview
2. Redirected to: /dashboard ✅

Login as ENTERPRISE user:
1. Try to access: /dashboard
2. Redirected to: /app/enterprise/org-overview ✅
```

### Test Case 5: Persistence Across Page Reload

```
1. Register personal account
2. Redirect to /dashboard
3. Refresh page
4. Still on /dashboard (persistent) ✅
5. account_type in localStorage verified ✅
```

---

## 📊 Data Structure

### User Object After Registration

**Personal User:**
```javascript
{
  id: 1702766400000,
  name: "John Doe",
  email: "john@gmail.com",
  country: "US",
  phone: "2025551234",
  avatar: "J",
  account_type: "personal"  // ← Key field
}
```

**Enterprise User:**
```javascript
{
  id: 1702766400001,
  name: "Jane Smith",
  email: "jane@acme.com",
  country: "US",
  phone: "2025559876",
  avatar: "J",
  account_type: "enterprise",  // ← Key field
  organization: "ACME Corp"  // ← Optional in future
}
```

### Storage
- 📱 **localStorage**: `user` (entire object including account_type)
- 📱 **AuthContext**: `user` state with account_type

---

## 🔄 Login Integration

### Login Flow

```
User enters credentials
         ↓
System finds matching test user
         ↓
User object loaded with account_type
         ↓
Saved to localStorage
         ↓
Saved to AuthContext
         ↓
Redirect based on account_type
```

### Test Login Accounts

**Personal Account:**
- Email: `jane@gmail.com`
- Password: `demo123`
- Type: Personal

**Enterprise Accounts:**
- Email: `test@test.com` | Password: `password` | Type: Enterprise
- Email: `admin@company.com` | Password: `admin123` | Type: Enterprise

---

## 🚀 Features Now Available

### Personal Users Can:
✅ Sign up with personal email  
✅ See "Personal Account" in registration  
✅ Access personal dashboard immediately  
✅ Use all personal finance features  
✅ Cannot access enterprise pages  

### Enterprise Users Can:
✅ Sign up with business email  
✅ See "Business/Enterprise Account" in registration  
✅ Enter organization name during signup  
✅ Access enterprise dashboard immediately  
✅ See all 7 enterprise pages  
✅ Cannot access personal dashboard  

### Both User Types:
✅ Account type persists after login  
✅ Account type preserved on page reload  
✅ Can't manually access wrong dashboard  
✅ Automatic redirect on route mismatch  

---

## 🔐 Security Notes

### Current (Demo) Security Level:
- ⚠️ Demo authentication (mock users in code)
- ⚠️ Passwords not hashed
- ⚠️ localStorage not encrypted

### To-Do for Production:

1. **Backend Integration:**
   - API endpoints for register/login
   - Real database user storage
   - JWT token authentication
   - Password hashing (bcrypt)

2. **Frontend Security:**
   - HTTPOnly cookies for tokens
   - CSRF protection
   - Remove demo users
   - Implement real auth checks

3. **Account Type Enforcement:**
   - Backend validates account_type on API calls
   - API returns only data for user's account_type
   - Team permissions enforced server-side

---

## 📞 FAQ

### Q: What if someone registers with a custom domain?
**A:** They're automatically detected as "Enterprise" and can confirm or change before profile entry.

### Q: Can a user change account type after registration?
**A:** Not in current version (would need backend support). Future enhancement.

### Q: What happens if personal user tries to access enterprise?
**A:** They're automatically redirected to `/dashboard` with no access granted.

### Q: Is account_type case-sensitive?
**A:** Yes, use lowercase: `'personal'` or `'enterprise'`.

### Q: Where is account_type stored?
**A:** In localStorage under `user` object, and in AuthContext during session.

### Q: How long does account_type persist?
**A:** Until user logs out or localStorage is cleared.

### Q: Can email domain detection be customized?
**A:** Yes, edit the `detectAccountType()` function in AuthContext.js to add/remove domains.

---

## 🎬 Next Steps (Phase 5)

1. **API Integration**
   - Connect register/login to backend
   - Store account_type in database
   - Retrieve account_type on login

2. **Enterprise Features**
   - Organization creation flow
   - Entity management form
   - Team invitation system
   - Permission enforcement

3. **Personal Features**
   - Dashboard customization
   - Personal tax returns
   - Investment tracking

4. **Backend Validation**
   - Verify account_type on all API calls
   - Enforce data isolation by type
   - Add role-based permissions

5. **Testing**
   - Unit tests for auth logic
   - Integration tests for routing
   - E2E tests for user flows

---

## ✨ Summary

The account type system is now **fully functional** with:

- ✅ 3-step intelligent registration
- ✅ Automatic email-based detection
- ✅ Separate dashboards for personal/enterprise
- ✅ Access control and routing guards
- ✅ Data persistence across sessions
- ✅ Clean user experience

Users can now sign up as either personal or enterprise accounts and automatically see their appropriate dashboard!

