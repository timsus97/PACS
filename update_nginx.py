#!/usr/bin/env python3
import re

# Read original nginx config
with open("nginx_fixed.conf", "r") as f:
    content = f.read()

# Read OHIF rules
with open("ohif_static_rules.txt", "r") as f:
    rules = f.read()

# Find and replace - insert rules before "# OHIF Viewer - proxy to container"
pattern = r"(        # OHIF Viewer - proxy to container)"
replacement = rules + "\n\n        # OHIF Viewer - proxy to container"
new_content = content.replace("        # OHIF Viewer - proxy to container", replacement)

# Write new config
with open("nginx_ohif_paths.conf", "w") as f:
    f.write(new_content)

print("✅ OHIF статические файлы добавлены в Nginx конфигурацию")
print("📋 Проверяем результат:")

# Show the inserted rules
lines = new_content.split('\n')
for i, line in enumerate(lines):
    if "OHIF static files" in line:
        for j in range(max(0, i-2), min(len(lines), i+15)):
            print(f"{j+1:3}: {lines[j]}")
        break 