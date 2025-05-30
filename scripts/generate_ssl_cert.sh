#!/bin/bash

# Script to generate self-signed SSL certificate for development

SSL_DIR="./config/ssl"
CERT_FILE="$SSL_DIR/cert.pem"
KEY_FILE="$SSL_DIR/key.pem"

# Create SSL directory if it doesn't exist
mkdir -p "$SSL_DIR"

# Generate self-signed certificate
echo "Generating self-signed SSL certificate for development..."

openssl req -x509 -newkey rsa:4096 -nodes \
    -keyout "$KEY_FILE" \
    -out "$CERT_FILE" \
    -days 365 \
    -subj "/C=RU/ST=Moscow/L=Moscow/O=Klinika Pro/OU=IT Department/CN=localhost"

if [ $? -eq 0 ]; then
    echo "SSL certificate generated successfully!"
    echo "Certificate: $CERT_FILE"
    echo "Private key: $KEY_FILE"
    echo ""
    echo "Note: This is a self-signed certificate for development only."
    echo "Your browser will show a security warning which you can safely ignore for local development."
else
    echo "Error generating SSL certificate"
    exit 1
fi

# Set appropriate permissions
chmod 644 "$CERT_FILE"
chmod 600 "$KEY_FILE"

echo "SSL certificate setup complete!" 