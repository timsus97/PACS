@app.route("/dashboard")
def dashboard():
    return '''<!DOCTYPE html>
<html>
<head>
    <title>Clinton Medical PACS - Dashboard</title>
    <style>
        body { font-family: Arial; background: linear-gradient(135deg, #667eea, #764ba2); margin: 0; padding: 50px; color: white; }
        .container { max-width: 800px; margin: 0 auto; background: rgba(255,255,255,0.1); padding: 40px; border-radius: 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .nav-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .nav-button { display: block; text-decoration: none; color: white; background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; text-align: center; transition: all 0.3s; }
        .nav-button:hover { background: rgba(255,255,255,0.2); transform: translateY(-2px); }
        .icon { font-size: 2em; margin-bottom: 10px; }
        .title { font-size: 1.2em; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 Clinton Medical PACS</h1>
            <p>Медицинская информационная система</p>
        </div>
        <div class="nav-grid">
            <a href="/#/" class="nav-button">
                <div class="icon">🔬</div>
                <div class="title">OHIF Viewer</div>
                <div>Просмотр медицинских изображений</div>
            </a>
            <a href="/orthanc" class="nav-button">
                <div class="icon">🗄️</div>
                <div class="title">Orthanc Server</div>
                <div>Управление PACS архивом</div>
            </a>
            <a href="/orthanc/app/explorer.html" class="nav-button">
                <div class="icon">🔍</div>
                <div class="title">Поиск исследований</div>
                <div>Поиск пациентов и данных</div>
            </a>
            <a href="/logout" class="nav-button">
                <div class="icon">🚪</div>
                <div class="title">Выход</div>
                <div>Выход из системы</div>
            </a>
        </div>
        <div style="text-align: center; margin-top: 30px; opacity: 0.7;">
            <p>Система готова • 38 исследований в архиве</p>
        </div>
    </div>
</body>
</html>''' 