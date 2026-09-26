import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Award, Building2, ChevronDown, Factory, Globe2, HardHat, House, MapPin, Menu, MessageCircle, Phone, ShieldCheck, X } from 'lucide-react'
import { projectsAPI, settingsAPI } from '../services/api'
import heroImage from '../../assests/Why Do Hoist Accidents Happen_ – St_ Louis Work Injury Lawyers.jpeg'
import PageLoader from '../components/PageLoader'

const services = [
  { icon: Building2, title: 'Commercial', subtitle: 'Construction', slug: 'commercial', text: 'Modern, functional and sustainable spaces.' },
  { icon: House, title: 'Residential', subtitle: 'Construction', slug: 'residential', text: 'Custom homes built with care and quality.' },
  { icon: Factory, title: 'Industrial', subtitle: 'Construction', slug: 'industrial', text: 'Durable solutions for complex industries.' },
  { icon: HardHat, title: 'Renovation &', subtitle: 'Remodeling', slug: 'renovation', text: 'Transforming spaces with precision.' },
]

const partnerNames = ['AECOM', 'Turner', 'DPR', 'CLARK', 'SKANSKA']

export default function HomePage() {
  const [settings, setSettings] = useState({ business_name: 'Impact Construction' })
  const [featuredProjects, setFeaturedProjects] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  const [stats, setStats] = useState({ projects: 0, requests: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    document.title = 'Impact Construction | Building Structures. Building Trust.'
    const description = document.querySelector('meta[name="description"]')
    description?.setAttribute('content', 'Impact Construction delivers dependable commercial, residential, industrial, and renovation projects with quality, safety, and integrity.')

    Promise.allSettled([settingsAPI.getPublic(), projectsAPI.getAll()]).then(([settingsResult, projectsResult]) => {
      if (settingsResult.status === 'fulfilled') {
        const { data } = settingsResult.value
        setSettings((current) => ({ ...current, ...data }))
        setStats(data.stats || { projects: 0, requests: 0 })
      }
      if (projectsResult.status === 'fulfilled') {
        const projects = projectsResult.value.data || []
        setFeaturedProjects(projects.filter((project) => project.cover_image_url || project.media?.some((media) => media.media_type === 'image')).slice(0, 4))
      }
    }).finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <PageLoader label="Preparing your build" />

  const phone = settings.business_phone || '(800) 123-4567'
  const email = settings.business_email || 'info@impactbuild.com'
  const address = settings.business_address || '123 Construction Avenue, New York, NY 10001'
  const hours = settings.business_hours || 'Mon - Fri: 9:00 AM - 6:00 PM'

  return (
    <div className="min-h-screen bg-white text-[#10233d]">
      <div className="bg-[#071b34] px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-white sm:text-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex gap-5 sm:gap-10"><span className="inline-flex items-center gap-1"><Award className="h-3 w-3 text-[#f4b51b]" /> 30+ Years of Excellence</span><span className="hidden items-center gap-1 sm:inline-flex"><Building2 className="h-3 w-3 text-[#f4b51b]" /> 500+ Projects Completed</span><span className="hidden items-center gap-1 sm:inline-flex"><ShieldCheck className="h-3 w-3 text-[#f4b51b]" /> Safety First, Always</span></div>
          <div className="hidden items-center gap-5 sm:flex"><span className="inline-flex items-center gap-1"><Phone className="h-3 w-3 text-[#f4b51b]" /> {phone}</span><Globe2 className="h-3 w-3" /><MessageCircle className="h-3 w-3" /><span className="text-[10px] font-black">in</span></div>
        </div>
      </div>

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
          <Link to="/" className="flex items-center gap-2 text-[#10233d]">
            {settings.logo_url ? <img src={settings.logo_url} alt={settings.business_name} className="h-12 w-14 object-contain" /> : <span className="flex h-12 w-11 items-center justify-center border-l-4 border-[#f4b51b] text-[#f4b51b]"><Building2 className="h-8 w-8" /></span>}
            <span className="text-base font-black uppercase leading-tight tracking-tight sm:text-lg">{settings.business_name}<small className="block text-[9px] font-bold tracking-[0.28em] text-[#d99d06]">BUILDING THE FUTURE</small></span>
          </Link>
          <nav className="hidden items-center gap-7 text-xs font-bold md:flex">
            <Link to="/" className="border-b-2 border-[#f4b51b] py-4">Home</Link>
            <Link to="/about" className="hover:text-[#d99d06]">About Us</Link>
            <div className="relative" onMouseEnter={() => setOpenMenu('services')} onMouseLeave={() => setOpenMenu(null)}><Link to="/services" className="flex items-center gap-1 py-4 hover:text-[#d99d06]">Services <ChevronDown className="h-3 w-3" /></Link>{openMenu === 'services' && <div className="absolute left-0 top-full w-52 border border-slate-200 bg-white p-2 shadow-xl"><Link to="/services#commercial" className="block px-3 py-2 text-xs hover:bg-slate-100">Commercial Construction</Link><Link to="/services#residential" className="block px-3 py-2 text-xs hover:bg-slate-100">Residential Construction</Link><Link to="/services#industrial" className="block px-3 py-2 text-xs hover:bg-slate-100">Industrial Construction</Link><Link to="/services#renovation" className="block px-3 py-2 text-xs hover:bg-slate-100">Renovation & Remodeling</Link></div>}</div>
            <Link to="/gallery" className="hover:text-[#d99d06]">Projects</Link>
            <div className="relative" onMouseEnter={() => setOpenMenu('industries')} onMouseLeave={() => setOpenMenu(null)}><Link to="/industries" className="flex items-center gap-1 py-4 hover:text-[#d99d06]">Industries <ChevronDown className="h-3 w-3" /></Link>{openMenu === 'industries' && <div className="absolute left-0 top-full w-48 border border-slate-200 bg-white p-2 shadow-xl"><Link to="/industries#commercial" className="block px-3 py-2 text-xs hover:bg-slate-100">Commercial</Link><Link to="/industries#residential" className="block px-3 py-2 text-xs hover:bg-slate-100">Residential</Link><Link to="/industries#industrial" className="block px-3 py-2 text-xs hover:bg-slate-100">Industrial</Link><Link to="/industries#public" className="block px-3 py-2 text-xs hover:bg-slate-100">Public & Community</Link></div>}</div>
            <Link to="/careers" className="hover:text-[#d99d06]">Careers</Link>
            <Link to="/blog" className="hover:text-[#d99d06]">Blog</Link>
            <Link to="/contact" className="hover:text-[#d99d06]">Contact</Link>
            <Link to="/login" className="px-3 py-3 font-black uppercase text-[#10233d] hover:text-[#d99d06]">Client Login</Link>
          </nav>
          <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} className="rounded-sm p-2 text-[#10233d] transition hover:bg-slate-100 md:hidden" aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}>{mobileMenuOpen ? <X /> : <Menu />}</button>
        </div>
        {mobileMenuOpen && <div className="border-t border-slate-200 px-5 py-4 md:hidden"><div className="flex flex-col gap-4 text-sm font-bold"><Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link><Link to="/about" onClick={() => setMobileMenuOpen(false)}>About Us</Link><Link to="/services" onClick={() => setMobileMenuOpen(false)}>Services</Link><Link to="/gallery" onClick={() => setMobileMenuOpen(false)}>Projects</Link><Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link><Link to="/login" onClick={() => setMobileMenuOpen(false)}>Client Login</Link></div></div>}
      </header>

      <main>
        <section className="relative min-h-[510px] overflow-hidden bg-[#e8edf2] sm:min-h-[570px]">
          <img src={heroImage} alt="Construction project under development" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/75 to-transparent sm:via-white/40" />
          <div className="relative mx-auto flex min-h-[510px] max-w-7xl items-center px-5 py-20 sm:min-h-[570px] lg:px-8">
            <div className="hero-copy max-w-xl"><p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[#d99d06]">We build your vision</p><h1 className="text-5xl font-black leading-[0.98] tracking-tight text-[#10233d] sm:text-7xl">Building Structures.<br /><span className="text-[#f0ad0d]">Building Trust.</span></h1><p className="mt-6 max-w-md text-base leading-7 text-[#26384d]">Delivering exceptional construction solutions with quality, safety and integrity at every step.</p><div className="mt-7 flex flex-wrap gap-3"><Link to="/services" className="inline-flex items-center gap-3 bg-[#f4b51b] px-5 py-3 text-xs font-black uppercase text-[#10233d] transition hover:-translate-y-0.5 hover:bg-[#d99d06]">Our Services <ArrowRight className="h-4 w-4" /></Link><Link to="/gallery" className="inline-flex items-center gap-3 bg-[#10233d] px-5 py-3 text-xs font-black uppercase text-white transition hover:-translate-y-0.5 hover:bg-[#18395e]">View Projects <ArrowRight className="h-4 w-4" /></Link></div></div>
          </div>
        </section>

        <section className="relative z-10 mx-auto -mt-10 max-w-7xl px-5 lg:px-8"><div className="grid grid-cols-2 divide-x divide-white/20 bg-[#071b34] text-white shadow-xl sm:grid-cols-4">{services.map((service) => { const ServiceIcon = service.icon; return <Link to={`/services#${service.slug}`} key={service.title} className="group flex gap-3 p-4 transition hover:bg-[#0d2b4d] sm:p-6"><ServiceIcon className="h-9 w-9 shrink-0 text-[#f4b51b] transition group-hover:scale-110" strokeWidth={1.5} /><div><h2 className="text-xs font-black uppercase sm:text-sm">{service.title}<br />{service.subtitle}</h2><p className="mt-2 hidden text-[10px] leading-4 text-white/70 sm:block">{service.text}</p></div></Link> })}</div></section>

        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><div className="flex items-end justify-between gap-5"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#d99d06]">Our projects</p><h2 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">Built with Precision.<br />Delivered with Pride.</h2></div><Link to="/gallery" className="hidden items-center gap-2 border border-[#aab4c0] px-4 py-3 text-xs font-bold transition hover:border-[#10233d] hover:bg-[#10233d] hover:text-white sm:flex">View All Projects <ArrowRight className="h-4 w-4" /></Link></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{featuredProjects.map((project, index) => <article key={project.id} className="group overflow-hidden border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"><div className="relative h-40 bg-slate-200">{(project.cover_image_url || project.media?.[0]?.media_url) && <img loading="lazy" src={project.cover_image_url || project.media[0].media_url} alt={project.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}<span className="absolute left-3 top-3 bg-[#f4b51b] px-2 py-1 text-[9px] font-black uppercase">{project.category?.name || ['Commercial', 'Residential', 'Industrial', 'Renovation'][index]}</span></div><div className="p-4"><h3 className="font-black">{project.title}</h3><p className="mt-1 flex items-center gap-1 text-[10px] text-slate-500"><MapPin className="h-3 w-3 text-[#d99d06]" /> {project.location || 'Project location'}</p><div className="mt-5 flex justify-between border-t border-slate-100 pt-3 text-[10px] font-bold text-slate-500"><span>{project.square_footage ? `${project.square_footage.toLocaleString()} sq ft` : 'Completed'}</span><span>{project.completion_date || new Date(project.created_at || Date.now()).getFullYear()}</span></div></div></article>)}{featuredProjects.length === 0 && <p className="text-sm text-slate-500 sm:col-span-2 lg:col-span-4">Our featured projects will appear here soon.</p>}</div></section>

        <section className="relative overflow-hidden bg-[#071b34] px-5 py-12 text-white lg:px-8"><div className="absolute inset-0 bg-[linear-gradient(115deg,#071b34_0%,#071b34_38%,rgba(7,27,52,.78)_38%,rgba(7,27,52,.78)_100%)]" /><div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_2fr] lg:items-center"><div><h2 className="text-3xl font-black sm:text-4xl">Let’s Build Something<br />Extraordinary Together.</h2><p className="mt-3 max-w-sm text-sm text-white/75">From concept to completion, we are committed to turning your vision into reality.</p><Link to="/contact" className="mt-6 inline-flex items-center gap-3 bg-[#f4b51b] px-5 py-3 text-xs font-black uppercase text-[#10233d] transition hover:-translate-y-0.5 hover:bg-[#d99d06]">Start Your Project <ArrowRight className="h-4 w-4" /></Link></div><div className="grid grid-cols-2 gap-7 sm:grid-cols-4"><div><p className="text-3xl font-black text-[#f4b51b]">30+</p><p className="text-xs">Years Experience</p></div><div><p className="text-3xl font-black text-[#f4b51b]">{stats.projects || '500+'}</p><p className="text-xs">Projects Completed</p></div><div><p className="text-3xl font-black text-[#f4b51b]">{stats.requests || '250+'}</p><p className="text-xs">Service Requests</p></div><div><p className="text-3xl font-black text-[#f4b51b]">100%</p><p className="text-xs">Safety Commitment</p></div></div></div></section>

        <section className="border-b border-slate-200 px-5 py-10 lg:px-8"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d99d06]">Trusted by</p><h2 className="mt-2 text-xl font-black">Building Strong Relationships</h2></div><div className="flex flex-wrap items-center gap-7 text-xl font-black text-slate-400 grayscale sm:gap-12">{partnerNames.map((name) => <span key={name}>{name}</span>)}</div></div></section>

        <section className="bg-[#f4f5f3] px-5 py-16 lg:px-8"><div className="mx-auto max-w-7xl"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#d99d06]">Client perspective</p><div className="mt-3 flex flex-wrap items-end justify-between gap-4"><h2 className="text-3xl font-black sm:text-4xl">Good work leaves a mark.</h2><span className="text-xl tracking-[0.3em] text-[#d99d06]">★★★★★</span></div><div className="mt-8 grid gap-5 md:grid-cols-3">{[['The team kept us informed at every stage and delivered exactly what was promised.', 'Residential renovation client'], ['Clear quotation, clean work, and a finish we are proud to show our customers.', 'Commercial project client'], ['Impact understood the brief quickly and turned a difficult site into a solid result.', 'New construction client']].map(([quote, role]) => <blockquote key={role} className="border-l-4 border-[#f4b51b] bg-white p-6 shadow-sm"><p className="font-bold leading-7">“{quote}”</p><footer className="mt-5 text-[10px] font-black uppercase tracking-widest text-slate-500">{role}</footer></blockquote>)}</div></div></section>
      </main>

      <footer className="bg-[#071b34] px-5 py-12 text-white lg:px-8"><div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.2fr_1.2fr]"><div><div className="text-lg font-black uppercase">{settings.business_name}</div><p className="mt-4 max-w-xs text-sm leading-6 text-white/65">We are a full-service construction company delivering high-quality projects across commercial, residential, and industrial sectors.</p><div className="mt-5 flex gap-4 text-white/70"><Globe2 className="h-4 w-4" /><MessageCircle className="h-4 w-4" /><span className="text-xs font-black">in</span></div></div><div><h3 className="text-sm font-black">Quick Links</h3><div className="mt-4 space-y-2 text-sm text-white/65"><Link className="block hover:text-[#f4b51b]" to="/about">About Us</Link><Link className="block hover:text-[#f4b51b]" to="/services">Services</Link><Link className="block hover:text-[#f4b51b]" to="/gallery">Projects</Link><Link className="block hover:text-[#f4b51b]" to="/careers">Careers</Link><Link className="block hover:text-[#f4b51b]" to="/contact">Contact</Link></div></div><div><h3 className="text-sm font-black">Contact Us</h3><p className="mt-4 text-sm leading-7 text-white/65"><Phone className="mr-2 inline h-3 w-3 text-[#f4b51b]" />{phone}<br />{email}<br />{address}<br />{hours}</p></div><div className="border border-white/20 p-5"><h3 className="font-black">Request a Quote</h3><p className="mt-2 text-sm text-white/65">Tell us about your project and we’ll get back to you.</p><Link to="/contact" className="mt-5 inline-flex items-center gap-2 bg-[#f4b51b] px-4 py-3 text-xs font-black text-[#10233d] transition hover:bg-[#d99d06]">Get a Free Quote <ArrowRight className="h-4 w-4" /></Link></div></div><div className="mx-auto mt-10 flex max-w-7xl flex-col justify-between gap-3 border-t border-white/15 pt-5 text-[10px] text-white/50 sm:flex-row"><span>© 2026 {settings.business_name}. All Rights Reserved.</span><span>Privacy Policy &nbsp; | &nbsp; Terms of Service</span></div></footer>
    </div>
  )
}
