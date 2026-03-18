# 📱 Country & Phone Number Feature

## ✅ What's Been Added

The registration form now includes **country selection** and **phone number with calling code**!

---

## 🌍 New Registration Fields

### Country Selection
- **65+ countries** available
- Shows country flag, name, and calling code
- Defaults to United States (+1)
- Easy-to-use dropdown selector

### Phone Number Input
- **Automatic calling code** display based on selected country
- Country flag shown next to calling code
- Only accepts numbers (auto-filters non-numeric characters)
- Minimum 6 digits required
- Format: [Country Code] [Your Number]

---

## 🎯 How It Works

### Registration Flow
```
1. Enter Name
2. Enter Email
3. Select Country (with flag & calling code)
4. Enter Phone Number (code auto-displayed)
5. Enter Password
6. Confirm Password
7. Click "Create Account"
```

### Example Registration
```
Name: John Doe
Email: john@example.com
Country: 🇺🇸 United States (+1)
Phone: 5551234567
Password: password123
Confirm: password123
```

---

## 🌎 Supported Countries (65+)

### North America
- 🇺🇸 United States (+1)
- 🇨🇦 Canada (+1)
- 🇲🇽 Mexico (+52)

### Europe
- 🇬🇧 United Kingdom (+44)
- 🇩🇪 Germany (+49)
- 🇫🇷 France (+33)
- 🇮🇹 Italy (+39)
- 🇪🇸 Spain (+34)
- 🇳🇱 Netherlands (+31)
- 🇸🇪 Sweden (+46)
- 🇳🇴 Norway (+47)
- And 20+ more European countries!

### Asia
- 🇮🇳 India (+91)
- 🇨🇳 China (+86)
- 🇯🇵 Japan (+81)
- 🇰🇷 South Korea (+82)
- 🇸🇬 Singapore (+65)
- 🇹🇭 Thailand (+66)
- 🇵🇭 Philippines (+63)
- And 10+ more Asian countries!

### Middle East & Africa
- 🇦🇪 UAE (+971)
- 🇸🇦 Saudi Arabia (+966)
- 🇿🇦 South Africa (+27)
- 🇳🇬 Nigeria (+234)
- 🇰🇪 Kenya (+254)
- And more!

### South America
- 🇧🇷 Brazil (+55)
- 🇦🇷 Argentina (+54)
- 🇨🇱 Chile (+56)
- 🇨🇴 Colombia (+57)
- And more!

### Oceania
- 🇦🇺 Australia (+61)
- 🇳🇿 New Zealand (+64)

---

## 💾 Data Storage

### User Object Now Includes
```javascript
{
  id: 12345,
  name: "John Doe",
  email: "john@example.com",
  country: "US",           // ← NEW: Country code
  phone: "5551234567",     // ← NEW: Phone number
  avatar: "J"
}
```

### Display in Sidebar
After login, the sidebar shows:
- User avatar
- User name
- User email
- **📱 Phone number** (with icon)

---

## 🎨 UI Features

### Country Dropdown
- Flag emoji for visual recognition
- Country name in full
- Calling code displayed in parentheses
- Searchable (type to find country)
- Example: `🇺🇸 United States (+1)`

### Phone Input
- **Two-part design:**
  1. **Prefix box**: Shows flag + calling code (read-only)
  2. **Input field**: For your phone number

- **Auto-formatting**: Only allows numbers
- **Validation**: Minimum 6 digits
- **Responsive**: Stacks vertically on mobile

### Example Display
```
┌─────────────┬──────────────────┐
│ 🇺🇸 +1      │ 5551234567       │
└─────────────┴──────────────────┘
 (Read-only)    (Your input)
```

---

## 📱 Phone Number Format

### What to Enter
Just enter your phone number **without** the country code:
- ✅ Correct: `5551234567`
- ❌ Wrong: `+1 5551234567`
- ❌ Wrong: `15551234567`

The calling code is automatically added from your selected country!

### Validation Rules
- Minimum: 6 digits
- Only numbers allowed
- Special characters auto-removed
- No spaces or dashes needed

---

## 🧪 Testing Examples

### Test Registration 1 (USA)
```
Name: John Smith
Email: john@test.com
Country: 🇺🇸 United States (+1)
Phone: 5551234567
Password: test123
Confirm: test123
```

