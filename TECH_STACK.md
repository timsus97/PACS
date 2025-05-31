# Clinton Medical PACS - Technology Stack

## 📋 **Overview**

**Clinton Medical PACS** is a comprehensive Picture Archiving and Communication System (PACS) built for medical institutions to manage, view, and report on medical imaging studies. The system provides role-based access control, multilingual support, and comprehensive doctor reporting functionality.

---

## 🐳 **Container Architecture**

### Docker & Docker Compose
- **Technology**: Docker, Docker Compose
- **Purpose**: Containerization and orchestration of all services
- **Configuration**: `docker-compose.yml`
- **Benefits**: 
  - Isolated environments for each service
  - Easy deployment and scaling
  - Consistent development/production environments
  - Automated service dependency management

### Container Services:
1. **OHIF Viewer** (`pacs_ohif_viewer`)
2. **Orthanc DICOM Server** (`pacs_orthanc`) 
3. **PostgreSQL Database** (`pacs_db`)
4. **Flask Authentication Service** (`pacs_flask_auth`)
5. **Nginx Reverse Proxy** (`pacs_nginx_proxy`)

---

## 🌐 **Frontend Technologies**

### OHIF Viewer v3.x
- **Technology**: OHIF (Open Health Imaging Foundation) Viewer
- **Purpose**: Medical imaging viewer for DICOM files
- **Language**: JavaScript, React
- **Features**:
  - Multi-planar reconstruction (MPR)
  - 3D volume rendering
  - Measurement tools and annotations
  - Viewport synchronization
  - Study/series navigation
  - Hanging protocols

### Web Technologies
- **HTML5**: Modern markup for medical interfaces
- **CSS3**: Responsive design with medical-grade UI
- **JavaScript ES6+**: Advanced interactions and customizations
- **React**: Component-based UI framework (via OHIF)

### Custom Enhancements
- **File**: `config/ohif/customizations.js` (1,900+ lines)
- **Features**:
  - Multilingual doctor report system (5 languages)
  - Role-based access control integration
  - Real-time patient data fetching
  - PDF export functionality
  - Account management interface
  - Language auto-detection and switching

---

## 🏥 **Backend Technologies**

### Orthanc DICOM Server v24.10.1
- **Technology**: Orthanc by Osimis
- **Purpose**: DICOM server for medical image storage and retrieval
- **Language**: C++
- **Database**: PostgreSQL (production), SQLite (development)
- **Plugins**:
  - DICOMweb plugin (RESTful DICOM access)
  - Authorization plugin (RBAC integration)
  - PostgreSQL plugin (enterprise database)
  - Compression plugin (storage optimization)
- **Standards**: DICOM 3.0, DICOMweb (QIDO-RS, WADO-RS, STOW-RS)

### Flask Authentication Service
- **Technology**: Flask (Python web framework)
- **Purpose**: User authentication, authorization, and role management
- **Language**: Python 3.9+
- **Features**:
  - JWT token-based authentication
  - Role-based access control (RBAC)
  - User management (admin, doctor, operator roles)
  - Session management with expiration
  - Audit logging for compliance
  - RESTful API endpoints

#### Dependencies:
```python
Flask==2.3.3
Flask-SQLAlchemy==3.0.5
PyJWT==2.8.0
Werkzeug==2.3.7
```

---

## 🗄️ **Database Technologies**

### PostgreSQL 15 Alpine
- **Technology**: PostgreSQL 15
- **Purpose**: Primary database for Orthanc and user management
- **Configuration**: Docker volume persistence
- **Features**:
  - ACID compliance
  - Advanced indexing for DICOM metadata
  - Backup and recovery capabilities
  - Connection pooling
  - Performance optimization for medical data

### SQLite (Development)
- **Technology**: SQLite
- **Purpose**: Development and testing database
- **Use Case**: Flask authentication service local development

---

## 🔒 **Security & Authentication**

### SSL/TLS Encryption
- **Technology**: TLS 1.3, SSL certificates
- **Implementation**: Nginx with custom certificates
- **Purpose**: Secure HTTPS communication
- **Configuration**: `config/ssl/`

### JWT Authentication
- **Technology**: JSON Web Tokens (JWT)
- **Algorithm**: HS256
- **Expiration**: 
  - Doctors/Operators: 8 hours
  - Administrators: 24 hours
- **Features**: Role-based claims, automatic expiration

### Role-Based Access Control (RBAC)
- **Roles**: 
  - `admin`: Full system access
  - `doctor`: Patient data, report creation/editing, PDF export
  - `operator`: Data upload, basic viewing (no report editing)
- **Implementation**: Flask middleware with Orthanc integration

---

## 🌍 **Networking & Proxy**

### Nginx 1.25 Alpine
- **Technology**: Nginx reverse proxy
- **Purpose**: Load balancing, SSL termination, static file serving
- **Configuration**: `config/nginx/nginx.conf`
- **Features**:
  - HTTPS/HTTP redirect (301)
  - CORS headers for DICOMweb
  - Security headers (HSTS, CSP, X-Frame-Options)
  - Gzip compression
  - Static asset caching
  - Health check endpoints

### Port Configuration
- **External Ports**:
  - 443 (HTTPS) - Main application access
  - 80 (HTTP) - Redirect to HTTPS
  - 8042 (Direct Orthanc access - development only)
  - 5001 (Flask auth service - development only)

- **Internal Container Ports**:
  - OHIF: 80, 8080
  - Orthanc: 8042, 4242
  - PostgreSQL: 5432
  - Flask: 5000

---

## 📊 **Data Management**

