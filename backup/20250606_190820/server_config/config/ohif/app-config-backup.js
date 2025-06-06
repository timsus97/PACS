// OHIF Viewer Configuration for Clinton Medical PACS
// Author: Tim Hunt (tr00x)
// Version: 1.0

// Enhanced configuration with maximum functionality
window.config = {
  routerBasename: '/',
  enableGoogleCloudAdapter: false,
  showStudyList: true,
  maxNumberOfWebWorkers: 4,
  disableEditing: false,
  disableAnnotationTools: false,
  showCineControls: true,
  showOpenFileButton: false,  // Hide file upload button
  allowMixedContentResize: true,
  showDownloadViewport: false,  // Hide download buttons
  showDownloadStudy: false,    // Hide download buttons
  
  // Add router basename (if needed)
  // routerBasename: '/ohif',
  
  extensions: [],
  modes: [],
  customizationService: {},
  
  // Custom logo configuration
  whiteLabeling: {
    createLogoComponentFn: function(React) {
      // Replace with Clinton Medical logo
      return React.createElement('div', {
        style: { 
          color: '#5a9def', 
          fontWeight: 'bold', 
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }
      }, [
        React.createElement('span', {
          key: 'icon',
          style: {
            fontSize: '20px'
          }
        }, '🏥'),
        React.createElement('span', {
          key: 'text'
        }, 'Clinton Medical PACS')
      ]);
    },
  },
  
  defaultDataSourceName: 'dicomweb',
  dataSources: [
    {
      friendlyName: 'Orthanc DICOM Server',
      namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
      sourceName: 'dicomweb',
      configuration: {
        name: 'Orthanc',
        qidoRoot: '/orthanc/dicom-web',  // Proxy to Orthanc via nginx
        wadoRoot: '/orthanc/dicom-web',
        qidoSupportsIncludeField: false,
        supportsReject: false,
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: false,
        supportsWildcard: true,
        requestOptions: {
          requestCredentials: 'same-origin', // include, same-origin, omit
          // auth: 'admin:orthanc',  // not recommended for production
        },
        dicomUploadEnabled: false,  // Disable upload feature
        bulkDataURI: {
          enabled: true,
          relativeResolution: 'studies',
        },
        omitQuotationForMultipartRequest: true,
      },
    },
  ],
  
  hotkeys: [],
  
  // Enhanced viewport options
  cornerstoneExtensionConfig: {
    tools: {
      ArrowAnnotate: {
        configuration: {
          // Disable some tools for security
          allowNewMeasurements: true,
          allowEditMeasurements: true,
        },
      },
      Bidirectional: {
        configuration: {
          allowNewMeasurements: true,
          allowEditMeasurements: true,
        },
      },
    },
  },
  
  // Study list configuration
  studyListConfig: {
    defaultSort: {
      field: 'StudyDate',
      order: 'desc',
    },
    
    // Columns configuration
    columns: [
      'PatientName',
      'PatientId', 
      'StudyDate',
      'StudyTime',
      'StudyDescription',
      'Modality',
      'StudyInstanceUID',
    ],
    
    // Search criteria
    filtersMeta: [
      {
        name: 'PatientName',
        displayName: 'Patient Name',
        inputType: 'text',
      },
      {
        name: 'PatientId',
        displayName: 'Patient ID',
        inputType: 'text',
      },
      {
        name: 'StudyDate',
        displayName: 'Study Date',
        inputType: 'date-range',
      },
      {
        name: 'modalities',
        displayName: 'Modality',
        inputType: 'text',
      },
      {
        name: 'StudyDescription',
        displayName: 'Study Description',
        inputType: 'text',
      },
    ],
  },
  
  // Additional security and customization options
  experimentalStudyBrowserSort: true,
  
  // Custom branding
  theme: {
    primaryColor: '#5a9def',
    backgroundColor: '#1a1a2e',
  },
  
  // Report configuration (removed some features for security)
  // Medical reports should be handled by the backend for audit trail
  investigationalUseDialog: {
    option: 'never',  // This hides the "Investigational Use" dialog
    text: ''  // Remove text as well
  },
  
  // Add doctor reports functionality
  doctorReports: {
    enabled: true,
    // Additional configuration can be added here
    // Configuration for doctor reports functionality:
    // - Header (e.g., "Clinton Medical - Medical Report").
    // - Patient info should include Patient Name, Patient ID, Study Date.
    // - StudyID should also be included in the header for easy identification.
    // - Report templates can be added.
    // - Export functionality (PDF) should include branding.
    // 
    // PDF export features:
    // - Should include patient information (name, ID, DOB).
    // - Should include study date and modality.
    // - Should include report author and creation date.
    // - Should include StudyID in the PDF for easy reference.
    // - Should include institution branding and letterhead.
    // - Should support multiple languages.
    
    pdfExport: {
      // Header configuration
      header: {
        institutionName: 'Clinton Medical PACS',
        // logo: '/assets/logo.png',  // Optional logo path
        address: '',  // Optional address
        phone: '',    // Optional phone
        email: '',    // Optional email
      },
      
      // Footer configuration
      footer: {
        text: 'Generated by Clinton Medical PACS',
        includeTimestamp: true,
      },
      
      // Report styling
      styling: {
        primaryColor: '#5a9def',
        fontFamily: 'Arial, sans-serif',
        fontSize: 12,
      },
    },
  },
  
  // CORS and security settings
  cors: true,
  
}; console.log('OHIF Configuration loaded successfully for Clinton Medical PACS');
console.log('Data source configuration:', window.config.dataSources[0]);

if (window.config.dataSources[0]?.configuration?.qidoRoot) {
  console.log('QIDO Root configured:', window.config.dataSources[0].configuration.qidoRoot);
} else {
  console.warn('QIDO Root not properly configured!');
}

// Add event listener for OHIF app initialization
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded - Applying Clinton Medical customizations...');
  
  // Apply custom theme
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --primary-color: #5a9def;
      --secondary-color: #4285f4;
      --background-color: #1a1a2e;
      --sidebar-color: #16213e;
    }
    
    /* Custom branding styles */
    .viewport-header {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    }
    
    /* Hide download buttons for security */
    button[title*="Download"], 
    button[title*="Export"],
    .download-button,
    .export-button {
      display: none !important;
    }
    
    /* Custom logo area */
    .logo-area {
      color: var(--primary-color);
      font-weight: bold;
    }
  `;
  document.head.appendChild(style);
  
  // Set page title
  document.title = 'Clinton Medical PACS';
  
  console.log('Clinton Medical customizations applied successfully');
}); 