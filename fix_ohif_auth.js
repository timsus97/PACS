// Function to check if user is authenticated
function isUserAuthenticated() {
    try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('jwt_token');
        
        // If no token, not authenticated
        if (!token) {
            console.log('No auth token found');
            return false;
        }
        
        // Check for our simple token from Flask auth
        if (token === 'valid_admin_token_123') {
            console.log('Valid Flask auth token found');
            return true;
        }
        
        // Try to handle JWT tokens (fallback for future compatibility)
        try {
            if (token.includes('.')) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const currentTime = Math.floor(Date.now() / 1000);
                
                if (payload.exp && payload.exp < currentTime) {
                    // Token expired, remove it
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('jwt_token');
                    console.log('JWT token expired');
                    return false;
                }
                
                console.log('Valid JWT token found');
                return true;
            }
        } catch (jwtError) {
            console.log('Token is not a valid JWT, checking as simple token');
        }
        
        // For any other token, assume authenticated if it exists
        // This provides flexibility for different auth systems
        if (token.length > 0) {
            console.log('Non-empty token found, assuming authenticated');
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('Error checking authentication:', error);
        return false;
    }
} 