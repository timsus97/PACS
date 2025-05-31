# 🏥 Clinton Medical PACS - Quick Start Guide

## 🚀 Quick Setup

### Prerequisites
- Docker & Docker Compose
- 8GB+ RAM
- 100GB+ free disk space

### 1. Clone & Start
```bash
git clone https://github.com/timsus97/PACS.git
cd PACS
docker-compose up -d
```

### 2. Access System
- **Main Application**: https://localhost
- **Login Page**: https://localhost/login

### 3. Default Credentials
```
Admin:    admin / admin
Doctor:   doctor / doctor  
Operator: operator / operator
```

## 🏗️ Architecture Overview

```
Internet → Nginx Proxy → OHIF Viewer
                      → Flask Auth API
                      → Orthanc DICOM Server → PostgreSQL
```

## 📋 Key Features

✅ **Medical Imaging**: DICOM viewer with MPR, 3D rendering  
✅ **Role-Based Access**: Admin, Doctor, Operator roles  
✅ **Multilingual**: English, Russian, Spanish, French, German  
✅ **Report System**: Create, edit, export PDF reports  
✅ **Security**: JWT auth, SSL/TLS, audit logging  
✅ **Standards**: DICOM 3.0, DICOMweb compliant  

## 🛠️ Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | OHIF Viewer v3 + React | Medical imaging interface |
| Backend | Orthanc DICOM Server | Medical data storage |
| Auth | Flask + Python | User management & RBAC |
| Database | PostgreSQL 15 | Data persistence |
| Proxy | Nginx | SSL termination & routing |
| Container | Docker Compose | Service orchestration |

## 📁 Project Structure

```
PACS/
├── config/
│   ├── ohif/              # OHIF configuration & customizations
│   ├── nginx/             # Reverse proxy configuration  
│   ├── orthanc/           # DICOM server settings
│   └── ssl/               # SSL certificates
├── flask_auth_service/    # Python authentication service
├── screenshots/           # System screenshots
├── docker-compose.yml     # Container orchestration
├── TECH_STACK.md         # Detailed technology documentation
└── README_QUICK_START.md # This file
```

## 🔑 Key Services

### OHIF Viewer (Port 3000)
- Medical imaging interface
- Custom doctor report system (1900+ lines JS)
- Multilingual support
- Role-based UI elements

### Orthanc DICOM (Port 8042)
- DICOM 3.0 compliant server
- DICOMweb REST APIs
- PostgreSQL backend
- Authorization plugin integration

### Flask Auth (Port 5001)
- JWT token authentication
- Role-based access control
- User management API
- Session handling

### Nginx Proxy (Port 443/80)
- SSL termination
- Route management  
- Security headers
- CORS handling

## 🧪 Development

### Add Test Data
```bash
./upload.sh                    # Upload sample DICOM files
./download_test_dicom.sh       # Download test datasets
```

### Logs & Debugging
```bash
docker-compose logs -f ohif_viewer    # OHIF logs
docker-compose logs -f orthanc        # DICOM server logs  
docker-compose logs -f flask_auth_service  # Auth logs
```

### Database Access
```bash
# PostgreSQL access
docker-compose exec db_pacs psql -U postgres -d orthanc

# User management
docker-compose exec flask_auth_service python create_admin_user.py
```

## 🔧 Configuration

### Environment Variables
- Check `docker-compose.yml` for configurable options
- SSL certificates in `config/ssl/`
- Authentication settings in Flask service

### Customization
- OHIF interface: `config/ohif/customizations.js`
- Translations: Embedded in customizations.js
- Routing: `config/nginx/nginx.conf`

## 📋 Common Tasks

### Reset Admin Password
```bash
docker-compose exec flask_auth_service python create_admin_user.py
```

### Backup System
```bash
./backup.sh    # Creates full system backup
```

### Update Configuration
```bash
# After config changes
docker-compose restart ohif_viewer
docker-compose restart nginx
```

## 🆘 Troubleshooting

### Port Conflicts
```bash
sudo lsof -ti:443 | xargs kill -9  # Kill process on port 443
sudo lsof -ti:80 | xargs kill -9   # Kill process on port 80
```

### Container Issues
```bash
docker-compose down --volumes    # Full reset
docker-compose up -d            # Restart all services
```

### Authentication Problems
```bash
# Clear browser data and restart auth service
docker-compose restart flask_auth_service
```

## 📞 Support

For detailed documentation see: **TECH_STACK.md**

### Contacts:
- **Author**: Tim Hunt (tr00x)  
- **GitHub**: [Issues](https://github.com/timsus97/PACS/issues)
- **Email**: tavci57@gmail.com
- **Telegram**: @tr00x

---

**Project**: Clinton Medical PACS v1.0  
**Author**: Tim Hunt (tr00x)  
**Updated**: December 2024  
**License**: MIT License 