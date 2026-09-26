import React, { useState } from 'react'
import { Building2, Menu, Phone, X } from 'lucide-react'
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
      {showUtilityBar && (
        <div className="bg-[#071b34] px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <span className="hidden sm:inline">30+ Years of Excellence &nbsp; | &nbsp; 500+ Projects Completed &nbsp; | &nbsp; Safety First, Always</span>
            <span className="inline-flex items-center gap-2 text-[#f4b51b]">
              <Phone className="h-3 w-3" />
              {phone}
            </span>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3 text-lg font-black uppercase tracking-tight text-[#10233d]">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#071b34] text-[#f4b51b] shadow-sm">
              <Building2 className="h-6 w-6" />
            </span>
            <span>
              {businessName}
              <small className="mt-1 block text-[9px] font-black uppercase tracking-[0.28em] text-[#b47b15]">Building trust</small>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-[10px] font-black uppercase tracking-[0.21em] lg:flex">
            {navigation.map(([key, label, path]) => (
              <Link
                key={key}
                to={path}
                className={activePage === key ? 'border-b-2 border-[#f4b51b] pb-2 text-[#071b34]' : 'pb-2 text-[#4d5864] transition hover:text-[#071b34]'}
              >
                {label}
              </Link>
            ))}
            <Link to="/login" className="rounded-full border border-[#dfe3df] px-4 py-2 text-[#071b34] transition hover:border-[#f4b51b] hover:text-[#b47b15]">
              Client Login
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="rounded-xl border border-[#dfe3df] p-2 lg:hidden"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-5 py-4 lg:hidden">
            <nav className="flex flex-col gap-4 text-sm font-bold">
              {navigation.map(([key, label, path]) => (
                <Link key={key} to={path} onClick={() => setMobileMenuOpen(false)} className={activePage === key ? 'text-[#d99d06]' : ''}>
                  {label}
                </Link>
              ))}
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-xl bg-[#071b34] px-4 py-3 text-center text-white">
                Client Login
              </Link>
            </nav>
          </div>
        )}
      </header>

      {children}

      <footer className="bg-[#071b34] px-5 py-10 text-white lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-lg font-black uppercase tracking-[0.12em]">{businessName}</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-white/65">Quality construction, clear communication, and lasting results for homes, businesses, and industrial spaces.</p>
          </div>
          <div className="text-sm text-white/65 sm:text-right">
            <p>{phone}</p>
            <p>{email}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em]">© 2026 {businessName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
