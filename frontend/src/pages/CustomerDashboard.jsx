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
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">My Dashboard</h1>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Requests</p>
            <p className="text-3xl font-bold">{requests.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{countByStatus('Submitted') + countByStatus('Reviewing')}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Accepted</p>
            <p className="text-3xl font-bold text-green-600">{countByStatus('Accepted')}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Completed</p>
            <p className="text-3xl font-bold text-blue-600">{countByStatus('Completed')}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 font-bold ${activeTab === 'overview' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-600'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-4 font-bold ${activeTab === 'requests' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-600'}`}
              >
                My Requests
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 font-bold ${activeTab === 'profile' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-600'}`}
              >
                Profile
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Welcome back!</h2>
                <p className="text-gray-600">Track your service requests and manage your profile.</p>
                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-3">Notifications</h3>
                  <div className="space-y-2">{notifications.slice(0, 5).map((notification) => <div key={notification.id} className={`rounded p-3 ${notification.is_read ? 'bg-gray-100' : 'bg-blue-50'}`}><p className="font-bold">{notification.title}</p><p className="text-sm text-gray-600">{notification.message}</p></div>)}{notifications.length === 0 && <p className="text-gray-500">No notifications yet.</p>}</div>
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">My Requests</h2>
                {requestError && <p className="mb-4 rounded bg-red-100 px-4 py-3 text-red-700">{requestError}</p>}
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 font-bold">Request ID</th>
                      <th className="text-left py-3 font-bold">Service</th>
                      <th className="text-left py-3 font-bold">Status</th>
                      <th className="text-left py-3 font-bold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr key={request.id} className="border-b">
                        <td className="py-3 font-bold">{request.request_number}</td>
                        <td>{request.requested_service || 'General inquiry'}</td>
                        <td><span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">{request.status}</span></td>
                        <td>{new Date(request.created_at).toLocaleDateString()}</td>
                        <td><button onClick={() => openRequest(request)} className="text-blue-600 font-bold">Open</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!requestError && requests.length === 0 && <p className="py-4 text-gray-600">No service requests yet.</p>}
                {selectedRequest && (
                  <div className="mt-8 border-t pt-6">
                    <h3 className="text-xl font-bold mb-2">{selectedRequest.request_number}</h3>
                    <p className="text-gray-600 mb-4">{selectedRequest.description}</p>
                    <div className="space-y-2 mb-4">
                      {messages.map((item) => <div key={item.id} className="rounded bg-gray-100 p-3"><p className="text-sm text-gray-500">{item.sender?.email || 'Message'}</p><p>{item.message_text}</p></div>)}
                      {messages.length === 0 && <p className="text-gray-500">No messages yet.</p>}
                    </div>
                    <div className="flex gap-2 mb-6">
                      <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write a message" className="flex-1 border rounded px-3 py-2" />
                      <button onClick={sendMessage} className="bg-blue-600 text-white px-4 rounded font-bold">Send</button>
                    </div>
                    {quotation && <div className="rounded border p-4"><h4 className="font-bold mb-2">Quotation: {quotation.service}</h4><p>{quotation.description}</p><p className="font-bold mt-2">Total: {quotation.total}</p><p className="text-sm text-gray-500">Valid until: {quotation.valid_until}</p>{!quotation.customer_response && <div className="mt-3 flex gap-2"><button onClick={() => respondToQuotation('accepted')} className="bg-green-600 text-white px-3 py-2 rounded">Accept</button><button onClick={() => respondToQuotation('declined')} className="bg-red-600 text-white px-3 py-2 rounded">Decline</button></div>}</div>}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">My Profile</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-600 font-bold">Name</label>
                    <p className="text-lg">John Doe</p>
                  </div>
                  <div>
                    <label className="block text-gray-600 font-bold">Email</label>
                    <p className="text-lg">john@example.com</p>
                  </div>
                  <div>
                    <label className="block text-gray-600 font-bold">Phone</label>
                    <p className="text-lg">+1 (555) 123-4567</p>
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
