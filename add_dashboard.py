#!/usr/bin/env python3

with open("/opt/clinton-pacs/config/nginx/nginx_simple_fixed.conf", "r") as f:
    content = f.read()

dashboard_block = """
        # Authentication dashboard
        location /dashboard {
            proxy_pass http://simple_auth:5000/dashboard;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }"""

# Find API block and add dashboard after it
lines = content.split("\n")
new_lines = []
in_api_block = False
brace_count = 0

for line in lines:
    new_lines.append(line)
    
    if "location /api/" in line:
        in_api_block = True
        brace_count = 0
    
    if in_api_block:
        if "{" in line:
            brace_count += 1
        if "}" in line:
            brace_count -= 1
            if brace_count == 0:
                new_lines.append(dashboard_block)
                in_api_block = False

with open("/opt/clinton-pacs/config/nginx/nginx_simple_fixed.conf", "w") as f:
    f.write("\n".join(new_lines))

print("Dashboard location added successfully!") 