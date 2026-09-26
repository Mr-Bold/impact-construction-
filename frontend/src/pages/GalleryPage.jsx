import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Building2, ChevronDown, Eye, Heart, LayoutGrid, List, Menu, Search, Star, X } from 'lucide-react'
import { projectsAPI, settingsAPI } from '../services/api'
import PageLoader from '../components/PageLoader'
import SiteLayout from '../components/SiteLayout'

export default function GalleryPage() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [visibleCount, setVisibleCount] = useState(6)
  const [selectedProject, setSelectedProject] = useState(null)
  const [settings, setSettings] = useState({ business_name: 'Impact Construction' })
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true)
      setError('')
      try {
        const { data } = await projectsAPI.getAll()
        setProjects(data)
      } catch (requestError) {
        setError(requestError.response?.data?.error || 'Unable to load projects.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [])

  useEffect(() => {
    settingsAPI.getPublic().then(({ data }) => setSettings((current) => ({ ...current, ...data }))).catch(() => {})
  }, [])

  const categories = useMemo(() => ['all', ...new Set(projects.map((project) => project.category?.name).filter(Boolean))], [projects])
  const visibleProjects = projects.filter((project) => {
    const matchesCategory = filter === 'all' || project.category?.name === filter
    const searchableText = `${project.title} ${project.description || ''} ${project.location || ''}`.toLowerCase()
    return matchesCategory && searchableText.includes(search.toLowerCase())
  }).sort((first, second) => {
    if (sort === 'oldest') return new Date(first.created_at) - new Date(second.created_at)
    if (sort === 'title') return first.title.localeCompare(second.title)
    if (sort === 'rating') return (second.average_rating || 0) - (first.average_rating || 0)
    return new Date(second.created_at) - new Date(first.created_at)
  })
  const displayedProjects = visibleProjects.slice(0, visibleCount)

  const updateProjectLike = async (project) => {
    if (!localStorage.getItem('token')) {
      setFeedback('Please log in to like projects.')
      return
    }

    try {
      const { data } = await projectsAPI.like(project.id)
      setProjects((current) => current.map((item) => item.id === project.id
        ? { ...item, like_count: Math.max(0, (item.like_count || 0) + (data.liked ? 1 : -1)) }
        : item))
      setFeedback(data.liked ? `${project.title} liked.` : `${project.title} like removed.`)
    } catch (requestError) {
      setFeedback(requestError.response?.data?.error || 'Unable to update project like.')
    }
  }

  const rateProject = async (project, value) => {
    if (!localStorage.getItem('token')) {
      setFeedback('Please log in to rate projects.')
      return
    }

    try {
      const { data } = await projectsAPI.rate(project.id, value)
      setProjects((current) => current.map((item) => item.id === project.id
        ? { ...item, average_rating: data.average_rating ?? item.average_rating, rating_count: data.rating_count ?? item.rating_count }
        : item))
      setFeedback(`Thanks for rating ${project.title}.`)
    } catch (requestError) {
      setFeedback(requestError.response?.data?.error || 'Unable to save project rating.')
    }
  }

  if (isLoading) return <PageLoader label="Loading our work" />

  return (
    <SiteLayout activePage="projects" settings={settings}>
      <header className="relative overflow-hidden bg-[#071b34] px-5 py-20 text-white lg:px-8"><div className="absolute inset-0 bg-[linear-gradient(120deg,#071b34_0%,#102f51_55%,#071b34_100%)]" /><div className="relative mx-auto flex max-w-7xl items-end justify-between gap-8"><div><p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-[#f4b51b]">Selected work</p><h1 className="max-w-3xl text-5xl font-black leading-[0.98] sm:text-7xl">Built for real life.</h1><p className="mt-6 max-w-xl text-lg leading-8 text-white/70">Explore the homes, renovations, and construction projects delivered by our team.</p></div><div className="hidden border-l border-white/20 pl-8 text-right sm:block"><p className="text-4xl font-black text-[#f4b51b]">{projects.length}+</p><p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/60">Projects to explore</p></div></div></header>

      <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="mb-10 flex flex-col gap-5 border-b border-slate-300 pb-8 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap gap-2">{categories.map((category) => <button key={category} onClick={() => { setFilter(category); setVisibleCount(6) }} className={`border px-4 py-2 text-xs font-black uppercase tracking-wider transition ${filter === category ? 'border-[#10233d] bg-[#10233d] text-white' : 'border-slate-300 bg-white hover:border-[#d99d06]'}`}>{category}</button>)}</div><div className="flex flex-col gap-3 sm:flex-row"><div className="flex border border-slate-300 bg-white p-1" aria-label="Project view mode"><button type="button" onClick={() => setViewMode('grid')} aria-label="Grid project view" className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-black uppercase ${viewMode === 'grid' ? 'bg-[#10233d] text-white' : 'text-slate-500 hover:text-[#10233d]'}`}><LayoutGrid className="h-4 w-4" /> Grid</button><button type="button" onClick={() => setViewMode('list')} aria-label="Vertical project view" className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-black uppercase ${viewMode === 'list' ? 'bg-[#10233d] text-white' : 'text-slate-500 hover:text-[#10233d]'}`}><List className="h-4 w-4" /> List</button></div><label className="relative"><span className="sr-only">Search projects</span><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" /><input value={search} onChange={(event) => { setSearch(event.target.value); setVisibleCount(6) }} placeholder="Search projects" className="min-w-0 border border-slate-300 bg-white py-3 pl-9 pr-4 text-sm outline-none focus:border-[#d99d06] lg:w-64" /></label><label><span className="sr-only">Sort projects</span><select value={sort} onChange={(event) => setSort(event.target.value)} className="w-full border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#d99d06]"><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="title">A-Z</option><option value="rating">Top rated</option></select></label></div></div>

        {error && <p className="rounded bg-red-100 px-4 py-3 text-red-700">{error}</p>}
        {feedback && <p className="mb-6 border-l-4 border-[#f4b51b] bg-white px-4 py-3 text-sm text-slate-600" role="status">{feedback}</p>}
        {!isLoading && !error && visibleProjects.length === 0 && (
          <p className="border border-[#c8c9c8] bg-white p-8 text-[#62646a]">No projects match your search yet.</p>
        )}

        <div className={viewMode === 'list' ? 'space-y-5' : 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'}>
          {displayedProjects.map((project, index) => {
            const isSpotlight = index % 5 === 0
            const isDarkCard = index % 4 === 3
            const imageHeight = viewMode === 'list' ? 'h-56 sm:h-64' : isSpotlight ? 'h-80' : 'h-64'
            return (
            <article key={project.id} className={`${viewMode === 'list' ? 'sm:grid sm:grid-cols-[280px_1fr]' : isSpotlight ? 'md:col-span-2' : ''} group overflow-hidden border border-slate-200 ${isDarkCard ? 'bg-[#10233d] text-white' : 'bg-white text-[#10233d]'} shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl`} style={{ animationDelay: `${index * 80}ms` }}>
              <div className="relative overflow-hidden bg-slate-200">{(project.cover_image_url || project.media?.[0]?.media_url) ? <button onClick={() => setSelectedProject(project)} className="block w-full text-left"><img loading="lazy" src={project.cover_image_url || project.media[0].media_url} alt={project.title} className={`${imageHeight} w-full object-cover transition duration-500 group-hover:scale-105`} /></button> : <div className={`${imageHeight} bg-slate-200`} />}<span className="absolute left-4 top-4 bg-[#f4b51b] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#10233d] shadow-sm">{isSpotlight && viewMode === 'grid' ? 'Featured build' : project.category?.name || 'Construction'}</span></div>
              <div className="flex flex-col p-6"><div className="flex items-start justify-between gap-4"><div><p className={`${isDarkCard ? 'text-[#f4b51b]' : 'text-[#d99d06]'} text-[10px] font-black uppercase tracking-[0.18em]`}>{project.category?.name || 'Construction'}</p><h2 className="mt-2 text-2xl font-black">{project.title}</h2></div><span className={`${isDarkCard ? 'text-white/60' : 'text-slate-500'} whitespace-nowrap text-xs font-bold`}>{project.completion_date || 'Recently'}</span></div><p className={`${isDarkCard ? 'text-white/65' : 'text-slate-600'} mt-4 line-clamp-2 leading-7`}>{project.description || 'Professional construction work completed with care.'}</p><div className={`${isDarkCard ? 'text-white/60' : 'text-slate-500'} mt-5 flex flex-wrap items-center gap-4 text-xs font-bold`}><button type="button" onClick={() => updateProjectLike(project)} className="inline-flex items-center gap-1 transition hover:text-[#f4b51b]" aria-label={`Like ${project.title}`}><Heart className="h-3 w-3" /> {project.like_count || 0} <span className="font-normal">Likes</span></button><span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {project.view_count || 0} <span className="font-normal">Views</span></span><span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-[#f4b51b] text-[#f4b51b]" /> {Number(project.average_rating || 0).toFixed(1)} <span className="font-normal">({project.rating_count || 0})</span></span><span className="ml-auto inline-flex items-center gap-1">Rate: {[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} onClick={() => rateProject(project, value)} aria-label={`Rate ${project.title} ${value} stars`} className="text-slate-300 transition hover:text-[#f4b51b]"><Star className="h-3 w-3 fill-current" /></button>)}</span></div><div className={`${isDarkCard ? 'border-white/15' : 'border-slate-200'} mt-6 flex flex-1 flex-wrap items-end justify-between gap-4 border-t pt-5`}><span className={`${isDarkCard ? 'text-white/60' : 'text-slate-500'} text-sm`}>{project.location || 'Impact Construction'}</span><div className="flex items-center gap-4"><button onClick={() => setSelectedProject(project)} className="text-xs font-black uppercase tracking-wider hover:text-[#d99d06]">Quick view</button><Link to={`/projects/${project.slug}`} className="inline-flex items-center gap-2 bg-[#f4b51b] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#10233d] transition hover:bg-[#d99d06]">View Case Study <ArrowRight className="h-3 w-3" /></Link></div></div>
              </div>
            </article>
            )
          })}
        </div>
        {visibleCount < visibleProjects.length && <button onClick={() => setVisibleCount((current) => current + 6)} className="mt-10 inline-flex items-center gap-2 border border-[#10233d] px-6 py-3 text-xs font-black uppercase tracking-wider transition hover:bg-[#10233d] hover:text-white">Load more projects <ArrowRight className="h-4 w-4" /></button>}
      </main>
      {selectedProject && <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#08090a]/85 p-5" role="dialog" aria-modal="true" onClick={() => setSelectedProject(null)}><div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto bg-[#f1f1ef]" onClick={(event) => event.stopPropagation()}><div className="relative">{(selectedProject.cover_image_url || selectedProject.media?.[0]?.media_url) && <img src={selectedProject.cover_image_url || selectedProject.media[0].media_url} alt={selectedProject.title} className="max-h-[55vh] w-full object-cover" />}<button onClick={() => setSelectedProject(null)} aria-label="Close project preview" className="absolute right-4 top-4 bg-[#08090a] px-4 py-2 text-white">X</button></div><div className="p-7"><p className="text-xs font-black uppercase tracking-widest text-[#b47b15]">{selectedProject.category?.name || 'Construction'}</p><h2 className="mt-2 text-3xl font-black">{selectedProject.title}</h2><p className="mt-4 max-w-2xl leading-7 text-[#62646a]">{selectedProject.description || 'Professional construction work completed with care.'}</p>{selectedProject.before_image_url && selectedProject.after_image_url && <div className="mt-6 grid gap-4 sm:grid-cols-2"><img src={selectedProject.before_image_url} alt="Before project" className="h-48 w-full object-cover" /><img src={selectedProject.after_image_url} alt="After project" className="h-48 w-full object-cover" /></div>}<div className="mt-7 flex flex-wrap gap-3"><Link to={`/projects/${selectedProject.slug}`} className="bg-[#111214] px-5 py-3 text-xs font-black uppercase tracking-wider text-white">Open full project</Link><Link to="/contact" className="bg-[#d7a83d] px-5 py-3 text-xs font-black uppercase tracking-wider text-[#111214]">Request similar service</Link>{settings.whatsapp_number && <a href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="border border-[#111214] px-5 py-3 text-xs font-black uppercase tracking-wider">WhatsApp</a>}</div></div></div></div>}
    </SiteLayout>
  )
}
