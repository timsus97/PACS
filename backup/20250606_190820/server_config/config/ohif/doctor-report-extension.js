// Doctor Report Extension for Klinika Pro PACS
// Implements Rule 4.2: "Doctor's Report" tab with PDF export

(function() {
    'use strict';

    // Check if user has permission to view doctor reports
    function hasPermission() {
        try {
            const token = localStorage.getItem('jwt_token');
            if (!token) return false;
            
            // Parse JWT token to get roles
            const payload = JSON.parse(atob(token.split('.')[1]));
            const roles = payload.roles || [];
            
            return roles.includes('doctor') || roles.includes('admin');
        } catch (e) {
            console.error('Error checking permissions:', e);
            return false;
        }
    }

    // Get user information from JWT
    function getUserInfo() {
        try {
            const token = localStorage.getItem('jwt_token');
            if (!token) return { username: 'Unknown', roles: [] };
            
            const payload = JSON.parse(atob(token.split('.')[1]));
            return {
                username: payload.user || 'Unknown',
                roles: payload.roles || []
            };
        } catch (e) {
            console.error('Error getting user info:', e);
            return { username: 'Unknown', roles: [] };
        }
    }

    // Save report to localStorage
    function saveReport(studyInstanceUID, reportData) {
        try {
            const key = `doctor_report_${studyInstanceUID}`;
            const reportWithMeta = {
                ...reportData,
                lastModified: new Date().toISOString(),
                author: getUserInfo().username,
                version: (reportData.version || 0) + 1
            };
            localStorage.setItem(key, JSON.stringify(reportWithMeta));
            return true;
        } catch (e) {
            console.error('Error saving report:', e);
            return false;
        }
    }

    // Load report from localStorage
    function loadReport(studyInstanceUID) {
        try {
            const key = `doctor_report_${studyInstanceUID}`;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error loading report:', e);
            return null;
        }
    }

    // Generate PDF report using jsPDF
    function generatePDF(studyData, reportContent) {
        // Load jsPDF if not already loaded
        if (typeof window.jsPDF === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => generatePDF(studyData, reportContent);
            document.head.appendChild(script);
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const userInfo = getUserInfo();
        
        // Set up fonts and spacing
        let yPosition = 30;
        const lineHeight = 10;
        const margin = 20;
        
        // Header
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Klinika Pro PACS', margin, yPosition);
        doc.text('Заключение врача', margin, yPosition + 15);
        
        // Horizontal line
        yPosition += 30;
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition, 190, yPosition);
        yPosition += 15;
        
        // Patient Information
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Информация о пациенте:', margin, yPosition);
        yPosition += lineHeight;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text(`Пациент: ${studyData.patientName || 'Не указано'}`, margin, yPosition);
        yPosition += lineHeight;
        doc.text(`ID пациента: ${studyData.patientId || 'Не указано'}`, margin, yPosition);
        yPosition += lineHeight;
        doc.text(`Дата рождения: ${studyData.patientBirthDate || 'Не указано'}`, margin, yPosition);
        yPosition += lineHeight + 5;
        
        // Study Information
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Информация об исследовании:', margin, yPosition);
        yPosition += lineHeight;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text(`Study ID: ${studyData.studyInstanceUID || 'Не указано'}`, margin, yPosition);
        yPosition += lineHeight;
        doc.text(`Дата исследования: ${studyData.studyDate || 'Не указано'}`, margin, yPosition);
        yPosition += lineHeight;
        doc.text(`Модальность: ${studyData.modality || 'Не указано'}`, margin, yPosition);
        yPosition += lineHeight + 10;
        
        // Report Content
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Заключение:', margin, yPosition);
        yPosition += lineHeight + 5;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        
        // Split report content into lines
        const reportLines = doc.splitTextToSize(reportContent || 'Заключение не заполнено', 170);
        reportLines.forEach(line => {
            if (yPosition > 260) { // Check if we need a new page
                doc.addPage();
                yPosition = 30;
            }
            doc.text(line, margin, yPosition);
            yPosition += lineHeight;
        });
        
        // Footer with signature
        yPosition = Math.max(yPosition + 20, 250);
        if (yPosition > 260) {
            doc.addPage();
            yPosition = 30;
        }
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Врач:', margin, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(`${userInfo.username}`, margin + 30, yPosition);
        yPosition += lineHeight;
        
        doc.text('Дата создания отчета:', margin, yPosition);
        doc.text(new Date().toLocaleString('ru-RU'), margin + 60, yPosition);
        yPosition += lineHeight + 10;
        
        doc.text('Подпись врача: ____________________', margin, yPosition);
        
        // Generate filename
        const filename = `report_${studyData.patientName?.replace(/\s+/g, '_') || 'patient'}_${new Date().toISOString().split('T')[0]}.pdf`;
        
        // Save PDF
        doc.save(filename);
    }

    // Create the main report tab interface
    function createReportTab(studyData) {
        const container = document.createElement('div');
        container.id = 'doctor-report-tab';
        container.style.cssText = `
            padding: 0;
            background: #1e1e1e;
            color: #ffffff;
            height: 100%;
            display: flex;
            flex-direction: column;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            border-radius: 0;
            overflow: hidden;
        `;

        // Load existing report
        const existingReport = loadReport(studyData.studyInstanceUID);
        
        container.innerHTML = `
            <!-- Header -->
            <div style="
                background: linear-gradient(135deg, #5a9def 0%, #4285f4 100%);
                color: white;
                padding: 16px 20px;
                border-bottom: 1px solid #333;
                display: flex;
                align-items: center;
                gap: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            ">
                <span style="font-size: 20px;">📋</span>
                <div>
                    <h2 style="margin: 0; font-size: 18px; font-weight: 600;">Doctor's Report</h2>
                    <p style="margin: 0; font-size: 12px; opacity: 0.9;">Klinika Pro</p>
                </div>
            </div>

            <!-- Content Area -->
            <div style="
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                background: #1e1e1e;
                display: flex;
                flex-direction: column;
                gap: 20px;
            ">
                <!-- Patient Info Section -->
                <div style="
                    background: #2a2a2a;
                    border-radius: 8px;
                    padding: 16px;
                    border: 1px solid #3a3a3a;
                ">
                    <h3 style="
                        margin: 0 0 12px 0;
                        color: #e0e0e0;
                        font-size: 14px;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    ">Patient Information</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
                        <div>
                            <span style="color: #888; font-weight: 500;">Patient:</span>
                            <span style="color: #fff; margin-left: 8px;">${studyData.patientName || 'Unknown'}</span>
                        </div>
                        <div>
                            <span style="color: #888; font-weight: 500;">ID:</span>
                            <span style="color: #fff; margin-left: 8px;">${studyData.patientId || 'Unknown'}</span>
                        </div>
                        <div>
                            <span style="color: #888; font-weight: 500;">DOB:</span>
                            <span style="color: #fff; margin-left: 8px;">${studyData.patientBirthDate || 'Unknown'}</span>
                        </div>
                        <div>
                            <span style="color: #888; font-weight: 500;">Study Date:</span>
                            <span style="color: #fff; margin-left: 8px;">${studyData.studyDate || 'Unknown'}</span>
                        </div>
                    </div>
                </div>

                <!-- Report Section -->
                <div style="
                    background: #2a2a2a;
                    border-radius: 8px;
                    padding: 16px;
                    border: 1px solid #3a3a3a;
                    flex: 1;
                ">
                    <label style="
                        display: block;
                        margin-bottom: 12px;
                        color: #e0e0e0;
                        font-size: 14px;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    ">📝 Medical Findings:</label>
                    <textarea 
                        id="doctor-report-content" 
                        placeholder="Enter your medical findings and diagnosis here..."
                        style="
                            width: 100%;
                            height: 300px;
                            background: #1e1e1e;
                            border: 2px solid #444;
                            border-radius: 6px;
                            color: #ffffff;
                            padding: 16px;
                            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            font-size: 14px;
                            line-height: 1.5;
                            resize: vertical;
                            transition: border-color 0.2s ease;
                            box-sizing: border-box;
                        "
                        onfocus="this.style.borderColor='#5a9def'"
                        onblur="this.style.borderColor='#444'"
                    >${existingReport ? existingReport.content : ''}</textarea>
                </div>

                <!-- Action Buttons -->
                <div style="
                    display: flex;
                    gap: 12px;
                    padding-top: 8px;
                ">
                    <button 
                        id="save-report-btn"
                        style="
                            flex: 1;
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                            color: white;
                            border: none;
                            padding: 12px 20px;
                            border-radius: 6px;
                            font-size: 14px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.2s ease;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 8px;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        "
                        onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(16, 185, 129, 0.3)'"
                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'"
                    >
                        <span>💾</span>
                        Save Report
                    </button>
                    
                    <button 
                        id="export-pdf-btn"
                        style="
                            flex: 1;
                            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                            color: white;
                            border: none;
                            padding: 12px 20px;
                            border-radius: 6px;
                            font-size: 14px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.2s ease;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 8px;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        "
                        onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(245, 158, 11, 0.3)'"
                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'"
                    >
                        <span>📄</span>
                        Export PDF
                    </button>
                </div>

                <!-- Study Info Footer -->
                <div style="
                    font-size: 12px;
                    color: #888;
                    padding-top: 8px;
                    border-top: 1px solid #333;
                    text-align: center;
                ">
                    Study ID: ${studyData.studyInstanceUID}
                </div>
            </div>
        `;

        // Auto-save functionality
        let autoSaveTimeout;
        const textarea = container.querySelector('#doctor-report-content');
        
        if (textarea) {
            textarea.addEventListener('input', () => {
                clearTimeout(autoSaveTimeout);
                autoSaveTimeout = setTimeout(() => {
                    const content = textarea.value;
                    const reportData = {
                        content: content,
                        studyInstanceUID: studyData.studyInstanceUID,
                        timestamp: new Date().toISOString()
                    };
                    saveReport(studyData.studyInstanceUID, reportData);
                    
                    // Show auto-save feedback
                    showToast('📝 Auto-saved', 'success');
                }, 2000); // Auto-save after 2 seconds of inactivity
            });
        }

        // Save button handler
        const saveBtn = container.querySelector('#save-report-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const content = textarea ? textarea.value : '';
                const reportData = {
                    content: content,
                    studyInstanceUID: studyData.studyInstanceUID,
                    timestamp: new Date().toISOString()
                };
                
                if (saveReport(studyData.studyInstanceUID, reportData)) {
                    showToast('💾 Report saved successfully', 'success');
                } else {
                    showToast('❌ Failed to save report', 'error');
                }
            });
        }

        // Export PDF button handler
        const exportBtn = container.querySelector('#export-pdf-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const content = textarea ? textarea.value : '';
                generatePDF(studyData, content);
                showToast('📄 PDF exported successfully', 'success');
            });
        }

        return container;
    }

    // Show toast notification
    function showToast(message, type = 'info') {
        // Remove existing toast
        const existingToast = document.querySelector('#doctor-report-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.id = 'doctor-report-toast';
        
        let backgroundColor, iconColor;
        switch (type) {
            case 'success':
                backgroundColor = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                iconColor = '#ffffff';
                break;
            case 'error':
                backgroundColor = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                iconColor = '#ffffff';
                break;
            case 'warning':
                backgroundColor = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
                iconColor = '#ffffff';
                break;
            default: // info
                backgroundColor = 'linear-gradient(135deg, #5a9def 0%, #4285f4 100%)';
                iconColor = '#ffffff';
        }
        
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 1000001;
            background: ${backgroundColor};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            transform: translateX(100%);
            opacity: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            gap: 8px;
            max-width: 300px;
        `;
        
        toast.innerHTML = message;
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        }, 10);
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
    }

    // Initialize report tab
    function initializeReportTab(studyData) {
        if (!hasPermission()) {
            return null;
        }
        
        return createReportTab(studyData);
    }

    // Export to global scope
    window.DoctorReportExtension = {
        hasPermission,
        initializeReportTab,
        saveReport,
        loadReport,
        generatePDF,
        getUserInfo
    };

    console.log('✅ Doctor Report Extension loaded successfully');

})(); 