### DICOM Standards
- **Standard**: DICOM 3.0 (Digital Imaging and Communications in Medicine)
- **Web Standards**: DICOMweb (QIDO-RS, WADO-RS, STOW-RS)
- **Formats**: DCM, JPEG, PNG image exports
- **Metadata**: Patient information, study data, series information

### File Storage
- **Structure**: Docker named volumes
- **Persistence**: 
  - `orthanc_data`: DICOM studies and metadata
  - `postgres_data`: Database files
  - `flask_data`: User database and sessions
- **Backup**: Automated daily backups via `backup.sh`

---

## 🌐 **Internationalization (i18n)**

### Multilingual Support
- **Languages**: English, Russian, Spanish, French, German
- **Implementation**: Custom translation system
- **Features**:
  - Auto-detection from OHIF interface
  - Manual language selection
  - Localized date/time formatting
  - Translated PDF reports
  - Role names in multiple languages

### Translation Files
- **Location**: Embedded in `customizations.js`
- **Format**: JavaScript objects with nested translations
- **Scope**: UI elements, messages, PDF content, user roles

---

## 📄 **Document Generation**

### PDF Reports
- **Technology**: Browser print API, jsPDF integration
- **Features**:
  - Patient information headers
  - Study metadata inclusion
  - Doctor signature fields
  - Clinic branding
  - Multilingual content
  - Print-optimized formatting

---

## 🛠️ **Development & Deployment**

### Development Tools
- **Docker**: Local development environment
- **Scripts**: 
  - `upload.sh`: Test data upload
  - `backup.sh`: Data backup automation
  - `download_test_dicom.sh`: Sample data download

### Testing Data
- **Location**: `orthanc/dicom-test-data/`
- **Types**: CT, MRI, Ultrasound, X-Ray samples
- **Purpose**: Development and testing workflows

### Configuration Management
- **Environment Variables**: Docker Compose `.env` files
- **Secrets**: Docker secrets for sensitive data
- **Configuration Files**: 
  - `config/ohif/app-config.js` - OHIF configuration
  - `config/nginx/nginx.conf` - Proxy settings
  - `config/orthanc/orthanc.json` - DICOM server settings

---

## 📈 **Performance & Monitoring**

### Caching Strategy
- **Browser Caching**: Static assets with cache headers
- **Application Caching**: Study metadata caching (5-minute TTL)
- **Database**: Connection pooling and query optimization

### Health Checks
- **Docker Health Checks**: All containers have health endpoints
- **Application Monitoring**: `/health` endpoints for each service
- **Log Management**: Centralized logging with rotation

### Performance Targets
- **OHIF Load Time**: ≤ 3 seconds
- **DICOM Rendering**: ≤ 2 seconds
- **API Response**: ≤ 500ms (95th percentile)
- **PDF Generation**: ≤ 10 seconds

---

## 🔧 **Infrastructure Requirements**

### System Requirements
- **OS**: Linux, macOS, Windows (with Docker)
- **RAM**: Minimum 8GB, Recommended 16GB+
- **Storage**: Minimum 100GB for DICOM data
- **Network**: 1Gbps for optimal DICOM transfer

### Hardware Compatibility
- **GPU**: Optional for advanced rendering
- **CPU**: Multi-core recommended for concurrent users
- **Network**: Ethernet preferred for stability

---

## 📚 **Documentation & Standards**

### Medical Standards Compliance
- **DICOM**: Full DICOM 3.0 conformance
- **HL7 FHIR**: Compatible where applicable
- **Security**: HIPAA/GDPR considerations
- **Audit**: Complete audit trail implementation

### Code Quality
- **Linting**: ESLint for JavaScript
- **Testing**: Unit and integration tests
- **Documentation**: Inline comments and README files
- **Version Control**: Git with conventional commits

---

## 🚀 **Deployment Architecture**

```
┌─────────────────────────────────────────────┐
│                 Internet                    │
└──────────────────┬──────────────────────────┘
                   │ HTTPS (443)
┌─────────────────────────────────────────────┐
│            Nginx Reverse Proxy              │
│          (SSL Termination)                  │
└─────────┬───────────────────────────────────┘
          │
    ┌─────┼─────┐
    │     │     │
┌───▼──┐ ┌▼──┐ ┌▼────────┐
│ OHIF │ │Auth│ │ Orthanc │
│Viewer│ │Flask│ │ DICOM   │
└──────┘ └───┘ └─────────┘
                     │
              ┌──────▼──────┐
              │ PostgreSQL  │
              │  Database   │
              └─────────────┘
```

---

## 📋 **Version Information**

| Component | Version | Release Date |
|-----------|---------|--------------|
| OHIF Viewer | 3.x | 2024 |
| Orthanc | 24.10.1 | October 2024 |
| PostgreSQL | 15 Alpine | 2024 |
| Nginx | 1.25 Alpine | 2024 |
| Flask | 2.3.3 | 2024 |
| Docker Compose | 2.x | 2024 |

---

## 🤝 **Contributing & Maintenance**

### Update Schedule
- **Security Updates**: Monthly
- **Feature Updates**: Quarterly
- **Dependency Updates**: As needed
- **DICOM Standard**: Annual review

### Backup Strategy
- **Daily**: Incremental backups
- **Weekly**: Full system backups
- **Monthly**: Archive and verification
- **Recovery**: RTO ≤ 4 hours, RPO ≤ 1 hour

---

**Last Updated**: December 2024  
**Project Version**: 1.0  
**Author**: Tim Hunt (tr00x)  
**License**: MIT License - Clinton Medical PACS 