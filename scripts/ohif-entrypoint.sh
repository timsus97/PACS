#!/bin/sh
set -e

echo "Starting OHIF entrypoint script..."

# Create temporary directory for config files
TEMP_CONFIG_DIR="/usr/share/nginx/html/config"
echo "Creating temp config directory: $TEMP_CONFIG_DIR"
mkdir -p $TEMP_CONFIG_DIR
mkdir -p $TEMP_CONFIG_DIR/extensions

# Copy mounted config files to writable location
if [ -f "/usr/share/nginx/html/app-config.js" ]; then
    echo "Copying app-config.js..."
    cp /usr/share/nginx/html/app-config.js $TEMP_CONFIG_DIR/
    ls -la $TEMP_CONFIG_DIR/app-config.js
fi

if [ -f "/usr/share/nginx/html/customizations.js" ]; then
    echo "Copying customizations.js..."
    cp /usr/share/nginx/html/customizations.js $TEMP_CONFIG_DIR/
    ls -la $TEMP_CONFIG_DIR/customizations.js
fi

if [ -f "/usr/share/nginx/html/extensions/doctor-report-extension.js" ]; then
    echo "Copying doctor-report-extension.js..."
    cp /usr/share/nginx/html/extensions/doctor-report-extension.js $TEMP_CONFIG_DIR/extensions/
    ls -la $TEMP_CONFIG_DIR/extensions/doctor-report-extension.js
fi

# Back up the original index.html if it exists
if [ -f "/usr/share/nginx/html/index.html.original" ]; then
    echo "Using backed up original index.html..."
    cp /usr/share/nginx/html/index.html.original /usr/share/nginx/html/index.html
else
    echo "Backing up original index.html..."
    cp /usr/share/nginx/html/index.html /usr/share/nginx/html/index.html.original
fi

# Inject our configuration and customizations into the original index.html
echo "Injecting custom configuration into index.html..."
# Update the title
sed -i 's@<title>OHIF Viewer</title>@<title>Clinton Medical PACS</title>@g' /usr/share/nginx/html/index.html
sed -i 's@OHIF Viewer@Clinton Medical PACS@g' /usr/share/nginx/html/index.html

# Update app-config.js path to use our config directory
sed -i 's@src="/app-config.js"@src="/config/app-config.js"@g' /usr/share/nginx/html/index.html

# Add our customizations script before the closing body tag
sed -i 's@</body>@<script src="/config/customizations.js"></script></body>@g' /usr/share/nginx/html/index.html

# Add custom styles for branding
cat > /usr/share/nginx/html/config/custom-styles.css << 'EOF'
:root{--primary-color:#2a5298;--secondary-color:#1e3c72;--highlight-color:#4b7bec;}
/* Hide all investigational use notifications and watermarks */
.research-use-notification,.investigational-use,[class*="InvestigationalUse"],[class*="investigational"],[class*="research-use"],
[data-cy*="investigational"],[data-testid*="investigational"],
.cornerstone-canvas-overlay [class*="text"]:has-text("INVESTIGATIONAL"),
.cornerstone-canvas-overlay [class*="watermark"],
.cornerstone-canvas:after,
div:contains("INVESTIGATIONAL USE ONLY"),
div:contains("investigational use only"),
div:contains("RESEARCH USE"),
div:contains("research use"),
span:contains("INVESTIGATIONAL"),
span:contains("investigational"),
[class*="watermark"],[class*="Watermark"],[class*="overlay-text"],
.cornerstone-overlay-text,
.cs-overlay-text,
.text-overlay,
.viewport-overlay-text,
[data-cy="viewport-overlay-text"],
.viewport-text-overlay
{display:none!important;visibility:hidden!important;opacity:0!important;z-index:-9999!important;}
/* Additional overlay hiding */
canvas + div[style*="position: absolute"],
div[style*="INVESTIGATIONAL"],
*:before,*:after{content:none!important;}
.OHIFHeader{background:var(--secondary-color)!important;}
#root:empty::before{content:"Загрузка Klinika Pro PACS...";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:24px;color:var(--primary-color);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}
EOF

# Add link to custom styles in head
sed -i 's@</head>@<link rel="stylesheet" href="/config/custom-styles.css"></head>@g' /usr/share/nginx/html/index.html

# Ensure proper permissions
echo "Setting permissions..."
chown -R nginx:nginx $TEMP_CONFIG_DIR
chmod -R 755 $TEMP_CONFIG_DIR
chown nginx:nginx /usr/share/nginx/html/index.html

echo "Directory contents:"
ls -la $TEMP_CONFIG_DIR
ls -la $TEMP_CONFIG_DIR/extensions

echo "Modified index.html preview:"
head -n 50 /usr/share/nginx/html/index.html

# Start Nginx
echo "Starting Nginx..."
exec nginx -g "daemon off;" 