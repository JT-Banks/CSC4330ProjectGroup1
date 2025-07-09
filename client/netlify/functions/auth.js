// Netlify function to proxy auth requests to Railway backend
const RAILWAY_API_URL = 'https://columbus-marketplace-backend-production.up.railway.app/api';

exports.handler = async (event, context) => {
    // Only allow POST, GET methods
    const allowedMethods = ['POST', 'GET', 'OPTIONS'];
    if (!allowedMethods.includes(event.httpMethod)) {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
            }
        };
    }

    try {
        // Extract the auth path from the Netlify function path
        // Example: /.netlify/functions/auth/register -> /register
        const pathSegments = event.path.split('/');
        const authPath = pathSegments.slice(pathSegments.indexOf('auth') + 1).join('/');
        
        const railwayUrl = `${RAILWAY_API_URL}/auth/${authPath}`;

        console.log('Proxying request to:', railwayUrl);
        console.log('Method:', event.httpMethod);
        console.log('Body:', event.body);

        const response = await fetch(railwayUrl, {
            method: event.httpMethod,
            headers: {
                'Content-Type': 'application/json',
                // Forward any authorization headers
                ...(event.headers.authorization && { 'Authorization': event.headers.authorization })
            },
            body: event.httpMethod !== 'GET' ? event.body : undefined
        });

        const data = await response.text();
        let parsedData;
        try {
            parsedData = JSON.parse(data);
        } catch (e) {
            parsedData = data;
        }

        return {
            statusCode: response.status,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(parsedData)
        };

    } catch (error) {
        console.error('Proxy error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message 
            })
        };
    }
};
