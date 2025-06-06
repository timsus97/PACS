window.config = {
  routerBasename: "/",
  showStudyList: true,
  defaultDataSourceName: "dicomweb",
  
  // Кастомный брендинг - убираем OHIF логотип
  whiteLabeling: {
    createLogoComponentFn: function(React) {
      return React.createElement('div', {
        style: { 
          color: '#5a9def', 
          fontWeight: 'bold', 
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px'
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
  
  dataSources: [{
    friendlyName: "Orthanc DICOM Server",
    namespace: "@ohif/extension-default.dataSourcesModule.dicomweb",
    sourceName: "dicomweb",
    configuration: {
      name: "Orthanc",
      qidoRoot: "/orthanc/dicom-web",
      wadoRoot: "/orthanc/dicom-web",
      qidoSupportsIncludeField: false,
      supportsReject: false,
      imageRendering: "wadors",
      thumbnailRendering: "wadors",
      enableStudyLazyLoad: true,
      supportsFuzzyMatching: false,
      supportsWildcard: true,
      requestOptions: {
        requestCredentials: "same-origin"
      }
    }
  }],
  
  extensions: [],
  modes: [],
  hotkeys: []
};

console.log("OHIF Config - Clinton Medical PACS custom branding loaded"); 