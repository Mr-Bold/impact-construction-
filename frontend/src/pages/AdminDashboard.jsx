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
    <div className="min-h-screen bg-[#eef0ef] text-[#111214]">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className={`${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-30 w-72 bg-[#08090a] text-white transition-transform duration-300 lg:static lg:translate-x-0`}>
          <div className="flex items-center justify-between border-b border-white/10 p-6">
            <div><p className="text-xs font-black uppercase tracking-[0.25em] text-[#d7a83d]">Impact</p><h2 className="mt-2 text-2xl font-black">Operations</h2></div>
            <button onClick={() => setMobileMenuOpen(false)} className="text-white/60 lg:hidden" aria-label="Close navigation">X</button>
          </div>
          <nav className="space-y-1 px-4 py-6">
            <button
              onClick={() => changePage('dashboard')}
              className={`w-full border-l-2 px-4 py-3 text-left text-sm font-bold ${activePage === 'dashboard' ? 'border-[#d7a83d] bg-white/10 text-[#d7a83d]' : 'border-transparent text-white/65 hover:bg-white/5 hover:text-white'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => changePage('projects')}
              className={`w-full border-l-2 px-4 py-3 text-left text-sm font-bold ${activePage === 'projects' ? 'border-[#d7a83d] bg-white/10 text-[#d7a83d]' : 'border-transparent text-white/65 hover:bg-white/5 hover:text-white'}`}
            >
              Projects
            </button>
            <button
              onClick={() => changePage('requests')}
              className={`w-full border-l-2 px-4 py-3 text-left text-sm font-bold ${activePage === 'requests' ? 'border-[#d7a83d] bg-white/10 text-[#d7a83d]' : 'border-transparent text-white/65 hover:bg-white/5 hover:text-white'}`}
            >
              Service Requests
            </button>
            <button
              onClick={() => changePage('customers')}
              className={`w-full border-l-2 px-4 py-3 text-left text-sm font-bold ${activePage === 'customers' ? 'border-[#d7a83d] bg-white/10 text-[#d7a83d]' : 'border-transparent text-white/65 hover:bg-white/5 hover:text-white'}`}
            >
              Customers
            </button>
            <button
              onClick={() => changePage('categories')}
              className={`w-full border-l-2 px-4 py-3 text-left text-sm font-bold ${activePage === 'categories' ? 'border-[#d7a83d] bg-white/10 text-[#d7a83d]' : 'border-transparent text-white/65 hover:bg-white/5 hover:text-white'}`}
            >
              Categories
            </button>
            <button
              onClick={() => changePage('analytics')}
              className={`w-full border-l-2 px-4 py-3 text-left text-sm font-bold ${activePage === 'analytics' ? 'border-[#d7a83d] bg-white/10 text-[#d7a83d]' : 'border-transparent text-white/65 hover:bg-white/5 hover:text-white'}`}
            >
              Analytics
            </button>
            <button
              onClick={() => changePage('settings')}
              className={`w-full border-l-2 px-4 py-3 text-left text-sm font-bold ${activePage === 'settings' ? 'border-[#d7a83d] bg-white/10 text-[#d7a83d]' : 'border-transparent text-white/65 hover:bg-white/5 hover:text-white'}`}
            >
              Settings
            </button>
          </nav>
          <div className="absolute bottom-0 w-full border-t border-white/10 p-4">
            <button onClick={handleLogout} className="w-full border border-white/20 px-4 py-3 text-sm font-bold text-white/75 hover:border-[#d7a83d] hover:text-[#d7a83d]">
              Logout
            </button>
          </div>
        </aside>
        {mobileMenuOpen && <button onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-20 bg-black/60 lg:hidden" aria-label="Close navigation overlay" />}

        {/* Main Content */}
        <main className="min-w-0 flex-1">
          <div className="border-b border-[#d7d9d7] bg-[#f8f8f6] px-5 py-5 sm:px-8">
            <div className="flex items-center justify-between"><div className="flex items-center gap-4"><button onClick={() => setMobileMenuOpen(true)} className="border border-[#c8c9c8] px-3 py-2 text-sm lg:hidden" aria-label="Open navigation">Menu</button><div><p className="text-xs font-black uppercase tracking-[0.25em] text-[#b47b15]">Admin workspace</p><h1 className="mt-1 text-2xl font-black sm:text-3xl">{pageTitles[activePage][0]}</h1><p className="hidden text-sm text-[#62646a] sm:block">{pageTitles[activePage][1]}</p></div></div><Link to="/" className="text-xs font-black uppercase tracking-wider text-[#62646a] hover:text-[#b47b15]">View site -&gt;</Link></div>
          </div>

          <div className="p-5 sm:p-8">
            {activePage === 'dashboard' && (
              <div>
                <div className="mb-8 flex items-end justify-between"><div><p className="text-sm font-black uppercase tracking-widest text-[#b47b15]">Today at a glance</p><h2 className="mt-2 text-3xl font-black">Keep momentum.</h2></div><span className="hidden text-sm text-[#62646a] sm:block">Live from Supabase</span></div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="border border-[#d2d3d1] border-t-4 border-t-[#d7a83d] bg-white p-6 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-widest text-[#62646a]">Total projects</p>
                    <p className="mt-3 text-4xl font-black">{stats.totalProjects}</p>
                  </div>
                  <div className="border border-[#d2d3d1] border-t-4 border-t-[#8f9699] bg-white p-6 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-widest text-[#62646a]">Total customers</p>
                    <p className="mt-3 text-4xl font-black">{stats.totalCustomers}</p>
                  </div>
                  <div className="border border-[#d2d3d1] border-t-4 border-t-[#c28b1b] bg-white p-6 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-widest text-[#62646a]">Pending requests</p>
                    <p className="mt-3 text-4xl font-black text-[#b47b15]">{stats.pendingRequests}</p>
                  </div>
                  <div className="border border-[#d2d3d1] border-t-4 border-t-[#4f7461] bg-white p-6 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-widest text-[#62646a]">Completed requests</p>
                    <p className="mt-3 text-4xl font-black text-[#4f7461]">{stats.completedRequests}</p>
                  </div>
                </div>
              </div>
            )}

            {activePage === 'projects' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Manage Projects</h2>
                <form onSubmit={handleCreateProject} className="bg-white rounded-lg shadow p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="title" value={projectForm.title} onChange={handleProjectChange} placeholder="Project title" required className="border rounded px-4 py-2" />
                  <select name="category_id" value={projectForm.category_id} onChange={handleProjectChange} className="border rounded px-4 py-2">
                    <option value="">No category</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                  <input name="location" value={projectForm.location} onChange={handleProjectChange} placeholder="Location" className="border rounded px-4 py-2" />
                  <input name="completion_date" type="date" value={projectForm.completion_date} onChange={handleProjectChange} className="border rounded px-4 py-2" />
                  <input name="duration" value={projectForm.duration} onChange={handleProjectChange} placeholder="Duration" className="border rounded px-4 py-2" />
                  <input type="file" accept="image/*" onChange={(event) => setCoverImageFile(event.target.files?.[0] || null)} className="border rounded px-4 py-2 md:col-span-2" />
                  <textarea name="description" value={projectForm.description} onChange={handleProjectChange} placeholder="Description" rows="3" className="border rounded px-4 py-2 md:col-span-2" />
                  <label className="flex items-center gap-2"><input name="is_featured" type="checkbox" checked={projectForm.is_featured} onChange={handleProjectChange} /> Featured project</label>
                  <label className="flex items-center gap-2"><input name="is_published" type="checkbox" checked={projectForm.is_published} onChange={handleProjectChange} /> Published</label>
                  <button disabled={isSavingProject} className="bg-[#111214] px-6 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:bg-[#d7a83d] hover:text-[#111214] md:col-span-2">
                    {isSavingProject ? 'Saving...' : 'Add New Project'}
                  </button>
                  {projectError && <p className="text-red-600 md:col-span-2">{projectError}</p>}
                </form>

                <div className="space-y-3">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center gap-4">
                      <div>
                        <h3 className="font-bold">{project.title}</h3>
                        <p className="text-sm text-gray-600">{project.location || 'Location not specified'}{project.is_featured ? ' | Featured' : ''}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer text-sm font-bold text-[#9b6d12] hover:text-[#111214]">Upload image<input type="file" accept="image/*" className="hidden" onChange={(event) => handleProjectMediaUpload(project.id, event)} /></label>
                        <button onClick={() => handleDeleteProject(project.id)} className="text-red-600 font-bold">Delete</button>
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && <p className="text-gray-600">No projects yet.</p>}
                </div>
              </div>
            )}

            {activePage === 'requests' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Service Requests</h2>
                {requestError && <p className="mb-4 rounded bg-red-100 px-4 py-3 text-red-700">{requestError}</p>}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="text-left px-6 py-3 font-bold">Request ID</th>
                        <th className="text-left px-6 py-3 font-bold">Customer</th>
                        <th className="text-left px-6 py-3 font-bold">Service</th>
                        <th className="text-left px-6 py-3 font-bold">Status</th>
                        <th className="text-left px-6 py-3 font-bold">Date</th>
                        <th className="text-left px-6 py-3 font-bold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((request) => (
                        <tr key={request.id} className="border-b">
                          <td className="px-6 py-4 font-bold">{request.request_number}</td>
                          <td className="px-6 py-4">{request.customer_name}<br /><span className="text-sm text-gray-500">{request.customer_email}</span></td>
                          <td className="px-6 py-4">{request.requested_service || 'General inquiry'}</td>
                          <td className="px-6 py-4">
                            <select value={request.status} onChange={(event) => updateRequestStatus(request.id, event.target.value)} className="border rounded px-2 py-1">
                              {['Submitted', 'Reviewing', 'Quoted', 'Accepted', 'In Progress', 'Completed', 'Rejected'].map((status) => <option key={status} value={status}>{status}</option>)}
                            </select>
                          </td>
                          <td className="px-6 py-4">{new Date(request.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4"><button onClick={() => openRequest(request)} className="font-bold text-[#9b6d12] hover:text-[#111214]">Open</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!requestError && requests.length === 0 && <p className="p-6 text-gray-600">No service requests yet.</p>}
                </div>
                {selectedRequest && (
                  <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-bold mb-2">{selectedRequest.request_number}</h3>
                    <p className="text-gray-600 mb-4">{selectedRequest.customer_name} | {selectedRequest.customer_email}</p>
                    <div className="space-y-2 mb-4">
                      {messages.map((item) => <div key={item.id} className="rounded bg-gray-100 p-3"><p className="text-sm text-gray-500">{item.sender?.email || 'Message'}</p><p>{item.message_text}</p></div>)}
                      {messages.length === 0 && <p className="text-gray-500">No messages yet.</p>}
                    </div>
                    <div className="flex gap-2 mb-8">
                      <input value={requestMessage} onChange={(event) => setRequestMessage(event.target.value)} placeholder="Reply to customer" className="flex-1 border rounded px-3 py-2" />
                      <button onClick={sendRequestMessage} className="bg-[#111214] px-4 py-2 font-bold text-white hover:bg-[#d7a83d] hover:text-[#111214]">Send</button>
                    </div>
                    <form onSubmit={createQuotation} className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <h4 className="font-bold md:col-span-2">Create quotation</h4>
                      <input value={quotationForm.service} onChange={(event) => setQuotationForm({ ...quotationForm, service: event.target.value })} placeholder="Service" required className="border rounded px-3 py-2" />
                      <input value={quotationForm.estimated_cost} onChange={(event) => setQuotationForm({ ...quotationForm, estimated_cost: event.target.value })} type="number" min="0" step="0.01" placeholder="Estimated cost" required className="border rounded px-3 py-2" />
                      <input value={quotationForm.additional_charges} onChange={(event) => setQuotationForm({ ...quotationForm, additional_charges: event.target.value })} type="number" min="0" step="0.01" placeholder="Additional charges" className="border rounded px-3 py-2" />
                      <input value={quotationForm.valid_until} onChange={(event) => setQuotationForm({ ...quotationForm, valid_until: event.target.value })} type="date" required className="border rounded px-3 py-2" />
                      <textarea value={quotationForm.description} onChange={(event) => setQuotationForm({ ...quotationForm, description: event.target.value })} placeholder="Quotation description" rows="3" className="border rounded px-3 py-2 md:col-span-2" />
                      <textarea value={quotationForm.notes} onChange={(event) => setQuotationForm({ ...quotationForm, notes: event.target.value })} placeholder="Notes" rows="2" className="border rounded px-3 py-2 md:col-span-2" />
                      <button className="bg-[#d7a83d] px-4 py-3 font-black uppercase tracking-wider text-[#111214] hover:bg-[#edc766] md:col-span-2">Create Quotation</button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {activePage === 'customers' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Manage Customers</h2>
                {customerError && <p className="mb-4 rounded bg-red-100 px-4 py-3 text-red-700">{customerError}</p>}
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-6 py-3 font-bold">Name</th>
                        <th className="px-6 py-3 font-bold">Email</th>
                        <th className="px-6 py-3 font-bold">Phone</th>
                        <th className="px-6 py-3 font-bold">Location</th>
                        <th className="px-6 py-3 font-bold">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => {
                        const profile = Array.isArray(customer.profiles) ? customer.profiles[0] : customer.profiles
                        return (
                          <tr key={customer.id} className="border-b">
                            <td className="px-6 py-4">{profile?.first_name} {profile?.last_name}</td>
                            <td className="px-6 py-4">{customer.email}</td>
                            <td className="px-6 py-4">{profile?.phone_number || 'Not provided'}</td>
                            <td className="px-6 py-4">{profile?.location || 'Not provided'}</td>
                            <td className="px-6 py-4">{new Date(customer.created_at).toLocaleDateString()}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {!customerError && customers.length === 0 && <p className="p-6 text-gray-600">No customers yet.</p>}
                </div>
              </div>
            )}

            {activePage === 'categories' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Manage Categories</h2>
                <form onSubmit={handleCreateCategory} className="flex gap-3 mb-6">
                  <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Category name" required className="border rounded px-4 py-2" />
                  <button className="bg-[#111214] px-6 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-[#d7a83d] hover:text-[#111214]">Add Category</button>
                </form>
                {categoryError && <p className="mb-4 text-red-600">{categoryError}</p>}
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="bg-white rounded-lg shadow p-4 flex justify-between">
                      <span className="font-bold">{category.name}</span>
                      <button onClick={() => handleDeleteCategory(category.id)} className="text-red-600 font-bold">Delete</button>
                    </div>
                  ))}
                  {categories.length === 0 && <p className="text-gray-600">No categories yet.</p>}
                </div>
              </div>
            )}

            {activePage === 'analytics' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Analytics</h2>
                {analyticsError && <p className="mb-4 rounded bg-red-100 px-4 py-3 text-red-700">{analyticsError}</p>}
                {analytics && <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {Object.entries(analytics.totals).map(([label, value]) => <div key={label} className="bg-white rounded-lg shadow p-5"><p className="text-gray-500 capitalize">{label.replace(/([A-Z])/g, ' $1')}</p><p className="text-3xl font-bold">{value}</p></div>)}
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-bold mb-4">Requests by status</h3>
                    <div className="space-y-2">{Object.entries(analytics.requestStatuses).map(([status, count]) => <div key={status} className="flex justify-between border-b py-2"><span>{status}</span><strong>{count}</strong></div>)}</div>
                  </div>
                </>}
                {!analytics && !analyticsError && <p className="text-gray-600">Loading analytics...</p>}
              </div>
            )}

            {activePage === 'settings' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Settings</h2>
                <form onSubmit={handleSaveSettings} className="bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
                  <input name="business_name" value={settings.business_name} onChange={(event) => setSettings({ ...settings, business_name: event.target.value })} placeholder="Business name" required className="border rounded px-4 py-2" />
                  <input name="business_phone" value={settings.business_phone || ''} onChange={(event) => setSettings({ ...settings, business_phone: event.target.value })} placeholder="Phone" className="border rounded px-4 py-2" />
                  <input name="business_email" type="email" value={settings.business_email || ''} onChange={(event) => setSettings({ ...settings, business_email: event.target.value })} placeholder="Email" className="border rounded px-4 py-2" />
                  <input name="whatsapp_number" value={settings.whatsapp_number || ''} onChange={(event) => setSettings({ ...settings, whatsapp_number: event.target.value })} placeholder="WhatsApp number" className="border rounded px-4 py-2" />
                  <input name="logo_url" value={settings.logo_url || ''} onChange={(event) => setSettings({ ...settings, logo_url: event.target.value })} placeholder="Logo URL" className="border rounded px-4 py-2 md:col-span-2" />
                  <input name="business_address" value={settings.business_address || ''} onChange={(event) => setSettings({ ...settings, business_address: event.target.value })} placeholder="Address" className="border rounded px-4 py-2 md:col-span-2" />
                  <textarea name="business_hours" value={settings.business_hours || ''} onChange={(event) => setSettings({ ...settings, business_hours: event.target.value })} placeholder="Business hours" rows="3" className="border rounded px-4 py-2 md:col-span-2" />
                  {settingsError && <p className="text-red-600 md:col-span-2">{settingsError}</p>}
                  <button disabled={isSavingSettings} className="bg-[#111214] px-6 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-[#d7a83d] hover:text-[#111214] md:col-span-2">{isSavingSettings ? 'Saving...' : 'Save Settings'}</button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
