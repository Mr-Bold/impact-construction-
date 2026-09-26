import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI, settingsAPI } from '../services/api'
import heroImage from '../../assests/Why Do Hoist Accidents Happen_ – St_ Louis Work Injury Lawyers.jpeg'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [settings, setSettings] = useState({ business_name: 'Impact Construction' })

  useEffect(() => {
    settingsAPI.getPublic().then(({ data }) => setSettings((current) => ({ ...current, ...data }))).catch(() => {})
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    setIsSubmitting(true)
    try {
      const { data } = await authAPI.forgotPassword(email)
      setMessage(data.resetToken ? `Development reset token: ${data.resetToken}` : data.message)
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to process your request.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#08090a] p-4 text-[#111214] sm:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-sm bg-[#f1f1ef] shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
        <div className="auth-slide-panel flex flex-col justify-between p-7 sm:p-12">
          <Link to="/" className="flex items-center gap-3 text-lg font-black uppercase tracking-[0.15em]">{settings.logo_url ? <img src={settings.logo_url} alt={settings.business_name} className="h-12 w-16 object-contain" /> : <span className="flex h-10 w-10 items-center justify-center border border-[#d7a83d] bg-[#08090a] text-xl text-[#d7a83d]">I</span>}{settings.business_name}</Link>
          <div className="mx-auto w-full max-w-md py-12"><p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-[#b47b15]">Account recovery</p><h1 className="text-4xl font-black leading-tight sm:text-5xl">Get back to building.</h1><p className="mt-4 text-[#62646a]">Enter the email connected to your client account and we’ll help you choose a new password.</p>
            <form onSubmit={handleSubmit} className="mt-9"><label className="text-xs font-black uppercase tracking-wider text-[#62646a]">Email address</label><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required className="mt-2 w-full border-0 border-b border-[#aeb1b3] bg-transparent px-0 py-3 outline-none focus:border-[#b47b15]" />
              {error && <p className="mt-5 rounded-sm bg-red-100 px-4 py-3 text-sm text-red-700">{error}</p>}{message && <p className="mt-5 break-all rounded-sm bg-green-100 px-4 py-3 text-sm text-green-700">{message}</p>}
              <button disabled={isSubmitting} className="mt-7 w-full bg-[#111214] py-4 text-sm font-black uppercase tracking-wider text-white transition hover:bg-[#d7a83d] hover:text-[#111214]">{isSubmitting ? 'Sending...' : 'Send reset instructions'}</button>
            </form>
            <div className="mt-8 space-y-3 text-sm text-[#62646a]"><Link to="/reset-password" className="block font-black text-[#9b6d12] hover:underline">I already have a reset token</Link><Link to="/login" className="block font-bold hover:text-[#9b6d12]">&lt;- Back to login</Link></div>
          </div><p className="text-xs font-bold uppercase tracking-widest text-[#62646a]">Concrete that lasts.</p>
        </div>
        <div className="relative hidden min-h-full overflow-hidden lg:block"><img src={heroImage} alt="Impact Construction worksite" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-[#08090a]/60" /><div className="absolute bottom-12 left-12 max-w-md text-white"><p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-[#d7a83d]">Secure client access</p><h2 className="text-5xl font-black leading-none">Your project details stay close.</h2></div></div>
      </div>
    </div>
  )
}
