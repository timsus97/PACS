// 🚀 Clinton Medical PACS - Supabase Auth Configuration
// Заменяет старую Flask авторизацию на современный Supabase

// ⚠️ ВАЖНО: Замени эти значения на реальные из твоего Supabase проекта:
// 1. Создай проект на https://supabase.com
// 2. Скопируй URL и anon key из Settings → API
// 3. Замени значения ниже

// Supabase configuration
const SUPABASE_CONFIG = {
  url: 'https://evirehefoqleegubokcl.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2aXJlaGVmb3FsZWVndWJva2NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMzA2ODUsImV4cCI6MjA2NDgwNjY4NX0.1-QSy_-OUQeYDc1YtJ5PlwavpbTmOKDXD3oSK4d2H74',
  
  // Auth settings
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    
    // Redirect URLs
    redirectTo: 'https://srv853233.hstgr.cloud/',
    
    // Providers (можно добавить Google, GitHub и т.д.)
    providers: ['email'],
    
    // User roles for PACS
    userRoles: {
      'admin': ['admin'],
      'doctor': ['doctor'], 
      'operator': ['operator']
    }
  }
};

// 🔧 OHIF Integration with Supabase
window.config = {
  routerBasename: '/',
  showStudyList: true,
  maxNumberOfWebWorkers: 4,
  
  // ✅ Supabase Authentication Integration
  userAuthenticationService: {
    async isAuthenticated() {
      const { data: { user } } = await supabase.auth.getUser();
      return !!user;
    },
    
    async getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    
    async getAccessToken() {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token;
    },
    
    async signOut() {
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
  },
  
  // Custom authentication function for OHIF
  isUserAuthenticated: async function() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🔐 Supabase Auth Check:', user ? 'AUTHENTICATED' : 'NOT AUTHENTICATED');
      return !!user;
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      return false;
    }
  },
  
  // Data sources (без изменений)
  dataSources: [
    {
      namespace: "@ohif/extension-default.dataSourcesModule.dicomweb",
      sourceName: "dicomweb",
      configuration: {
        friendlyName: "Clinton PACS",
        name: "DCM4CHEE",
        wadoUriRoot: "https://srv853233.hstgr.cloud/orthanc/dicom-web",
        qidoRoot: "https://srv853233.hstgr.cloud/orthanc/dicom-web",
        wadoRoot: "https://srv853233.hstgr.cloud/orthanc/dicom-web",
        qidoSupportsIncludeField: false,
        supportsReject: false,
        imageRendering: "wadors",
        thumbnailRendering: "wadors",
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: false,
        supportsWildcard: false,
        dicomUploadEnabled: false,
        
        // 🔑 Authorization headers for Orthanc requests
        requestOptions: {
          headers: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            return {
              'Authorization': `Bearer ${session?.access_token || ''}`,
              'Content-Type': 'application/json'
            };
          }
        }
      }
    }
  ],
  
  defaultDataSourceName: "dicomweb"
};

// Initialize Supabase client
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Global auth state management
window.supabase = supabase;
window.authConfig = SUPABASE_CONFIG; 