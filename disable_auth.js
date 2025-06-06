// EMERGENCY AUTH DISABLE SCRIPT
// This script overrides the authentication functions to always return true

console.log('Loading auth disable script...');

// Override isUserAuthenticated function
window.isUserAuthenticated = function() {
    console.log('Auth disabled - always authenticated');
    return true;
};

// Override checkAuthenticationOnLoad function  
window.checkAuthenticationOnLoad = function() {
    console.log('Auth check disabled on load');
    return;
};

// Also define as global functions
function isUserAuthenticated() {
    console.log('Global auth disabled - always authenticated');
    return true;
}

function checkAuthenticationOnLoad() {
    console.log('Global auth check disabled on load');
    return;
}

console.log('Auth disable script loaded successfully!');

// Полное отключение аутентификации OHIF
console.log('🚀 OHIF Authentication DISABLED by disable_auth.js');

// Переопределяем функции аутентификации
function isUserAuthenticated() {
    console.log('✅ isUserAuthenticated() overridden - always returns true');
    return true;
}

function checkAuthenticationOnLoad() {
    console.log('✅ checkAuthenticationOnLoad() overridden - disabled');
    return;
}

// Для window объекта
window.isUserAuthenticated = isUserAuthenticated;
window.checkAuthenticationOnLoad = checkAuthenticationOnLoad;

console.log('🎯 Authentication functions overridden successfully'); 