#!/usr/bin/env python3

with open("/opt/clinton-pacs/config/nginx/nginx_simple_fixed.conf", "r") as f:
    content = f.read()

api_block = """
        # Authentication API
        location /api/ {
            proxy_pass http://simple_auth:5000/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 90;
        }"""

# Find location /login block and add API block after it
lines = content.split("\n")
new_lines = []
in_login_block = False
brace_count = 0

for line in lines:
    new_lines.append(line)
    
    if "location /login" in line:
        in_login_block = True
        brace_count = 0
    
    if in_login_block:
        if "{" in line:
            brace_count += 1
        if "}" in line:
            brace_count -= 1
            if brace_count == 0:
                new_lines.append(api_block)
                in_login_block = False

with open("/opt/clinton-pacs/config/nginx/nginx_simple_fixed.conf", "w") as f:
    f.write("\n".join(new_lines))

print("API block added successfully!") 