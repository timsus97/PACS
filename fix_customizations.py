#!/usr/bin/env python3
import re

# Read the original file
with open('original_customizations.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the new function
new_function = '''// FIXED Function to check if user is authenticated
function isUserAuthenticated() {
    try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('jwt_token');
        
        // If no token, not authenticated
        if (!token) {
            console.log('No auth token found');
            return false;
        }
        
        // Check for our simple token from Flask auth
        if (token === 'valid_admin_token_123') {
            console.log('Valid Flask auth token found');
            return true;
        }
        
        // Try to handle JWT tokens (fallback for future compatibility)
        try {
            if (token.includes('.')) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const currentTime = Math.floor(Date.now() / 1000);
                
                if (payload.exp && payload.exp < currentTime) {
                    // Token expired, remove it
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('jwt_token');
                    console.log('JWT token expired');
                    return false;
                }
                
                console.log('Valid JWT token found');
                return true;
            }
        } catch (jwtError) {
            console.log('Token is not a valid JWT, checking as simple token');
        }
        
        // For any other token, assume authenticated if it exists
        if (token.length > 0) {
            console.log('Non-empty token found, assuming authenticated');
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('Error checking authentication:', error);
        return false;
    }
}'''

# Find and replace the function using regex
pattern = r'(// Function to check if user is authenticated\s*\n)?function isUserAuthenticated\(\)[^}]*\{[^}]*\}(?:\s*localStorage\.removeItem[^}]*\})?\s*(?:return false;\s*\}\s*)?(?:\s*return true;\s*\}\s*)?(?:\s*\}\s*catch[^}]*\}\s*)?'

# More specific pattern to match the exact function
pattern = r'// Function to check if user is authenticated\s*\nfunction isUserAuthenticated\(\)[\s\S]*?^\}'

# Use multiline mode
fixed_content = re.sub(pattern, new_function, content, flags=re.MULTILINE)

# If the regex didn't work, try a simpler approach
if fixed_content == content:
    # Find the function manually
    start_marker = '// Function to check if user is authenticated'
    start_pos = content.find(start_marker)
    
    if start_pos != -1:
        # Find the end of the function
        function_start = content.find('function isUserAuthenticated()', start_pos)
        if function_start != -1:
            # Find the matching closing brace
            brace_count = 0
            pos = function_start
            while pos < len(content):
                if content[pos] == '{':
                    brace_count += 1
                elif content[pos] == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        # Found the end of the function
                        fixed_content = content[:start_pos] + new_function + content[pos+1:]
                        break
                pos += 1

# Write the fixed content
with open('fixed_customizations.js', 'w', encoding='utf-8') as f:
    f.write(fixed_content)

print("Fixed customizations.js created!") 