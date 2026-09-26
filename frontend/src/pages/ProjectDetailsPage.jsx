import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, Copy, Eye, Heart, MapPin, MessageSquare, Star, Wrench } from 'lucide-react'
import { projectsAPI, settingsAPI } from '../services/api'
import SiteLayout from '../components/SiteLayout'
import PageLoader from '../components/PageLoader'

const splitList = (value) => {
  if (Array.isArray(value)) return value
  return value ? value.split(',').map((item) => item.trim()).filter(Boolean) : []
}

export default function ProjectDetailsPage() {
  const { slug } = useParams()
  const [project, setProject] = useState(null)
  const [settings, setSettings] = useState({})
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProject = async () => {
      try {
        const [{ data }, settingsResult] = await Promise.all([
          projectsAPI.getById(slug),
          settingsAPI.getPublic().catch(() => ({ data: {} })),
        ])
        setProject(data)
        setSettings(settingsResult.data || {})
        const commentsResponse = await projectsAPI.getComments(data.id)
        setComments(commentsResponse.data || [])
      } catch (requestError) {
        setError(requestError.response?.data?.error || 'Unable to load this project.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProject()
  }, [slug])

  const requireLogin = () => {
    if (!localStorage.getItem('token')) {
      setFeedback('Please log in to interact with projects.')
      return false
    }
    return true
  }

  const handleLike = async () => {
    if (!requireLogin()) return
    try {
      const { data } = await projectsAPI.like(project.id)
      setProject((current) => ({
        ...current,
        like_count: Math.max(0, (current.like_count || 0) + (data.liked ? 1 : -1)),
      }))
      setFeedback(data.liked ? 'Project liked.' : 'Project like removed.')
    } catch (requestError) {
      setFeedback(requestError.response?.data?.error || 'Unable to update like.')
    }
  }

  const handleRate = async () => {
    if (!requireLogin() || !rating) {
      setFeedback('Choose a rating first.')
      return
    }
    try {
      const { data } = await projectsAPI.rate(project.id, rating)
      setProject((current) => ({
        ...current,
        average_rating: data.average_rating ?? current.average_rating,
        rating_count: data.rating_count ?? current.rating_count,
      }))
      setFeedback('Thanks for rating this project.')
    } catch (requestError) {
      setFeedback(requestError.response?.data?.error || 'Unable to save rating.')
    }
  }

  const handleComment = async () => {
    if (!requireLogin() || !comment.trim()) {
      setFeedback(comment.trim() ? 'Please log in to comment.' : 'Write a comment first.')
      return
    }
    try {
      const { data } = await projectsAPI.addComment(project.id, comment.trim())
      setComments((current) => [data, ...current])
      setComment('')
      setFeedback('Comment posted.')
    } catch (requestError) {
      setFeedback(requestError.response?.data?.error || 'Unable to post comment.')
    }
  }

  const handleCopyLink = async () => {
    await navigator.clipboard?.writeText(window.location.href)
    setFeedback('Project link copied.')
  }

  if (isLoading) return <PageLoader label="Loading case study" />
  if (error || !project) return <div className="min-h-screen bg-[#f4f5f3] p-12 text-center text-red-700">{error || 'Project not found.'}</div>

  const services = splitList(project.services)
  const materials = splitList(project.materials)
  const media = project.media?.filter((item) => item.media_type === 'image') || []
  const ratingValue = Number(project.average_rating || 0)
  const stars = Math.round(ratingValue)

  return (
    <SiteLayout activePage="projects" settings={settings}>
      <main>
        <section className="bg-[#071b34] px-5 py-16 text-white lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Link to="/gallery" className="mb-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/65 hover:text-[#f4b51b]">
              <ArrowLeft className="h-4 w-4" /> Back to Our Work
            </Link>

            <div className="flex flex-wrap items-end justify-between gap-8">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-[#f4b51b]">
                  {project.category?.name || 'Construction'} case study
                </p>
                <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.98] sm:text-7xl">{project.title}</h1>
                <p className="mt-6 flex items-center gap-2 text-white/70">
                  <MapPin className="h-4 w-4 text-[#f4b51b]" /> {project.location || 'Location available on request'}
                </p>
              </div>

              <Link to="/contact" className="inline-flex items-center gap-3 bg-[#f4b51b] px-5 py-3 text-xs font-black uppercase text-[#10233d]">
                Request a similar project <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.45fr_0.55fr]">
            <div>
              <div className="overflow-hidden bg-slate-200">
                {project.cover_image_url ? (
                  <img src={project.cover_image_url} alt={project.title} className="h-[420px] w-full object-cover sm:h-[560px]" />
                ) : (
                  <div className="h-[420px] sm:h-[560px]" />
                )}
              </div>

              {media.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {media.slice(0, 3).map((item) => (
                    <img key={item.id} loading="lazy" src={item.media_url} alt={`${project.title} project detail`} className="h-28 w-full object-cover" />
                  ))}
                </div>
              )}

              <div className="mt-12">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d99d06]">Project overview</p>
                <h2 className="mt-3 text-3xl font-black">A result designed to last.</h2>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
                  {project.description || 'This project showcases careful planning, skilled workmanship, and a finish designed for real life.'}
                </p>
              </div>

              {(project.before_image_url || project.after_image_url) && (
                <div className="mt-12">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d99d06]">Transformation</p>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    {project.before_image_url && (
                      <div>
                        <p className="mb-2 text-xs font-black uppercase tracking-widest text-slate-500">Before</p>
                        <img loading="lazy" src={project.before_image_url} alt="Before project" className="h-64 w-full object-cover" />
                      </div>
                    )}
                    {project.after_image_url && (
                      <div>
                        <p className="mb-2 text-xs font-black uppercase tracking-widest text-slate-500">After</p>
                        <img loading="lazy" src={project.after_image_url} alt="After project" className="h-64 w-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <section className="mt-12 border-t border-slate-300 pt-10">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-[#d99d06]" />
                  <h2 className="text-2xl font-black">Client perspective</h2>
                </div>

                <div className="mt-5 flex gap-3">
                  <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    rows={3}
                    placeholder="Share your thoughts on this project"
                    className="min-w-0 flex-1 border border-slate-300 bg-white p-4 outline-none focus:border-[#d99d06]"
                  />
                  <button type="button" onClick={handleComment} className="self-end bg-[#10233d] px-4 py-3 text-xs font-black uppercase text-white">
                    Post
                  </button>
                </div>

                {feedback && <p className="mt-3 text-sm text-slate-600">{feedback}</p>}

                <div className="mt-7 space-y-4">
                  {comments.map((item) => (
                    <div key={item.id} className="border-l-2 border-[#f4b51b] bg-white p-4 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-500">{item.user?.email || 'Customer'}</p>
                      <p className="mt-2 leading-6">{item.comment_text}</p>
                    </div>
                  ))}

                  {comments.length === 0 && (
                    <p className="text-sm text-slate-500">No comments yet. Be the first to share your perspective.</p>
                  )}
                </div>
              </section>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-[#d99d06]">At a glance</p>

                <div className="mt-6 space-y-5">
                  <div className="flex gap-3">
                    <MapPin className="h-5 w-5 text-[#d99d06]" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500">Location</p>
                      <p className="mt-1 font-black">{project.location || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Clock3 className="h-5 w-5 text-[#d99d06]" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500">Duration</p>
                      <p className="mt-1 font-black">{project.duration || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#d99d06]" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500">Completed</p>
                      <p className="mt-1 font-black">{project.completion_date || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {services.length > 0 && (
                  <div className="mt-7 border-t border-slate-200 pt-6">
                    <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                      <Wrench className="h-4 w-4 text-[#d99d06]" /> Services
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {services.map((item) => (
                        <span key={item} className="bg-[#eef1f3] px-3 py-2 text-xs font-bold">{item}</span>
                      ))}
                    </div>
                  </div>
                )}

                {materials.length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Materials</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{materials.join(' · ')}</p>
                  </div>
                )}

                <div className="mt-7 border-t border-slate-200 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-sm font-black">
                      <Star className="h-4 w-4 fill-[#f4b51b] text-[#f4b51b]" /> {ratingValue.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-500">{project.rating_count || 0} ratings</span>
                  </div>

                  <div className="mt-2 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        type="button"
                        key={value}
                        onClick={() => setRating(value)}
                        aria-label={`Rate ${value} stars`}
                        className={value <= (rating || stars) ? 'text-[#f4b51b]' : 'text-slate-300'}
                      >
                        <Star className="h-5 w-5 fill-current" />
                      </button>
                    ))}
                    <button type="button" onClick={handleRate} className="ml-auto bg-[#10233d] px-3 py-2 text-[10px] font-black uppercase text-white">
                      Rate
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 text-xs font-bold text-slate-500">
                  <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" /> {project.view_count || 0} views</span>
                  <span className="inline-flex items-center gap-1"><Heart className="h-4 w-4" /> {project.like_count || 0} likes</span>
                </div>

                <button type="button" onClick={handleLike} className="mt-5 w-full border border-[#10233d] py-3 text-xs font-black uppercase transition hover:bg-[#10233d] hover:text-white">
                  <Heart className="mr-2 inline h-4 w-4" /> Like this project
                </button>
                <Link to="/contact" className="mt-3 inline-flex w-full items-center justify-center gap-2 bg-[#f4b51b] py-3 text-xs font-black uppercase text-[#10233d]">
                  Request similar service <ArrowRight className="h-4 w-4" />
                </Link>
                <button type="button" onClick={handleCopyLink} className="mt-3 inline-flex w-full items-center justify-center gap-2 border border-slate-300 py-3 text-xs font-black uppercase">
                  <Copy className="h-4 w-4" /> Copy project link
                </button>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </SiteLayout>
  )
}
