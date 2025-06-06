#!/bin/bash

# Script to upload test DICOM data to Orthanc
# This creates sample studies for testing OHIF viewer

VPS_IP="31.97.135.47"
VPS_USER="root" 
VPS_PASSWORD=';dJd9@YU.a2?ek;Ddb0G'
ORTHANC_URL="http://srv853233.hstgr.cloud/orthanc"
ORTHANC_AUTH="admin:admin"

echo "=== Creating Test DICOM Data ==="

# Function to execute commands on remote server
execute_remote() {
    sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "$1"
}

echo "Step 1: Creating test DICOM files in Orthanc..."

# Create a test study using Orthanc API
echo "Creating Test Patient 1..."
execute_remote "curl -u $ORTHANC_AUTH -X POST $ORTHANC_URL/tools/create-dicom \\
  -H 'Content-Type: application/json' \\
  -d '{
    \"PatientName\": \"Clinton^Test^Patient\",
    \"PatientID\": \"CLINTON001\",
    \"StudyDescription\": \"Test CT Scan\",
    \"SeriesDescription\": \"Test Series\",
    \"Modality\": \"CT\",
    \"StudyDate\": \"20241204\",
    \"SeriesDate\": \"20241204\",
    \"InstanceNumber\": \"1\"
  }'"

echo "Creating Test Patient 2..."
execute_remote "curl -u $ORTHANC_AUTH -X POST $ORTHANC_URL/tools/create-dicom \\
  -H 'Content-Type: application/json' \\
  -d '{
    \"PatientName\": \"Medical^Demo^Patient\",
    \"PatientID\": \"CLINTON002\",
    \"StudyDescription\": \"Demo MRI Study\",
    \"SeriesDescription\": \"T1 Weighted\",
    \"Modality\": \"MR\",
    \"StudyDate\": \"20241203\",
    \"SeriesDate\": \"20241203\",
    \"InstanceNumber\": \"1\"
  }'"

echo "Creating Test Patient 3..."
execute_remote "curl -u $ORTHANC_AUTH -X POST $ORTHANC_URL/tools/create-dicom \\
  -H 'Content-Type: application/json' \\
  -d '{
    \"PatientName\": \"PACS^System^Test\",
    \"PatientID\": \"CLINTON003\",
    \"StudyDescription\": \"X-Ray Chest\",
    \"SeriesDescription\": \"PA View\",
    \"Modality\": \"CR\",
    \"StudyDate\": \"20241202\",
    \"SeriesDate\": \"20241202\",
    \"InstanceNumber\": \"1\"
  }'"

echo ""
echo "Step 2: Verifying created studies..."
execute_remote "curl -u $ORTHANC_AUTH $ORTHANC_URL/studies"

echo ""
echo "Step 3: Checking DICOMweb endpoint..."
execute_remote "curl -u $ORTHANC_AUTH $ORTHANC_URL/dicom-web/studies"

echo ""
echo "=== Test Data Creation Complete ==="
echo "You can now access the studies in OHIF at: http://srv853233.hstgr.cloud"
echo "Or view them directly in Orthanc at: http://srv853233.hstgr.cloud:8042"
echo ""
echo "Test Patients:"
echo "1. Clinton Test Patient (ID: CLINTON001)"
echo "2. Medical Demo Patient (ID: CLINTON002)" 
echo "3. PACS System Test (ID: CLINTON003)" 