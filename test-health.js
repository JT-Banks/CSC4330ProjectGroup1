const axios = require('axios');

async function testHealth() {
    try {
        console.log('Testing Railway backend health endpoint...');
        
        const response = await axios.get(
            'https://columbus-marketplace-backend-production.up.railway.app/health'
        );
        
        console.log('✅ Health check success:', response.status, response.data);
        
        // Now test auth health
        const authResponse = await axios.get(
            'https://columbus-marketplace-backend-production.up.railway.app/api/auth/health'
        );
        
        console.log('✅ Auth health success:', authResponse.status, authResponse.data);
        
    } catch (error) {
        console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
        console.log('Error code:', error.code);
    }
}

testHealth();
