# PACS System Project Rules

## 1. CORE ARCHITECTURE RULES

### 1.1 Container Architecture
- **MANDATORY**: All services must run in Docker containers
- **MANDATORY**: Use docker-compose for orchestration
- **MANDATORY**: Flask-based Authorization Service (for RBAC logic, e.g., at `/authorize`) must be containerized.
- **MANDATORY**: Each service must have health checks
- **MANDATORY**: All data must be persisted in named volumes
- **FORBIDDEN**: Running services directly on host system

### 1.2 Network Architecture
- **MANDATORY**: Fixed port allocation:
  - Orthanc: 8042 (internal), accessible via `/orthanc`
  - OHIF Viewer: 3000 (internal), accessible via `/`
  - Nginx: 443 (HTTPS), 80 (redirect to HTTPS)
- **MANDATORY**: All external access must go through Nginx reverse proxy
- **MANDATORY**: Kill conflicting processes before deployment
- **FORBIDDEN**: Dynamic port allocation
- **FORBIDDEN**: Direct access to backend services

### 1.3 Routing Rules
- **MANDATORY**: Orthanc must be served at `/orthanc` path
- **MANDATORY**: OHIF Viewer must be served at root `/` path
- **MANDATORY**: Flask Authorization Service must be accessible (e.g., at `/authorize`) via Nginx.
- **MANDATORY**: API routes must be versioned (`/api/v1/`)
- **MANDATORY**: Static assets must have cache headers

## 2. SECURITY RULES

### 2.1 Authentication & Authorization
- **MANDATORY**: Implement role-based access control (RBAC)
- **MANDATORY**: Three roles: `admin`, `doctor`, `operator`
- **MANDATORY**: JWT tokens for session management
- **MANDATORY**: Token expiration: 8 hours for doctors/operators, 24 hours for admins
- **MANDATORY**: Secure password requirements (min 12 chars, complexity)
- **FORBIDDEN**: Hardcoded credentials
- **FORBIDDEN**: Plain text password storage

### 2.2 Role Permissions
- **admin**: Full system access, user management, configuration
- **doctor**: Patient data access, report creation/editing, PDF export
- **operator**: Patient data upload, basic viewing, no report editing
- **MANDATORY**: Audit logging for all user actions
- **MANDATORY**: Session timeout after 30 minutes of inactivity

### 2.3 Data Security
- **MANDATORY**: HTTPS/TLS 1.3 for all communications
- **MANDATORY**: Encrypt data at rest using AES-256
- **MANDATORY**: Secure headers (HSTS, CSP, X-Frame-Options)
- **MANDATORY**: Regular security updates for all dependencies

## 3. ORTHANC RULES

### 3.1 Plugin Requirements
- **MANDATORY**: DICOMweb plugin enabled and configured
- **MANDATORY**: Authorization plugin for access control (integrated with the Flask Authorization Service)
- **MANDATORY**: PostgreSQL plugin for production database
- **MANDATORY**: Compression plugin for storage efficiency
- **MANDATORY**: Storage commitment plugin for reliability
- **FORBIDDEN**: SQLite in production environment

### 3.2 Configuration Rules
- **MANDATORY**: Enable CORS for OHIF integration
- **MANDATORY**: Configure proper DICOM modalities
- **MANDATORY**: Set up automatic backup schedules
- **MANDATORY**: Configure retention policies for studies
- **MANDATORY**: Enable compression for storage efficiency

### 3.3 API Rules
- **MANDATORY**: All API responses must include proper HTTP status codes
- **MANDATORY**: Implement rate limiting (100 requests/minute per user)
- **MANDATORY**: Log all API access with user identification
- **FORBIDDEN**: Exposing internal Orthanc URLs in responses

## 4. OHIF VIEWER RULES

### 4.1 Configuration Rules
- **MANDATORY**: Custom branding with client logo and colors (e.g., "Klinika Pro").
- **MANDATORY**: Configure data sources to point to Orthanc DICOMweb
- **MANDATORY**: Russian language support enabled in OHIF Viewer (if available and technically feasible).
- **MANDATORY**: Enable measurement tools and annotations
- **MANDATORY**: Configure proper viewport layouts
- **FORBIDDEN**: Default OHIF branding in production

