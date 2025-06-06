# Добавляем маршрут Dashboard с кнопками навигации
@app.route("/dashboard")
def dashboard():
    return render_template_string("""<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clinton Medical PACS - Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .dashboard-container {
            max-width: 800px;
            width: 90%;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .nav-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .nav-button {
            display: block;
            text-decoration: none;
            color: white;
            background: linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 15px;
            padding: 25px 20px;
            text-align: center;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .nav-button:hover {
            background: linear-gradient(45deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1));
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        .nav-button .icon {
            font-size: 2.5em;
            margin-bottom: 15px;
            display: block;
        }
        .nav-button .title {
            font-size: 1.3em;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .nav-button .desc {
            font-size: 0.9em;
            opacity: 0.8;
            line-height: 1.4;
        }
        .logout-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(231, 76, 60, 0.8);
            border: none;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            text-decoration: none;
        }
        .logout-btn:hover {
            background: rgba(231, 76, 60, 1);
        }
    </style>
</head>
<body>
    <a href="/logout" class="logout-btn">🚪 Выход</a>
    
    <div class="dashboard-container">
        <div class="header">
            <h1>🏥 Clinton Medical PACS</h1>
            <p>Медицинская информационная система управления изображениями</p>
        </div>
        
        <div class="nav-grid">
            <a href="/#/" class="nav-button">
                <span class="icon">🔬</span>
                <div class="title">OHIF Viewer</div>
                <div class="desc">Просмотр и анализ медицинских изображений DICOM</div>
            </a>
            
            <a href="/orthanc" class="nav-button">
                <span class="icon">🗄️</span>
                <div class="title">Orthanc Server</div>
                <div class="desc">Управление PACS сервером и архивом изображений</div>
            </a>
            
            <a href="/api/reports" class="nav-button">
                <span class="icon">📋</span>
                <div class="title">Медицинские отчеты</div>
                <div class="desc">Создание и управление медицинскими заключениями</div>
            </a>
            
            <a href="/api/stats" class="nav-button">
                <span class="icon">📊</span>
                <div class="title">Статистика</div>
                <div class="desc">Статистика использования системы PACS</div>
            </a>
            
            <a href="/orthanc/app/explorer.html" class="nav-button">
                <span class="icon">🔍</span>
                <div class="title">Поиск исследований</div>
                <div class="desc">Поиск пациентов и медицинских исследований</div>
            </a>
            
            <a href="/api/admin" class="nav-button">
                <span class="icon">⚙️</span>
                <div class="title">Администрирование</div>
                <div class="desc">Настройки системы и управление пользователями</div>
            </a>
        </div>
        
        <div style="margin-top: 40px; text-align: center; opacity: 0.7; font-size: 0.9em;">
            <p>Система готова к работе • 38 исследований в архиве</p>
        </div>
    </div>
</body>
</html>""") 