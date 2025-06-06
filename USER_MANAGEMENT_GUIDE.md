# Clinton Medical PACS - User Management Guide

## 🔐 User Management & Role System

### **1. Supabase User Management**

#### **Access Supabase Dashboard:**
- URL: https://supabase.com/dashboard
- Project: `evirehefoqleegubokcl`
- Navigate to: **Authentication → Users**

#### **User Operations:**
```bash
# Add new user manually:
1. Go to Authentication → Users
2. Click "Add User"
3. Enter email and temporary password
4. Set user metadata for role

# User metadata example:
{
  "role": "admin",
  "full_name": "Dr. John Smith",
  "department": "Radiology"
}
```

### **2. Role System Overview**

#### **Available Roles:**
- **`admin`** - Full system access
- **`doctor`** - Medical staff access  
- **`operator`** - Technical/support access

#### **Role Detection Logic:**
```javascript
// Automatic role assignment based on email:
admin@clintonmedical.com       → admin
timhunt@clintonmedical.com     → admin
doctor.smith@hospital.com      → doctor
tech.support@clinic.com        → operator
```

### **3. Current Access Control**

#### **What Each Role Can Do:**

| Feature | Admin | Doctor | Operator |
|---------|-------|--------|----------|
| View DICOM Images | ✅ | ✅ | ✅ |
| Create Reports | ✅ | ✅ | ❌ |
| Edit Reports | ✅ | ✅ | ❌ |
| Delete Reports | ✅ | ✅ | ❌ |
| Export Reports | ✅ | ✅ | ❌ |
| User Management | ✅ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ |
| Upload DICOM | ✅ | ✅ | ✅ |
| View Statistics | ✅ | ✅ | ✅ |

### **4. Role Management Commands**

#### **Browser Console Commands:**
```javascript
// Check current user info
await window.clintonPACS.debugUserInfo()

// Set user role manually (for testing)
window.clintonPACS.setUserRole('doctor@clinic.com', 'admin')

// Check role detection
window.clintonPACS.determineUserRole('new.user@hospital.com')

// List all manual role overrides
Object.keys(localStorage).filter(k => k.startsWith('user_role_'))
```

### **5. Adding New Users**

#### **Method 1: Supabase Registration**
1. Users register at: https://srv853233.hstgr.cloud/login
2. Click "New to PACS? Create account"
3. Admin manually assigns role in Supabase

#### **Method 2: Admin Invitation**
```bash
# In Supabase Dashboard:
1. Authentication → Users → Invite User
2. Enter email address
3. Set initial role in user_metadata
4. User receives invitation email
```

#### **Method 3: Manual Creation**
```bash
# Direct database entry:
1. Authentication → Users → Add User
2. Email: doctor@clinic.com
3. Password: temporary123
4. Metadata: {"role": "doctor", "full_name": "Dr. Name"}
```

### **6. Advanced Role Configuration**

#### **Custom Role Rules:**
```javascript
// Add to customizations.js
const customRoleRules = {
    // Department-based roles
    'radiology@clinic.com': 'admin',
    'cardiology@clinic.com': 'doctor',
    
    // Specific individuals
    'chief.radiologist@clinic.com': 'admin',
    'technician@clinic.com': 'operator'
};

// Email domain rules
const domainRules = {
    '@admin.clintonmedical.com': 'admin',
    '@doctors.clintonmedical.com': 'doctor',
    '@tech.clintonmedical.com': 'operator'
};
```

### **7. User Data Structure**

#### **Supabase User Profile:**
```json
{
  "id": "uuid",
  "email": "doctor@clinic.com",
  "user_metadata": {
    "role": "doctor",
    "full_name": "Dr. John Smith",
    "department": "Radiology",
    "license_number": "MD12345",
    "specialization": "Diagnostic Radiology"
  },
  "app_metadata": {
    "provider": "email",
    "role": "doctor"
  }
}
```

### **8. Monitoring & Security**

#### **User Activity Logs:**
- Login/logout events
- Report creation/modification
- DICOM access logs
- Role changes

#### **Security Features:**
- Session timeout (configurable)
- Failed login attempt tracking
- Password complexity requirements
- Multi-factor authentication (optional)

### **9. Bulk User Management**

#### **CSV Import Template:**
```csv
email,role,full_name,department
doctor1@clinic.com,doctor,"Dr. Smith",Radiology
admin@clinic.com,admin,"Admin User",IT
tech1@clinic.com,operator,"Tech Support",Technical
```

#### **Import Script:**
```bash
# Upload users via Supabase CLI
supabase auth users import users.csv
```

### **10. Troubleshooting**

#### **Common Issues:**
1. **User sees wrong role**: Check email patterns in determineUserRole()
2. **No access after login**: Verify Supabase session data
3. **Role not updating**: Clear localStorage, re-login
4. **Manual role override**: Use setUserRole() function

#### **Debug Commands:**
```javascript
// Check all localStorage auth data
Object.keys(localStorage).filter(k => k.includes('supabase') || k.includes('auth'))

// Force role refresh
window.location.reload()

// Clear role cache
Object.keys(localStorage).filter(k => k.startsWith('user_role_')).forEach(k => localStorage.removeItem(k))
```

### **11. Next Steps - Enhanced Access Control**

#### **Planned Features:**
- [ ] DICOM study access by department
- [ ] Time-based access restrictions
- [ ] Audit trail for all actions
- [ ] Custom permission sets
- [ ] Patient privacy controls
- [ ] Integration with hospital AD/LDAP

---

## 🚀 Quick Start Checklist

1. **Access Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to Users**: Authentication → Users
3. **Add test users** with different roles
4. **Test role system** in PACS interface
5. **Configure custom role rules** if needed

## 📞 Support

For user management issues:
- Check console logs for role detection
- Verify Supabase user metadata
- Use debug functions for troubleshooting 