### 4.2 User Interface Rules
- **MANDATORY**: Responsive design for desktop and tablet
- **MANDATORY**: Dark mode as default theme
- **MANDATORY**: "Download" button or similar direct download features for studies/series must be removed or hidden.
- **MANDATORY**: "Doctor's Report" (Заключение врача) tab/section requirements:
    - Must feature a rich textarea for report input.
    - Must include a "Save" button saving report content to browser localStorage.
    - Must include an "Export PDF" button using a library like jsPDF.
    - PDF export must include a header, Patient Information, StudyID, and Doctor's signature.
    - This tab/section must be visible only to users with `doctor` or `admin` roles.
- **MANDATORY**: Keyboard shortcuts for common actions
- **MANDATORY**: Context menus for right-click operations
- **MANDATORY**: Progress indicators for long operations

### 4.3 Integration Rules
- **MANDATORY**: Real-time updates from Orthanc
- **MANDATORY**: Proper error handling with user-friendly messages
- **MANDATORY**: Seamless authentication flow with backend
- **FORBIDDEN**: Client-side sensitive data storage

## 5. REPORT SYSTEM RULES

### 5.1 Report Creation
- **MANDATORY**: Rich text editor for doctors and admins only
- **MANDATORY**: Template system for common report types
- **MANDATORY**: Auto-save functionality every 30 seconds
- **MANDATORY**: Version control for report revisions
- **FORBIDDEN**: Report editing by operators

