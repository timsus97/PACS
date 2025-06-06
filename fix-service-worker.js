// Fix for Service Worker error
// This script prevents the TypeError: Cannot read properties of undefined (reading 'getRegistrations')

(function() {
    // Check if service worker is supported
    if ('serviceWorker' in navigator) {
        // Ensure serviceWorker.getRegistrations exists
        if (!navigator.serviceWorker.getRegistrations) {
            navigator.serviceWorker.getRegistrations = function() {
                return Promise.resolve([]);
            };
        }
    } else {
        // Create a mock serviceWorker for browsers that don't support it
        navigator.serviceWorker = {
            register: function() { return Promise.resolve(); },
            getRegistrations: function() { return Promise.resolve([]); },
            ready: Promise.resolve({
                unregister: function() { return Promise.resolve(); }
            })
        };
    }
    
    console.log('Service Worker compatibility layer initialized');
})(); 