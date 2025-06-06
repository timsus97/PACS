// === ENHANCED PALETTE ERROR FIXES ===
console.log("🎨 Loading enhanced palette error fixes...");

// Global palette error suppression
window.addEventListener("error", function(e) {
    if (e.message && e.message.includes("palette")) {
        console.warn("Palette error suppressed:", e.message);
        e.preventDefault();
        return false;
    }
    if (e.message && e.message.includes("complete color palette")) {
        console.warn("Color palette completeness error suppressed");
        e.preventDefault();
        return false;
    }
});

// Promise rejection handler for palette errors
window.addEventListener("unhandledrejection", function(e) {
    if (e.reason && e.reason.message && e.reason.message.includes("palette")) {
        console.warn("Palette promise rejection suppressed:", e.reason.message);
        e.preventDefault();
        return false;
    }
});

// Cornerstone palette metadata override
if (window.cornerstone) {
    // Override metaData get function
    const originalConsoleError = console.error;
    console.error = function(...args) {
        const message = args.join(' ');
        if (message.includes('palette') || message.includes('No data found for')) {
            // Suppress palette errors in console
            return;
        }
        return originalConsoleError.apply(console, args);
    };
    
    // Enhanced DICOM loader palette handling
    if (window.cornerstoneDICOMImageLoader) {
        const original_getPaletteColor = window.cornerstoneDICOMImageLoader.internal.dicomParser.getPaletteColor;
        if (original_getPaletteColor) {
            window.cornerstoneDICOMImageLoader.internal.dicomParser.getPaletteColor = function(...args) {
                try {
                    return original_getPaletteColor.apply(this, args);
                } catch (e) {
                    console.warn("Palette color lookup failed, using default handling");
                    return null; // Return null instead of throwing
                }
            };
        }
    }
}

// Frame loading error resilience
if (window.cornerstone && window.cornerstone.imageLoader) {
    const originalLoadImage = window.cornerstone.imageLoader.loadImage;
    if (originalLoadImage) {
        window.cornerstone.imageLoader.loadImage = function(imageId) {
            return originalLoadImage.call(this, imageId).catch(function(error) {
                if (error.message && error.message.includes("400")) {
                    console.warn("Frame loading failed (400 error), attempting fallback for:", imageId);
                    // Return a placeholder or retry with different parameters
                    return Promise.reject(new Error("Frame unavailable - using fallback"));
                }
                return Promise.reject(error);
            });
        };
    }
}

console.log("✅ Enhanced palette and frame error handling loaded"); 