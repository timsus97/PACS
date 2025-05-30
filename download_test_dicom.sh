#!/bin/bash

# Download test DICOM files

echo "Downloading test DICOM files..."

# Create directories
mkdir -p orthanc/dicom-test-data/{ct,mri,us,video}

# Download sample DICOM files from public sources
echo "Downloading CT sample..."
curl -L "https://github.com/cornerstonejs/dicomParser/raw/master/testImages/CT0012.dcm" \
     -o orthanc/dicom-test-data/ct/CT0012.dcm

echo "Downloading MRI sample..."
curl -L "https://github.com/cornerstonejs/dicomParser/raw/master/testImages/MR-MONO2-16-head.dcm" \
     -o orthanc/dicom-test-data/mri/MR-MONO2-16-head.dcm

echo "Downloading US sample..."
curl -L "https://github.com/cornerstonejs/dicomParser/raw/master/testImages/US1_J2KR.dcm" \
     -o orthanc/dicom-test-data/us/US1_J2KR.dcm

echo "Test DICOM files downloaded!"
echo "You can now run ./upload.sh to upload them to Orthanc" 