// SPAM FIXED: 
// CLINTON BRANDING COMPLETE: 1749243451
// CUSTOMIZATIONS FIXED: 1749242788
// LOGOUT FIXED: 1749247892
(function() {
    const style = document.createElement('style');
    style.textContent = `
        /* Hide all investigational use texts and watermarks */
        .research-use-notification,
        .investigational-use,
        [class*="InvestigationalUse"],
        [class*="investigational"],
        [class*="research-use"],
        [data-cy*="investigational"],
        [data-testid*="investigational"],
        div:contains("INVESTIGATIONAL USE ONLY"),
        div:contains("investigational use only"),
        span:contains("INVESTIGATIONAL"),
        span:contains("investigational"),
        .cornerstone-canvas-overlay [class*="text"],
        [style*="INVESTIGATIONAL"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            position: absolute !important;
            left: -9999px !important;
            width: 0 !important;
            height: 0 !important;
        }
        
        /* Additional rules for any remaining elements */
        *[class*="watermark"],
        *[class*="overlay"]:contains("INVESTIGATIONAL"),
        .cornerstoneViewportOverlay *:contains("INVESTIGATIONAL") {
            display: none !important;
        }
        
        /* Hide OHIF standard header and branding */
        [class*="Header"],
        [class*="header"] {
            background: #1a1a2e !important;
        }
        
        /* Hide "Open Health Imaging Foundation" text */
        div:contains("Open Health Imaging Foundation"),
        span:contains("Open Health Imaging Foundation"),
        a:contains("Open Health Imaging Foundation"),
        [title="Open Health Imaging Foundation"],
        [alt="Open Health Imaging Foundation"] {
            display: none !important;
            visibility: hidden !important;
        }
        
        /* Custom styling for Clinton Medical branding */
        [class*="Logo"],
        [class*="logo"] {
            color: #5a9def !important;
        }
    `;
    document.head.appendChild(style);
})();

// Doctor report system for OHIF PACS with full functionality and multilingual support
// Global functions for managing reports and patient data
function getAllSavedReports() {
    try {
        const globalBackups = JSON.parse(localStorage.getItem('pacs_global_report_backups') || '[]');
        const patientKeys = Object.keys(localStorage).filter(key => key.startsWith('pacs_reports_'));
        
        let allReports = [...globalBackups];
        
        patientKeys.forEach(key => {
            try {
                const patientReports = JSON.parse(localStorage.getItem(key) || '[]');
                allReports = allReports.concat(patientReports);
            } catch (error) {
                console.error('Error loading reports from', key, ':', error);
            }
        });
        
        // Remove duplicates based on report ID
        const uniqueReports = allReports.filter((report, index, arr) => 
            arr.findIndex(r => r.id === report.id) === index
        );
        
        return uniqueReports.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } catch (error) {
        console.error('Error getting all saved reports:', error);
        return [];
    }
}

function getAllPatients() {
    try {
        const patientsData = localStorage.getItem('pacs_all_patients');
        return patientsData ? JSON.parse(patientsData) : {};
    } catch (error) {
        console.error('Error loading patients data:', error);
        return {};
    }
}

function saveAllPatients(patients) {
    try {
        localStorage.setItem('pacs_all_patients', JSON.stringify(patients));
    } catch (error) {
        console.error('Error saving patients data:', error);
    }
}

function getPatientReports(studyUID) {
    try {
        const reportsData = localStorage.getItem(`pacs_reports_${studyUID}`);
        const reports = reportsData ? JSON.parse(reportsData) : [];
        return reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
        console.error('Error loading patient reports:', error);
        return [];
    }
}

function savePatientReports(studyUID, reports) {
    try {
        localStorage.setItem(`pacs_reports_${studyUID}`, JSON.stringify(reports));
    } catch (error) {
        console.error('Error saving patient reports:', error);
    }
}

function parseDicomPatientName(dicomName) {
    try {
        if (!dicomName) return 'Unknown Patient';
        
        if (typeof dicomName === 'object' && dicomName.Alphabetic) {
            dicomName = dicomName.Alphabetic;
        }
        
        if (typeof dicomName === 'string') {
            const parts = dicomName.split('^');
            if (parts.length >= 2) {
                return parts.filter(p => p && p.trim()).join(' ').trim();
            } else {
                return dicomName.trim();
            }
        }
        
        return 'Unknown Patient';
    } catch (error) {
        console.error('Error parsing DICOM patient name:', error);
        return 'Unknown Patient';
    }
}

// Global function to get current study data
function getCurrentStudyData() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const studyUID = urlParams.get('StudyInstanceUIDs');
        
        if (!studyUID) {
            return {
                studyInstanceUID: 'Unknown',
                patientName: 'Unknown Patient',
                patientId: 'Unknown',
                studyDescription: 'Unknown Study',
                studyDate: new Date().toLocaleDateString('ru-RU')
            };
        }
        
        const currentStudyUID = studyUID.split(',')[0]; // Take first study if multiple
        
        // Try to get real data from Orthanc API
        return fetchStudyDataFromOrthanc(currentStudyUID);
        
    } catch (error) {
        console.error('Error getting study data:', error);
        return {
            studyInstanceUID: 'Unknown',
            patientName: 'Unknown Patient',
            patientId: 'Unknown',
            studyDescription: 'Unknown Study',
            studyDate: new Date().toLocaleDateString('ru-RU')
        };
    }
}

