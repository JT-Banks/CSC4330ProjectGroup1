const axios = require('axios');

async function testRegister() {
    try {
        console.log('Testing Railway backend register endpoint...');
        
        const response = await axios.post(
            'https://columbus-marketplace-backend-production.up.railway.app/api/auth/register',
            {
                name: 'Test User',
                email: 'test@lsu.edu', 
                password: 'password123'
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ Success:', response.status, response.data);
    } catch (error) {
        console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
        console.log('Full error:', error.code, error.response?.statusText);
    }
}

testRegister();
