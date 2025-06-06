@app.route('/login')
def login_page():
    return '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clinton Medical PACS - Login</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 50px; }
        .login-container { max-width: 400px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .logo { text-align: center; margin-bottom: 30px; color: #2c3e50; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input[type="text"], input[type="password"] { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        button { width: 100%; padding: 12px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        button:hover { background: #2980b9; }
        .error { color: #e74c3c; margin-top: 10px; }
        .info { color: #27ae60; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">
            <h1>Clinton Medical PACS</h1>
            <p>Secure Medical Imaging System</p>
        </div>
        <form id="loginForm">
            <div class="form-group">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit">Login</button>
            <div id="message"></div>
        </form>
        <div class="info" style="margin-top: 20px; font-size: 14px;">
            <strong>Test Credentials:</strong><br>
            Username: admin2 / Password: admin123<br>
            Username: test / Password: test
        </div>
    </div>

    <script>
        document.getElementById("loginForm").addEventListener("submit", async function(e) {
            e.preventDefault();
            
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            const messageDiv = document.getElementById("message");
            
            try {
                const response = await fetch("/api/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({username, password})
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    messageDiv.innerHTML = "<div class=\\"info\\">Login successful! Redirecting...</div>";
                    localStorage.setItem("auth_token", data.token);
                    localStorage.setItem("user_info", JSON.stringify(data.user));
                    setTimeout(() => {
                        window.location.href = "/";
                    }, 1000);
                } else {
                    messageDiv.innerHTML = "<div class=\\"error\\">Error: " + data.error + "</div>";
                }
            } catch (error) {
                messageDiv.innerHTML = "<div class=\\"error\\">Connection error: " + error.message + "</div>";
            }
        });
    </script>
</body>
</html>
    ''' 