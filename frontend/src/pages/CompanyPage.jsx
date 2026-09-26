import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Building2, CheckCircle2, HardHat, Mail, ShieldCheck, Users } from 'lucide-react'
import SiteLayout from '../components/SiteLayout'

const pageContent = {
  about: {
    eyebrow: 'About Impact Construction',
    title: 'The people behind work built to last.',
    intro: 'We bring practical planning, skilled craft, and clear communication to every project we take on.',
    items: [
      ['Built around trust', 'We keep the brief, budget, and people using the space at the centre of every decision.'],
      ['Experienced by design', 'Our process combines proven construction discipline with thoughtful problem-solving.'],
      ['Progress you can see', 'You receive clear updates from the first conversation through final handover.'],
    ],
  },
  services: {
    eyebrow: 'What we do',
    title: 'Construction expertise for every stage of your vision.',
    intro: 'From a new build to a careful renovation, our team brings the right people and process to the work.',
    items: [
      ['Commercial construction', 'Functional, durable spaces planned around your operation and your customers.'],
      ['Residential construction', 'Homes and extensions shaped around how you want to live.'],
      ['Industrial construction', 'Robust solutions for demanding sites, facilities, and production environments.'],
      ['Renovation and remodeling', 'Thoughtful upgrades that give existing spaces a stronger second life.'],
    ],
  },
  industries: {
    eyebrow: 'Industries we serve',
    title: 'Built for the way your industry works.',
    intro: 'Every sector has different pressures. We plan around the people, standards, and outcomes that matter to your operation.',
    items: [
      ['Commercial spaces', 'Offices, retail, hospitality, and public-facing spaces designed for daily performance.'],
      ['Residential communities', 'Homes and multi-unit developments built for comfort, durability, and long-term value.'],
      ['Industrial facilities', 'Practical facilities that support production, logistics, storage, and specialist operations.'],
      ['Public and community', 'Reliable spaces delivered with safety, accessibility, and the wider community in mind.'],
    ],
  },
  careers: {
    eyebrow: 'Careers',
    title: 'Do work you can be proud to put your name on.',
    intro: 'We are always interested in meeting dependable people who care about craft, safety, and doing the job properly.',
    items: [
      ['Skilled trades', 'Bring your experience to projects where detail, safety, and teamwork matter.'],
      ['Project leadership', 'Help clients and crews move confidently from scope to handover.'],
      ['Early careers', 'Build practical experience with a team that values curiosity and responsibility.'],
    ],
  },
  blog: {
    eyebrow: 'Field notes',
    title: 'Ideas for building with more confidence.',
    intro: 'Practical guidance from the construction floor, covering planning, materials, maintenance, and better project conversations.',
    items: [
      ['Planning before the first pour', 'The questions worth answering before construction begins.'],
      ['Renovation without surprises', 'How a clear scope helps protect time, budget, and the finished result.'],
      ['Safety is part of quality', 'Why disciplined site practices create better work for everyone.'],
    ],
  },
}

export default function CompanyPage({ pageKey = 'about' }) {
  const content = pageContent[pageKey] || pageContent.about

  return (
    <SiteLayout activePage={pageKey}>
      <main>
        <section className="bg-[#10233d] px-5 py-20 text-white lg:px-8"><div className="mx-auto max-w-7xl"><p className="text-xs font-black uppercase tracking-[0.25em] text-[#f4b51b]">{content.eyebrow}</p><h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.98] sm:text-7xl">{content.title}</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-white/70">{content.intro}</p></div></section>
        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><div className="grid gap-px bg-[#cad0d4] sm:grid-cols-2 lg:grid-cols-3">{content.items.map(([title, description], index) => { const anchor = pageKey === 'services' ? ['commercial', 'residential', 'industrial', 'renovation'][index] : pageKey === 'industries' ? ['commercial', 'residential', 'industrial', 'public'][index] : undefined; return <article id={anchor} key={title} className="scroll-mt-28 bg-white p-7"><span className="text-sm font-black text-[#d99d06]">0{index + 1}</span><h2 className="mt-12 text-2xl font-black">{title}</h2><p className="mt-4 leading-7 text-slate-600">{description}</p></article> })}</div><div className="mt-14 grid gap-8 border-t border-slate-300 pt-10 md:grid-cols-3"><div className="flex gap-4"><ShieldCheck className="h-8 w-8 shrink-0 text-[#d99d06]" /><div><h3 className="font-black">Safety first</h3><p className="mt-2 text-sm leading-6 text-slate-600">Careful planning and responsible site practices are part of every build.</p></div></div><div className="flex gap-4"><Users className="h-8 w-8 shrink-0 text-[#d99d06]" /><div><h3 className="font-black">People focused</h3><p className="mt-2 text-sm leading-6 text-slate-600">We build strong working relationships with clients and partners.</p></div></div><div className="flex gap-4"><HardHat className="h-8 w-8 shrink-0 text-[#d99d06]" /><div><h3 className="font-black">Built with care</h3><p className="mt-2 text-sm leading-6 text-slate-600">Quality is visible in the details, the finish, and the handover.</p></div></div></div><div className="mt-14 flex flex-wrap gap-3"><Link to="/contact" className="inline-flex items-center gap-3 bg-[#f4b51b] px-5 py-3 text-xs font-black uppercase text-[#10233d]">Start a conversation <ArrowRight className="h-4 w-4" /></Link><Link to="/gallery" className="inline-flex items-center gap-3 border border-[#10233d] px-5 py-3 text-xs font-black uppercase">Explore our work <ArrowRight className="h-4 w-4" /></Link></div></section>
      </main>
    </SiteLayout>
  )
}
