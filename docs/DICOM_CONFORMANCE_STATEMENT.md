# DICOM Conformance Statement
## Klinika Pro PACS System

### Document Information
- **Product Name**: Klinika Pro PACS
- **Version**: 1.0
- **Date**: 2024
- **Manufacturer**: Klinika Pro Medical Systems

### 1. Introduction

This DICOM Conformance Statement specifies the compliance of Klinika Pro PACS with the DICOM 3.0 standard. It details the supported DICOM services, communication protocols, and information objects.

### 2. Implementation Model

#### 2.1 Application Data Flow Diagram

```
┌─────────────────┐     DICOM      ┌──────────────┐
│ DICOM Modality  │ ──────────────> │              │
│   (CT/MR/US)    │                 │   Orthanc    │
└─────────────────┘                 │    Server    │
                                    │              │
┌─────────────────┐     DICOMweb   │              │     API      ┌──────────────┐
│  OHIF Viewer    │ <─────────────> │              │ <──────────> │ Flask Auth   │
└─────────────────┘                 └──────────────┘              └──────────────┘
```

#### 2.2 Functional Definitions

- **Storage SCP**: Accepts and stores DICOM objects
- **Query/Retrieve SCP**: Provides C-FIND, C-MOVE, C-GET services
- **Storage Commitment SCP**: Ensures data persistence
- **DICOMweb Services**: QIDO-RS, WADO-RS, STOW-RS

### 3. AE Specifications

#### 3.1 Klinika Pro PACS AE

- **AE Title**: KLINIKA_PACS
- **Port**: 4242 (DICOM), 8042 (DICOMweb)
- **Maximum PDU Size**: 16384 bytes
- **Implementation Class UID**: 1.2.826.0.1.3680043.8.498.12345678.1.0
- **Implementation Version**: KLINIKA_PRO_1.0

### 4. Communication Profiles

#### 4.1 Supported Communication Stacks
- TCP/IP
- TLS 1.2/1.3 for secure communication

#### 4.2 Physical Media Support
- Network Standard: Ethernet 100/1000 Mbps

### 5. Extensions/Specializations/Privatizations

#### 5.1 Standard Extended/Specialized/Private SOPs
None

#### 5.2 Private Transfer Syntaxes
None

### 6. Configuration

#### 6.1 AE Title/Presentation Address Mapping
```
AE Title: KLINIKA_PACS
IP Address: Configurable
Port: 4242 (DICOM), 8042 (DICOMweb)
```

#### 6.2 Configurable Parameters
- Maximum number of associations: 50
- Association timeout: 30 seconds
- Storage commitment timeout: 600 seconds

### 7. Support of Extended Character Sets

Supported character sets:
- ISO_IR 100 (Latin-1)
- ISO_IR 144 (Cyrillic)
- ISO_IR 192 (UTF-8)

### 8. Codes and Controlled Terminology

Supports standard DICOM codes and terminology as defined in PS3.16.

### 9. Security Profiles

#### 9.1 Security Measures
- TLS 1.2/1.3 encryption
- User authentication via OAuth 2.0
- Role-based access control (RBAC)
- Audit trail logging per DICOM Supplement 95

#### 9.2 Association Level Security
- Secure Transport Connection Profile
- Basic Digital Signature Profile

### 10. Annexes

#### 10.1 IOD Contents

##### 10.1.1 Created SOP Instances
None (PACS is storage only)

##### 10.1.2 Supported Storage SOP Classes

