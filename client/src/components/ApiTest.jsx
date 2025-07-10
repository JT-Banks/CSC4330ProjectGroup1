import React from 'react'
import { authAPI } from '../services/api'

const ApiTest = () => {
  const testRegistration = async () => {
    console.log('🔍 Testing registration from React component...')
    try {
      const result = await authAPI.register(
        'React Test User',
        `reacttest${Date.now()}@lsu.edu`,
        'testpassword123'
      )
      console.log('✅ Registration success:', result.data)
      alert('Registration success: ' + result.data.message)
    } catch (error) {
      console.error('❌ Registration error:', error)
      alert('Registration error: ' + (error.response?.data?.message || error.message))
    }
  }

  const testLogin = async () => {
    console.log('🔍 Testing login from React component...')
    try {
      const result = await authAPI.login('test@lsu.edu', 'testpassword')
      console.log('✅ Login success:', result.data)
      alert('Login success: ' + result.data.message)
    } catch (error) {
      console.error('❌ Login error:', error)
      alert('Login error: ' + (error.response?.data?.message || error.message))
    }
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>API Test Component</h3>
      <button onClick={testRegistration} style={{ marginRight: '10px' }}>
        Test Registration
      </button>
      <button onClick={testLogin}>
        Test Login
      </button>
    </div>
  )
}

export default ApiTest
