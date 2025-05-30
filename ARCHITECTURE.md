# 🏗️ Klinika Pro PACS - System Architecture

## 🎯 Architecture Overview

Klinika Pro PACS follows a microservices architecture with containerized components, ensuring scalability, maintainability, and security for medical imaging workflows.

---

## 🔄 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        INTERNET                             │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS/SSL (Port 443)
                       │ HTTP Redirect (Port 80)
┌──────────────────────▼──────────────────────────────────────┐
│                 NGINX REVERSE PROXY                         │
│           (SSL Termination & Load Balancing)               │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐  │
└──┤  Security   │   Routing   │   CORS      │   Caching   ├──┘
   │  Headers    │   Rules     │   Policy    │   Strategy  │
   └─────────────┴─────────────┴─────────────┴─────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼───┐    ┌─────▼────┐    ┌────▼────────┐
   │ OHIF   │    │  Flask   │    │   Orthanc   │
   │Viewer  │    │  Auth    │    │   DICOM     │
   │        │    │ Service  │    │   Server    │
   │Port 80 │    │Port 5000 │    │ Port 8042   │
   └────────┘    └──────────┘    └─────────────┘
                                        │
                                 ┌──────▼──────┐
                                 │ PostgreSQL  │
                                 │  Database   │
                                 │ Port 5432   │
                                 └─────────────┘
```

---

## 🧩 Component Architecture

### 1. **Frontend Layer**

```
┌──────────────────────────────────────────────────────────┐
│                    OHIF VIEWER                           │
├──────────────────────────────────────────────────────────┤
│  React Components    │  Medical Imaging Engine          │
│  - Study Browser     │  - DICOM Rendering               │
│  - Viewport Manager  │  - MPR Reconstruction            │
│  - Tool Manager      │  - 3D Volume Rendering           │
│  - UI Components     │  - Image Processing              │
├──────────────────────────────────────────────────────────┤
│                Custom Extensions                         │
│  - Doctor Report System (customizations.js)             │
│  - Multilingual Support (5 languages)                   │
│  - Account Management Interface                          │
│  - PDF Export Functionality                             │
│  - Role-Based UI Controls                               │
└──────────────────────────────────────────────────────────┘
```

### 2. **Authentication Layer**

```
┌──────────────────────────────────────────────────────────┐
│                 FLASK AUTH SERVICE                       │
├──────────────────────────────────────────────────────────┤
│  Authentication      │  Authorization                    │
│  - JWT Token Mgmt    │  - Role-Based Access Control     │
│  - Session Handling  │  - Permission Validation         │
│  - User Management   │  - Audit Logging                 │
│  - Password Policy   │  - Orthanc Integration           │
├──────────────────────────────────────────────────────────┤
│                    User Roles                            │
│  Admin: Full Access  │  Doctor: Reports+View            │
│  Operator: Upload+View │  Custom: Configurable          │
└──────────────────────────────────────────────────────────┘
```

### 3. **DICOM Backend Layer**

```
┌──────────────────────────────────────────────────────────┐
│                 ORTHANC DICOM SERVER                     │
├──────────────────────────────────────────────────────────┤
│  DICOM Core          │  DICOMweb APIs                    │
│  - C-STORE SCP       │  - QIDO-RS (Query)              │
│  - C-FIND SCP        │  - WADO-RS (Retrieve)           │
│  - C-MOVE SCP        │  - STOW-RS (Store)              │
│  - Storage Classes   │  - REST Endpoints                │
├──────────────────────────────────────────────────────────┤
│  Plugins             │  Database Integration            │
│  - Authorization     │  - PostgreSQL Backend           │
│  - DICOMweb         │  - Metadata Indexing            │
│  - Compression      │  - Full-Text Search              │
│  - Auto-routing     │  - Performance Optimization      │
└──────────────────────────────────────────────────────────┘
```

### 4. **Data Persistence Layer**

```
┌──────────────────────────────────────────────────────────┐
│                 POSTGRESQL DATABASE                      │
├──────────────────────────────────────────────────────────┤
│  DICOM Metadata     │  User Management                  │
│  - Studies Table    │  - Users Table                    │
│  - Series Table     │  - Sessions Table                 │
│  - Instances Table  │  - Audit Logs Table              │
│  - Patient Table    │  - Roles & Permissions           │
├──────────────────────────────────────────────────────────┤
│  File Storage       │  Performance Features            │
│  - DICOM Files      │  - Connection Pooling            │
│  - Compressed Data  │  - Query Optimization            │
│  - Backup Strategy  │  - Index Management              │
│  - Volume Mounts    │  - ACID Compliance               │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### 1. **User Authentication Flow**

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ Browser │    │  Nginx  │    │  Flask  │    │Database │
└────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘
     │              │              │              │
     │ POST /login  │              │              │
     ├─────────────▶│              │              │
     │              │ Forward      │              │
     │              ├─────────────▶│              │
     │              │              │ Validate     │
     │              │              ├─────────────▶│
     │              │              │              │
     │              │              │◀─────────────┤
     │              │              │ Generate JWT │
     │              │◀─────────────┤              │
     │              │              │              │
     │◀─────────────┤              │              │
     │ JWT Token    │              │              │
     │              │              │              │
