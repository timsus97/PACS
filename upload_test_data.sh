#!/bin/bash

# Orthanc URL
ORTHANC_URL="http://localhost:8042"

# Function to upload a DICOM file
upload_dicom() {
    local file=$1
    echo "Uploading: $file"
    curl -X POST \
         "$ORTHANC_URL/instances" \
         --data-binary "@$file" \
         -H "Content-Type: application/dicom" \
         -s -o /dev/null -w "%{http_code}" | {
        read http_code
        if [ "$http_code" = "200" ]; then
            echo "  ✓ Success"
        else
            echo "  ✗ Failed (HTTP $http_code)"
        fi
    }
}

# Upload all DICOM files from test data directories
echo "Starting DICOM upload to Orthanc..."
echo "================================="

# Upload the generated DICOM files
find orthanc/dicom-test-data/generated -name "*.dcm" -type f | while read file; do
    upload_dicom "$file"
done

echo "================================="
echo "Upload complete!"

# Check the number of studies in Orthanc
echo -n "Studies in Orthanc: "
curl -s "$ORTHANC_URL/studies" | jq '. | length'

# List the studies
echo ""
echo "Available studies:"
curl -s "$ORTHANC_URL/studies" | jq -r '.[]' | while read study_id; do
    study_info=$(curl -s "$ORTHANC_URL/studies/$study_id")
    patient_name=$(echo $study_info | jq -r '.PatientMainDicomTags.PatientName // "Unknown"')
    study_desc=$(echo $study_info | jq -r '.MainDicomTags.StudyDescription // "No description"')
    echo "  - $patient_name: $study_desc (ID: $study_id)"
done 