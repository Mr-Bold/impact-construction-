import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authAPI } from '../services/api'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const [token, setToken] = useState(searchParams.get('token') || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    try {
      const { data } = await authAPI.resetPassword(token, password)
      setMessage(data.message)
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to reset your password.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">
      <div className="auth-slide-panel bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Choose a New Password</h1>
        <form onSubmit={handleSubmit}>
          <textarea value={token} onChange={(event) => setToken(event.target.value)} placeholder="Reset token" required rows="3" className="w-full px-4 py-3 border rounded-lg mb-4" />
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" minLength="8" required className="w-full px-4 py-3 border rounded-lg mb-4" />
          <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm new password" minLength="8" required className="w-full px-4 py-3 border rounded-lg mb-4" />
          {error && <p className="mb-4 rounded bg-red-100 px-4 py-3 text-red-700">{error}</p>}
          {message && <p className="mb-4 rounded bg-green-100 px-4 py-3 text-green-700">{message}</p>}
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">Reset Password</button>
        </form>
        <Link to="/login" className="block mt-6 text-center text-blue-600 hover:underline">Back to Login</Link>
      </div>
    </div>
  )
}
