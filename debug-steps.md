# Debug Script - Run these tests in order

## Test 1: Railway Backend Health Check
# Open in browser or curl:
https://columbus-marketplace-backend-production.up.railway.app/health

## Test 2: Railway Auth Endpoint 
# This should return 404 or method not allowed (GET not supported):
https://columbus-marketplace-backend-production.up.railway.app/api/auth/register

## Test 3: Frontend Debug Console
# 1. Go to: https://columbusmarketplace.netlify.app/register
# 2. Open browser Developer Tools (F12)
# 3. Look in Console tab for debug messages:
#    - 🔍 VITE_API_URL: should show Railway URL
#    - 🔍 Axios baseURL: should show Railway URL
# 4. Go to Network tab
# 5. Try to register a user
# 6. Check what URL the POST request goes to

## Test 4: Manual API Test
# Use this curl command to test registration directly:
curl -X POST https://columbus-marketplace-backend-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@lsu.edu","password":"testpass123"}'
