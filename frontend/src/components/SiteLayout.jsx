import React, { useState } from 'react'
import { Building2, Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'

const navigation = [
  ['home', 'Home', '/'],
  ['about', 'About', '/about'],
  ['services', 'Services', '/services'],
  ['projects', 'Our Work', '/gallery'],
  ['industries', 'Industries', '/industries'],
  ['careers', 'Careers', '/careers'],
  ['blog', 'Blog', '/blog'],
  ['contact', 'Contact', '/contact'],
]

export default function SiteLayout({ children, activePage, settings = {}, showUtilityBar = true }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const businessName = settings.business_name || 'Impact Construction'
  const phone = settings.business_phone || '(800) 123-4567'
  const email = settings.business_email || 'info@impactbuild.com'

  return (
    <div className="min-h-screen bg-[#f4f5f3] text-[#10233d]">
      {showUtilityBar && <div className="bg-[#071b34] px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-white"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4"><span>30+ Years of Excellence &nbsp; | &nbsp; 500+ Projects Completed &nbsp; | &nbsp; Safety First, Always</span><span className="hidden sm:inline">{phone}</span></div></div>}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2 text-lg font-black uppercase tracking-tight"><Building2 className="h-8 w-8 text-[#f4b51b]" />{businessName}</Link>
          <nav className="hidden items-center gap-6 text-xs font-black uppercase tracking-wider lg:flex">{navigation.map(([key, label, path]) => <Link key={key} to={path} className={activePage === key ? 'border-b-2 border-[#f4b51b] py-3' : 'py-3 hover:text-[#d99d06]'}>{label}</Link>)}<Link to="/login" className="px-3 py-3 text-[#10233d] hover:text-[#d99d06]">Client Login</Link></nav>
          <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} className="rounded-sm p-2 lg:hidden" aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}>{mobileMenuOpen ? <X /> : <Menu />}</button>
        </div>
        {mobileMenuOpen && <div className="border-t border-slate-200 px-5 py-4 lg:hidden"><nav className="flex flex-col gap-4 text-sm font-bold">{navigation.map(([key, label, path]) => <Link key={key} to={path} onClick={() => setMobileMenuOpen(false)} className={activePage === key ? 'text-[#d99d06]' : ''}>{label}</Link>)}<Link to="/login" onClick={() => setMobileMenuOpen(false)}>Client Login</Link></nav></div>}
      </header>
      {children}
      <footer className="bg-[#071b34] px-5 py-10 text-white lg:px-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-lg font-black uppercase">{businessName}</p><p className="mt-2 text-sm text-white/60">Quality construction, clear communication, lasting results.</p></div><div className="text-sm text-white/60 sm:text-right"><p>{phone}</p><p>{email}</p><p className="mt-2 text-xs">© 2026 {businessName}. All rights reserved.</p></div></div></footer>
    </div>
  )
}
