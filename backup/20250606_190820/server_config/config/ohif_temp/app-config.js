window.config = {
  routerBasename: '/',
  showStudyList: true,
  dataSources: [
    {
      friendlyName: 'Orthanc PACS',
      namespace: '@ohif/extension-default.datasources.dicomweb',
      sourceName: 'dicomweb',
      configuration: {
        name: 'Orthanc',
        wadoUriRoot: '/orthanc/dicom-web',
        qidoRoot: '/orthanc/dicom-web',
        wadoRoot: '/orthanc/dicom-web',
        qidoSupportsIncludeField: true,
        supportsReject: true,
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: true,
        supportsWildcard: true,
        dicomUploadEnabled: false
      }
    }
  ],
  defaultDataSourceName: 'dicomweb',
  whiteLabeling: {
    createLogoComponentFn: function(React) {
      return React.createElement('div', {
        style: {
          display: 'flex',
          alignItems: 'center'
        }
      }, React.createElement('span', {
        style: {
          color: '#fff',
          fontWeight: 'bold',
          padding: '10px'
        }
      }, 'Klinika Pro PACS'));
    }
  }
}; 