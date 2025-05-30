#!/bin/bash

# Generate self-signed SSL certificates for development

SSL_DIR="./config/ssl"
mkdir -p "$SSL_DIR"

# Generate private key
openssl genrsa -out "$SSL_DIR/privkey.pem" 2048

# Generate certificate
openssl req -new -x509 -key "$SSL_DIR/privkey.pem" -out "$SSL_DIR/fullchain.pem" -days 365 \
    -subj "/C=RU/ST=Moscow/L=Moscow/O=Klinika Pro/OU=IT/CN=localhost"

echo "SSL certificates generated in $SSL_DIR"
echo "- Private key: $SSL_DIR/privkey.pem"
echo "- Certificate: $SSL_DIR/fullchain.pem" 