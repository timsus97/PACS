// 🚀 OHIF Authentication Disabler v3.0 - Fixed Edition
// Проверка на повторную загрузку
if (window.OHIF_AUTH_DISABLED) {
    console.log('🔄 OHIF Auth Disabler already loaded, skipping...');
} else {
    console.log('🔥 OHIF Authentication Disabler v3.0 - Loading...');

    // Маркер что скрипт уже загружен
    window.OHIF_AUTH_DISABLED = true;

    // Простое переопределение функций без Object.defineProperty
    window.isUserAuthenticated = function() {
        console.log('✅ isUserAuthenticated() HIJACKED - always returns true');
        return true;
    };

    window.checkAuthenticationOnLoad = function() {
        console.log('✅ checkAuthenticationOnLoad() HIJACKED - disabled');
        return;
    };

    window.getUserId = function() { return 'admin'; };
    window.getUserName = function() { return 'admin'; };
    window.getAuthorizationHeader = function() { return 'Bearer valid_admin_token_123'; };
    window.isAuthenticationRequired = function() { return false; };
    window.requireAuthentication = function() { return true; };
    window.redirectToLogin = function() {
        console.log('🚫 redirectToLogin() BLOCKED!');
        return;
    };

    // Перехват location redirects (только если еще не перехвачено)
    if (!window.LOCATION_HIJACKED) {
        window.LOCATION_HIJACKED = true;
        
        const origReplace = window.location.replace;
        const origAssign = window.location.assign;

        window.location.replace = function(url) {
            if (url && (url.includes('/login') || url.includes('login'))) {
                console.log('🚫 BLOCKED redirect to login:', url);
                return;
            }
            return origReplace.call(this, url);
        };

        window.location.assign = function(url) {
            if (url && (url.includes('/login') || url.includes('login'))) {
                console.log('🚫 BLOCKED redirect to login:', url);
                return;
            }
            return origAssign.call(this, url);
        };
    }

    // Перехват pushState/replaceState (только если еще не перехвачено)
    if (!window.HISTORY_HIJACKED) {
        window.HISTORY_HIJACKED = true;
        
        const origPushState = history.pushState;
        const origReplaceState = history.replaceState;

        history.pushState = function(state, title, url) {
            if (url && (url.includes('/login') || url.includes('login'))) {
                console.log('🚫 BLOCKED history.pushState to login:', url);
                return;
            }
            return origPushState.call(this, state, title, url);
        };

        history.replaceState = function(state, title, url) {
            if (url && (url.includes('/login') || url.includes('login'))) {
                console.log('🚫 BLOCKED history.replaceState to login:', url);
                return;
            }
            return origReplaceState.call(this, state, title, url);
        };
    }

    // Мониторинг попыток redirect (только если еще не запущен)
    if (!window.AUTH_OBSERVER_STARTED) {
        window.AUTH_OBSERVER_STARTED = true;
        
        const authObserver = new MutationObserver(() => {
            if (window.location.pathname.includes('/login')) {
                console.log('🚫 DETECTED login page - forcing back to OHIF');
                window.location.replace('/ohif/');
            }
        });

        // Запуск мониторинга когда DOM готов
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                if (document.body) {
                    authObserver.observe(document.body, { childList: true, subtree: true });
                }
            });
        } else {
            if (document.body) {
                authObserver.observe(document.body, { childList: true, subtree: true });
            }
        }
    }

    console.log('🎯 OHIF Authentication COMPLETELY DISABLED v3.0!');
    console.log('🔥 All authentication methods hijacked without errors');
    console.log('🚀 OHIF should load without authentication checks');
} 