### Test Registration 2 (UK)
```
Name: Jane Doe
Email: jane@test.com
Country: 🇬🇧 United Kingdom (+44)
Phone: 7911123456
Password: test123
Confirm: test123
```

### Test Registration 3 (India)
```
Name: Raj Kumar
Email: raj@test.com
Country: 🇮🇳 India (+91)
Phone: 9876543210
Password: test123
Confirm: test123
```

---

## 🔧 Technical Details

### New Files
- `src/utils/countries.js` - Country data with flags and codes

### Updated Files
- `src/pages/Register/Register.js` - Added country & phone fields
- `src/pages/Register/Register.css` - New styles for inputs
- `src/context/AuthContext.js` - Store country & phone
- `src/components/Layout/Layout.js` - Display phone in sidebar
- `src/components/Layout/Layout.css` - Phone display styling

### Country Data Structure
```javascript
{
  code: 'US',              // ISO country code
  name: 'United States',   // Full country name
  dialCode: '+1',          // Phone calling code
  flag: '🇺🇸'              // Flag emoji
}
```

---

## 🎯 Form Validation

### Required Fields
- ✅ Name (any text)
- ✅ Email (must include @)
- ✅ Country (from dropdown)
- ✅ Phone (minimum 6 digits)
- ✅ Password (minimum 6 characters)
- ✅ Confirm Password (must match)

### Error Messages
- "Please fill in all fields" - Missing required field
- "Please enter a valid email" - Email missing @
- "Password must be at least 6 characters" - Password too short
- "Passwords do not match" - Confirmation mismatch
- "Please enter a valid phone number" - Phone less than 6 digits

---

## 📊 User Profile Display

### Sidebar Footer Shows
```
┌─────────────────────────┐
│  [J]  John Doe         │
│       john@example.com  │
│       📱 5551234567     │
└─────────────────────────┘
│   🚪 Logout             │
└─────────────────────────┘
```

### Responsive Behavior
- **Desktop**: Shows name, email, and phone
- **Tablet**: Shows name and email (phone hidden)
- **Mobile**: Shows name only (email & phone hidden)

---

## 🔌 Backend Integration (Future)

When connecting to Django backend, update the registration endpoint:

### Django Model Addition
```python
class User(AbstractUser):
    country = models.CharField(max_length=2)  # ISO code
    phone = models.CharField(max_length=20)
    # ... other fields
```

### API Endpoint
```python
POST /api/auth/register/
{
    "name": "John Doe",
    "email": "john@example.com",
    "country": "US",
    "phone": "5551234567",
    "password": "password123"
}
```

---

## 💡 Usage Tips

### For Users
1. **Select your country first** - The calling code updates automatically
2. **Enter phone without country code** - It's already shown!
3. **Only numbers** - System removes other characters
4. **Minimum 6 digits** - Ensures valid phone number

### For Developers
1. Country list is in `src/utils/countries.js`
2. Easy to add more countries
3. Flags use Unicode emoji (universal support)
4. Phone validation can be customized
5. Format stored: country code + phone number

---

## 🌟 Benefits

✅ **International support** - 65+ countries  
✅ **Visual clarity** - Flag emojis for easy recognition  
✅ **Auto-formatting** - Calling codes handled automatically  
✅ **Validation** - Ensures proper phone numbers  
✅ **User-friendly** - Simple two-field design  
✅ **Professional** - Standard registration practice  
✅ **Extensible** - Easy to add more countries  

---

## 🎉 Try It Now!

1. Visit: http://localhost:3001/register
2. Fill out the form:
   - Name: Your name
   - Email: your@email.com
   - **Country: Pick your country** ← NEW!
   - **Phone: Enter your number** ← NEW!
   - Password: (6+ characters)
   - Confirm: (same password)
3. Click "Create Account"
4. Check sidebar - see your phone number! 📱

---

## 📞 Demo Values

Use these for testing:

```
USA User:
Country: 🇺🇸 United States (+1)
Phone: 5551234567

UK User:
Country: 🇬🇧 United Kingdom (+44)
Phone: 7911123456

India User:
Country: 🇮🇳 India (+91)
Phone: 9876543210
```

---

**✨ Your registration form is now international-ready!**

**Test it at: http://localhost:3001/register**
