#!/bin/bash

# Script to upload test DICOM files to Orthanc
# This script should be run from the project root or ensure paths are adjusted.

ORTHANC_URL="http://localhost/orthanc" # Assuming Nginx proxy at /orthanc
# ORTHANC_URL="http://localhost:${ORTHANC_PORT:-8042}" # Direct to Orthanc (if exposed and no auth issues)

# Orthanc credentials (if basic auth is enabled and no JWT is used for this script)
# ORTHANC_USER="${ORTHANC_USERNAME:-admin_pacs}"
# ORTHANC_PASS="${ORTHANC_PASSWORD:-change_this_very_secret_password_for_orthanc_admin}"
# AUTH_HEADER="-u ${ORTHANC_USER}:${ORTHANC_PASS}"
AUTH_HEADER="" # Modify if Orthanc instance requires auth for uploads and no other mechanism is used

# Test data directory (relative to project root)
TEST_DATA_DIR="./orthanc/dicom-test-data"

# Check if curl and jq are installed
if ! command -v curl &> /dev/null; then
    echo "curl could not be found. Please install curl." >&2
    exit 1
fi
if ! command -v jq &> /dev/null; then
    echo "jq could not be found. Please install jq." >&2
    # exit 1 # jq is optional for this script version, but useful for parsing responses
fi

# Function to upload a single DICOM file
upload_dicom_file() {
    local file_path=$1
    if [ ! -f "$file_path" ]; then
        echo "File not found: $file_path" >&2
        return 1
    fi

    echo "Uploading $file_path to $ORTHANC_URL/instances ..."
    response=$(curl $AUTH_HEADER -s -X POST --data-binary @"$file_path" "$ORTHANC_URL/instances")
    
    # Basic check for success (Orthanc returns JSON with ID on success)
    if echo "$response" | jq -e '.ID' > /dev/null 2>&1; then
        echo "Successfully uploaded $file_path. Orthanc ID: $(echo $response | jq -r .ID)"
    elif echo "$response" | grep -q 'already stored'; then # Osimis Orthanc might return plain text
        echo "Skipped $file_path: Already stored or similar response."
    else
        echo "Failed to upload $file_path. Response: $response" >&2
        return 1
    fi
    sleep 0.1 # Small delay to avoid overwhelming the server
}

# Check if Orthanc is available
if ! curl -s -f "$ORTHANC_URL/app/explorer.html" > /dev/null; then
    echo "Orthanc does not seem to be available at $ORTHANC_URL" >&2
    echo "Please ensure Orthanc is running and accessible before running this script." >&2
    exit 1
fi
echo "Orthanc is accessible. Starting uploads..."

# Find all .dcm files in the test data directory and subdirectories
find "$TEST_DATA_DIR" -type f \( -iname '*.dcm' -o -iname '*.dicom' \) -print0 | while IFS= read -r -d $'\0' file; do
    upload_dicom_file "$file"
done

echo ""
echo "DICOM test data upload process completed."

# You might want to add a final check or summary here
# Example: curl $AUTH_HEADER -s "$ORTHANC_URL/studies" | jq

exit 0 