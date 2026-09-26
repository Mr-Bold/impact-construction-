import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Building2, Clock3, FileUp, Mail, MapPin, Menu, Phone, Send, X } from 'lucide-react'
import { requestsAPI, settingsAPI } from '../services/api'
import heroImage from '../../assests/Why Do Hoist Accidents Happen_ – St_ Louis Work Injury Lawyers.jpeg'
import PageLoader from '../components/PageLoader'
import SiteLayout from '../components/SiteLayout'

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', requested_service: '', message: '' })
  const [attachment, setAttachment] = useState(null)
  const [feedback, setFeedback] = useState({ error: '', success: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState({ business_name: 'Impact Construction', business_phone: '+1 (555) 123-4567', business_email: 'info@impactconstruction.com', business_address: '123 Construction Ave, City, Country', business_hours: 'Monday - Friday: 9:00 AM - 6:00 PM' })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    settingsAPI.getPublic().then(({ data }) => setSettings((current) => ({ ...current, ...data }))).catch(() => {}).finally(() => setIsLoading(false))
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFeedback({ error: '', success: '' })
    setIsSubmitting(true)
    try {
      const { data } = await requestsAPI.create({ ...formData, description: formData.message })
      if (attachment && data.id && localStorage.getItem('token')) await requestsAPI.addAttachment(data.id, attachment)
      setFeedback({ error: '', success: `Request ${data.request_number} submitted successfully.` })
      setFormData({ name: '', email: '', phone: '', requested_service: '', message: '' })
      setAttachment(null)
    } catch (requestError) {
      setFeedback({ error: requestError.response?.data?.error || 'Unable to submit your request.', success: '' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <PageLoader label="Opening contact" />

  return (
    <SiteLayout activePage="contact" settings={settings}>
      <header className="relative overflow-hidden bg-[#071b34] px-5 py-20 text-white lg:px-8"><img src={heroImage} alt="Construction worksite" className="absolute inset-0 h-full w-full object-cover opacity-25" /><div className="absolute inset-0 bg-gradient-to-r from-[#071b34] via-[#071b34]/90 to-[#071b34]/45" /><div className="relative mx-auto max-w-7xl"><p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-[#f4b51b]">Start a conversation</p><h1 className="max-w-3xl text-5xl font-black leading-[0.98] sm:text-7xl">Tell us what you’re building.</h1><p className="mt-6 max-w-xl text-lg leading-8 text-white/70">Share the brief, the challenge, or simply the idea. We’ll help you find the next practical step.</p></div></header>

      <main className="mx-auto max-w-7xl px-5 py-14 lg:px-8"><div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="flex flex-col justify-between">
            <div><p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-[#d99d06]">Reach the team</p><h2 className="text-4xl font-black leading-tight">Good projects begin with clear contact.</h2>
            
            <div className="mt-10 space-y-7"><div className="flex gap-4"><Phone className="h-6 w-6 shrink-0 text-[#d99d06]" /><div><p className="text-xs font-black uppercase tracking-widest text-[#62646a]">Phone</p><a href={`tel:${settings.business_phone}`} className="mt-2 block text-xl font-black hover:text-[#d99d06]">{settings.business_phone}</a></div></div>

              <div className="flex gap-4"><Mail className="h-6 w-6 shrink-0 text-[#d99d06]" /><div><p className="text-xs font-black uppercase tracking-widest text-[#62646a]">Email</p><a href={`mailto:${settings.business_email}`} className="mt-2 block text-xl font-black hover:text-[#d99d06]">{settings.business_email}</a></div></div>

              {settings.whatsapp_number && <a href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="inline-block bg-[#d7a83d] px-5 py-3 text-xs font-black uppercase tracking-wider text-[#111214]">Chat on WhatsApp -&gt;</a>}

              <div className="flex gap-4"><MapPin className="h-6 w-6 shrink-0 text-[#d99d06]" /><div><p className="text-xs font-black uppercase tracking-widest text-[#62646a]">Address</p><p className="mt-2 text-lg font-bold">{settings.business_address}</p></div></div>

              <div className="flex gap-4"><Clock3 className="h-6 w-6 shrink-0 text-[#d99d06]" /><div><p className="text-xs font-black uppercase tracking-widest text-[#62646a]">Business hours</p><p className="mt-2 whitespace-pre-line text-lg font-bold">{settings.business_hours}</p></div></div></div></div>
            <div className="mt-12 border-t border-[#c8c9c8] pt-5 text-sm text-[#62646a]">Prefer to browse first? <Link to="/gallery" className="font-black text-[#9b6d12]">See our work -&gt;</Link></div>
          </div>

          <div><form onSubmit={handleSubmit} className="rounded-sm border border-slate-200 bg-white p-7 shadow-sm sm:p-10"><p className="text-xs font-black uppercase tracking-widest text-[#d99d06]">Project enquiry</p><h2 className="mt-3 text-3xl font-black">Tell us about your project</h2><p className="mt-3 text-[#62646a]">The more context you share, the more useful our first response can be.</p>

              <div className="mt-8 grid gap-5 sm:grid-cols-2"><div><label className="text-xs font-black uppercase tracking-wider text-[#62646a]">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-2 w-full border-0 border-b border-[#aeb1b3] bg-transparent px-0 py-3 outline-none focus:border-[#b47b15]"
                  required
                />
              </div>

              <div><label className="text-xs font-black uppercase tracking-wider text-[#62646a]">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-2 w-full border-0 border-b border-[#aeb1b3] bg-transparent px-0 py-3 outline-none focus:border-[#b47b15]" required />
              </div>

              <div><label className="text-xs font-black uppercase tracking-wider text-[#62646a]">Phone</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-2 w-full border-0 border-b border-[#aeb1b3] bg-transparent px-0 py-3 outline-none focus:border-[#b47b15]" required />
              </div>

              <div><label htmlFor="requested-service" className="text-xs font-black uppercase tracking-wider text-[#62646a]">Requested service</label><select id="requested-service" name="requested_service" value={formData.requested_service} onChange={handleChange} className="mt-2 w-full border-0 border-b border-[#aeb1b3] bg-transparent px-0 py-3 outline-none focus:border-[#d99d06]"><option value="">Select a service</option><option value="Commercial construction">Commercial construction</option><option value="Residential construction">Residential construction</option><option value="Industrial construction">Industrial construction</option><option value="Renovation and remodeling">Renovation and remodeling</option><option value="Concrete work">Concrete work</option></select></div></div>

              <div className="mt-6"><label htmlFor="project-brief" className="text-xs font-black uppercase tracking-wider text-[#62646a]">Project brief</label>
                <textarea
                  id="project-brief"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="mt-2 h-32 w-full resize-none border border-[#aeb1b3] bg-transparent p-4 outline-none focus:border-[#b47b15]"
                  required
                ></textarea>
              </div>

              <div className="mt-6 border border-dashed border-[#aeb1b3] p-4"><label htmlFor="project-attachment" className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#62646a]"><FileUp className="h-4 w-4 text-[#d99d06]" /> Attach plans or reference images</label><input id="project-attachment" type="file" onChange={(event) => setAttachment(event.target.files?.[0] || null)} className="mt-3 w-full text-sm" accept="image/*,video/*,.pdf" />{attachment && <p className="mt-2 text-sm text-[#62646a]">Selected: {attachment.name}</p>}{!localStorage.getItem('token') && <p className="mt-2 text-xs text-[#62646a]">Log in before attaching a file.</p>}</div>

              {feedback.error && <p className="mt-5 rounded-sm bg-red-100 px-4 py-3 text-red-700">{feedback.error}</p>}
              {feedback.success && <p className="mt-5 rounded-sm bg-green-100 px-4 py-3 text-green-700">{feedback.success}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 inline-flex w-full items-center justify-center gap-3 bg-[#071b34] py-4 text-sm font-black uppercase tracking-wider text-white transition hover:bg-[#f4b51b] hover:text-[#10233d]"
              >
                {isSubmitting ? 'Submitting...' : 'Submit project enquiry'} {!isSubmitting && <Send className="h-4 w-4" />}
              </button>
            </form></div>
          </div>
      </main>
    </SiteLayout>
  )
}