```

### 2. **DICOM Study Access Flow**

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  OHIF   │    │  Nginx  │    │ Orthanc │    │Database │
└────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘
     │              │              │              │
     │ GET /studies │              │              │
     ├─────────────▶│              │              │
     │              │ Auth Check   │              │
     │              │ + Forward    │              │
     │              ├─────────────▶│              │
     │              │              │ Query Meta   │
     │              │              ├─────────────▶│
     │              │              │              │
     │              │              │◀─────────────┤
     │              │              │ Return JSON  │
     │              │◀─────────────┤              │
     │              │              │              │
     │◀─────────────┤              │              │
     │ Study List   │              │              │
     │              │              │              │
```

### 3. **Report Creation Flow**

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ Doctor  │    │  OHIF   │    │ Browser │    │ Storage │
│Interface│    │Viewer   │    │LocalStor│    │ (PDF)   │
└────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘
     │              │              │              │
     │ Create Report│              │              │
     ├─────────────▶│              │              │
     │              │ Fetch Patient│              │
     │              │ Data         │              │
     │              ├─────────────▶│              │
     │              │              │              │
     │              │◀─────────────┤              │
     │              │ Save Report  │              │
     │              ├─────────────▶│              │
     │              │              │              │
     │ Export PDF   │              │              │
     ├─────────────▶│              │              │
     │              │ Generate PDF │              │
     │              ├─────────────────────────────▶│
     │              │              │              │
     │◀─────────────┴──────────────┴──────────────┤
     │                    PDF Download             │
     │                                            │
```

---

## 🔒 Security Architecture

### Network Security
```
┌─────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                      │
├─────────────────────────────────────────────────────────┤
│ Layer 1: Network    │ TLS 1.3 Encryption               │
│                     │ SSL Certificate Management       │
│                     │ HTTPS Enforcement (301 Redirect) │
├─────────────────────────────────────────────────────────┤
│ Layer 2: Proxy      │ Security Headers (HSTS, CSP)     │
│                     │ Rate Limiting                     │
│                     │ Request Filtering                 │
├─────────────────────────────────────────────────────────┤
│ Layer 3: Application│ JWT Authentication                │
│                     │ Role-Based Access Control        │
│                     │ Session Management                │
├─────────────────────────────────────────────────────────┤
│ Layer 4: Data       │ Database Encryption               │
│                     │ Audit Logging                     │
│                     │ Backup Encryption                 │
└─────────────────────────────────────────────────────────┘
```

### Authentication Flow
```
┌─────────────────────────────────────────────────────────┐
│                 RBAC IMPLEMENTATION                     │
├─────────────────────────────────────────────────────────┤
│  Role: ADMIN        │  Permissions:                     │
│  ├─ User Management │  - Create/Delete Users            │
│  ├─ System Config   │  - Modify System Settings        │
│  ├─ Full DICOM      │  - All DICOM Operations          │
│  └─ All Reports     │  - Create/Edit/Delete Reports     │
├─────────────────────────────────────────────────────────┤
│  Role: DOCTOR       │  Permissions:                     │
│  ├─ Patient Data    │  - View Patient Information       │
│  ├─ Study Access    │  - View/Download Studies          │
│  ├─ Report System   │  - Create/Edit/Export Reports     │
│  └─ Measurements    │  - Add Annotations & Measurements │
├─────────────────────────────────────────────────────────┤
│  Role: OPERATOR     │  Permissions:                     │
│  ├─ Study Upload    │  - Upload DICOM Files            │
│  ├─ Basic Viewing   │  - View Studies (Read-Only)      │
│  ├─ Patient Info    │  - View Patient Data              │
│  └─ Limited Access  │  - No Report Creation/Editing    │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Performance Architecture

### Caching Strategy
```
┌─────────────────────────────────────────────────────────┐
│                   CACHING LAYERS                        │
├─────────────────────────────────────────────────────────┤
│ Browser Cache      │ Static Assets (JS, CSS, Images)   │
│ TTL: 1 hour        │ OHIF Viewer Components            │
├─────────────────────────────────────────────────────────┤
│ Application Cache  │ Study Metadata (5 min TTL)        │
│ Location: Memory   │ Patient Information               │
│                    │ Language Preferences              │
├─────────────────────────────────────────────────────────┤
│ Database Cache     │ Query Result Caching              │
│ PostgreSQL Buffer  │ Connection Pooling                │
│                    │ Index Optimization                │
├─────────────────────────────────────────────────────────┤
│ Nginx Cache        │ Proxy Response Caching            │
│ Static Files       │ Gzip Compression                  │
│                    │ Asset Minification                │
└─────────────────────────────────────────────────────────┘
```