// Global function to fetch study data from Orthanc
function fetchStudyDataFromOrthanc(studyUID) {
    // Check cache first
    const cacheKey = `study_cache_${studyUID}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
        try {
            const parsedData = JSON.parse(cachedData);
            // Use cached data if it's less than 5 minutes old
            if (new Date() - new Date(parsedData.cachedAt) < 5 * 60 * 1000) {
                // console.log('Using cached study data for:', studyUID);
                return parsedData.data;
            }
        } catch (error) {
            console.error('Error parsing cached data:', error);
        }
    }
    
    // Return default data immediately, then fetch real data asynchronously
    const defaultData = {
        studyInstanceUID: studyUID,
        patientName: 'Загрузка...',
        patientId: 'Загрузка...',
        studyDescription: 'Загрузка...',
        studyDate: new Date().toLocaleDateString('ru-RU')
    };
    
    // Prevent multiple concurrent requests for the same study
    const requestKey = `fetching_${studyUID}`;
    if (window[requestKey]) {
        console.log('Request already in progress for study:', studyUID);
        return defaultData;
    }
    window[requestKey] = true;
    
    // Fetch real data from Orthanc
    fetchStudyDataAsync(studyUID).then(realData => {
        window[requestKey] = false;
        
        if (realData) {
            // Cache the data
            try {
                localStorage.setItem(cacheKey, JSON.stringify({
                    data: realData,
                    cachedAt: new Date().toISOString()
                }));
            } catch (error) {
                console.error('Error caching study data:', error);
            }
            
            // Update UI if currently viewing the same study
            const reportPanel = document.getElementById('doctorReportPanel');
            if (reportPanel && reportPanel.style.right === '0px') {
                const patientInfoDiv = document.getElementById('patientInfo');
                if (patientInfoDiv && patientInfoDiv.style.display !== 'none') {
                    displayPatientInfo(realData);
                    console.log('Updated with real patient data:', realData.patientName);
                }
            }
        }
    }).catch(error => {
        window[requestKey] = false;
        console.error('Failed to fetch study data from Orthanc:', error);
    });
    
    return defaultData;
}

// Global async function to fetch study data
async function fetchStudyDataAsync(studyUID) {
    try {
        // First, search for the study by StudyInstanceUID
        const searchResponse = await fetch(`/orthanc/dicom-web/studies?StudyInstanceUID=${encodeURIComponent(studyUID)}&includefield=00100010,00100020,00100030,00080020,00081030,00080060,0020000D`);
        
        if (!searchResponse.ok) {
            throw new Error(`HTTP error! status: ${searchResponse.status}`);
        }
        
        const studies = await searchResponse.json();
        
        if (!studies || studies.length === 0) {
            console.warn('No study found with UID:', studyUID);
            return null;
        }
        
        const study = studies[0];
        
        // Extract DICOM tags
        const patientName = parseDicomPatientName(extractDicomValue(study, '00100010')) || 'Unknown Patient';
        const patientId = extractDicomValue(study, '00100020') || 'Unknown ID';
        const patientBirthDate = extractDicomValue(study, '00100030') || '';
        const studyDate = extractDicomValue(study, '00080020') || '';
        const studyDescription = extractDicomValue(study, '00081030') || 'Unknown Study';
        const modality = extractDicomValue(study, '00080060') || 'Unknown';
        
        // Format dates
        const formattedStudyDate = formatDicomDate(studyDate) || new Date().toLocaleDateString('ru-RU');
        
        const studyData = {
            studyInstanceUID: studyUID,
            patientName: patientName,
            patientId: patientId,
            patientBirthDate: patientBirthDate,
            studyDescription: studyDescription,
            studyDate: formattedStudyDate,
            modality: modality,
            rawStudyDate: studyDate
        };
        
        console.log('Fetched real study data from Orthanc:', studyData);
        return studyData;
        
    } catch (error) {
        console.error('Error fetching study data from Orthanc:', error);
        return null;
    }
}

// Global helper functions
function extractDicomValue(dicomObject, tag) {
    try {
        const element = dicomObject[tag];
        if (!element) return null;
        
        if (element.Value && element.Value.length > 0) {
            return element.Value[0];
        }
        
        return null;
    } catch (error) {
        console.error('Error extracting DICOM value for tag', tag, ':', error);
        return null;
    }
}

function formatDicomDate(dicomDate) {
    try {
        if (!dicomDate || dicomDate.length < 8) return null;
        
        // DICOM date format: YYYYMMDD
        const year = dicomDate.substring(0, 4);
        const month = dicomDate.substring(4, 6);
        const day = dicomDate.substring(6, 8);
        
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('ru-RU');
    } catch (error) {
        console.error('Error formatting DICOM date:', error);
        return null;
    }
}

function generateReportId() {
    return 'report_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Global helper function for displaying patient info
function displayPatientInfo(patientData) {
    try {
        const patientNameEl = document.getElementById('patientName');
        const patientIdEl = document.getElementById('patientId');
        const studyDescEl = document.getElementById('studyDescription');
        const studyDateEl = document.getElementById('studyDate');
        const studyUIDEl = document.getElementById('studyInstanceUID');
        
        if (patientNameEl) patientNameEl.textContent = patientData.patientName || 'Unknown Patient';
        if (patientIdEl) patientIdEl.textContent = patientData.patientId || 'Unknown ID';
        if (studyDescEl) studyDescEl.textContent = patientData.studyDescription || 'Unknown Study';
        if (studyDateEl) studyDateEl.textContent = patientData.studyDate || 'Unknown Date';
        if (studyUIDEl) studyUIDEl.textContent = (patientData.studyInstanceUID || 'Unknown').substring(0, 30) + '...';
        
        // Add additional info if available
        if (patientData.modality && studyDescEl) {
            studyDescEl.textContent = `${patientData.studyDescription} (${patientData.modality})`;
        }
        
        console.log('Displayed patient info for:', patientData.patientName);
    } catch (error) {
        console.error('Error displaying patient info:', error);
    }
}

function importReportsData(jsonData) {
    try {
        const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
        
        if (!data.reports || !data.patients) {
            throw new Error('Invalid data format');
        }
        
        let importedReports = 0;
        let importedPatients = 0;
        
        // Import patients
        const existingPatients = getAllPatients();
        Object.keys(data.patients).forEach(studyUID => {
            existingPatients[studyUID] = data.patients[studyUID];
            importedPatients++;
        });
        saveAllPatients(existingPatients);
        
        // Import reports
        data.reports.forEach(report => {
            const existingReports = getPatientReports(report.studyUID);
            const existingIndex = existingReports.findIndex(r => r.id === report.id);
            
            if (existingIndex >= 0) {
                existingReports[existingIndex] = report;
                } else {
                existingReports.push(report);
            }
            
            savePatientReports(report.studyUID, existingReports);
            importedReports++;
        });
        
        console.log('Data import completed:', importedReports, 'reports imported');
        return true;
        
            } catch (error) {
        console.error('Error importing data:', error);
        return false;
    }
}

// Multilingual translations for the report system
const translations = {
    en: {
        // UI Elements
        reportTitle: 'Doctor\'s Reports',
        exportData: 'Export Data',
        close: 'Close',
        patientInfo: 'Patient Information',
        patient: 'Patient',
        patientID: 'ID',
        study: 'Study',
        date: 'Date',
        studyID: 'StudyID',
        reportHistory: 'Report History',
        newReport: 'New Report',
        noReports: 'No saved reports',
        newReportTitle: 'New Report',
        editReportTitle: 'Editing Report',
        reportPlaceholder: 'Enter doctor\'s report...',
        reportNamePlaceholder: 'Report name...',
        save: 'Save',
        exportPDF: 'Export PDF',
        delete: 'Delete',
        
        // Messages
        patientLoaded: 'Patient loaded',
        openStudy: 'Open a patient study to create a report',
        patientSwitched: 'Switched to patient',
        studyClosed: 'Study closed. Open another study',
        selectPatient: 'First select a patient',
        reportCreated: 'New report created',
        reportLoaded: 'Report loaded for editing',
        enterText: 'Enter report text before saving',
        reportSaved: 'Report saved',
        saveError: 'Save error! Try again or export to PDF',
        reportDeleted: 'Report deleted',
        deleteConfirm: 'Are you sure you want to delete this report?',
        noActiveReport: 'No active report for export',
        generatingPDF: 'Generating PDF',
        pdfReady: 'PDF ready',
        exportingData: 'Exporting all data...',
        exported: 'Exported',
        reportsFor: 'reports for',
        patients: 'patients',
        exportError: 'Data export error',
        noPatientData: 'No patient data for saving',
        noPatientExport: 'No patient data for export',
        
        // PDF Content
        clinicName: 'Clinton Medical PACS',
        patientInformation: 'Patient Information',
        patientName: 'Patient',
        patientIDLabel: 'Patient ID',
        studyDate: 'Study Date',
        studyData: 'Study Data',
        studyType: 'Study Type',
        doctorReport: 'Doctor\'s Report',
        doctor: 'Doctor',
        reportDate: 'Report Creation Date',
        time: 'Time',
        
        // Status
        created: 'Created',
        updated: 'Updated'
    },
    
    ru: {
        // UI Elements
        reportTitle: 'Заключения врача',
        exportData: 'Экспорт данных',
        close: 'Закрыть',
        patientInfo: 'Информация о пациенте',
        patient: 'Пациент',
        patientID: 'ID',
        study: 'Исследование',
        date: 'Дата',
        studyID: 'StudyID',
        reportHistory: 'История заключений',
        newReport: 'Новое заключение',
        noReports: 'Нет сохраненных заключений',
        newReportTitle: 'Новое заключение',
        editReportTitle: 'Редактирование заключения',
        reportPlaceholder: 'Введите заключение врача...',
        reportNamePlaceholder: 'Название заключения...',
        save: 'Сохранить',
        exportPDF: 'Экспорт PDF',
        delete: 'Удалить',
        
        // Messages
        patientLoaded: 'Загружен пациент',
        openStudy: 'Откройте исследование пациента для создания заключения',
        patientSwitched: 'Переключено на пациента',
        studyClosed: 'Исследование закрыто. Откройте другое исследование',
        selectPatient: 'Сначала выберите пациента',
        reportCreated: 'Создано новое заключение',
        reportLoaded: 'Заключение загружено для редактирования',
        enterText: 'Введите текст заключения перед сохранением',
        reportSaved: 'Заключение сохранено',
        saveError: 'Ошибка сохранения! Попробуйте еще раз или экспортируйте в PDF',
        reportDeleted: 'Заключение удалено',
        deleteConfirm: 'Вы уверены, что хотите удалить это заключение?',
        noActiveReport: 'Нет активного заключения для экспорта',
        generatingPDF: 'Генерация PDF',
        pdfReady: 'PDF готов',
        exportingData: 'Экспортируем все данные...',
        exported: 'Экспортировано',
        reportsFor: 'заключений для',
        patients: 'пациентов',
        exportError: 'Ошибка экспорта данных',
        noPatientData: 'Нет данных пациента для сохранения',
        noPatientExport: 'Нет данных пациента для экспорта',
        
        // PDF Content
        clinicName: 'Clinton Medical PACS',
        patientInformation: 'Информация о пациенте',
        patientName: 'Пациент',
        patientIDLabel: 'ID пациента',
        studyDate: 'Дата исследования',
        studyData: 'Данные исследования',
        studyType: 'Тип исследования',
        doctorReport: 'Заключение врача',
        doctor: 'Врач',
        reportDate: 'Дата создания заключения',
        time: 'Время',
        
        // Status
        created: 'Создано',
        updated: 'Обновлено'
    },
    
    es: {
        // UI Elements
        reportTitle: 'Informes Médicos',
        exportData: 'Exportar Datos',
        close: 'Cerrar',
        patientInfo: 'Información del Paciente',
        patient: 'Paciente',
        patientID: 'ID',
        study: 'Estudio',
        date: 'Fecha',
        studyID: 'ID del Estudio',
        reportHistory: 'Historial de Informes',
        newReport: 'Nuevo Informe',
        noReports: 'No hay informes guardados',
        newReportTitle: 'Nuevo Informe',
        editReportTitle: 'Editando Informe',
        reportPlaceholder: 'Ingrese el informe médico...',
        reportNamePlaceholder: 'Nombre del informe...',
        save: 'Guardar',
        exportPDF: 'Exportar PDF',
        delete: 'Eliminar',
        
        // Messages
        patientLoaded: 'Paciente cargado',
        openStudy: 'Abra un estudio del paciente para crear un informe',
        patientSwitched: 'Cambió al paciente',
        studyClosed: 'Estudio cerrado. Abra otro estudio',
        selectPatient: 'Primero seleccione un paciente',
        reportCreated: 'Nuevo informe creado',
        reportLoaded: 'Informe cargado para edición',
        enterText: 'Ingrese texto del informe antes de guardar',
        reportSaved: 'Informe guardado',
        saveError: 'Error al guardar! Intente de nuevo o exporte a PDF',
        reportDeleted: 'Informe eliminado',
        deleteConfirm: '¿Está seguro de que quiere eliminar este informe?',
        noActiveReport: 'No hay informe activo para exportar',
        generatingPDF: 'Generando PDF',
        pdfReady: 'PDF listo',
        exportingData: 'Exportando todos los datos...',
        exported: 'Exportado',
        reportsFor: 'informes para',
        patients: 'pacientes',
        exportError: 'Error de exportación de datos',
        noPatientData: 'No hay datos del paciente para guardar',
        noPatientExport: 'No hay datos del paciente para exportar',
        
        // PDF Content
        clinicName: 'Clinton Medical PACS',
        patientInformation: 'Información del Paciente',
        patientName: 'Paciente',
        patientIDLabel: 'ID del Paciente',
        studyDate: 'Fecha del Estudio',
        studyData: 'Datos del Estudio',
        studyType: 'Tipo de Estudio',
        doctorReport: 'Informe Médico',
        doctor: 'Doctor',
        reportDate: 'Fecha de Creación del Informe',
        time: 'Hora',
        
        // Status
        created: 'Creado',
        updated: 'Actualizado'
    },
    
    fr: {
        // UI Elements
        reportTitle: 'Rapports Médicaux',
        exportData: 'Exporter Données',
        close: 'Fermer',
        patientInfo: 'Information Patient',
        patient: 'Patient',
        patientID: 'ID',
        study: 'Étude',
        date: 'Date',
        studyID: 'ID Étude',
        reportHistory: 'Historique des Rapports',
        newReport: 'Nouveau Rapport',
        noReports: 'Aucun rapport sauvegardé',
        newReportTitle: 'Nouveau Rapport',
        editReportTitle: 'Édition du Rapport',
        reportPlaceholder: 'Entrez le rapport médical...',
        reportNamePlaceholder: 'Nom du rapport...',
        save: 'Sauvegarder',
        exportPDF: 'Exporter PDF',
        delete: 'Supprimer',
        
        // Messages
        patientLoaded: 'Patient chargé',
        openStudy: 'Ouvrez une étude patient pour créer un rapport',
        patientSwitched: 'Basculé vers le patient',
        studyClosed: 'Étude fermée. Ouvrez une autre étude',
        selectPatient: 'Sélectionnez d\'abord un patient',
        reportCreated: 'Nouveau rapport créé',
        reportLoaded: 'Rapport chargé pour édition',
        enterText: 'Entrez le texte du rapport avant de sauvegarder',
        reportSaved: 'Rapport sauvegardé',
        saveError: 'Erreur de sauvegarde! Réessayez ou exportez en PDF',
        reportDeleted: 'Rapport supprimé',
        deleteConfirm: 'Êtes-vous sûr de vouloir supprimer ce rapport?',
        noActiveReport: 'Aucun rapport actif pour l\'export',
        generatingPDF: 'Génération PDF',
        pdfReady: 'PDF prêt',
        exportingData: 'Export de toutes les données...',
        exported: 'Exporté',
        reportsFor: 'rapports pour',
        patients: 'patients',
        exportError: 'Erreur d\'export des données',
        noPatientData: 'Aucune donnée patient pour sauvegarder',
        noPatientExport: 'Aucune donnée patient pour export',
        
        // PDF Content
        clinicName: 'Clinton Medical PACS',
        patientInformation: 'Information du Patient',
        patientName: 'Patient',
        patientIDLabel: 'ID du Patient',
        studyDate: 'Date de l\'Étude',
        studyData: 'Données de l\'Étude',
        studyType: 'Type d\'Étude',
        doctorReport: 'Rapport Médical',
        doctor: 'Docteur',
        reportDate: 'Date de Création du Rapport',
        time: 'Heure',
        
        // Status
        created: 'Créé',
        updated: 'Mis à jour'
    },
    
    de: {
        // UI Elements
        reportTitle: 'Arztberichte',
        exportData: 'Daten Exportieren',
        close: 'Schließen',
        patientInfo: 'Patienteninformation',
        patient: 'Patient',
        patientID: 'ID',
        study: 'Studie',
        date: 'Datum',
        studyID: 'StudienID',
        reportHistory: 'Berichtsverlauf',
        newReport: 'Neuer Bericht',
        noReports: 'Keine gespeicherten Berichte',
        newReportTitle: 'Neuer Bericht',
        editReportTitle: 'Bericht Bearbeiten',
        reportPlaceholder: 'Arztbericht eingeben...',
        reportNamePlaceholder: 'Berichtsname...',
        save: 'Speichern',
        exportPDF: 'PDF Exportieren',
        delete: 'Löschen',
        
        // Messages
        patientLoaded: 'Patient geladen',
        openStudy: 'Öffnen Sie eine Patientenstudie um einen Bericht zu erstellen',
        patientSwitched: 'Gewechselt zu Patient',
        studyClosed: 'Studie geschlossen. Öffnen Sie eine andere Studie',
        selectPatient: 'Wählen Sie zuerst einen Patienten',
        reportCreated: 'Neuer Bericht erstellt',
        reportLoaded: 'Bericht zum Bearbeiten geladen',
        enterText: 'Berichtstext vor dem Speichern eingeben',
        reportSaved: 'Bericht gespeichert',
        saveError: 'Speicherfehler! Versuchen Sie es erneut oder exportieren Sie als PDF',
        reportDeleted: 'Bericht gelöscht',
        deleteConfirm: 'Sind Sie sicher, dass Sie diesen Bericht löschen möchten?',
        noActiveReport: 'Kein aktiver Bericht zum Exportieren',
        generatingPDF: 'PDF wird generiert',
        pdfReady: 'PDF bereit',
        exportingData: 'Exportiere alle Daten...',
        exported: 'Exportiert',
        reportsFor: 'Berichte für',
        patients: 'Patienten',
        exportError: 'Datenexport-Fehler',
        noPatientData: 'Keine Patientendaten zum Speichern',
        noPatientExport: 'Keine Patientendaten zum Exportieren',
        
        // PDF Content
        clinicName: 'Clinton Medical PACS',
        patientInformation: 'Patienteninformation',
        patientName: 'Patient',
        patientIDLabel: 'Patienten-ID',
        studyDate: 'Studiendatum',
        studyData: 'Studiendaten',
        studyType: 'Studientyp',
        doctorReport: 'Arztbericht',
        doctor: 'Arzt',
        reportDate: 'Erstellungsdatum des Berichts',
        time: 'Zeit',
        
        // Status
        created: 'Erstellt',
        updated: 'Aktualisiert'
    }
};

// Global variable for forced language
let forcedLanguage = null;
let lastLanguageCheck = null;
let languageCache = null;

// Function to get current language from OHIF
function getCurrentLanguage() {
    try {
        // Cache language for 30 seconds to reduce excessive checks
        const now = Date.now();
        if (languageCache && lastLanguageCheck && (now - lastLanguageCheck < 30000)) {
            return languageCache;
        }
        
        // Check for saved forced language first
        if (!forcedLanguage) {
            forcedLanguage = localStorage.getItem('pacs_forced_language');
        }
        
        // If user manually selected a language, use that
        if (forcedLanguage && translations[forcedLanguage]) {
            languageCache = forcedLanguage;
            lastLanguageCheck = now;
            return forcedLanguage;
        }
        
        // Method 1: Try to get language from i18next
        if (window.i18next && window.i18next.language) {
            const lang = window.i18next.language.split('-')[0].toLowerCase();
            if (translations[lang]) {
                languageCache = lang;
                lastLanguageCheck = now;
                return lang;
            }
        }
        
        // Method 2: Check localStorage for language preference
        const storedLang = localStorage.getItem('ohif-language') || localStorage.getItem('i18nextLng');
        if (storedLang) {
            const lang = storedLang.split('-')[0].toLowerCase();
            if (translations[lang]) {
                languageCache = lang;
                lastLanguageCheck = now;
                return lang;
            }
        }
        
        // Method 3: Check URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lng') || urlParams.get('language');
        if (urlLang) {
            const lang = urlLang.split('-')[0].toLowerCase();
            if (translations[lang]) {
                languageCache = lang;
                lastLanguageCheck = now;
                return lang;
            }
        }
        
        // Default to English - removed DOM detection as it was inaccurate
        languageCache = 'en';
        lastLanguageCheck = now;
        return 'en';
    } catch (error) {
        console.error('Error detecting language:', error);
        return 'en';
    }
}

// Function to get translated text
function t(key) {
    const currentLang = getCurrentLanguage();
    const translation = translations[currentLang];
    return translation && translation[key] ? translation[key] : translations.en[key] || key;
}

// Function to format date according to locale
function formatDate(date, locale = null) {
    if (!locale) {
        locale = getCurrentLanguage() === 'en' ? 'en-US' : 
                 getCurrentLanguage() === 'ru' ? 'ru-RU' : 
                 getCurrentLanguage() === 'es' ? 'es-ES' : 
                 getCurrentLanguage() === 'fr' ? 'fr-FR' : 
                 getCurrentLanguage() === 'de' ? 'de-DE' : 'en-US';
    }
    
    return new Date(date).toLocaleDateString(locale);
}

// Function to format time according to locale
function formatTime(date, locale = null) {
    if (!locale) {
        locale = getCurrentLanguage() === 'en' ? 'en-US' : 
                 getCurrentLanguage() === 'ru' ? 'ru-RU' : 
                 getCurrentLanguage() === 'es' ? 'es-ES' : 
                 getCurrentLanguage() === 'fr' ? 'fr-FR' : 
                 getCurrentLanguage() === 'de' ? 'de-DE' : 'en-US';
    }
    
    return new Date(date).toLocaleTimeString(locale);
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
    floatingBtn.innerHTML = `<i class="fa fa-file-text-o"></i> ${t('reportTitle')}`;
    floatingBtn.style.cssText = `
        position: fixed; bottom: 30px; right: 30px;
        background: linear-gradient(135deg, #5a9def 0%, #4285f4 100%);
        color: white; padding: 16px 24px; border-radius: 12px; cursor: pointer;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 14px; font-weight: 600; z-index: 10000; border: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        white-space: nowrap; user-select: none;
        box-shadow: 0 8px 32px rgba(90, 157, 239, 0.3);
    `;
    
    // Create report panel
    const reportPanel = document.createElement('div');
    reportPanel.id = 'doctorReportPanel';
    reportPanel.style.cssText = `
        position: fixed; top: 0; right: -500px; width: 480px; height: 100vh;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-left: 2px solid #5a9def; z-index: 9999;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        overflow-y: auto; box-shadow: -10px 0 40px rgba(0, 0, 0, 0.3);
    `;
    
    reportPanel.innerHTML = `
        <div style="padding: 24px; height: 100%; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #2a2a3e;">
                <h2 style="color: #5a9def; margin: 0; font-size: 20px; font-weight: 700;">${t('reportTitle')}</h2>
                <div style="display: flex; gap: 8px;">
                    <select id="languageSelector" style="background: rgba(255, 255, 255, 0.1); color: white; border: 1px solid rgba(90, 157, 239, 0.3); border-radius: 4px; padding: 4px 8px; font-size: 11px;">
                        <option value="en">🇺🇸 EN</option>
                        <option value="ru">🇷🇺 RU</option>
                        <option value="es">🇪🇸 ES</option>
                        <option value="fr">🇫🇷 FR</option>
                        <option value="de">🇩🇪 DE</option>
                    </select>
                    <button id="exportAllDataBtn" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; border: none; border-radius: 6px; padding: 6px 10px; cursor: pointer; font-size: 11px; font-weight: 600;">
                        💾 ${t('exportData')}
                    </button>
                    <button id="closePanelBtn" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; border: none; border-radius: 8px; padding: 8px 12px; cursor: pointer; font-size: 12px; font-weight: 600;">
                        ✕ ${t('close')}
                    </button>
                </div>
            </div>
            
            <div id="patientInfo" style="background: rgba(90, 157, 239, 0.1); border: 1px solid rgba(90, 157, 239, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 20px; display: none;">
                <h3 style="color: #5a9def; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">${t('patientInfo')}</h3>
                <div style="color: #e0e0e0; font-size: 14px; line-height: 1.6;">
                    <div><strong>${t('patient')}:</strong> <span id="patientName">-</span></div>
                    <div><strong>${t('patientID')}:</strong> <span id="patientId">-</span></div>
                    <div><strong>${t('study')}:</strong> <span id="studyDescription">-</span></div>
                    <div><strong>${t('date')}:</strong> <span id="studyDate">-</span></div>
                    <div><strong>${t('studyID')}:</strong> <span id="studyInstanceUID">-</span></div>
                </div>
            </div>

            <!-- Report History -->
            <div id="reportHistorySection" style="display: none; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h3 style="color: #5a9def; margin: 0; font-size: 16px; font-weight: 600;">${t('reportHistory')}</h3>
                    <button id="newReportBtn" style="
                        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                        color: white; border: none; border-radius: 6px; padding: 6px 12px; cursor: pointer;
                        font-size: 12px; font-weight: 600;
                    ">+ ${t('newReport')}</button>
                </div>
                <div id="reportsList" style="
                    max-height: 150px; overflow-y: auto;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(90, 157, 239, 0.2);
                    border-radius: 8px; padding: 8px;
                "></div>
            </div>
            
            <div id="reportEditor" style="flex: 1; display: none; flex-direction: column;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <label style="color: #5a9def; font-weight: 600; font-size: 14px;">
                        <span id="reportTitle">${t('newReportTitle')}</span>
                    </label>
                    <input type="text" id="reportName" placeholder="${t('reportNamePlaceholder')}" style="
                        background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(90, 157, 239, 0.3);
                        border-radius: 6px; padding: 6px 12px; color: #e0e0e0; font-size: 12px; width: 200px; outline: none;">
                </div>
                <textarea id="reportText" placeholder="${t('reportPlaceholder')}" style="
                    flex: 1; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(90, 157, 239, 0.3);
                    border-radius: 8px; padding: 16px; color: #e0e0e0; font-size: 14px;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    resize: none; outline: none; min-height: 200px;"></textarea>
                
                <div style="margin-top: 20px; display: flex; gap: 12px;">
                    <button id="saveReport" style="flex: 1; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; border: none; border-radius: 8px; padding: 12px 16px; cursor: pointer; font-weight: 600; font-size: 14px;">💾 ${t('save')}</button>
                    <button id="exportPDF" style="flex: 1; background: linear-gradient(135deg, #fd7e14 0%, #e55353 100%); color: white; border: none; border-radius: 8px; padding: 12px 16px; cursor: pointer; font-weight: 600; font-size: 14px;">📄 ${t('exportPDF')}</button>
                    <button id="deleteReport" style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; border: none; border-radius: 8px; padding: 12px 16px; cursor: pointer; font-weight: 600; font-size: 14px; display: none;">🗑️ ${t('delete')}</button>
                </div>
            </div>
            
            <div id="statusMessage" style="margin-top: 12px; padding: 8px; border-radius: 6px; font-size: 12px; text-align: center; display: none;"></div>
        </div>
    `;
    
    document.body.appendChild(floatingBtn);
    document.body.appendChild(reportPanel);
    
    console.log('Doctor report elements created successfully');
    initializeEventListeners();
}

// Function to initialize all event listeners
function initializeEventListeners() {
    console.log('Initializing doctor report event listeners...');
    
    const floatingBtn = document.getElementById('doctorReportBtn');
    const reportPanel = document.getElementById('doctorReportPanel');
    const closeBtn = document.getElementById('closePanelBtn');
    const exportAllDataBtn = document.getElementById('exportAllDataBtn');
    const languageSelector = document.getElementById('languageSelector');
    const newReportBtn = document.getElementById('newReportBtn');
    const saveBtn = document.getElementById('saveReport');
    const exportBtn = document.getElementById('exportPDF');
    const deleteBtn = document.getElementById('deleteReport');
    const reportText = document.getElementById('reportText');
    const reportName = document.getElementById('reportName');
    
    if (!floatingBtn || !reportPanel) {
        console.error('Doctor report elements not found');
        return;
    }
    
    let isPanelOpen = false;
    let currentStudyUID = null;
    let currentPatientData = null;
    let currentReportId = null;
    
    // Floating button click handler
    floatingBtn.addEventListener('click', function() {
        console.log('Floating button clicked');
        
        if (!isPanelOpen) {
            // Open panel
            reportPanel.style.right = '0px';
            floatingBtn.style.opacity = '0';
            floatingBtn.style.transform = 'scale(0)';
            isPanelOpen = true;
            
            // Update interface language when panel opens
            setTimeout(() => {
                updateInterfaceLanguage();
            }, 100);
            
            // Check if we have a current study open
            const currentStudy = getCurrentStudyData();
            if (currentStudy && currentStudy.studyInstanceUID !== 'Unknown') {
                // Automatically select current study patient
                console.log('Auto-loading current study patient:', currentStudy.patientName);
                selectPatient(currentStudy.studyInstanceUID, currentStudy);
                showMessage(`${t('patientLoaded')}: ${currentStudy.patientName}`, 'info');
            } else {
                // No study open, show empty state
                clearPatientInfo();
                showMessage(t('openStudy'), 'info');
            }
        } else {
            closePanel();
        }
    });
    
    // Close button handler
    if (closeBtn) {
        closeBtn.addEventListener('click', closePanel);
    }
    
    // Export all data button handler
    if (exportAllDataBtn) {
        exportAllDataBtn.addEventListener('click', exportAllReportsData);
    }
    
    // Language selector handler
    if (languageSelector) {
        // Set current language in selector
        languageSelector.value = getCurrentLanguage();
        
        languageSelector.addEventListener('change', function() {
            const selectedLang = this.value;
            console.log('User selected language:', selectedLang);
            
            // Set forced language
            forcedLanguage = selectedLang;
            localStorage.setItem('pacs_forced_language', selectedLang);
            
            // Update interface immediately
            updateInterfaceLanguage();
            
            // If panel is open, refresh content
            if (isPanelOpen) {
                if (currentStudyUID && currentPatientData) {
                    displayPatientInfo(currentPatientData);
                    loadReportHistory(currentStudyUID);
                }
            }
            
            console.log('Language changed to:', selectedLang);
        });
    }
    
    // New report button handler
    if (newReportBtn) {
        newReportBtn.addEventListener('click', createNewReport);
    }
    
    // Save button handler
    if (saveBtn) {
        saveBtn.addEventListener('click', saveCurrentReport);
    }
    
    // Export PDF button handler
    if (exportBtn) {
        exportBtn.addEventListener('click', exportCurrentReportToPDF);
    }
    
    // Delete button handler
    if (deleteBtn) {
        deleteBtn.addEventListener('click', deleteCurrentReport);
    }
    
    // Study change detection
    function checkForStudyChange() {
        if (isPanelOpen) {
            const studyData = getCurrentStudyData();
            const newStudyUID = studyData.studyInstanceUID;
            
            if (newStudyUID !== 'Unknown' && newStudyUID !== currentStudyUID) {
                console.log('Study changed from', currentStudyUID, 'to', newStudyUID);
                
                // Automatically load new patient data
                selectPatient(newStudyUID, studyData);
                
                showMessage(`${t('patientSwitched')}: ${studyData.patientName}`, 'info');
            } else if (newStudyUID === 'Unknown' && currentStudyUID) {
                // Study was closed, clear current patient
                console.log('Study closed, clearing patient info');
                clearPatientInfo();
                showMessage(t('studyClosed'), 'info');
            }
        }
    }
    
    // Check for study changes every 5 seconds (reduced frequency)
    setInterval(checkForStudyChange, 30000); // Reduced from 5s to 30s
    
    console.log('Event listeners initialized successfully');
    
    function closePanel() {
        reportPanel.style.right = '-500px';
        floatingBtn.style.opacity = '1';
        floatingBtn.style.transform = 'scale(1)';
        isPanelOpen = false;
        currentStudyUID = null;
        currentPatientData = null;
        currentReportId = null;
    }
    
    function selectPatient(studyUID, patientData = null) {
        // Use passed data first, then try localStorage
        let finalPatientData = patientData;
        
        if (!finalPatientData) {
            const allPatients = getAllPatients();
            finalPatientData = allPatients[studyUID];
        }
        
        if (finalPatientData) {
            currentStudyUID = studyUID;
            currentPatientData = finalPatientData;
            
            // Show patient info
            displayPatientInfo(finalPatientData);
            
            // Load report history
            loadReportHistory(studyUID);
            
            // Show sections
            document.getElementById('patientInfo').style.display = 'block';
            document.getElementById('reportHistorySection').style.display = 'block';
            
            // Save current patient data to localStorage for future use
            const allPatients = getAllPatients();
            allPatients[studyUID] = finalPatientData;
            saveAllPatients(allPatients);
            
            console.log('Selected patient:', finalPatientData.patientName, 'for study:', studyUID);
        } else {
            console.warn('No patient data found for study UID:', studyUID);
            showMessage(t('noPatientData'), 'error');
        }
    }
    
    function clearPatientInfo() {
        document.getElementById('patientInfo').style.display = 'none';
        document.getElementById('reportHistorySection').style.display = 'none';
        document.getElementById('reportEditor').style.display = 'none';
        
        currentStudyUID = null;
        currentPatientData = null;
        currentReportId = null;
        
        console.log('Cleared patient info and reset interface');
    }
    
    function displayPatientInfo(patientData) {
        document.getElementById('patientName').textContent = patientData.patientName || 'Unknown Patient';
        document.getElementById('patientId').textContent = patientData.patientId || 'Unknown ID';
        document.getElementById('studyDescription').textContent = patientData.studyDescription || 'Unknown Study';
        document.getElementById('studyDate').textContent = patientData.studyDate || 'Unknown Date';
        document.getElementById('studyInstanceUID').textContent = (patientData.studyInstanceUID || 'Unknown').substring(0, 30) + '...';
        
        // Add additional info if available
        if (patientData.modality) {
            const modalityInfo = document.getElementById('studyDescription');
            modalityInfo.textContent = `${patientData.studyDescription} (${patientData.modality})`;
        }
        
        console.log('Displayed patient info for:', patientData.patientName);
    }
    
    function loadReportHistory(studyUID) {
        const reports = getPatientReports(studyUID);
        const reportsList = document.getElementById('reportsList');
        
        if (reportsList) {
            reportsList.innerHTML = '';
            
            if (reports.length === 0) {
                reportsList.innerHTML = `<div style="color: #888; text-align: center; padding: 20px; font-size: 14px;">${t('noReports')}</div>`;
            } else {
                reports.forEach(report => {
                    const reportItem = document.createElement('div');
                    reportItem.style.cssText = `
                        background: rgba(90, 157, 239, 0.1);
                        border: 1px solid rgba(90, 157, 239, 0.2);
                        border-radius: 6px; padding: 12px; margin-bottom: 8px; cursor: pointer;
                        transition: all 0.2s;
                    `;
                    
                    reportItem.innerHTML = `
                        <div style="color: #5a9def; font-weight: 600; font-size: 14px; margin-bottom: 4px;">
                            ${report.name || `${t('newReport')} ${formatDate(report.createdAt)}`}
                        </div>
                        <div style="color: #ccc; font-size: 12px;">
                            ${t('created')}: ${formatDate(report.createdAt)} ${formatTime(report.createdAt)}
                            ${report.updatedAt && report.updatedAt !== report.createdAt ? 
                                ` | ${t('updated')}: ${formatDate(report.updatedAt)} ${formatTime(report.updatedAt)}` : ''}
                        </div>
                        <div style="color: #e0e0e0; font-size: 12px; margin-top: 4px; max-height: 40px; overflow: hidden;">
                            ${report.text ? report.text.substring(0, 100) + (report.text.length > 100 ? '...' : '') : t('noReports')}
                        </div>
                    `;
                    
                    reportItem.addEventListener('click', () => loadReport(report));
                    reportItem.addEventListener('mouseenter', () => {
                        reportItem.style.background = 'rgba(90, 157, 239, 0.2)';
                    });
                    reportItem.addEventListener('mouseleave', () => {
                        reportItem.style.background = 'rgba(90, 157, 239, 0.1)';
                    });
                    
                    reportsList.appendChild(reportItem);
                });
            }
        }
    }
    
    function createNewReport() {
        if (!currentPatientData) {
            showMessage(t('selectPatient'), 'error');
            return;
        }
        
        const newReport = {
            id: generateReportId(),
            studyUID: currentStudyUID,
            name: '',
            text: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            patientData: currentPatientData
        };
        
        loadReport(newReport, true);
    }
    
    function loadReport(report, isNew = false) {
        currentReportId = report.id;
        
        // Show editor
        document.getElementById('reportEditor').style.display = 'flex';
        
        // Fill form
        document.getElementById('reportName').value = report.name || '';
        document.getElementById('reportText').value = report.text || '';
        document.getElementById('reportTitle').textContent = isNew ? t('newReportTitle') : t('editReportTitle');
        
        // Show/hide delete button
        const deleteBtn = document.getElementById('deleteReport');
        if (deleteBtn) {
            deleteBtn.style.display = isNew ? 'none' : 'block';
        }
        
        showMessage(isNew ? t('reportCreated') : t('reportLoaded'), 'info');
    }
    
    function saveCurrentReport() {
        if (!currentReportId || !currentPatientData) {
            showMessage(t('noPatientData'), 'error');
            return;
        }
        
        const reportText = document.getElementById('reportText').value || '';
        const reportName = document.getElementById('reportName').value || `${t('newReport')} ${formatDate(new Date())}`;
        
        if (!reportText.trim()) {
            showMessage(t('enterText'), 'error');
            return;
        }
        
        const reportData = {
            id: currentReportId,
            studyUID: currentStudyUID,
            name: reportName,
            text: reportText,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            patientData: currentPatientData,
            version: '1.0'
        };
        
        try {
            // Check if report already exists
            const existingReports = getPatientReports(currentStudyUID);
            const existingIndex = existingReports.findIndex(r => r.id === currentReportId);
            
            if (existingIndex >= 0) {
                // Update existing report (keep original createdAt)
                reportData.createdAt = existingReports[existingIndex].createdAt;
                existingReports[existingIndex] = reportData;
            } else {
                // Add new report
                existingReports.push(reportData);
            }
            
            // Save to localStorage
            savePatientReports(currentStudyUID, existingReports);
            
            // Verify the save was successful
            const verifyReports = getPatientReports(currentStudyUID);
            const savedReport = verifyReports.find(r => r.id === currentReportId);
            
            if (savedReport && savedReport.text === reportText) {
                showMessage(`✅ ${t('reportSaved')}: ${reportData.name}`, 'success');
                console.log('Report saved successfully:', reportData.name, 'for patient:', currentPatientData.patientName);
                
                // Refresh history to show the saved report
                loadReportHistory(currentStudyUID);
                
            } else {
                throw new Error('Verification failed - report not saved correctly');
            }
            
        } catch (error) {
            console.error('Error saving report:', error);
            showMessage(`❌ ${t('saveError')}`, 'error');
        }
    }
    
    function deleteCurrentReport() {
        if (!currentReportId || !currentPatientData) {
            showMessage(t('noActiveReport'), 'error');
            return;
        }
        
        if (!confirm(t('deleteConfirm'))) {
            return;
        }
        
        const existingReports = getPatientReports(currentStudyUID);
        const filteredReports = existingReports.filter(r => r.id !== currentReportId);
        
        savePatientReports(currentStudyUID, filteredReports);
        showMessage(t('reportDeleted'), 'success');
        
        // Clear editor and refresh history
        document.getElementById('reportEditor').style.display = 'none';
        currentReportId = null;
        loadReportHistory(currentStudyUID);
    }
    
    function exportCurrentReportToPDF() {
        if (!currentReportId || !currentPatientData) {
            showMessage(t('noActiveReport'), 'error');
            return;
        }
        
        const reportName = document.getElementById('reportName').value || t('newReport');
        const reportText = document.getElementById('reportText').value || t('enterText');
        
        showMessage(`${t('generatingPDF')}: ${reportName}...`, 'info');
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>${reportName} - ${currentPatientData.patientName}</title>
                <style>
                    body { font-family: 'Times New Roman', serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
                    .header { text-align: center; border-bottom: 2px solid #5a9def; padding-bottom: 20px; margin-bottom: 30px; }
                    .clinic-name { color: #5a9def; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                    .patient-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
                    .study-info { background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #5a9def; }
                    .report-content { border: 1px solid #ddd; padding: 20px; border-radius: 8px; min-height: 300px; white-space: pre-wrap; }
                    .signature { margin-top: 50px; text-align: right; }
                    @media print { body { margin: 0; padding: 20px; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="clinic-name">${t('clinicName')}</div>
                    <div>${reportName}</div>
                </div>
                <div class="patient-info">
                    <h3>${t('patientInformation')}</h3>
                    <p><strong>${t('patientName')}:</strong> ${currentPatientData.patientName}</p>
                    <p><strong>${t('patientIDLabel')}:</strong> ${currentPatientData.patientId}</p>
                    <p><strong>${t('studyDate')}:</strong> ${currentPatientData.studyDate}</p>
                </div>
                <div class="study-info">
                    <h4>${t('studyData')}</h4>
                    <p><strong>${t('studyType')}:</strong> ${currentPatientData.studyDescription}</p>
                    <p><strong>${t('studyID')}:</strong> ${currentPatientData.studyInstanceUID}</p>
                </div>
                <h3>${t('doctorReport')}:</h3>
                <div class="report-content">${reportText}</div>
                <div class="signature">
                    <p>${t('doctor')}: _________________________</p>
                    <p>${t('reportDate')}: ${formatDate(new Date())}</p>
                    <p>${t('time')}: ${formatTime(new Date())}</p>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
            showMessage(`${t('pdfReady')}: ${reportName}`, 'success');
        }, 250);
    }
    
    function exportAllReportsData() {
        try {
            showMessage(t('exportingData'), 'info');
            
            // Collect all data
            const allReports = getAllSavedReports();
            const allPatients = getAllPatients();
            
            const exportData = {
                timestamp: new Date().toISOString(),
                version: '1.0',
                totalReports: allReports.length,
                totalPatients: Object.keys(allPatients).length,
                reports: allReports,
                patients: allPatients,
                metadata: {
                    exportedBy: t('clinicName'),
                    userAgent: navigator.userAgent,
                    url: window.location.href
                }
            };
            
            // Create and download file
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `pacs_reports_backup_${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.json`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(link.href);
            
            showMessage(`✅ ${t('exported')} ${allReports.length} ${t('reportsFor')} ${Object.keys(allPatients).length} ${t('patients')}`, 'success');
            console.log('Data export completed:', exportData.totalReports, 'reports exported');
            
        } catch (error) {
            console.error('Error exporting data:', error);
            showMessage(`❌ ${t('exportError')}`, 'error');
        }
    }
    
    function showMessage(text, type = 'info') {
        const msgElement = document.getElementById('statusMessage');
        if (!msgElement) return;
        
        msgElement.textContent = text;
        msgElement.style.display = 'block';
        
        if (type === 'success') {
            msgElement.style.background = 'rgba(40, 167, 69, 0.2)';
            msgElement.style.color = '#28a745';
            msgElement.style.border = '1px solid rgba(40, 167, 69, 0.3)';
        } else if (type === 'error') {
            msgElement.style.background = 'rgba(220, 53, 69, 0.2)';
            msgElement.style.color = '#dc3545';
            msgElement.style.border = '1px solid rgba(220, 53, 69, 0.3)';
        } else {
            msgElement.style.background = 'rgba(90, 157, 239, 0.2)';
            msgElement.style.color = '#5a9def';
            msgElement.style.border = '1px solid rgba(90, 157, 239, 0.3)';
        }
        
        setTimeout(() => {
            msgElement.style.display = 'none';
        }, 3000);
    }
    
    // Function to update interface language
    function updateInterfaceLanguage() {
        // Update floating button
        const floatingBtn = document.getElementById('doctorReportBtn');
        if (floatingBtn) {
            floatingBtn.innerHTML = `<i class="fa fa-file-text-o"></i> ${t('reportTitle')}`;
        }
        
        // Update language selector
        const languageSelector = document.getElementById('languageSelector');
        if (languageSelector) {
            languageSelector.value = getCurrentLanguage();
        }
        
        // Update panel header elements
        const headerElements = document.querySelector('#doctorReportPanel h2');
        if (headerElements) {
            headerElements.textContent = t('reportTitle');
        }
        
        // Update buttons
        const buttons = {
            'exportAllDataBtn': `💾 ${t('exportData')}`,
            'closePanelBtn': `✕ ${t('close')}`,
            'newReportBtn': `+ ${t('newReport')}`,
            'saveReport': `💾 ${t('save')}`,
            'exportPDF': `📄 ${t('exportPDF')}`,
            'deleteReport': `🗑️ ${t('delete')}`
        };
        
        Object.keys(buttons).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = buttons[id];
            }
        });
        
        // Update section headers
        const patientInfoHeader = document.querySelector('#patientInfo h3');
        if (patientInfoHeader) {
            patientInfoHeader.textContent = t('patientInfo');
        }
        
        const reportHistoryHeader = document.querySelector('#reportHistorySection h3');
        if (reportHistoryHeader) {
            reportHistoryHeader.textContent = t('reportHistory');
        }
        
        const reportTitleElement = document.getElementById('reportTitle');
        if (reportTitleElement) {
            const isNewReport = reportTitleElement.textContent.includes('New') || reportTitleElement.textContent.includes('Новое');
            reportTitleElement.textContent = isNewReport ? t('newReportTitle') : t('editReportTitle');
        }
        
        // Update patient info labels
        const patientInfoDiv = document.getElementById('patientInfo');
        if (patientInfoDiv) {
            const labels = patientInfoDiv.querySelectorAll('strong');
            const labelTexts = [t('patient'), t('patientID'), t('study'), t('date'), t('studyID')];
            labels.forEach((label, index) => {
                if (labelTexts[index]) {
                    label.textContent = labelTexts[index] + ':';
                }
            });
        }
        
        // Update placeholders
        const reportText = document.getElementById('reportText');
        const reportName = document.getElementById('reportName');
        if (reportText) reportText.placeholder = t('reportPlaceholder');
        if (reportName) reportName.placeholder = t('reportNamePlaceholder');
        
        // Update no reports message if visible
        const reportsList = document.getElementById('reportsList');
        if (reportsList && reportsList.innerHTML.includes('No saved reports') || reportsList.innerHTML.includes('Нет сохраненных')) {
            reportsList.innerHTML = `<div style="color: #888; text-align: center; padding: 20px; font-size: 14px;">${t('noReports')}</div>`;
        }
    }
    
    // Check for language changes periodically but less frequently
    let lastLanguage = getCurrentLanguage();
setInterval(() => {
        const currentLang = getCurrentLanguage();
        if (currentLang !== lastLanguage) {
            console.log('Language changed from', lastLanguage, 'to', currentLang);
            lastLanguage = currentLang;
            updateInterfaceLanguage();
            
            // If panel is open, also update patient info and reports
            if (isPanelOpen && currentStudyUID && currentPatientData) {
                displayPatientInfo(currentPatientData);
                loadReportHistory(currentStudyUID);
            }
        }
    }, 5000); // Check every 5 seconds instead of 1 second
}

// Function to add account info and logout to OHIF settings menu
function addAccountInfoToSettingsMenu() {
    console.log('Setting up account info integration...');
    
    // Function to find and modify the settings menu
    function modifySettingsMenu() {
        // Look for settings dropdown menu containers - improved selectors for OHIF
        const possibleMenuSelectors = [
            '[data-cy="UserPreferences"]',
            '[role="menu"]',
            '.dropdown-menu',
            '.user-menu',
            '.settings-menu',
            '.preferences-menu',
            // OHIF specific selectors
            '[class*="DropdownMenu"]',
            '[class*="dropdown"]',
            '[class*="Menu"]',
            '[class*="Popover"]',
            'div[role="menu"]',
            'ul[role="menu"]'
        ];
        
        let settingsMenu = null;
        
        // First try to find by text content
            const allElements = document.querySelectorAll('*');
        for (const element of allElements) {
            const elementText = element.textContent || '';
            const hasMenuStructure = element.children && element.children.length > 0;
            
            if (hasMenuStructure && (
                (elementText.includes('About') && elementText.includes('Preferences')) ||
                (elementText.includes('Acerca') && elementText.includes('Preferencias')) ||
                (elementText.includes('О программе') && elementText.includes('Настройки'))
            )) {
                // Check if this looks like a menu container
                const style = window.getComputedStyle(element);
                if (style.position === 'absolute' || style.position === 'fixed' || 
                    element.getAttribute('role') === 'menu' ||
                    element.className.toLowerCase().includes('menu') ||
                    element.className.toLowerCase().includes('dropdown') ||
                    element.className.toLowerCase().includes('popover')) {
                    settingsMenu = element;
                    break;
                }
            }
        }
        
        if (!settingsMenu) {
            // Try traditional selectors
            for (const selector of possibleMenuSelectors) {
                const elements = document.querySelectorAll(selector);
                for (const element of elements) {
                    // Check if this menu contains About or Preferences items
                    const menuText = element.textContent || '';
                    if (menuText.includes('About') || menuText.includes('Preferences') || 
                        menuText.includes('Acerca') || menuText.includes('Preferencias') ||
                        menuText.includes('О программе') || menuText.includes('Настройки')) {
                        settingsMenu = element;
                        break;
                    }
                }
                if (settingsMenu) break;
            }
        }
        
        if (!settingsMenu) {
            // Last resort: find any element that's positioned like a dropdown and contains both About and Preferences
            const dropdownElements = document.querySelectorAll('div, ul, nav');
            for (const element of dropdownElements) {
                const menuText = element.textContent || '';
                const style = window.getComputedStyle(element);
                
                if ((style.position === 'absolute' || style.position === 'fixed') &&
                    menuText.includes('About') && menuText.includes('Preferences')) {
                    settingsMenu = element;
                    break;
                }
            }
        }
        
        if (settingsMenu && !settingsMenu.querySelector('.account-info-section')) {
            console.log('Adding account info to settings menu');
            addAccountSection(settingsMenu);
        }
    }
    
    function addAccountSection(menuElement) {
        // Get current user info
        const currentUser = getCurrentUserInfo();
        
        // Create account info section
        const accountSection = document.createElement('div');
        accountSection.className = 'account-info-section';
        accountSection.style.cssText = `
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            margin-bottom: 8px;
            padding-bottom: 8px;
        `;
        
        // User info display
        const userInfo = document.createElement('div');
        userInfo.style.cssText = `
            padding: 12px 16px;
            background: rgba(90, 157, 239, 0.1);
            border-radius: 6px;
            margin-bottom: 8px;
        `;
        
        userInfo.innerHTML = `
            <div style="color: #5a9def; font-weight: 600; font-size: 14px; margin-bottom: 4px;">
                👤 ${currentUser.name}
            </div>
            <div style="color: #ccc; font-size: 12px;">
                ${currentUser.role} • ${currentUser.email}
            </div>
            <div style="color: #888; font-size: 11px; margin-top: 2px;">
                ${t('reportDate')}: ${formatTime(new Date())}
            </div>
        `;
        
        // Logout button
        const logoutButton = document.createElement('button');
        logoutButton.style.cssText = `
            width: 100%;
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            color: white;
            border: none;
            border-radius: 6px;
            padding: 10px 16px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        `;
        
        logoutButton.innerHTML = `🚪 ${getLogoutText()}`;
        
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            performLogout();
        });
        
        logoutButton.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
            this.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
        });
        
        logoutButton.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'none';
        });
        
        // Assemble section
        accountSection.appendChild(userInfo);
        accountSection.appendChild(logoutButton);
        
        // Insert at the top of the menu
        if (menuElement.firstChild) {
            menuElement.insertBefore(accountSection, menuElement.firstChild);
        } else {
            menuElement.appendChild(accountSection);
        }
        
    }
    
    function getCurrentUserInfo() {
        try {
            // Try to get user info from JWT token
            const token = localStorage.getItem('jwt_token') || localStorage.getItem('authToken');
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const username = payload.user || payload.username || 'Unknown';
                
                // Get display name based on username
                let displayName = username;
                if (username === 'admin') {
                    displayName = 'Administrator';
                } else if (username === 'doctor') {
                    displayName = 'Doctor';
                } else if (username === 'operator') {
                    displayName = 'Operator';
                }
                
                return {
                    name: displayName,
                    username: username,
                    email: payload.email || 'user@clintonmedical.com',
                    role: getRoleText(payload.role || 'doctor'),
                    userId: payload.sub || payload.user_id || 'unknown'
                        };
                    }
                } catch (error) {
            console.error('Error parsing user token:', error);
        }
        
        // Fallback user info
        return {
            name: 'User',
            username: 'guest',
            email: 'guest@clintonmedical.com', 
            role: getRoleText('doctor'),
            userId: 'guest'
        };
    }
    
    function getRoleText(role) {
        const currentLang = getCurrentLanguage();
        const roleTranslations = {
            'admin': {
                'en': 'Administrator',
                'ru': 'Администратор',
                'es': 'Administrador',
                'fr': 'Administrateur',
                'de': 'Administrator'
            },
            'doctor': {
                'en': 'Doctor',
                'ru': 'Врач',
                'es': 'Doctor',
                'fr': 'Docteur',
                'de': 'Arzt'
            },
            'operator': {
                'en': 'Operator',
                'ru': 'Оператор',
                'es': 'Operador',
                'fr': 'Opérateur',
                'de': 'Operator'
            }
        };
        
        return roleTranslations[role]?.[currentLang] || roleTranslations[role]?.['en'] || role;
    }
    
    function getLogoutText() {
        const logoutTranslations = {
            'en': 'Logout',
            'ru': 'Выход',
            'es': 'Cerrar sesión',
            'fr': 'Déconnexion',
            'de': 'Abmelden'
        };
        
        return logoutTranslations[getCurrentLanguage()] || 'Logout';
    }
    
    function performLogout() {
        const confirmText = {
            'en': 'Are you sure you want to logout?',
            'ru': 'Вы уверены, что хотите выйти?',
            'es': '¿Está seguro de que quiere cerrar sesión?',
            'fr': 'Êtes-vous sûr de vouloir vous déconnecter?',
            'de': 'Sind Sie sicher, dass Sie sich abmelden möchten?'
        };
        
        if (confirm(confirmText[getCurrentLanguage()] || confirmText['en'])) {
            console.log('Performing complete logout...');
            
            // Create logout overlay immediately
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                z-index: 99999;
            `;
            
            overlay.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 20px;">👋</div>
                    <div style="font-size: 24px; margin-bottom: 10px;">Clearing all sessions...</div>
                    <div style="font-size: 14px; color: #ccc;">Complete logout in progress...</div>
                </div>
            `;
            
            document.body.appendChild(overlay);
            
            // Complete session clearing function
            function clearAllAuthData() {
                // Clear localStorage completely
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && (
                        key.includes('supabase') ||
                        key.includes('auth') ||
                        key.includes('token') ||
                        key.includes('session') ||
                        key.includes('sb-') ||
                        key === 'jwt_token' ||
                        key === 'authToken' ||
                        key === 'user_session' ||
                        key === 'refresh_token'
                    )) {
                        keysToRemove.push(key);
                    }
                }
                
                keysToRemove.forEach(key => {
                    localStorage.removeItem(key);
                    console.log('Removed from localStorage:', key);
                });
                
                // Clear sessionStorage completely
                const sessionKeysToRemove = [];
                for (let i = 0; i < sessionStorage.length; i++) {
                    const key = sessionStorage.key(i);
                    if (key && (
                        key.includes('supabase') ||
                        key.includes('auth') ||
                        key.includes('token') ||
                        key.includes('session') ||
                        key.includes('sb-')
                    )) {
                        sessionKeysToRemove.push(key);
                    }
                }
                
                sessionKeysToRemove.forEach(key => {
                    sessionStorage.removeItem(key);
                    console.log('Removed from sessionStorage:', key);
                });
                
                // Clear all cookies
                document.cookie.split(";").forEach(function(c) { 
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                });
                
                // Clear any Supabase auth if available
                if (window.supabase && window.supabase.auth && window.supabase.auth.signOut) {
                    window.supabase.auth.signOut();
                }
                
                console.log('All authentication data cleared!');
            }
            
            // Execute clearing
            clearAllAuthData();
            
            // Redirect to login with force logout parameter
            setTimeout(() => {
                // Use location.replace to avoid back button issues
                window.location.replace('/login?logout=true&t=' + Date.now());
            }, 2000);
        }
    }
    
    // Set up observers to catch when the menu appears
    function setupMenuObserver() {
        let lastMenuCheck = 0;
        const MENU_CHECK_INTERVAL = 10000; // Check every 10 seconds instead of 3
        
        const observer = new MutationObserver(function(mutations) {
            const now = Date.now();
            if (now - lastMenuCheck < 1000) return; // Debounce: don't check more than once per second
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if a menu was added
                            if (node.querySelector && (
                                node.matches && (
                                    node.matches('[role="menu"]') ||
                                    node.matches('.dropdown-menu') ||
                                    node.matches('[class*="menu"]') ||
                                    node.matches('[class*="Menu"]') ||
                                    node.matches('[class*="dropdown"]') ||
                                    node.matches('[class*="Dropdown"]')
                                ) ||
                                node.querySelector('[role="menu"], .dropdown-menu, [class*="menu"], [class*="Menu"], [class*="dropdown"], [class*="Dropdown"]')
                            )) {
                                lastMenuCheck = now;
                                setTimeout(modifySettingsMenu, 100);
                    }
                }
            });
            }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Check periodically but less frequently
        setInterval(modifySettingsMenu, MENU_CHECK_INTERVAL);
        
        // Add manual trigger function to window for debugging (only in development)
        if (window.location.hostname === 'localhost') {
            window.debugAddAccountInfo = function() {
                console.log('Manual trigger: searching for settings menu...');
                modifySettingsMenu();
                
                // Debug: show all potential menu elements
                console.log('All elements with menu-like classes:');
                const menuLikeElements = document.querySelectorAll('[class*="menu"], [class*="Menu"], [class*="dropdown"], [class*="Dropdown"], [role="menu"]');
                menuLikeElements.forEach((el, index) => {
                    console.log(`Menu element ${index}:`, el, 'Text:', el.textContent?.substring(0, 100));
                });
                
                // Debug: show elements containing About/Preferences
                console.log('Elements containing About or Preferences:');
                const allElements = document.querySelectorAll('*');
                let foundElements = [];
                allElements.forEach(el => {
                    const text = el.textContent || '';
                    if (text.includes('About') || text.includes('Preferences')) {
                        foundElements.push(el);
                    }
                });
                foundElements.forEach((el, index) => {
                    console.log(`About/Preferences element ${index}:`, el, 'Text:', el.textContent?.substring(0, 100));
                });
            };
            
            console.log('Debug mode: Use window.debugAddAccountInfo() to manually trigger menu search.');
        }
    }
    
    // Initialize
    setupMenuObserver();
    
    // Try immediate modification in case menu is already there
    setTimeout(modifySettingsMenu, 1000);
    setTimeout(modifySettingsMenu, 3000);
    setTimeout(modifySettingsMenu, 5000);
    
    console.log('Account info integration setup complete');
}

// Function to check if user is authenticated
function isUserAuthenticated() {
    try {
        const token = localStorage.getItem('jwt_token') || localStorage.getItem('authToken');
        if (!token) return false;
        
        // Check if token is valid (not expired)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp < currentTime) {
            // Token expired, remove it
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user_session');
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error checking authentication:', error);
        // Clear invalid tokens
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user_session');
        return false;
    }
}

// Function to redirect to login if not authenticated
function checkAuthenticationOnLoad() {
    // AUTO AUTH DISABLED - no automatic login redirect
    return;
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        forceEnglishLanguage();
        checkAuthenticationOnLoad(); // AUTO AUTH ENABLED
        createDoctorReportElements();
        setTimeout(addAccountInfoToSettingsMenu, 2000);
    });
} else {
    forceEnglishLanguage();
    checkAuthenticationOnLoad(); // AUTO AUTH ENABLED
    setTimeout(createDoctorReportElements, 1000);
    setTimeout(addAccountInfoToSettingsMenu, 3000);
}

console.log('Doctor Report system loaded - full functionality restored'); 

// Function to force English language
function forceEnglishLanguage() {
    // Clear any cached language that might be wrong
    languageCache = null;
    lastLanguageCheck = null;
    
    // Set forced language to English
    forcedLanguage = 'en';
    localStorage.setItem('pacs_forced_language', 'en');
    
    // Also try to set OHIF language if possible
    if (window.i18next && window.i18next.changeLanguage) {
        window.i18next.changeLanguage('en');
    }
    
    console.log('Forced interface language to English');
}

// Function to redirect to login if not authenticated
function checkAuthenticationOnLoad() {
    // AUTO AUTH DISABLED - no automatic login redirect
    return;
}

// Initialize the report system when DOM is ready
function initReportSystem() {
    // DOM is already ready since this script loads after page load
    createDoctorReportElements();
    
    // Monitor viewport changes
    const observer = new MutationObserver(function(mutations) {
        // Handle viewport changes if needed
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                // Check for study changes
                const currentStudy = getCurrentStudyData();
                if (currentStudy && currentStudy.studyInstanceUID !== 'Unknown') {
                    // console.log('Study detected in viewport:', currentStudy.patientName);
                }
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });
    
    console.log('Report system initialized successfully');
}

// Anti-investigational use patrol - continuously remove any investigational elements
function antiInvestigationalPatrol() {
    try {
        // Find and remove any elements containing investigational text
        const investigationalSelectors = [
            '*[class*="investigational"]',
            '*[class*="InvestigationalUse"]', 
            '*[class*="research-use"]',
            '*[data-cy*="investigational"]',
            '*[data-testid*="investigational"]',
            '.research-use-notification',
            '.investigational-use'
        ];
        
        investigationalSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el) {
                    el.style.display = 'none';
                    el.style.visibility = 'hidden';
                    el.style.opacity = '0';
                    el.remove();
                }
            });
        });
        
        // Find elements by text content
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let textNode;
        const investigationalTexts = [
            'INVESTIGATIONAL USE ONLY',
            'investigational use only',
            'INVESTIGATIONAL',
            'investigational'
        ];
        
        while (textNode = walker.nextNode()) {
            const text = textNode.textContent;
            if (investigationalTexts.some(invText => text.includes(invText))) {
                const parent = textNode.parentElement;
                if (parent) {
                    parent.style.display = 'none';
                    parent.remove();
                }
            }
        }
        
        // Remove canvas overlay texts that might contain investigational content
        const canvasOverlays = document.querySelectorAll('.cornerstone-canvas-overlay, .viewport-overlay');
        canvasOverlays.forEach(overlay => {
            const textElements = overlay.querySelectorAll('*');
            textElements.forEach(el => {
                if (el.textContent && (
                    el.textContent.includes('INVESTIGATIONAL') || 
                    el.textContent.includes('investigational')
                )) {
                    el.style.display = 'none';
                    el.remove();
                }
            });
        });
        
    } catch (error) {
        // Silently handle errors to avoid disrupting the main application
    }
}

// Run anti-investigational patrol every 500ms
setInterval(antiInvestigationalPatrol, 500);

// Run immediately
antiInvestigationalPatrol();

// Start the report system
initReportSystem();// Clinton Medical Branding - Replace OHIF Foundation text
function replaceBrandingText() {
    // Skip if already replaced
    if (document.body.textContent.includes("Clinton Medical PACS") && document.querySelectorAll("*").length > 100) {
        return;
    }
    console.log('Replacing OHIF Foundation branding with Clinton Medical...');
    
    // Replace all text nodes containing OHIF Foundation
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    let node;
    const replacements = [
        { from: 'Open Health Imaging Foundation', to: 'Clinton Medical PACS' },
        { from: 'OHIF', to: 'Clinton Medical' },
        { from: 'ohif', to: 'Clinton Medical' }
    ];
    
    while (node = walker.nextNode()) {
        let text = node.textContent;
        let replaced = false;
        
        replacements.forEach(replacement => {
            if (text.includes(replacement.from)) {
                text = text.replace(new RegExp(replacement.from, 'g'), replacement.to);
                replaced = true;
            }
        });
        
        if (replaced) {
            node.textContent = text;
            console.log('Replaced branding text:', text);
        }
    }
    
    // Replace attributes and aria-labels
    document.querySelectorAll('[aria-label*="OHIF"], [title*="OHIF"], [alt*="OHIF"]').forEach(el => {
        if (el.getAttribute('aria-label')) {
            el.setAttribute('aria-label', el.getAttribute('aria-label').replace(/OHIF/g, 'Clinton Medical'));
        }
        if (el.getAttribute('title')) {
            el.setAttribute('title', el.getAttribute('title').replace(/OHIF/g, 'Clinton Medical'));
        }
        if (el.getAttribute('alt')) {
            el.setAttribute('alt', el.getAttribute('alt').replace(/OHIF/g, 'Clinton Medical'));
        }
    });
    
    console.log('Clinton Medical branding replacement completed');
}

// Run branding replacement multiple times to catch dynamically loaded content
function initClintonBranding() {
    console.log('Initializing Clinton Medical branding...');
    
    // Initial replacement
    setTimeout(replaceBrandingText, 1000);
    
    // Repeated replacements for dynamic content
    
    // Observe DOM changes and replace branding
    const observer = new MutationObserver((mutations) => {
        let shouldReplace = false;
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                shouldReplace = true;
            }
        });
        
        if (shouldReplace) {
            // Debounced replacement
            clearTimeout(window.brandingTimeout);
            window.brandingTimeout = setTimeout(replaceBrandingText, 2000);
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('Clinton Medical branding observer started');
}

// Add to initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClintonBranding);
} else {
    initClintonBranding();
} 