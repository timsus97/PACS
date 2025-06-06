from flask import Flask, redirect
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

@app.route("/do-login")
def do_login(): return redirect("/")

@app.route("/dashboard") 
def dashboard(): return redirect("/")

@app.route("/viewer")
def viewer(): return redirect("/")

@app.route("/logout")
def logout(): return redirect("/api/logout")

@app.route("/api/logout")
def api_logout(): return """<html><head><title>Logout</title></head><body style="font-family:Arial;padding:50px;text-align:center;"><h1>🔐 Logout Success</h1><p style="color:#28a745;">✅ Logout успешен!</p><br><a href="/do-login" style="padding:20px 40px;background:#007bff;color:white;text-decoration:none;border-radius:10px;">🔑 ВОЙТИ ЗАНОВО</a></body></html>"""

if __name__ == "__main__": app.run(host="0.0.0.0", port=5000, debug=True)