### Load Distribution
```
┌─────────────────────────────────────────────────────────┐
│                LOAD BALANCING STRATEGY                  │
├─────────────────────────────────────────────────────────┤
│ Nginx Proxy        │ Round-Robin Distribution          │
│                    │ Health Check Monitoring           │
│                    │ Failover Handling                 │
├─────────────────────────────────────────────────────────┤
│ Service Scaling    │ Horizontal OHIF Scaling          │
│                    │ Database Connection Pooling       │
│                    │ Orthanc Instance Management       │
├─────────────────────────────────────────────────────────┤
│ Resource Limits    │ Container Memory Limits           │
│                    │ CPU Allocation                    │
│                    │ Storage I/O Optimization          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Deployment Architecture

### Container Orchestration
```
┌─────────────────────────────────────────────────────────┐
│                DOCKER COMPOSE STACK                     │
├─────────────────────────────────────────────────────────┤
│ Networks:          │ Volumes:                          │
│ ├─ default         │ ├─ orthanc_data (DICOM files)     │
│ ├─ backend         │ ├─ postgres_data (DB files)       │
│ └─ frontend        │ ├─ flask_data (User DB)           │
│                    │ └─ nginx_logs (Access logs)       │
├─────────────────────────────────────────────────────────┤
│ Health Checks:     │ Restart Policies:                 │
│ ├─ HTTP endpoints  │ ├─ unless-stopped                 │
│ ├─ Database conn   │ ├─ on-failure (max 3)            │
│ └─ Service status  │ └─ always (critical services)     │
└─────────────────────────────────────────────────────────┘
```

### Environment Configuration
```
┌─────────────────────────────────────────────────────────┐
│              ENVIRONMENT MANAGEMENT                     │
├─────────────────────────────────────────────────────────┤
│ Development:       │ Production:                       │
│ ├─ SQLite DB       │ ├─ PostgreSQL DB                  │
│ ├─ Debug Logging   │ ├─ Error Logging Only             │
│ ├─ Auto-reload     │ ├─ Performance Optimized          │
│ └─ Test Data       │ └─ Security Hardened              │
├─────────────────────────────────────────────────────────┤
│ Configuration:     │ Secrets Management:               │
│ ├─ Environment Vars│ ├─ Docker Secrets                 │
│ ├─ Config Files    │ ├─ SSL Certificates               │
│ └─ Docker Compose  │ └─ Database Credentials           │
└─────────────────────────────────────────────────────────┘
```

---

## 📈 Monitoring & Logging

### System Monitoring
```
┌─────────────────────────────────────────────────────────┐
│                 MONITORING STACK                        │
├─────────────────────────────────────────────────────────┤
│ Container Health:  │ Application Metrics:              │
│ ├─ Docker Stats    │ ├─ Response Times                 │
│ ├─ Memory Usage    │ ├─ Error Rates                    │
│ ├─ CPU Utilization │ ├─ User Sessions                  │
│ └─ Disk I/O        │ └─ DICOM Transfer Rates           │
├─────────────────────────────────────────────────────────┤
│ Log Aggregation:   │ Alerting:                         │
│ ├─ Centralized     │ ├─ Health Check Failures         │
│ ├─ Structured      │ ├─ High Error Rates               │
│ ├─ Searchable      │ ├─ Resource Exhaustion            │
│ └─ Retention Policy│ └─ Security Events                │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Integration Points

### External System Integration
```
┌─────────────────────────────────────────────────────────┐
│               INTEGRATION ARCHITECTURE                  │
├─────────────────────────────────────────────────────────┤
│ DICOM Devices:     │ HL7 Systems:                      │
│ ├─ Modalities      │ ├─ HIS Integration                │
│ ├─ PACS Systems    │ ├─ EMR Connectivity               │
│ ├─ Workstations    │ ├─ Laboratory Systems             │
│ └─ Mobile Devices  │ └─ Billing Systems                │
├─────────────────────────────────────────────────────────┤
│ API Endpoints:     │ Data Exchange:                    │
│ ├─ RESTful APIs    │ ├─ DICOMweb Protocol              │
│ ├─ Authentication  │ ├─ HL7 FHIR (Future)             │
│ ├─ User Management │ ├─ PDF Export                     │
│ └─ Report System   │ └─ Backup/Restore                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Quality Attributes

### Performance Requirements
- **Response Time**: < 3s page load, < 2s image rendering
- **Throughput**: 100+ concurrent users, 1000+ studies/day
- **Scalability**: Horizontal scaling for OHIF instances
- **Availability**: 99.9% uptime target

### Security Requirements
- **Authentication**: Multi-factor authentication support
- **Authorization**: Granular role-based permissions
- **Encryption**: Data at rest and in transit
- **Compliance**: HIPAA/GDPR considerations

### Reliability Requirements
- **Backup**: Daily automated backups with verification
- **Recovery**: RTO ≤ 4 hours, RPO ≤ 1 hour
- **Fault Tolerance**: Graceful degradation on component failure
- **Monitoring**: Real-time health monitoring and alerting

---

**Document Version**: 1.0  
**Author**: Tim Hunt (tr00x)  
**Last Updated**: December 2024  
**Review Cycle**: Quarterly 