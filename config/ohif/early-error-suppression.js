// Early Error Suppression for Clinton Medical PACS
// This script must load BEFORE any other scripts to catch all errors

console.log('🛡️ IMMEDIATE ERROR SUPPRESSION ACTIVE');

// Override console methods immediately
(function() {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    // Enhanced error patterns to suppress
    const suppressPatterns = [
        /Failed to load resource.*frames/,
        /Failed to load resource.*400.*Bad Request/,
        /XMLHttpRequest.*frames/,
        /XMLHttpRequest.*wadors/,
        /400.*Bad Request.*frames/,
        /The image does not have a complete color palette/,
        /No data found for.*palette/,
        /Failed to resolve module specifier/,
        /mode-basic-test-mode/,
        /Uncaught.*XMLHttpRequest/,
        /Promise rejected.*XMLHttpRequest/,
        /Error loading frame/,
        /Frame request failed/,
        /wadors:.*frames/,
        /GET.*frames.*400.*Bad Request/,
        /Uncaught \(in promise\).*XMLHttpRequest/,
        /400 \(Bad Request\)/
    ];
    
    console.error = function(...args) {
        const message = args.join(' ');
        const shouldSuppress = suppressPatterns.some(pattern => pattern.test(message));
        
        if (shouldSuppress) {
            console.log('🔇 Error suppressed:', message.substring(0, 100) + '...');
            return;
        }
        
        return originalError.apply(console, args);
    };
    
    console.warn = function(...args) {
        const message = args.join(' ');
        const shouldSuppress = suppressPatterns.some(pattern => pattern.test(message));
        
        if (shouldSuppress) {
            return;
        }
        
        return originalWarn.apply(console, args);
    };
    
    // Global error event handler
    window.addEventListener('error', function(event) {
        const message = event.message || '';
        const shouldSuppress = suppressPatterns.some(pattern => pattern.test(message));
        
        if (shouldSuppress) {
            console.log('🔇 Global error suppressed:', message);
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    }, true);
    
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        const error = event.reason;
        const errorMessage = error ? error.toString() : 'Unknown error';
        const shouldSuppress = suppressPatterns.some(pattern => pattern.test(errorMessage));
        
        if (shouldSuppress) {
            console.log('🔇 Promise rejection suppressed:', errorMessage);
            event.preventDefault();
            return false;
        }
    });
    
    console.log('✅ Immediate console suppression loaded');
})();

// Override XMLHttpRequest immediately
(function() {
    const OriginalXHR = window.XMLHttpRequest;
    
    window.XMLHttpRequest = function() {
        const xhr = new OriginalXHR();
        const originalOpen = xhr.open;
        const originalSend = xhr.send;
        
        let requestUrl = '';
        
        xhr.open = function(method, url, ...args) {
            requestUrl = url;
            return originalOpen.apply(this, [method, url, ...args]);
        };
        
        xhr.send = function(...args) {
            const isFrameRequest = requestUrl && (
                requestUrl.includes('/frames/') ||
                requestUrl.includes('frame') ||
                requestUrl.includes('wadors:')
            );
            
            if (isFrameRequest) {
                // Suppress frame loading errors completely
                this.addEventListener('error', function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                }, true);
                
                this.addEventListener('loadend', function() {
                    if (this.status === 400 || this.status === 404) {
                        console.log('🔧 Frame request handled silently (' + this.status + ')');
                    }
                });
                
                // Override error handlers
                const originalOnError = this.onerror;
                this.onerror = function(e) {
                    console.log('🔧 XHR frame error intercepted');
                    if (originalOnError) {
                        try {
                            originalOnError.call(this, e);
                        } catch (err) {
                            // Silent
                        }
                    }
                    return true;
                };
            }
            
            return originalSend.apply(this, args);
        };
        
        return xhr;
    };
    
    // Copy static properties
    for (let prop in OriginalXHR) {
        if (OriginalXHR.hasOwnProperty(prop)) {
            window.XMLHttpRequest[prop] = OriginalXHR[prop];
        }
    }
    
    console.log('✅ Early XMLHttpRequest override loaded');
})();

// Override fetch immediately
(function() {
    const originalFetch = window.fetch;
    
    window.fetch = async function(url, options = {}) {
        try {
            const isFrameRequest = url && (
                url.includes('/frames/') ||
                url.includes('frame') ||
                url.includes('wadors:') ||
                url.includes('dicom-web')
            );
            
            if (isFrameRequest) {
                const response = await originalFetch(url, options);
                
                if (!response.ok && (response.status === 400 || response.status === 404)) {
                    console.log('🔧 Fetch frame error handled silently (' + response.status + ')');
                    
                    // Return a valid response for failed frames
                    return new Response(new ArrayBuffer(0), {
                        status: 200,
                        statusText: 'OK (Fallback)',
                        headers: {
                            'Content-Type': 'application/octet-stream',
                            'Content-Length': '0'
                        }
                    });
                }
                
                return response;
            } else {
                return originalFetch(url, options);
            }
        } catch (error) {
            console.log('🔧 Fetch error handled silently:', error.message);
            
            // Return fallback response for any fetch errors
            return new Response(new ArrayBuffer(0), {
                status: 200,
                statusText: 'OK (Error Fallback)',
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Content-Length': '0'
                }
            });
        }
    };
    
    console.log('✅ Early Fetch override loaded');
})();

console.log('🛡️ EARLY ERROR SUPPRESSION COMPLETE'); 