### 5.2 PDF Export Requirements
- **MANDATORY**: Include patient information (name, ID, DOB)
- **MANDATORY**: Include study date and modality
- **MANDATORY**: Include report author (Doctor's Name/ID) and creation date
- **MANDATORY**: Include StudyID in the PDF.
- **MANDATORY**: Include institution branding and letterhead (e.g., "Klinika Pro").
- **MANDATORY**: Include Doctor's signature (can be text or placeholder for a digital one).
- **MANDATORY**: Digital signature for PDF authenticity (if deemed necessary and implemented).
- **MANDATORY**: Embed relevant DICOM images in report (if technically feasible and required by workflow).

### 5.3 Report Storage
- **MANDATORY**: Store reports in structured format (JSON + HTML)
- **MANDATORY**: Link reports to DICOM studies via Study Instance UID
- **MANDATORY**: Backup reports to external storage daily
- **MANDATORY**: Audit trail for all report modifications

## 6. DATA MANAGEMENT RULES

### 6.1 Patient Data
- **MANDATORY**: Use only real patient data (no mock data)
- **MANDATORY**: Comply with HIPAA/GDPR regulations
- **MANDATORY**: Implement data anonymization tools
- **MANDATORY**: Patient consent tracking system
- **FORBIDDEN**: Test data in production environment

### 6.2 Study Management
- **MANDATORY**: Automatic DICOM validation on upload
- **MANDATORY**: Duplicate study detection and handling
- **MANDATORY**: Study priority levels (urgent, routine, stat)
- **MANDATORY**: Automatic study routing based on modality
- **MANDATORY**: Test data (e.g., CT, MRI, US, video) should be available in a structured directory like `orthanc/dicom-test-data/` for development and testing.

### 6.3 Backup & Recovery
- **MANDATORY**: Daily incremental backups
- **MANDATORY**: Weekly full backups
- **MANDATORY**: Monthly backup verification tests
- **MANDATORY**: Documented disaster recovery procedures
- **MANDATORY**: RTO ≤ 4 hours, RPO ≤ 1 hour

## 7. DEPLOYMENT RULES

### 7.1 Environment Management
- **MANDATORY**: Separate environments: development, staging, production
- **MANDATORY**: Environment-specific configuration files
- **MANDATORY**: Automated deployment pipelines
- **FORBIDDEN**: Manual configuration changes in production

### 7.2 Service Management
- **MANDATORY**: Automated service dependency resolution
- **MANDATORY**: Graceful shutdown procedures
- **MANDATORY**: Service restart policies (unless-stopped)
- **MANDATORY**: Resource limits for all containers

### 7.3 Monitoring & Logging
- **MANDATORY**: Centralized logging with ELK stack or similar
- **MANDATORY**: Application performance monitoring
- **MANDATORY**: Health check endpoints for all services
- **MANDATORY**: Alert system for critical failures
- **MANDATORY**: Log retention policy (90 days minimum)

## 8. PERFORMANCE RULES

### 8.1 Response Time Requirements
- **MANDATORY**: OHIF viewer load time ≤ 3 seconds
- **MANDATORY**: DICOM image rendering ≤ 2 seconds
- **MANDATORY**: API response time ≤ 500ms (95th percentile)
- **MANDATORY**: Report PDF generation ≤ 10 seconds

### 8.2 Scalability Rules
- **MANDATORY**: Horizontal scaling capability for OHIF
- **MANDATORY**: Load balancing for multiple OHIF instances
- **MANDATORY**: Caching strategy for frequently accessed studies
- **MANDATORY**: Database connection pooling

## 9. DEVELOPMENT RULES

### 9.1 Code Quality
- **MANDATORY**: ESLint and Prettier for JavaScript/TypeScript
- **MANDATORY**: Code coverage ≥ 80% for critical components
- **MANDATORY**: Documentation for all public APIs
- **MANDATORY**: Git commit message conventions
- **FORBIDDEN**: Committing secrets or credentials

### 9.2 Testing Rules
- **MANDATORY**: Unit tests for all business logic
- **MANDATORY**: Integration tests for API endpoints
- **MANDATORY**: End-to-end tests for critical workflows, including report generation and role-based access to the "Doctor's Report" tab.
- **MANDATORY**: Load testing before production deployment
- **MANDATORY**: An `upload.sh` script or similar mechanism should exist to automatically load test DICOM files from `orthanc/dicom-test-data/` into Orthanc upon system startup during development/testing.

### 9.3 Configuration Management
- **MANDATORY**: Environment variables for all configuration
- **MANDATORY**: Configuration validation on startup
- **MANDATORY**: Secrets management with Docker secrets or vault
- **FORBIDDEN**: Hardcoded configuration values

## 10. MAINTENANCE RULES

### 10.1 Updates & Patches
- **MANDATORY**: Monthly security updates
- **MANDATORY**: Quarterly feature updates
- **MANDATORY**: Test all updates in staging first
- **MANDATORY**: Rollback procedures for failed updates

### 10.2 Data Cleanup
- **MANDATORY**: Automated cleanup of temporary files
- **MANDATORY**: Log rotation and cleanup
- **MANDATORY**: Old session cleanup
- **MANDATORY**: Orphaned file detection and removal

## 11. COMPLIANCE RULES

### 11.1 Medical Compliance
- **MANDATORY**: DICOM conformance statement
- **MANDATORY**: HL7 FHIR compatibility where applicable
- **MANDATORY**: Medical device classification compliance
- **MANDATORY**: Clinical workflow validation

### 11.2 Audit Requirements
- **MANDATORY**: Complete audit trail for all patient data access
- **MANDATORY**: User action logging with timestamps
- **MANDATORY**: System event logging
- **MANDATORY**: Audit log integrity protection

---

## EMERGENCY PROCEDURES

### Port Conflict Resolution
```bash
# Kill processes on required ports
sudo lsof -ti:443 | xargs kill -9
sudo lsof -ti:8042 | xargs kill -9
sudo lsof -ti:3000 | xargs kill -9
```

### Service Recovery
1. Check docker-compose logs
2. Verify volume mounts
3. Check network connectivity
4. Restart in dependency order: postgres → orthanc → ohif → nginx

### Data Recovery
1. Stop all services
2. Restore from latest backup
3. Verify data integrity
4. Restart services
5. Validate functionality

---

**Last Updated**: $(date)
**Version**: 1.0
**Review Schedule**: Monthly 