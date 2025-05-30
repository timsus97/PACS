// OHIF Viewer Configuration for Klinika Pro PACS
// Saved as: /config/ohif/app-config.js
// This file will be mounted into the OHIF Docker container.

window.config = {
  // App Name and Theming (Rule 4.1, 4.2)
  routerBasename: '/',
  // whiteLabeling: {
  //   createLogoComponentFn: function (React) {
  //     return React.createElement(
  //       'a',
  //       {
  //         target: '_self',
  //         href: '/',
  //         style: {
  //           display: 'block',
  //           textDecoration: 'none'
  //         },
  //       },
  //       // Replace with your Klinika Pro logo (e.g., an SVG or an <img> tag)
  //       React.createElement('img', {
  //         src: '/assets/klinika-pro-logo.svg', // Ensure this asset is available
  //         style: { height: '40px', marginTop: '5px' }, // Adjust style as needed
  //         alt: 'Klinika Pro',
  //       })
  //     );
  //   },
  // },
  // studyListFunctionsEnabled: true, // Keep study list enabled

  // Extensions: Add any required or custom extensions here
  extensions: [],

  // Modes: Configure modes for different workflows if needed
  modes: [],

  // Data Sources (Rule 4.1)
  dataSources: [
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
      sourceName: 'dicomweb',
      configuration: {
        name: 'Orthanc',
        wadoUriRoot: 'https://localhost/orthanc/wado',
        qidoRoot: 'https://localhost/orthanc/dicom-web',
        wadoRoot: 'https://localhost/orthanc/dicom-web',
        qidoSupportsIncludeField: true,
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: true,
        supportsWildcard: true,
        requestOptions: {
          auth: 'bearer',
          headers: {
            'Authorization': () => {
              const token = localStorage.getItem('jwt_token');
              return token ? `Bearer ${token}` : '';
            }
          }
        }
      },
    },
  ],

  // Default route if no other matching route is found
  defaultRoute: '/studylist',

  // Show Study List first
  showStudyList: true,

  // Basic hanging protocols configuration
  hangingProtocols: [
    {
      id: 'defaultProtocol',
      name: 'Default Layout',
      protocolMatchingRules: [
        {
          weight: 1,
          attribute: 'StudyInstanceUID',
          constraint: {
            equals: {
              value: '*'
            }
          }
        }
      ],
      stages: [
        {
          name: 'default',
          viewportStructure: {
            layoutType: 'grid',
            properties: {
              rows: 1,
              columns: 1
            }
          },
          viewports: [
            {
              viewportOptions: {
                toolGroupId: 'default'
              },
              displaySets: [
                {
                  id: 'defaultDisplaySetId',
                  matchedDisplaySetsIndex: 0
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'mpr',
      name: 'MPR Layout',
      protocolMatchingRules: [
        {
          weight: 25,
          attribute: 'StudyInstanceUID',
          constraint: {
            equals: {
              value: '*'
            }
          }
        }
      ],
      stages: [
        {
          name: 'mpr',
          viewportStructure: {
            layoutType: 'grid',
            properties: {
              rows: 2,
              columns: 2
            }
          },
          viewports: [
            {
              viewportOptions: {
                toolGroupId: 'mpr',
                initialImageIdOrIndex: 0
              },
              displaySets: [
                {
                  matchedDisplaySetsIndex: 0
                }
              ]
            },
            {
              viewportOptions: {
                toolGroupId: 'mpr',
                orientation: 'sagittal'
              },
              displaySets: [
                {
                  matchedDisplaySetsIndex: 0
                }
              ]
            },
            {
              viewportOptions: {
                toolGroupId: 'mpr',
                orientation: 'coronal'
              },
              displaySets: [
                {
                  matchedDisplaySetsIndex: 0
                }
              ]
            },
            {
              viewportOptions: {
                toolGroupId: 'mpr',
                orientation: 'axial'
              },
              displaySets: [
                {
                  matchedDisplaySetsIndex: 0
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'mprAnd3DVolumeViewport',
      name: 'MPR and 3D Volume',
      protocolMatchingRules: [
        {
          weight: 30,
          attribute: 'StudyInstanceUID',
          constraint: {
            equals: {
              value: '*'
            }
          }
        }
      ],
      stages: [
        {
          name: 'mprAnd3D',
          viewportStructure: {
            layoutType: 'grid',
            properties: {
              rows: 2,
              columns: 2
            }
          },
          viewports: [
            {
              viewportOptions: {
                toolGroupId: 'mpr3d',
                viewportType: 'volume'
              },
              displaySets: [
                {
                  matchedDisplaySetsIndex: 0
                }
              ]
            },
            {
              viewportOptions: {
                toolGroupId: 'mpr3d',
                orientation: 'sagittal'
              },
              displaySets: [
                {
                  matchedDisplaySetsIndex: 0
                }
              ]
            },
            {
              viewportOptions: {
                toolGroupId: 'mpr3d',
                orientation: 'coronal'
              },
              displaySets: [
                {
                  matchedDisplaySetsIndex: 0
                }
              ]
            },
            {
              viewportOptions: {
                toolGroupId: 'mpr3d',
                orientation: 'axial'
              },
              displaySets: [
                {
                  matchedDisplaySetsIndex: 0
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: '@ohif/seg',
      name: 'Segmentation Layout',
      protocolMatchingRules: [
        {
          weight: 35,
          attribute: 'StudyInstanceUID',
          constraint: {
            equals: {
              value: '*'
            }
          }
        }
      ],
      stages: [
        {
          name: 'segmentation',
          viewportStructure: {
            layoutType: 'grid',
            properties: {
              rows: 1,
              columns: 2
            }
          },
          viewports: [
            {
              viewportOptions: {
                toolGroupId: 'segmentation'
              },
              displaySets: [
                {
                  matchedDisplaySetsIndex: 0
                }
              ]
            },
            {
              viewportOptions: {
                toolGroupId: 'segmentation'
              },
              displaySets: [
                {
                  matchedDisplaySetsIndex: 0
                }
              ]
            }
          ]
        }
      ]
    }
  ],

  // Max number of Web Workers to use for parsing and decoding multi-frame images
  maxNumberOfWebWorkers: navigator.hardwareConcurrency || 3,

  // i18n Configuration to fix React warnings
  i18n: {
    defaultLanguage: 'en',
    defaultNS: 'common',
    useSuspense: false, // Fix for the wait option warning
    react: {
      useSuspense: false, // Additional fix for React components
      wait: false // Explicitly disable old wait option
    },
    debug: false,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already does escaping
    },
    resources: {
      en: {
        common: {
          // Basic translations to prevent missing key warnings
          'StudyList': 'Study List',
          'Viewer': 'Viewer',
          'Settings': 'Settings'
        }
      }
    }
  },

  // UI Customizations (Rule 4.1, 4.2)
  // Some UI settings can be controlled here, others might need direct OHIF code modification or extensions.

  // Example: To control available SOP classes or hanging protocols
  // sopClassHandlers: [],
  // studyPrefetcher: { /* ... */ },
  cornerstoneExtensionConfig: {
    // Disable investigational use watermarks
    showTextOverlay: false,
    showWatermark: false,
    showInvestigationalUseText: false,
    enableInvestigationalUseOverlay: false,
    investigationalUseDialogSettings: {
      show: false,
      enabled: false
    },
    overlay: {
      enabled: false,
      investigationalUse: false,
      showTextOverlay: false
    },
    // Tool configuration
    // activeTools: ['Zoom', 'Pan', 'Magnify', 'Wwwc', 'Length', 'Angle', 'Bidirectional', 'EllipticalRoi', 'RectangleRoi'],
    // tools: {
    //   Length: { /* specific config */ },
    //   // ... other tools
    // }
  },

  // TODO (Rule 4.2): Implement Russian Language Support
  // This usually involves creating a localization file (e.g., public/locales/ru/common.json)
  // and registering it. OHIF's i18n capabilities might need to be leveraged.
  // Example (conceptual):
  // i18n: {
  //   defaultLanguage: 'ru', // Set Russian as default
  //   locales: ['en', 'ru'],
  // },

  // TODO (Rule 4.2): Remove "Download" button/features.
  // This might require CSS overrides, an extension, or modifying OHIF's source/components.
  // Search for `data-cy="download-report-button"` or similar selectors in OHIF for report download.
  // For study/series download, it might be part of context menus or toolbars.
  // A simple CSS hide could be a first step but might not be robust:
  // customCSS: [
  //   `.download-button-selector { display: none !important; }`
  // ],

  // TODO (Rule 4.2): Implement "Doctor's Report" (Заключение врача) tab/section.
  // This is a significant UI addition and will likely require a custom OHIF extension.
  // The extension would:
  // 1. Add a new panel or tab to the viewer layout.
  // 2. Inside this panel, include:
  //    - A rich textarea for report input.
  //    - A "Save" button (persisting to localStorage, perhaps scoped by StudyInstanceUID).
  //    - An "Export PDF" button.
  // 3. The "Export PDF" button should trigger jsPDF to generate a PDF with:
  //    - Header (e.g., "Klinika Pro - Medical Report").
  //    - Patient Information (Name, ID, DOB - fetched from DICOM metadata).
  //    - Study Information (StudyDate, Modality, StudyID - fetched from DICOM metadata).
  //    - Report Author (Doctor's name/ID - from user session or input).
  //    - Doctor's Signature (text or placeholder).
  //    - Potentially a digital signature if implemented (Rule 5.2).
  // 4. This tab/section must be conditionally rendered based on user role (`doctor` or `admin`).
  //    The user role would need to be passed from your Flask Auth service to OHIF (e.g., via JWT payload or a dedicated endpoint).

  // Placeholder for where such an extension might be configured or invoked:
  // extensions: [
  //   // ... other extensions
  //   {
  //     id: '@klinika-pro/ohif-extension-doctors-report',
  //     version: '1.0.0',
  //     // Configuration for the extension, like API endpoints for fetching user roles
  //   },
  // ],

  // Notification manager configuration
  // whiteLabeling.logoComponent may need to be a function component now
  whiteLabeling: {
    createLogoComponentFn: function(React) {
      return React.createElement('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          padding: '10px'
        }
      }, React.createElement('span', {
        style: {
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '18px'
        }
      }, 'Klinika Pro PACS'));
    }
  },
  // Default theme (Rule 4.2)
  defaultTheme: 'dark', // Ensure this aligns with OHIF's theme capabilities

  // Tool Groups Configuration
  toolGroupIds: ['default', 'mpr', 'mpr3d', 'segmentation'],

  // Other settings from your technical specification or PROJECT_RULES.md
  // For example, enabling specific measurement tools or viewport layouts.
  // These are often configured within cornerstoneExtensionConfig or specific mode/extension settings.

  // Example for enabling specific tools (actual names/config may vary with OHIF version):
  // cornerstoneExtensionConfig: {
  //   activeTools: ['Zoom', 'Pan', 'Magnify', 'Wwwc', 'Length', 'Angle', 'Bidirectional', 'EllipticalRoi', 'RectangleRoi'],
  //   tools: {
  //     Length: { /* specific config */ },
  //     // ... other tools
  //   }
  // },

  // Session timeout: Handled by Flask Auth and Nginx/UI logic rather than OHIF config directly.
  // OHIF itself doesn't have a built-in session timeout that logs out, but the UI can react to JWT expiration.

  defaultDataSourceName: 'dicomweb',

  showLoadingIndicator: true,

  hotkeys: [
    {
      commandName: 'incrementActiveViewport',
      label: 'Next Viewport',
      keys: ['right'],
    },
    {
      commandName: 'decrementActiveViewport',
      label: 'Previous Viewport',
      keys: ['left'],
    },
    { commandName: 'rotateViewportCW', label: 'Rotate Right', keys: ['r'] },
    { commandName: 'rotateViewportCCW', label: 'Rotate Left', keys: ['l'] },
    { commandName: 'invertViewport', label: 'Invert', keys: ['i'] },
  ],

  // Disable investigational use notifications globally
  investigationalUseDialog: {
    enabled: false,
    show: false
  },
  
  // Additional watermark/overlay disabling
  enableStudyList: true,
  disableInvestigationalUseDialog: true,
  watermarkText: '',
  overlayText: '',
  showWatermark: false,
  showOverlay: false,
}; 