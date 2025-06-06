// 🚀 МОЩНОЕ ОТКЛЮЧЕНИЕ АУТЕНТИФИКАЦИИ OHIF V2
console.log('🔥 OHIF Authentication KILLER v2.0 - Loading...');

// Функции для переопределения
const authFunctions = {
    isUserAuthenticated: () => {
        console.log('✅ isUserAuthenticated() HIJACKED - always returns true');
        return true;
    },
    checkAuthenticationOnLoad: () => {
        console.log('✅ checkAuthenticationOnLoad() HIJACKED - disabled');
        return;
    },
    getUserId: () => 'admin',
    getUserName: () => 'admin',
    getAuthorizationHeader: () => 'Bearer valid_admin_token_123',
    isAuthenticationRequired: () => false,
    requireAuthentication: () => true,
    redirectToLogin: () => {
        console.log('🚫 redirectToLogin() BLOCKED!');
        return;
    }
};

// Немедленное переопределение window
Object.assign(window, authFunctions);

// Переопределение через Object.defineProperty (нельзя перезаписать)
Object.keys(authFunctions).forEach(funcName => {
    try {
        Object.defineProperty(window, funcName, {
            value: authFunctions[funcName],
            writable: false,
            configurable: false
        });
        console.log(`🔒 ${funcName} LOCKED as always-authenticated`);
    } catch (e) {
        console.log(`⚠️ Could not lock ${funcName}:`, e);
    }
});

// Перехват location redirects
const originalReplace = window.location.replace;
const originalAssign = window.location.assign;

window.location.replace = function(url) {
    if (url && (url.includes('/login') || url.includes('login'))) {
        console.log('🚫 BLOCKED redirect to login:', url);
        return;
    }
    return originalReplace.call(this, url);
};

window.location.assign = function(url) {
    if (url && (url.includes('/login') || url.includes('login'))) {
        console.log('🚫 BLOCKED redirect to login:', url);
        return;
    }
    return originalAssign.call(this, url);
};

// Перехват pushState/replaceState для SPA
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function(state, title, url) {
    if (url && (url.includes('/login') || url.includes('login'))) {
        console.log('🚫 BLOCKED history.pushState to login:', url);
        return;
    }
    return originalPushState.call(this, state, title, url);
};

history.replaceState = function(state, title, url) {
    if (url && (url.includes('/login') || url.includes('login'))) {
        console.log('🚫 BLOCKED history.replaceState to login:', url);
        return;
    }
    return originalReplaceState.call(this, state, title, url);
};

// Мониторинг попыток redirect
const observer = new MutationObserver(() => {
    if (window.location.pathname.includes('/login')) {
        console.log('🚫 DETECTED login page - forcing back to OHIF');
        window.location.replace('/ohif/');
    }
});

// Запуск мониторинга когда DOM готов
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, { childList: true, subtree: true });
    });
} else {
    observer.observe(document.body, { childList: true, subtree: true });
}

console.log('🎯 OHIF Authentication COMPLETELY DISABLED - OHIF IS NOW AUTH-FREE!');
console.log('🔥 All authentication methods have been hijacked and disabled');
console.log('🚀 OHIF should load without any authentication checks'); 