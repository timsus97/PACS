// Service Worker initialization for Clinton Medical PACS
// Handles offline caching and background sync

(function() {
    'use strict';
    
    // Comprehensive check for service worker support
    function isServiceWorkerSupported() {
        return typeof navigator !== 'undefined' && 
               'serviceWorker' in navigator && 
               typeof navigator.serviceWorker !== 'undefined' &&
               typeof navigator.serviceWorker.register === 'function';
    }
    
    // Check if service workers are supported
    if (!isServiceWorkerSupported()) {
        console.warn('Service Workers are not supported in this browser or context');
        return;
    }
    
    // Register service worker when page loads
    function registerServiceWorker() {
        try {
            navigator.serviceWorker.register('/service-worker.js')
                .then(function(registration) {
                    console.log('Service Worker registered successfully:', registration.scope);
                    
                    // Check for updates
                    registration.addEventListener('updatefound', function() {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', function() {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    console.log('New content is available; please refresh.');
                                    // Optionally show update notification to user
                                }
                            });
                        }
                    });
                })
                .catch(function(error) {
                    console.log('Service Worker registration failed:', error);
                });
        } catch (e) {
            console.warn('Service Worker registration error:', e);
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', registerServiceWorker);
    } else {
        registerServiceWorker();
    }
    
    // Handle service worker messages
    if (isServiceWorkerSupported()) {
        try {
            navigator.serviceWorker.addEventListener('message', function(event) {
                console.log('Message from service worker:', event.data);
            });
        } catch (e) {
            console.warn('Service Worker message handler error:', e);
        }
    }
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {};
}