| SOP Class Name | SOP Class UID |
|----------------|---------------|
| Computed Radiography Image Storage | 1.2.840.10008.5.1.4.1.1.1 |
| Digital X-Ray Image Storage | 1.2.840.10008.5.1.4.1.1.1.1 |
| CT Image Storage | 1.2.840.10008.5.1.4.1.1.2 |
| Enhanced CT Image Storage | 1.2.840.10008.5.1.4.1.1.2.1 |
| MR Image Storage | 1.2.840.10008.5.1.4.1.1.4 |
| Enhanced MR Image Storage | 1.2.840.10008.5.1.4.1.1.4.1 |
| Ultrasound Image Storage | 1.2.840.10008.5.1.4.1.1.6.1 |
| Secondary Capture Image Storage | 1.2.840.10008.5.1.4.1.1.7 |
| X-Ray Angiographic Image Storage | 1.2.840.10008.5.1.4.1.1.12.1 |
| X-Ray Radiofluoroscopic Image Storage | 1.2.840.10008.5.1.4.1.1.12.2 |
| Nuclear Medicine Image Storage | 1.2.840.10008.5.1.4.1.1.20 |
| Positron Emission Tomography Image Storage | 1.2.840.10008.5.1.4.1.1.128 |
| RT Image Storage | 1.2.840.10008.5.1.4.1.1.481.1 |
| RT Dose Storage | 1.2.840.10008.5.1.4.1.1.481.2 |
| RT Structure Set Storage | 1.2.840.10008.5.1.4.1.1.481.3 |
| Digital Mammography X-Ray Image Storage | 1.2.840.10008.5.1.4.1.1.1.2 |
| Video Endoscopic Image Storage | 1.2.840.10008.5.1.4.1.1.77.1.1.1 |
| Encapsulated PDF Storage | 1.2.840.10008.5.1.4.1.1.104.1 |
| Basic Text SR Storage | 1.2.840.10008.5.1.4.1.1.88.11 |
| Enhanced SR Storage | 1.2.840.10008.5.1.4.1.1.88.22 |
| Comprehensive SR Storage | 1.2.840.10008.5.1.4.1.1.88.33 |

#### 10.2 Data Dictionary

No private data elements defined.

#### 10.3 Grayscale Image Consistency

The system maintains the grayscale consistency of images as received without modification.

#### 10.4 Standard SOP Instance

The system supports all mandatory and conditional attributes as defined in DICOM PS3.3.

### 11. Networking

#### 11.1 Implementation Model

##### 11.1.1 Application Data Flow
```
Remote AE → Association Request → KLINIKA_PACS
         ← Association Accept ←
         → C-STORE Request →
         ← C-STORE Response ←
         → Association Release →
```

##### 11.1.2 AE Specifications
- Maximum simultaneous associations: 50
- Asynchronous operations window: Not supported
- Implementation identification: KLINIKA_PRO_PACS_1.0

#### 11.2 Association Establishment Policies

##### 11.2.1 General
- Calling AE Title verification: Configurable
- Called AE Title must match configured value
- Maximum PDU size: 16384 bytes

##### 11.2.2 Number of Associations
- Maximum concurrent associations as SCP: 50
- Maximum concurrent associations as SCU: 10

##### 11.2.3 Asynchronous Nature
Not supported

##### 11.2.4 Implementation Identifying Information
- Implementation Class UID: 1.2.826.0.1.3680043.8.498.12345678.1.0
- Implementation Version Name: KLINIKA_PRO_1.0

#### 11.3 Association Initiation Policy

The system initiates associations for:
- C-MOVE operations
- Storage commitment requests
- Query/Retrieve operations

#### 11.4 Transfer Syntaxes

##### 11.4.1 Supported Transfer Syntaxes
| Transfer Syntax | UID |
|-----------------|-----|
| Implicit VR Little Endian | 1.2.840.10008.1.2 |
| Explicit VR Little Endian | 1.2.840.10008.1.2.1 |
| Explicit VR Big Endian | 1.2.840.10008.1.2.2 |
| JPEG Baseline | 1.2.840.10008.1.2.4.50 |
| JPEG Extended | 1.2.840.10008.1.2.4.51 |
| JPEG Lossless | 1.2.840.10008.1.2.4.57 |
| JPEG Lossless SV1 | 1.2.840.10008.1.2.4.70 |
| JPEG-LS Lossless | 1.2.840.10008.1.2.4.80 |
| JPEG-LS Lossy | 1.2.840.10008.1.2.4.81 |
| JPEG 2000 Lossless | 1.2.840.10008.1.2.4.90 |
| JPEG 2000 Lossy | 1.2.840.10008.1.2.4.91 |

### 12. Media Interchange

Not supported in current version.

### 13. Support Customer Communication

- Technical Support: support@klinika-pro.ru
- Phone: +7 (495) 123-45-67
- Hours: Monday-Friday 9:00-18:00 MSK

### 14. Annexes

#### 14.1 Attribute Mapping

The system preserves all standard DICOM attributes without modification.

#### 14.2 Workflow Management

Supports DICOM Modality Worklist and Modality Performed Procedure Step services.

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Status**: Release 