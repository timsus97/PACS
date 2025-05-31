# Developer Checklist


Use this checklist before committing code or deploying to ensure all project rules are followed.

## Pre-Commit Checklist

### 🔐 Security (Rules 2.1-2.3)
- [ ] No hardcoded passwords, secrets, or API keys in code
- [ ] All sensitive data stored in environment variables
- [ ] Authentication implemented for all endpoints
- [ ] HTTPS enabled for all communications
- [ ] Security headers configured in Nginx

### 🐳 Docker & Infrastructure (Rules 1.1-1.3, 7.1-7.3)
- [ ] All services containerized with Docker
- [ ] Flask Authorization Service containerized and accessible via Nginx (e.g. /authorize)
- [ ] Health checks configured for all containers
- [ ] Named volumes used for data persistence
- [ ] Resource limits set for all containers
- [ ] Fixed ports used: 8042 (Orthanc), 3000 (OHIF), 443 (HTTPS)
- [ ] Services accessible only through Nginx reverse proxy

### 🏥 Orthanc Configuration (Rules 3.1-3.3)
- [ ] DICOMweb plugin enabled and configured
- [ ] Authorization plugin configured and integrated with Flask service
- [ ] PostgreSQL plugin configured (not SQLite)
- [ ] Compression plugin enabled
- [ ] Storage commitment plugin enabled
- [ ] CORS enabled for OHIF integration
- [ ] Rate limiting implemented (100 req/min per user)
- [ ] API responses include proper HTTP status codes

### 👁️ OHIF Viewer (Rules 4.1-4.3)
- [ ] Custom branding applied (e.g., "Klinika Pro" logo and colors)
- [ ] Russian language support configured (if available)
- [ ] Data sources point to Orthanc DICOMweb
- [ ] "Download" button/features removed or hidden
- [ ] "Doctor's Report" tab implemented as per Rule 4.2:
    - [ ] Rich textarea for input
    - [ ] "Save" button (localStorage)
    - [ ] "Export PDF" button (jsPDF)
    - [ ] PDF includes header, patient info, StudyID, doctor's signature
    - [ ] Tab visible only to `doctor` and `admin` roles
- [ ] Measurement tools and annotations enabled
- [ ] Dark mode set as default theme
- [ ] Responsive design for desktop and tablet
- [ ] Error handling with user-friendly messages

### 📋 Report System (Rules 5.1-5.3)
- [ ] Rich text editor available for doctors/admins only (in "Doctor's Report" tab)
- [ ] Template system implemented for common reports (if applicable beyond basic tab)
- [ ] Auto-save functionality every 30 seconds (for "Doctor's Report" tab)
- [ ] Version control for report revisions (if applicable beyond localStorage)
- [ ] PDF export includes patient info, StudyID, study date, author, and "Klinika Pro" branding
- [ ] PDF export includes doctor's signature (text or placeholder)
- [ ] PDF export includes digital signature (if implemented)
- [ ] Reports linked to DICOM studies via Study Instance UID

### 📊 Data Management (Rules 6.1-6.3)
- [ ] Only real patient data used (no mock data)
- [ ] HIPAA/GDPR compliance measures implemented
- [ ] Data anonymization tools available
- [ ] Test data available in `orthanc/dicom-test-data/` (CT, MRI, US, video)
- [ ] Automatic DICOM validation on upload
- [ ] Backup schedules configured (daily incremental, weekly full)
- [ ] Disaster recovery procedures documented

### ⚡ Performance (Rules 8.1-8.2)
- [ ] OHIF loads in ≤ 3 seconds
- [ ] DICOM rendering in ≤ 2 seconds
- [ ] API responses in ≤ 500ms (95th percentile)
- [ ] Caching strategy implemented
- [ ] Database connection pooling configured

### 🧪 Code Quality (Rules 9.1-9.3)
- [ ] ESLint and Prettier configured and passing
- [ ] Code coverage ≥ 80% for critical components
- [ ] `upload.sh` script created for loading test DICOM data
- [ ] API documentation updated
- [ ] Git commit messages follow conventions
- [ ] No secrets committed to repository
- [ ] Environment variables for all configuration

### 🔄 Testing (Rule 9.2)
- [ ] Unit tests written for business logic
- [ ] Integration tests for API endpoints
- [ ] End-to-end tests for critical workflows (including "Doctor's Report" tab functionality and PDF export)
- [ ] Test DICOM data loaded automatically via `upload.sh` during test environment startup
- [ ] Load testing completed for production deployment

## Pre-Deployment Checklist

### 🚀 Deployment Readiness
- [ ] Run `./scripts/enforce_rules.sh` and address all warnings
- [ ] All tests passing in CI/CD pipeline
- [ ] Environment-specific configurations verified
- [ ] SSL certificates valid and properly configured
- [ ] Backup procedures tested and verified
- [ ] Monitoring and alerting configured

### 🏥 Medical Compliance (Rules 11.1-11.2)
- [ ] DICOM conformance statement updated
- [ ] HL7 FHIR compatibility verified
- [ ] Medical workflow validation completed
- [ ] Audit trail functionality tested
- [ ] User action logging verified

### 🔧 System Checks
- [ ] All required ports available (443, 8042, 3000)
- [ ] Database migrations completed
- [ ] Volume mounts verified
- [ ] Network connectivity tested
- [ ] Service dependencies resolved

## Emergency Procedures

### Port Conflicts
```bash
# Kill processes on required ports
sudo lsof -ti:443 | xargs kill -9
sudo lsof -ti:8042 | xargs kill -9
sudo lsof -ti:3000 | xargs kill -9
```

### Quick System Check
```bash
# Run rule enforcement
./scripts/enforce_rules.sh

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### Rollback Procedure
1. Stop current services: `docker-compose down`
2. Restore previous configuration from git
3. Restore data from backup if needed
4. Start services: `docker-compose up -d`
5. Verify functionality

## Role-Specific Checklist

### 👨‍⚕️ For Doctors
- [ ] Can access patient studies and images
- [ ] Can create and edit reports
- [ ] Can export reports to PDF
- [ ] Cannot access admin functions
- [ ] Session timeout works (30 minutes)

### 👥 For Operators
- [ ] Can upload patient data
- [ ] Can view studies and images
- [ ] Cannot edit reports
- [ ] Cannot access admin functions
- [ ] Session timeout works (30 minutes)

### ⚙️ For Admins
- [ ] Full system access available
- [ ] User management functions work
- [ ] System configuration accessible
- [ ] Audit logs viewable
- [ ] Extended session timeout works (24 hours)

## Weekly Maintenance Checklist

- [ ] Review system logs for errors
- [ ] Check backup integrity
- [ ] Update security patches
- [ ] Review user access and permissions
- [ ] Monitor system performance metrics
- [ ] Test disaster recovery procedures (monthly)

---

**Remember**: Always run `./scripts/enforce_rules.sh` before any deployment!

**Need Help?** Check the [PROJECT_RULES.md](./PROJECT_RULES.md) for detailed rule explanations. 