# Changelog

## [2.0.0] - 2025-01-26 - Dashboard Removal Update

### 🚀 Major Changes
- **BREAKING**: Completely removed dashboard interface
- **NEW**: Direct access to OHIF viewer from root path (/)
- **ENHANCED**: Streamlined authentication flow

### ✨ Added
- Direct root path routing to OHIF viewer
- Aggressive Clinton Medical branding implementation
- Large file support (2GB max upload)
- Enhanced error handling and console spam reduction
- Dynamic configuration support for OHIF v3+
- Comprehensive DICOM connection documentation

### 🔧 Modified
- **Flask Authentication Service**:
  - Added root route redirects
  - Removed dashboard routes completely
  - Updated login success handling to redirect to `/`
  
- **OHIF Viewer Configuration**:
  - Updated server URLs to use srv853233.hstgr.cloud domain
  - Added `dangerouslyUseDynamicConfig` support
  - Removed extension duplication errors
  - Fixed JavaScript MIME type issues

- **Nginx Configuration**:
  - Root path (`/`) now serves OHIF directly
  - Updated CSP headers for custom font loading
  - Added CORS support for DICOM API calls
  - Increased upload limits and timeout settings
  - Fixed redirect loop issues

- **Custom Branding**:
  - Implemented aggressive CSS overrides for React components
  - Added MutationObserver for dynamic text replacement
  - Hidden "Investigational Use" notices
  - Custom Clinton Medical header and logo

### 🐛 Fixed
- Resolved infinite redirect loops between Flask and nginx
- Fixed CSP font-src directive causing font loading errors
- Corrected JavaScript syntax errors in customizations
- Eliminated extension duplication console errors
- Reduced excessive console logging from MutationObserver
- Fixed DICOM API CORS issues

### 🔒 Security
- Maintained SSL/TLS encryption
- Preserved session-based authentication
- Updated Content Security Policy headers
- Secure cookie configuration

### 📋 Technical Details
- **Container Updates**: Custom OHIF image with branding
- **Volume Mounts**: Configuration files properly mounted
- **Network**: Internal Docker network (172.18.0.x)
- **SSL**: Self-signed certificates for HTTPS

### 🏥 DICOM Integration
- **Orthanc Server**: Running on port 4242
- **DICOMWeb API**: Enabled and configured
- **Test Data**: Loaded with 2 patients, 6 studies, 369 instances
- **Device Support**: Configured for Esaote MyLab equipment

---

## [1.0.0] - 2025-01-24 - Initial PACS System

### ✨ Added
- Complete PACS system with OHIF viewer
- Flask-based authentication service
- Nginx SSL proxy and load balancer
- Orthanc DICOM server integration
- Docker Compose orchestration
- Basic dashboard interface (later removed)
- Supabase authentication preparation
- SSL certificate generation
- Multi-container networking

### 🔧 Configuration
- Initial OHIF viewer setup
- Basic nginx configuration
- Flask session management
- Docker network creation
- Volume mounting for persistence
- Environment variable management

### 📋 Features
- User authentication and sessions
- DICOM file viewing and management
- Basic medical imaging tools
- Secure HTTPS access
- Container health monitoring
- Log aggregation setup

---

## Version Comparison

| Feature | v1.0.0 | v2.0.0 |
|---------|--------|--------|
| Dashboard | ✅ | ❌ (Removed) |
| Direct OHIF Access | ❌ | ✅ |
| Custom Branding | Basic | Advanced |
| Root Path Access | Dashboard | OHIF Viewer |
| Authentication Flow | Login → Dashboard → OHIF | Login → OHIF |
| Large File Support | 1MB | 2GB |
| Console Spam | High | Reduced |
| DICOM Integration | Basic | Enhanced |

---

## Migration Notes

### From v1.0.0 to v2.0.0
1. **Authentication Flow Changed**: Users now go directly to OHIF after login
2. **URLs Updated**: Root path (`/`) serves OHIF instead of dashboard
3. **Configuration Files**: Multiple config files updated (see commit diff)
4. **Container Images**: Using custom OHIF image with branding
5. **Nginx Routes**: Significant routing changes for root path handling

### Backup Recommendations
- Backup existing configuration files before upgrading
- Test in staging environment first
- Verify DICOM device connections after upgrade
- Update any hardcoded URLs in external systems

---

## Contributors
- **Tim Hunt** - Lead Developer & System Administrator
- **Claude AI** - Development Assistant & Configuration Management

---

## Support
For issues related to this version:
1. Check container logs: `docker logs [container_name]`
2. Verify configuration file syntax
3. Test authentication flow manually
4. Ensure all containers are running and healthy 