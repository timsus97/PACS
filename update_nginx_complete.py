#!/usr/bin/env python3
import re

# Read original nginx config
with open("nginx_fixed.conf", "r") as f:
    content = f.read()

# Read complete OHIF rules
with open("ohif_complete_rules.txt", "r") as f:
    rules = f.read()

# Find and replace - insert rules before "# OHIF Viewer - proxy to container"
pattern = r"(        # OHIF Viewer - proxy to container)"
replacement = rules + "\n\n        # OHIF Viewer - proxy to container"
new_content = content.replace("        # OHIF Viewer - proxy to container", replacement)

# Write new config
with open("nginx_complete.conf", "w") as f:
    f.write(new_content)

print("✅ Полные правила OHIF добавлены в Nginx конфигурацию")
print("📋 Добавленные правила:")
print("- CSS файлы с хешами (e.g., 10.81258732728ed501c1ae.css)")
print("- JS Bundle файлы (vendors~app.bundle.*.js, app.bundle.*.js)")
print("- Workbox и Service Worker файлы")
print("- Assets папка (/assets/)")
print("- Универсальное правило для .css/.js/.mjs файлов")

# Show the inserted rules
lines = new_content.split('\n')
for i, line in enumerate(lines):
    if "OHIF static files on root path (comprehensive coverage)" in line:
        print(f"\n🎯 Правила вставлены на строке {i+1}")
        for j in range(i, min(i+10, len(lines))):
            if lines[j].strip():
                print(f"{j+1}: {lines[j]}")
        break 