// Function to wait for OHIF to be fully loaded
function waitForOHIF(callback, maxAttempts = 50) {
    let attempts = 0;
    
    function checkForOHIF() {
        attempts++;
        
        // Multiple ways to detect OHIF is ready
        const hasViewport = document.querySelector('[data-cy="viewport-container"]') || 
                           document.querySelector('.viewport-container') ||
                           document.querySelector('[class*="viewport"]') ||
                           document.querySelector('[class*="Viewport"]') ||
                           document.querySelector('#viewport-0') ||
                           document.querySelector('.cornerstone-viewport') ||
                           document.querySelector('body > div:last-child') ||
                           document.body;
        
        const hasOHIFStructure = document.querySelector('[class*="ohif"]') ||
                                document.querySelector('[data-cy*="ohif"]') ||
                                document.querySelector('.StudyList') ||
                                document.querySelector('.ViewerLayout') ||
                                window.location.pathname.includes('viewer') ||
                                window.location.search.includes('StudyInstanceUIDs');
        
        console.log(`OHIF Detection attempt ${attempts}:`, {
            hasViewport: !!hasViewport,
            hasOHIFStructure: !!hasOHIFStructure,
            currentURL: window.location.href,
            bodyChildren: document.body.children.length
        });
        
        if ((hasViewport || hasOHIFStructure) && attempts > 5) {
            callback();
        } else if (attempts < maxAttempts) {
            setTimeout(checkForOHIF, 500);
        } else {
            console.warn('OHIF not detected after maximum attempts, creating elements anyway');
            callback();
        }
    }
    
    checkForOHIF();
}

// Enhanced function to create doctor report elements
function createDoctorReportElements() {
    console.log('Creating doctor report elements...');
    
    // Remove existing elements first
    const existingButton = document.getElementById('doctorReportBtn');
    const existingPanel = document.getElementById('doctorReportPanel');
    if (existingButton) existingButton.remove();
    if (existingPanel) existingPanel.remove();
    
    // Create floating button
    const floatingBtn = document.createElement('div');
    floatingBtn.id = 'doctorReportBtn';
    floatingBtn.innerHTML = '<i class="fa fa-file-text-o"></i> Заключение';
    floatingBtn.style.cssText = `
        position: fixed;
        top: 50%;
        right: 30px;
        transform: translateY(-50%);
        background: linear-gradient(135deg, #5a9def 0%, #4285f4 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        cursor: pointer;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 8px 32px rgba(90, 157, 239, 0.3);
        z-index: 10000;
        border: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        white-space: nowrap;
        user-select: none;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    `;
    
    // Create report panel
    const reportPanel = document.createElement('div');
    reportPanel.id = 'doctorReportPanel';
    reportPanel.style.cssText = `
        position: fixed;
        top: 0;
        right: -500px;
        width: 480px;
        height: 100vh;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-left: 2px solid #5a9def;
        box-shadow: -10px 0 40px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        overflow-y: auto;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
    `;
    
    reportPanel.innerHTML = `
        <div style="padding: 24px; height: 100%; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #2a2a3e;">
                <h2 style="color: #5a9def; margin: 0; font-size: 20px; font-weight: 700;">Заключение врача</h2>
                <button id="closePanelBtn" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; border: none; border-radius: 8px; padding: 8px 12px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s;">
                    ✕ Закрыть
                </button>
            </div>
            
            <div id="patientInfo" style="background: rgba(90, 157, 239, 0.1); border: 1px solid rgba(90, 157, 239, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <h3 style="color: #5a9def; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Информация о пациенте</h3>
                <div style="color: #e0e0e0; font-size: 14px; line-height: 1.6;">
                    <div><strong>Пациент:</strong> <span id="patientName">Загрузка...</span></div>
                    <div><strong>ID:</strong> <span id="patientId">Загрузка...</span></div>
                    <div><strong>Исследование:</strong> <span id="studyDescription">Загрузка...</span></div>
                    <div><strong>Дата:</strong> <span id="studyDate">Загрузка...</span></div>
                    <div><strong>StudyID:</strong> <span id="studyInstanceUID">Загрузка...</span></div>
                </div>
            </div>
            
            <div style="flex: 1; display: flex; flex-direction: column;">
                <label for="reportText" style="color: #5a9def; margin-bottom: 8px; font-weight: 600; font-size: 14px;">Текст заключения:</label>
                <textarea id="reportText" placeholder="Введите заключение врача..." style="
                    flex: 1;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(90, 157, 239, 0.3);
                    border-radius: 8px;
                    padding: 16px;
                    color: #e0e0e0;
                    font-size: 14px;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    resize: none;
                    outline: none;
                    transition: all 0.2s;
                    min-height: 200px;
                "></textarea>
            </div>
            
            <div style="margin-top: 20px; display: flex; gap: 12px;">
                <button id="saveReport" style="
                    flex: 1;
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 12px 16px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                    transition: all 0.2s;
                ">💾 Сохранить</button>
                
                <button id="exportPDF" style="
                    flex: 1;
                    background: linear-gradient(135deg, #fd7e14 0%, #e55353 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 12px 16px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                    transition: all 0.2s;
                ">📄 Экспорт PDF</button>
            </div>
            
            <div id="statusMessage" style="margin-top: 12px; padding: 8px; border-radius: 6px; font-size: 12px; text-align: center; display: none;"></div>
        </div>
    `;
    
    // Add elements to body
    document.body.appendChild(floatingBtn);
    document.body.appendChild(reportPanel);
    
    console.log('Doctor report elements created successfully');
    
    // Initialize functionality after elements are created
    setTimeout(() => {
        if (window.DoctorReportExtension) {
            window.DoctorReportExtension.initializeEventListeners();
            console.log('Doctor report extension initialized');
        }
    }, 100);
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        waitForOHIF(createDoctorReportElements);
    });
} else {
    waitForOHIF(createDoctorReportElements);
}

// Also try to initialize when URL changes (for SPA navigation)
let currentURL = location.href;
setInterval(() => {
    if (location.href !== currentURL) {
        currentURL = location.href;
        console.log('URL changed, checking for doctor report elements...');
        
        if (!document.getElementById('doctorReportBtn')) {
            waitForOHIF(createDoctorReportElements);
        }
    }
}, 1000);

// Fallback: create elements after a delay
setTimeout(() => {
    if (!document.getElementById('doctorReportBtn')) {
        console.log('Fallback: Creating doctor report elements after delay');
        createDoctorReportElements();
    }
}, 3000);

console.log('Customizations.js loaded - Doctor Report system ready'); 