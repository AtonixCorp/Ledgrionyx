# Test Login Credentials

## Pre-configured Test Users

You can use any of these accounts to test the login functionality:

### Account 1 - John Doe
- **Email:** `test@test.com`
- **Password:** `password`
- **Country:** Nigeria
- **Phone:** +234 801 234 5678

### Account 2 - Jane Smith
- **Email:** `demo@demo.com`
- **Password:** `demo123`
- **Country:** Kenya
- **Phone:** +254 712 345 678

### Account 3 - Admin User
- **Email:** `admin@admin.com`
- **Password:** `admin123`
- **Country:** South Africa
- **Phone:** +27 82 123 4567

---

## How to Test

1. **Start the application:**
   ```bash
   cd /home/atonixdev/buhlayfinance/frontend
   npm start
   ```

2. **Navigate to:** `http://localhost:3001`

3. **Click "Get Started"** or **"Login"** button

4. **Use any of the test credentials above**

---

## Alternative Testing Methods

### Option 1: Quick Login (Recommended)
Use the pre-configured accounts above for instant access.

### Option 2: Register New User
You can also create a new account:
1. Click "Sign Up" on the login page
2. Fill in the registration form
3. Select your country from the dropdown (all African countries available!)
4. Enter your phone number
5. Create your account

### Option 3: Any Credentials
The system also accepts **any email/password combination** for testing purposes, so you can use:
- Email: `anything@example.com`
- Password: `anything`

---

## Features to Test

Once logged in, you can explore:

- ✅ **Dashboard** - View financial overview
- ✅ **Expenses** - Track your spending
- ✅ **Income** - Monitor your earnings
- ✅ **Budget** - Set and manage budgets
- ✅ **Analytics** - Visualize financial data
- ✅ **Profile Menu** - Access settings and logout

---

## Notes

- This is a **mock authentication system** - no backend database is connected yet
- User data is stored in browser's `localStorage`
- To clear your session, click the profile icon → Logout
