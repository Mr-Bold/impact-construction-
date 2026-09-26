import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI, notificationsAPI, requestsAPI } from '../services/api'

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [requests, setRequests] = useState([])
  const [requestError, setRequestError] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [messages, setMessages] = useState([])
  const [quotation, setQuotation] = useState(null)
  const [message, setMessage] = useState('')
  const [notifications, setNotifications] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const { data } = await requestsAPI.getAll()
        setRequests(data)
      } catch (requestError) {
        setRequestError(requestError.response?.data?.error || 'Unable to load requests.')
      }
    }
    loadRequests()
    const loadNotifications = async () => {
      try {
        const { data } = await notificationsAPI.getAll()
        setNotifications(data)
      } catch {
      }
    }
    loadNotifications()
  }, [])

  const countByStatus = (status) => requests.filter((request) => request.status === status).length

  const openRequest = async (request) => {
    setSelectedRequest(request)
    setRequestError('')
    try {
      const [messagesResponse, quotationResponse] = await Promise.all([
        requestsAPI.getMessages(request.id),
        requestsAPI.getQuotation(request.id).catch(() => ({ data: null })),
      ])
      setMessages(messagesResponse.data)
      setQuotation(quotationResponse.data)
    } catch (requestError) {
      setRequestError(requestError.response?.data?.error || 'Unable to load request details.')
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || !selectedRequest) return
    try {
      const { data } = await requestsAPI.addMessage(selectedRequest.id, message)
      setMessages((current) => [...current, data])
      setMessage('')
    } catch (requestError) {
      setRequestError(requestError.response?.data?.error || 'Unable to send message.')
    }
  }

  const respondToQuotation = async (response) => {
    if (!selectedRequest) return
    try {
      const { data } = await requestsAPI.respondToQuotation(selectedRequest.id, response)
      setQuotation(data)
      setRequests((current) => current.map((request) => request.id === selectedRequest.id ? { ...request, status: response === 'accepted' ? 'Accepted' : 'Rejected' } : request))
      setSelectedRequest((current) => ({ ...current, status: response === 'accepted' ? 'Accepted' : 'Rejected' }))
    } catch (requestError) {
      setRequestError(requestError.response?.data?.error || 'Unable to respond to quotation.')
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

  return (
    <div className="min-h-screen bg-[#f4f5f3] text-[#111214]">
      <div className="border-b border-[#dfe3df] bg-[#071b34] text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#f4b51b]">Impact Construction</p>
            <h1 className="mt-1 text-xl font-black sm:text-2xl">Client Portal</h1>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:border-[#f4b51b] hover:text-[#f4b51b]"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#dfe3df] bg-white p-5 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#62646a]">Total requests</p>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-3xl font-black">{requests.length}</span>
              <span className="rounded-full bg-[#f4b51b]/15 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#9b6d12]">Active</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#dfe3df] bg-white p-5 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#62646a]">Pending</p>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-3xl font-black text-[#b47b15]">{countByStatus('Submitted') + countByStatus('Reviewing')}</span>
              <span className="rounded-full bg-[#f7d98b]/20 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#9b6d12]">Review</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#dfe3df] bg-white p-5 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#62646a]">Accepted</p>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-3xl font-black text-[#1f6a52]">{countByStatus('Accepted')}</span>
              <span className="rounded-full bg-[#d9efe7] px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#1f6a52]">Approved</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#dfe3df] bg-white p-5 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#62646a]">Completed</p>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-3xl font-black text-[#0f2d4d]">{countByStatus('Completed')}</span>
              <span className="rounded-full bg-[#dfeaf6] px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#0f2d4d]">Done</span>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#dfe3df] bg-white shadow-sm">
          <div className="border-b border-[#dfe3df] bg-[#f8f8f6]">
            <div className="flex flex-wrap gap-2 px-5 py-4 sm:px-6">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'requests', label: 'My Requests' },
                { key: 'profile', label: 'Profile' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.18em] transition ${
                    activeTab === tab.key
                      ? 'bg-[#071b34] text-white'
                      : 'bg-transparent text-[#62646a] hover:bg-[#edf0ef] hover:text-[#111214]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#b47b15]">Welcome back</p>
                    <h2 className="mt-2 text-3xl font-black">Your project progress is on track.</h2>
                  </div>
                  <span className="text-sm text-[#62646a]">Client portal • live updates</span>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-2xl border border-[#dfe3df] bg-[#f8f8f6] p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black">Notifications</h3>
                      <span className="rounded-full bg-[#071b34] px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                        {notifications.filter((item) => !item.is_read).length} new
                      </span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          className={`rounded-xl border p-3 ${
                            notification.is_read ? 'border-[#e3e6e3] bg-white' : 'border-[#f4b51b]/30 bg-[#fffaf0]'
                          }`}
                        >
                          <p className="text-sm font-black text-[#111214]">{notification.title}</p>
                          <p className="mt-1 text-sm text-[#62646a]">{notification.message}</p>
                        </div>
                      ))}

                      {notifications.length === 0 && (
                        <p className="rounded-xl border border-dashed border-[#c7cbd0] bg-white p-4 text-sm text-[#62646a]">
                          No notifications yet.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#dfe3df] bg-[#071b34] p-5 text-white">
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#f4b51b]">Fast actions</p>
                    <div className="mt-4 space-y-3">
                      <button className="block w-full rounded-xl bg-[#f4b51b] px-4 py-3 text-left text-xs font-black uppercase tracking-[0.18em] text-[#111214]">
                        Create new request
                      </button>
                      <button className="block w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-left text-xs font-black uppercase tracking-[0.18em] text-white">
                        View my files
                      </button>
                      <button className="block w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-left text-xs font-black uppercase tracking-[0.18em] text-white">
                        Contact support
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#b47b15]">Project tracking</p>
                    <h2 className="mt-2 text-2xl font-black">My Requests</h2>
                  </div>
                </div>

                {requestError && <p className="mb-4 rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-700">{requestError}</p>}

                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="rounded-2xl border border-[#dfe3df] bg-[#f8f8f6] p-4 shadow-sm">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#62646a]">{request.request_number}</p>
                          <h3 className="mt-2 text-lg font-black">{request.requested_service || 'General inquiry'}</h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <span className="rounded-full bg-[#f7d98b]/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#9b6d12]">
                            {request.status}
                          </span>
                          <span className="text-sm text-[#62646a]">{new Date(request.created_at).toLocaleDateString()}</span>
                          <button
                            onClick={() => openRequest(request)}
                            className="rounded-full border border-[#dfe3df] bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#111214] transition hover:border-[#071b34]"
                          >
                            Open
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {!requestError && requests.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-[#d0d4d2] bg-[#f8f8f6] p-8 text-center text-[#62646a]">
                      No service requests yet.
                    </div>
                  )}
                </div>

                {selectedRequest && (
                  <div className="mt-6 rounded-2xl border border-[#dfe3df] bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-[#e5e7e5] pb-4 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#b47b15]">Request detail</p>
                        <h3 className="mt-2 text-2xl font-black">{selectedRequest.request_number}</h3>
                      </div>
                      <span className="rounded-full bg-[#071b34] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                        {selectedRequest.status}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                      <div>
                        <p className="text-sm text-[#62646a]">{selectedRequest.description}</p>

                        <div className="mt-5 space-y-3">
                          {messages.map((item) => (
                            <div key={item.id} className="rounded-2xl border border-[#e6e8e6] bg-[#f8f8f6] p-3">
                              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#62646a]">{item.sender?.email || 'Message'}</p>
                              <p className="mt-2 text-sm text-[#111214]">{item.message_text}</p>
                            </div>
                          ))}

                          {messages.length === 0 && (
                            <p className="rounded-2xl border border-dashed border-[#d0d4d2] bg-[#f8f8f6] p-4 text-sm text-[#62646a]">
                              No messages yet.
                            </p>
                          )}
                        </div>

                        <div className="mt-5 flex gap-3">
                          <input
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            placeholder="Write a message"
                            className="flex-1 rounded-xl border border-[#dfe3df] bg-[#f8f8f6] px-3 py-3 text-sm outline-none focus:border-[#f4b51b]"
                          />
                          <button
                            onClick={sendMessage}
                            className="rounded-xl bg-[#071b34] px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#10233d]"
                          >
                            Send
                          </button>
                        </div>
                      </div>

                      <div>
                        {quotation && (
                          <div className="rounded-2xl border border-[#dfe3df] bg-[#f9f7f2] p-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#b47b15]">Quotation</p>
                            <h4 className="mt-2 text-lg font-black">{quotation.service}</h4>
                            <p className="mt-3 text-sm leading-6 text-[#62646a]">{quotation.description}</p>
                            <div className="mt-4 space-y-2 text-sm">
                              <div className="flex justify-between"><span className="text-[#62646a]">Estimated cost</span><span className="font-black">{quotation.estimated_cost}</span></div>
                              <div className="flex justify-between"><span className="text-[#62646a]">Additional charges</span><span className="font-black">{quotation.additional_charges}</span></div>
                              <div className="flex justify-between"><span className="text-[#62646a]">Total</span><span className="font-black">{quotation.total}</span></div>
                              <div className="flex justify-between"><span className="text-[#62646a]">Valid until</span><span className="font-black">{quotation.valid_until}</span></div>
                            </div>

                            {!quotation.customer_response && (
                              <div className="mt-5 flex gap-3">
                                <button
                                  onClick={() => respondToQuotation('accepted')}
                                  className="flex-1 rounded-xl bg-[#1f6a52] px-3 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => respondToQuotation('declined')}
                                  className="flex-1 rounded-xl bg-[#d14848] px-3 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white"
                                >
                                  Decline
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {!quotation && (
                          <div className="rounded-2xl border border-dashed border-[#d0d4d2] bg-[#f8f8f6] p-5 text-sm text-[#62646a]">
                            No quotation has been sent yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <div className="mb-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#b47b15]">Account</p>
                  <h2 className="mt-2 text-2xl font-black">My Profile</h2>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="rounded-2xl border border-[#dfe3df] bg-[#f8f8f6] p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#62646a]">Full name</p>
                    <p className="mt-3 text-xl font-black">John Doe</p>
                  </div>

                  <div className="rounded-2xl border border-[#dfe3df] bg-[#f8f8f6] p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#62646a]">Email</p>
                    <p className="mt-3 text-xl font-black">john@example.com</p>
                  </div>

                  <div className="rounded-2xl border border-[#dfe3df] bg-[#f8f8f6] p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#62646a]">Phone</p>
                    <p className="mt-3 text-xl font-black">+1 (555) 123-4567</p>
                  </div>

                  <div className="rounded-2xl border border-[#dfe3df] bg-[#f8f8f6] p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#62646a]">Account type</p>
                    <p className="mt-3 text-xl font-black">Client</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
