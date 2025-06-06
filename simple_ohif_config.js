// Simple OHIF Configuration for Clinton Medical PACS
window.config = {
  routerBasename: '/',
  showStudyList: true,
  
  whiteLabeling: {
    createLogoComponentFn: function(React) {
      return React.createElement('div', {
        style: { 
          color: '#5a9def', 
          fontWeight: 'bold', 
          fontSize: '18px'
        }
      }, '🏥 Clinton Medical PACS');
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
        qidoRoot: '/orthanc/dicom-web',
        wadoRoot: '/orthanc/dicom-web',
        qidoSupportsIncludeField: false,
        supportsReject: false,
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: false,
        supportsWildcard: true,
      },
    },
  ],
  
  extensions: [],
  modes: [],
  customizationService: {},
  
  // Simple viewport options
  hotkeys: [],
};

console.log('Simple OHIF Configuration loaded for Clinton Medical PACS'); 