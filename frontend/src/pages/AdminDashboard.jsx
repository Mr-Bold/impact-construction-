import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminAPI, authAPI, projectsAPI, requestsAPI } from '../services/api'

export default function AdminDashboard() {
  const [activePage, setActivePage] = useState('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [projects, setProjects] = useState([])
  const [categories, setCategories] = useState([])
  const [customers, setCustomers] = useState([])
  const [categoryName, setCategoryName] = useState('')
  const [projectForm, setProjectForm] = useState({
    title: '', description: '', category_id: '', location: '', completion_date: '', duration: '', cover_image_url: '',
    is_featured: false, is_published: true,
  })
  const [projectError, setProjectError] = useState('')
  const [coverImageFile, setCoverImageFile] = useState(null)
  const [isSavingProject, setIsSavingProject] = useState(false)
  const [categoryError, setCategoryError] = useState('')
  const [customerError, setCustomerError] = useState('')
  const [settings, setSettings] = useState({ business_name: '', business_phone: '', business_email: '', business_address: '', business_hours: '', whatsapp_number: '', logo_url: '' })
  const [settingsError, setSettingsError] = useState('')
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [analytics, setAnalytics] = useState(null)
  const [analyticsError, setAnalyticsError] = useState('')
  const [requests, setRequests] = useState([])
  const [requestError, setRequestError] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [messages, setMessages] = useState([])
  const [requestMessage, setRequestMessage] = useState('')
  const [quotationForm, setQuotationForm] = useState({ service: '', description: '', estimated_cost: '', additional_charges: '0', valid_until: '', notes: '' })
  const [stats, setStats] = useState({ totalProjects: 0, totalCustomers: 0, pendingRequests: 0, completedRequests: 0 })
  const navigate = useNavigate()

  const loadRequests = async () => {
    try {
      const { data } = await requestsAPI.getAll()
      setRequests(data)
    } catch (requestError) {
      setRequestError(requestError.response?.data?.error || 'Unable to load service requests.')
    }
  }

  const loadCategories = async () => {
    try {
      const { data } = await adminAPI.getCategories()
      setCategories(data)
    } catch (requestError) {
      setCategoryError(requestError.response?.data?.error || 'Unable to load categories.')
    }
  }

  const loadCustomers = async () => {
    try {
      const { data } = await adminAPI.getCustomers()
      setCustomers(data)
    } catch (requestError) {
      setCustomerError(requestError.response?.data?.error || 'Unable to load customers.')
    }
  }

  const loadSettings = async () => {
    try {
      const { data } = await adminAPI.getSettings()
      if (data) setSettings((current) => ({ ...current, ...data }))
    } catch (requestError) {
      setSettingsError(requestError.response?.data?.error || 'Unable to load settings.')
    }
  }

  const loadAnalytics = async () => {
    try {
      const { data } = await adminAPI.getAnalytics()
      setAnalytics(data)
    } catch (requestError) {
      setAnalyticsError(requestError.response?.data?.error || 'Unable to load analytics.')
    }
  }

  const loadStats = async () => {
    try {
      const { data } = await adminAPI.getDashboardStats()
      setStats(data)
    } catch (requestError) {
      setRequestError(requestError.response?.data?.error || 'Unable to load dashboard statistics.')
    }
  }

  const loadProjects = async () => {
    try {
      const { data } = await projectsAPI.getAll()
      setProjects(data)
    } catch (requestError) {
      setProjectError(requestError.response?.data?.error || 'Unable to load projects.')
    }
  }

  useEffect(() => {
    loadProjects()
    loadRequests()
    loadStats()
    loadCategories()
    loadCustomers()
    loadSettings()
    loadAnalytics()
  }, [])

  const updateRequestStatus = async (id, status) => {
    try {
      const { data } = await requestsAPI.updateStatus(id, status)
      setRequests((current) => current.map((request) => (request.id === id ? data : request)))
    } catch (requestError) {
      setRequestError(requestError.response?.data?.error || 'Unable to update request status.')
    }
  }

  const openRequest = async (request) => {
    setSelectedRequest(request)
    setRequestError('')
    try {
      const { data } = await requestsAPI.getMessages(request.id)
      setMessages(data)
    } catch (requestError) {
      setRequestError(requestError.response?.data?.error || 'Unable to load request messages.')
    }
  }

  const sendRequestMessage = async () => {
    if (!selectedRequest || !requestMessage.trim()) return
    try {
      const { data } = await requestsAPI.addMessage(selectedRequest.id, requestMessage)
      setMessages((current) => [...current, data])
      setRequestMessage('')
    } catch (requestError) {
      setRequestError(requestError.response?.data?.error || 'Unable to send message.')
    }
  }

  const createQuotation = async (event) => {
    event.preventDefault()
    if (!selectedRequest) return
    try {
      await requestsAPI.createQuotation(selectedRequest.id, quotationForm)
      setRequestError('Quotation created successfully.')
      setRequests((current) => current.map((request) => request.id === selectedRequest.id ? { ...request, status: 'Quoted' } : request))
    } catch (requestError) {
      setRequestError(requestError.response?.data?.error || 'Unable to create quotation.')
    }
  }

  const handleProjectChange = (event) => {
    const { name, value, type, checked } = event.target
    setProjectForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleCreateProject = async (event) => {
    event.preventDefault()
    setProjectError('')
    setIsSavingProject(true)
    try {
      const { data: createdProject } = await projectsAPI.create(projectForm)
      if (coverImageFile) await projectsAPI.addMedia(createdProject.id, coverImageFile, true)
      setProjectForm({ title: '', description: '', category_id: '', location: '', completion_date: '', duration: '', cover_image_url: '', is_featured: false, is_published: true })
      setCoverImageFile(null)
      await loadProjects()
      await loadProjects()
    } catch (requestError) {
      setProjectError(requestError.response?.data?.error || 'Unable to create project.')
    } finally {
      setIsSavingProject(false)
    }
  }

  const handleCreateCategory = async (event) => {
    event.preventDefault()
    setCategoryError('')
    try {
      const { data } = await adminAPI.createCategory({ name: categoryName })
      setCategories((current) => [...current, data])
      setCategoryName('')
    } catch (requestError) {
      setCategoryError(requestError.response?.data?.error || 'Unable to create category.')
    }
  }

  const handleDeleteCategory = async (id) => {
    try {
      await adminAPI.deleteCategory(id)
      setCategories((current) => current.filter((category) => category.id !== id))
    } catch (requestError) {
      setCategoryError(requestError.response?.data?.error || 'Unable to delete category.')
    }
  }

  const handleSaveSettings = async (event) => {
    event.preventDefault()
    setSettingsError('')
    setIsSavingSettings(true)
    try {
      const { data } = await adminAPI.updateSettings(settings)
      setSettings(data)
    } catch (requestError) {
      setSettingsError(requestError.response?.data?.error || 'Unable to save settings.')
    } finally {
      setIsSavingSettings(false)
    }
  }

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return
    try {
      await projectsAPI.delete(id)
      setProjects((current) => current.filter((project) => project.id !== id))
    } catch (requestError) {
      setProjectError(requestError.response?.data?.error || 'Unable to delete project.')
    }
  }

  const handleProjectMediaUpload = async (id, event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setProjectError('')
    try {
      await projectsAPI.addMedia(id, file, true)
      await loadProjects()
    } catch (requestError) {
      setProjectError(requestError.response?.data?.error || 'Unable to upload project image.')
    } finally {
      event.target.value = ''
    }
  }

  const handleLogout = async () => {
    try {
      await authAPI.logout()
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login')
    }
  }

  const changePage = (page) => {
    setActivePage(page)
    setMobileMenuOpen(false)
  }

  const pageTitles = {
    dashboard: ['Overview', 'A live view of the business at a glance.'],
    projects: ['Projects', 'Create, publish, and curate your work portfolio.'],
    requests: ['Service Requests', 'Keep customer conversations and quotations moving.'],
    customers: ['Customers', 'Understand the people trusting you with their projects.'],
    categories: ['Categories', 'Organize your portfolio for easier discovery.'],
    analytics: ['Analytics', 'See what is getting attention across the platform.'],
    settings: ['Settings', 'Keep your public company information current.'],
  }

  return (
    <div className="min-h-screen bg-[#f4f5f3] text-[#111214]">
      <div className="flex min-h-screen">
        <aside
          className={`${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-30 w-72 border-r border-[#1f2a37] bg-[#071b34] text-white transition-transform duration-300 lg:static lg:translate-x-0`}
        >
          <div className="flex items-center justify-between border-b border-white/10 p-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#f4b51b]">Impact</p>
              <h2 className="mt-2 text-2xl font-black">Operations</h2>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="text-white/60 lg:hidden" aria-label="Close navigation">
              X
            </button>
          </div>

          <nav className="space-y-1 px-4 py-6">
            {[
              ['dashboard', 'Dashboard'],
              ['projects', 'Projects'],
              ['requests', 'Service Requests'],
              ['customers', 'Customers'],
              ['categories', 'Categories'],
              ['analytics', 'Analytics'],
              ['settings', 'Settings'],
            ].map(([page, label]) => (
              <button
                key={page}
                onClick={() => changePage(page)}
                className={`w-full rounded-xl border-l-2 px-4 py-3 text-left text-sm font-black uppercase tracking-[0.18em] transition ${
                  activePage === page
                    ? 'border-[#f4b51b] bg-white/10 text-[#f4b51b]'
                    : 'border-transparent text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="absolute bottom-0 w-full border-t border-white/10 p-4">
            <button
              onClick={handleLogout}
              className="w-full rounded-xl border border-white/20 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-white/80 transition hover:border-[#f4b51b] hover:text-[#f4b51b]"
            >
              Logout
            </button>
          </div>
        </aside>

        {mobileMenuOpen && (
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-20 bg-black/60 lg:hidden"
            aria-label="Close navigation overlay"
          />
        )}

        <main className="min-w-0 flex-1">
          <div className="border-b border-[#dfe3df] bg-[#f8f8f6] px-5 py-5 sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="rounded-xl border border-[#c8c9c8] bg-white px-3 py-2 text-sm font-black uppercase tracking-[0.18em] lg:hidden"
                  aria-label="Open navigation"
                >
                  Menu
                </button>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#b47b15]">Admin workspace</p>
                  <h1 className="mt-1 text-2xl font-black sm:text-3xl">{pageTitles[activePage][0]}</h1>
                  <p className="hidden text-sm text-[#62646a] sm:block">{pageTitles[activePage][1]}</p>
                </div>
              </div>

              <Link to="/" className="text-xs font-black uppercase tracking-[0.18em] text-[#62646a] hover:text-[#b47b15]">
                View site →
              </Link>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            {activePage === 'dashboard' && (
              <div>
                <div className="mb-8 flex items-end justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#b47b15]">Today at a glance</p>
                    <h2 className="mt-2 text-3xl font-black">Keep momentum.</h2>
                  </div>
                  <span className="hidden text-sm text-[#62646a] sm:block">Live from Supabase</span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-[#dfe3df] border-t-4 border-t-[#f4b51b] bg-white p-5 shadow-sm">
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#62646a]">Total projects</p>
                    <p className="mt-3 text-4xl font-black">{stats.totalProjects}</p>
                  </div>
                  <div className="rounded-2xl border border-[#dfe3df] border-t-4 border-t-[#64748b] bg-white p-5 shadow-sm">
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#62646a]">Total customers</p>
                    <p className="mt-3 text-4xl font-black">{stats.totalCustomers}</p>
                  </div>
                  <div className="rounded-2xl border border-[#dfe3df] border-t-4 border-t-[#d7a83d] bg-white p-5 shadow-sm">
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#62646a]">Pending requests</p>
                    <p className="mt-3 text-4xl font-black text-[#b47b15]">{stats.pendingRequests}</p>
                  </div>
                  <div className="rounded-2xl border border-[#dfe3df] border-t-4 border-t-[#1f6a52] bg-white p-5 shadow-sm">
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#62646a]">Completed requests</p>
                    <p className="mt-3 text-4xl font-black text-[#1f6a52]">{stats.completedRequests}</p>
                  </div>
                </div>
              </div>
            )}

            {activePage === 'projects' && (
              <div>
                <div className="mb-6 flex items-end justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#b47b15]">Portfolio</p>
                    <h2 className="mt-2 text-2xl font-black">Manage Projects</h2>
                  </div>
                </div>

                <form onSubmit={handleCreateProject} className="mb-8 grid grid-cols-1 gap-4 rounded-3xl border border-[#dfe3df] bg-white p-6 shadow-sm md:grid-cols-2">
                  <input name="title" value={projectForm.title} onChange={handleProjectChange} placeholder="Project title" required className="rounded-xl border border-[#dfe3df] bg-[#f8f8f6] px-4 py-3 text-sm outline-none focus:border-[#f4b51b]" />
                  <select name="category_id" value={projectForm.category_id} onChange={handleProjectChange} className="rounded-xl border border-[#dfe3df] bg-[#f8f8f6] px-4 py-3 text-sm outline-none focus:border-[#f4b51b]">
                    <option value="">No category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  <input name="location" value={projectForm.location} onChange={handleProjectChange} placeholder="Location" className="rounded-xl border border-[#dfe3df] bg-[#f8f8f6] px-4 py-3 text-sm outline-none focus:border-[#f4b51b]" />
                  <input name="completion_date" type="date" value={projectForm.completion_date} onChange={handleProjectChange} className="rounded-xl border border-[#dfe3df] bg-[#f8f8f6] px-4 py-3 text-sm outline-none focus:border-[#f4b51b]" />
                  <input name="duration" value={projectForm.duration} onChange={handleProjectChange} placeholder="Duration" className="rounded-xl border border-[#dfe3df] bg-[#f8f8f6] px-4 py-3 text-sm outline-none focus:border-[#f4b51b]" />
                  <input type="file" accept="image/*" onChange={(event) => setCoverImageFile(event.target.files?.[0] || null)} className="rounded-xl border border-[#dfe3df] bg-[#f8f8f6] px-4 py-3 text-sm outline-none focus:border-[#f4b51b] md:col-span-2" />
                  <textarea name="description" value={projectForm.description} onChange={handleProjectChange} placeholder="Description" rows="3" className="rounded-xl border border-[#dfe3df] bg-[#f8f8f6] px-4 py-3 text-sm outline-none focus:border-[#f4b51b] md:col-span-2" />

                  <label className="flex items-center gap-2 text-sm font-medium text-[#62646a]"><input name="is_featured" type="checkbox" checked={projectForm.is_featured} onChange={handleProjectChange} /> Featured project</label>
                  <label className="flex items-center gap-2 text-sm font-medium text-[#62646a]"><input name="is_published" type="checkbox" checked={projectForm.is_published} onChange={handleProjectChange} /> Published</label>

                  <button disabled={isSavingProject} className="rounded-xl bg-[#071b34] px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#10233d] md:col-span-2">
                    {isSavingProject ? 'Saving...' : 'Add New Project'}
                  </button>

                  {projectError && <p className="text-sm text-red-600 md:col-span-2">{projectError}</p>}
                </form>

                <div className="space-y-3">
                  {projects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between gap-4 rounded-2xl border border-[#dfe3df] bg-white p-4 shadow-sm">
                      <div>
                        <h3 className="text-lg font-black">{project.title}</h3>
                        <p className="text-sm text-[#62646a]">{project.location || 'Location not specified'}{project.is_featured ? ' • Featured' : ''}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer rounded-full border border-[#dfe3df] bg-[#f8f8f6] px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#111214] hover:border-[#071b34]">
                          Upload image
                          <input type="file" accept="image/*" className="hidden" onChange={(event) => handleProjectMediaUpload(project.id, event)} />
                        </label>
                        <button onClick={() => handleDeleteProject(project.id)} className="text-sm font-black uppercase tracking-[0.18em] text-red-600">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                  {projects.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-[#d0d4d2] bg-[#f8f8f6] p-8 text-center text-[#62646a]">
                      No projects yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activePage === 'requests' && (
              <div>
                <div className="mb-6">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#b47b15]">Operations</p>
                  <h2 className="mt-2 text-2xl font-black">Service Requests</h2>
                </div>

                {requestError && <p className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-700">{requestError}</p>}

                <div className="overflow-hidden rounded-3xl border border-[#dfe3df] bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left">
                      <thead className="bg-[#f8f8f6] text-[#111214]">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Request ID</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Customer</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Service</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Status</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Date</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map((request) => (
                          <tr key={request.id} className="border-t border-[#edf0ef]">
                            <td className="px-6 py-4 font-black">{request.request_number}</td>
                            <td className="px-6 py-4">
                              <p className="font-bold">{request.customer_name}</p>
                              <p className="text-sm text-[#62646a]">{request.customer_email}</p>
                            </td>
                            <td className="px-6 py-4 text-[#62646a]">{request.requested_service || 'General inquiry'}</td>
                            <td className="px-6 py-4">
                              <select value={request.status} onChange={(event) => updateRequestStatus(request.id, event.target.value)} className="rounded-xl border border-[#dfe3df] bg-[#f8f8f6] px-3 py-2 text-sm outline-none focus:border-[#f4b51b]">
                                {['Submitted', 'Reviewing', 'Quoted', 'Accepted', 'In Progress', 'Completed', 'Rejected'].map((status) => (
                                  <option key={status} value={status}>{status}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-6 py-4 text-[#62646a]">{new Date(request.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <button onClick={() => openRequest(request)} className="text-sm font-black uppercase tracking-[0.18em] text-[#9b6d12] hover:text-[#111214]">
                                Open
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {!requestError && requests.length === 0 && <p className="p-6 text-[#62646a]">No service requests yet.</p>}
                </div>

                {selectedRequest && (
                  <div className="mt-8 rounded-3xl border border-[#dfe3df] bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-[#edf0ef] pb-5 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#b47b15]">Selected request</p>
                        <h3 className="mt-2 text-2xl font-black">{selectedRequest.request_number}</h3>
                      </div>
                      <span className="rounded-full bg-[#071b34] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                        {selectedRequest.status}
                      </span>
                    </div>

                    <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                      <div>
                        <p className="text-sm text-[#62646a]">{selectedRequest.customer_name} • {selectedRequest.customer_email}</p>
                        <div className="mt-5 space-y-3">
                          {messages.map((item) => (
                            <div key={item.id} className="rounded-2xl border border-[#e7e9e7] bg-[#f8f8f6] p-3">
                              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#62646a]">{item.sender?.email || 'Message'}</p>
                              <p className="mt-2 text-sm leading-6 text-[#111214]">{item.message_text}</p>
                            </div>
                          ))}

                          {messages.length === 0 && (
                            <p className="rounded-2xl border border-dashed border-[#d0d4d2] bg-[#f8f8f6] p-4 text-sm text-[#62646a]">No messages yet.</p>
                          )}
                        </div>

                        <div className="mt-5 flex gap-3">
                          <input value={requestMessage} onChange={(event) => setRequestMessage(event.target.value)} placeholder="Reply to customer" className="flex-1 rounded-xl border border-[#dfe3df] bg-[#f8f8f6] px-4 py-3 text-sm outline-none focus:border-[#f4b51b]" />
                          <button onClick={sendRequestMessage} className="rounded-xl bg-[#071b34] px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#10233d]">
                            Send
                          </button>
                        </div>
                      </div>

                      <div>
                        <form onSubmit={createQuotation} className="rounded-2xl border border-[#dfe3df] bg-[#f9f7f2] p-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#b47b15]">Create quotation</p>
                          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <input value={quotationForm.service} onChange={(event) => setQuotationForm({ ...quotationForm, service: event.target.value })} placeholder="Service" required className="rounded-xl border border-[#dfe3df] bg-white px-3 py-3 text-sm outline-none focus:border-[#f4b51b] sm:col-span-2" />
                            <input value={quotationForm.estimated_cost} onChange={(event) => setQuotationForm({ ...quotationForm, estimated_cost: event.target.value })} type="number" min="0" step="0.01" placeholder="Estimated cost" required className="rounded-xl border border-[#dfe3df] bg-white px-3 py-3 text-sm outline-none focus:border-[#f4b51b]" />
                            <input value={quotationForm.additional_charges} onChange={(event) => setQuotationForm({ ...quotationForm, additional_charges: event.target.value })} type="number" min="0" step="0.01" placeholder="Additional charges" className="rounded-xl border border-[#dfe3df] bg-white px-3 py-3 text-sm outline-none focus:border-[#f4b51b]" />
                            <input value={quotationForm.valid_until} onChange={(event) => setQuotationForm({ ...quotationForm, valid_until: event.target.value })} type="date" required className="rounded-xl border border-[#dfe3df] bg-white px-3 py-3 text-sm outline-none focus:border-[#f4b51b] sm:col-span-2" />
                            <textarea value={quotationForm.description} onChange={(event) => setQuotationForm({ ...quotationForm, description: event.target.value })} placeholder="Quotation description" rows="3" className="rounded-xl border border-[#dfe3df] bg-white px-3 py-3 text-sm outline-none focus:border-[#f4b51b] sm:col-span-2" />
                            <textarea value={quotationForm.notes} onChange={(event) => setQuotationForm({ ...quotationForm, notes: event.target.value })} placeholder="Notes" rows="2" className="rounded-xl border border-[#dfe3df] bg-white px-3 py-3 text-sm outline-none focus:border-[#f4b51b] sm:col-span-2" />
                          </div>

                          <button className="mt-4 w-full rounded-xl bg-[#f4b51b] px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#111214]">Create quotation</button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activePage === 'customers' && (
              <div>
                <div className="mb-6">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#b47b15]">Client list</p>
                  <h2 className="mt-2 text-2xl font-black">Manage Customers</h2>
                </div>

                {customerError && <p className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-700">{customerError}</p>}

                <div className="overflow-hidden rounded-3xl border border-[#dfe3df] bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left">
                      <thead className="bg-[#f8f8f6]">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Name</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Email</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Phone</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Location</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em]">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((customer) => {
                          const profile = Array.isArray(customer.profiles) ? customer.profiles[0] : customer.profiles
                          return (
                            <tr key={customer.id} className="border-t border-[#edf0ef]">
                              <td className="px-6 py-4 font-bold">{profile?.first_name} {profile?.last_name}</td>
                              <td className="px-6 py-4 text-[#62646a]">{customer.email}</td>
                              <td className="px-6 py-4 text-[#62646a]">{profile?.phone_number || 'Not provided'}</td>
                              <td className="px-6 py-4 text-[#62646a]">{profile?.location || 'Not provided'}</td>
                              <td className="px-6 py-4 text-[#62646a]">{new Date(customer.created_at).toLocaleDateString()}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {!customerError && customers.length === 0 && <p className="p-6 text-[#62646a]">No customers yet.</p>}
                </div>
              </div>
            )}

            {activePage === 'categories' && (
              <div>
                <div className="mb-6">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#b47b15]">Portfolio</p>
                  <h2 className="mt-2 text-2xl font-black">Manage Categories</h2>
                </div>

                <form onSubmit={handleCreateCategory} className="mb-6 flex flex-col gap-3 rounded-3xl border border-[#dfe3df] bg-white p-5 shadow-sm sm:flex-row">
                  <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Category name" required className="flex-1 rounded-xl border border-[#dfe3df] bg-[#f8f8f6] px-4 py-3 text-sm outline-none focus:border-[#f4b51b]" />
                  <button className="rounded-xl bg-[#071b34] px-6 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#10233d]">Add category</button>
                </form>

                {categoryError && <p className="mb-4 text-sm text-red-600">{categoryError}</p>}

                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between rounded-2xl border border-[#dfe3df] bg-white p-4 shadow-sm">
                      <span className="text-lg font-black">{category.name}</span>
                      <button onClick={() => handleDeleteCategory(category.id)} className="text-sm font-black uppercase tracking-[0.18em] text-red-600">Delete</button>
                    </div>
                  ))}

                  {categories.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-[#d0d4d2] bg-[#f8f8f6] p-8 text-center text-[#62646a]">
                      No categories yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activePage === 'analytics' && (
              <div>
                <div className="mb-6">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#b47b15]">Performance</p>
                  <h2 className="mt-2 text-2xl font-black">Analytics</h2>
                </div>

                {analyticsError && <p className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-700">{analyticsError}</p>}

                {analytics && (
                  <>
                    <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
                      {Object.entries(analytics.totals).map(([label, value]) => (
                        <div key={label} className="rounded-2xl border border-[#dfe3df] bg-white p-5 shadow-sm">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#62646a]">{label.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="mt-3 text-3xl font-black">{value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-3xl border border-[#dfe3df] bg-white p-6 shadow-sm">
                      <h3 className="text-xl font-black">Requests by status</h3>
                      <div className="mt-5 space-y-3">
                        {Object.entries(analytics.requestStatuses).map(([status, count]) => (
                          <div key={status} className="flex items-center justify-between border-b border-[#edf0ef] pb-2">
                            <span className="text-[#62646a]">{status}</span>
                            <strong>{count}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {!analytics && !analyticsError && <p className="text-[#62646a]">Loading analytics...</p>}
              </div>
            )}

            {activePage === 'settings' && (
              <div>
                <div className="mb-6">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#b47b15]">Brand</p>
                  <h2 className="mt-2 text-2xl font-black">Settings</h2>
                </div>

                <form onSubmit={handleSaveSettings} className="grid max-w-4xl grid-cols-1 gap-4 rounded-3xl border border-[#dfe3df] bg-white p-6 shadow-sm md:grid-cols-2">
                  <input name="business_name" value={settings.business_name} onChange={(event) => setSettings({ ...settings, business_name: event.target.value })} placeholder="Business name" required className="rounded-xl border border-[#dfe3df] bg-[#f8f8f6] px-4 py-3 text-sm outline-none focus:border-[#f4b51b]" />
                  <input name="business_phone" value={settings.business_phone || ''} onChange={(event) => setSettings({ ...settings, business_phone: event.target.value })} placeholder="Phone" className="rounded-xl border border-[#dfe3df] bg-[#f8f8f6] px-4 py-3 text-sm outline-none focus:border-[#f4b51b]" />
                  <input name="business_email" type="email" value={settings.business_email || ''} onChange={(event) => setSettings({ ...settings, business_email: event.target.value })} placeholder="Email" className="rounded-xl border border-[#dfe3df] bg-[#f8f8f6] px-4 py-3 text-sm outline-none focus:border-[#f4b51b]" />
                  <input name="whatsapp_number" value={settings.whatsapp_number || ''} onChange={(event) => setSettings({ ...settings, whatsapp_number: event.target.value })} placeholder="WhatsApp number" className="rounded-xl border border-[#dfe3df] bg-[#f8f8f6] px-4 py-3 text-sm outline-none focus:border-[#f4b51b]" />
                  <input name="logo_url" value={settings.logo_url || ''} onChange={(event) => setSettings({ ...settings, logo_url: event.target.value })} placeholder="Logo URL" className="rounded-xl border border-[#dfe3df] bg-[#f8f8f6] px-4 py-3 text-sm outline-none focus:border-[#f4b51b] md:col-span-2" />
                  <input name="business_address" value={settings.business_address || ''} onChange={(event) => setSettings({ ...settings, business_address: event.target.value })} placeholder="Address" className="rounded-xl border border-[#dfe3df] bg-[#f8f8f6] px-4 py-3 text-sm outline-none focus:border-[#f4b51b] md:col-span-2" />
                  <textarea name="business_hours" value={settings.business_hours || ''} onChange={(event) => setSettings({ ...settings, business_hours: event.target.value })} placeholder="Business hours" rows="3" className="rounded-xl border border-[#dfe3df] bg-[#f8f8f6] px-4 py-3 text-sm outline-none focus:border-[#f4b51b] md:col-span-2" />

                  {settingsError && <p className="text-sm text-red-600 md:col-span-2">{settingsError}</p>}

                  <button disabled={isSavingSettings} className="rounded-xl bg-[#071b34] px-6 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#10233d] md:col-span-2">
                    {isSavingSettings ? 'Saving...' : 'Save Settings'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
