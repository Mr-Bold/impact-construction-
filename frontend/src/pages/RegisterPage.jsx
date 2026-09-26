import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI, settingsAPI } from '../services/api'
import heroImage from '../../assests/Why Do Hoist Accidents Happen_ – St_ Louis Work Injury Lawyers.jpeg'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [settings, setSettings] = useState({ business_name: 'Impact Construction' })
  const navigate = useNavigate()

  useEffect(() => {
    settingsAPI.getPublic().then(({ data }) => setSettings((current) => ({ ...current, ...data }))).catch(() => {})
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setError('')
    setIsSubmitting(true)
    try {
      await authAPI.register(formData)
      navigate('/login')
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to create your account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#08090a] p-4 text-[#111214] sm:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-sm bg-[#f1f1ef] shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative hidden min-h-full overflow-hidden lg:block"><img src={heroImage} alt="Impact Construction worksite" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-[#08090a]/55" /><div className="absolute bottom-12 left-12 max-w-md text-white"><p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-[#d7a83d]">Start building</p><h2 className="text-5xl font-black leading-none">A stronger space starts with a clear brief.</h2></div></div>
        <div className="auth-slide-panel flex flex-col justify-between p-7 sm:p-12">
          <Link to="/" className="flex items-center gap-3 text-lg font-black uppercase tracking-[0.15em]">{settings.logo_url ? <img src={settings.logo_url} alt={settings.business_name} className="h-12 w-16 object-contain" /> : <span className="flex h-10 w-10 items-center justify-center border border-[#d7a83d] bg-[#08090a] text-xl text-[#d7a83d]">I</span>}{settings.business_name}</Link>
          <div className="mx-auto w-full max-w-md py-10">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-[#b47b15]">Client portal</p>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl">Create your account.</h1>
            <p className="mt-4 text-[#62646a]">Track requests, review quotations, and stay connected with your project team.</p>
        
            <form onSubmit={handleSubmit} className="mt-8">
          <div className="mb-5 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border-0 border-b border-[#aeb1b3] bg-transparent px-0 py-3 outline-none focus:border-[#b47b15]"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full border-0 border-b border-[#aeb1b3] bg-transparent px-0 py-3 outline-none focus:border-[#b47b15]"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border-0 border-b border-[#aeb1b3] bg-transparent px-0 py-3 outline-none focus:border-[#b47b15]"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border-0 border-b border-[#aeb1b3] bg-transparent px-0 py-3 outline-none focus:border-[#b47b15]"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Password</label>
            <div className="relative"><input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border-0 border-b border-[#aeb1b3] bg-transparent px-0 py-3 pr-16 outline-none focus:border-[#b47b15]"
              required
            /><button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-0 top-3 text-xs font-black uppercase tracking-wider text-[#62646a]">{showPassword ? 'Hide' : 'Show'}</button></div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2">Confirm Password</label>
            <div className="relative"><input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border-0 border-b border-[#aeb1b3] bg-transparent px-0 py-3 pr-16 outline-none focus:border-[#b47b15]"
              required
            /><button type="button" onClick={() => setShowConfirmPassword((current) => !current)} className="absolute right-0 top-3 text-xs font-black uppercase tracking-wider text-[#62646a]">{showConfirmPassword ? 'Hide' : 'Show'}</button></div>
          </div>

          {error && <p className="mb-4 rounded bg-red-100 px-4 py-3 text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#111214] py-4 text-sm font-black uppercase tracking-wider text-white transition hover:bg-[#d7a83d] hover:text-[#111214]"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
            </form>

            <div className="mt-8 text-sm text-[#62646a]"><p>Already have an account? <Link to="/login" className="font-black text-[#9b6d12] hover:underline">Login</Link></p><Link to="/" className="mt-3 inline-block font-bold hover:text-[#9b6d12]">&lt;- Back to home</Link></div>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#62646a]">Concrete that lasts.</p>
        </div>
      </div>
    </div>
  )
}
