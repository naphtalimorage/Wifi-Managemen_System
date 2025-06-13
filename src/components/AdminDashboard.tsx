import React, { useState, useEffect } from 'react'
import { Users, CreditCard, Settings, Activity, Eye, UserX } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatDistanceToNow } from 'date-fns'

interface User {
  id: string
  full_name: string
  phone_number: string
  email: string
  created_at: string
}

interface UserSession {
  id: string
  user_id: string
  plan_id: string
  start_time: string
  end_time: string
  is_active: boolean
  users: User
  data_plans: {
    name: string
    price_ksh: number
  }
}

interface Payment {
  id: string
  amount_ksh: number
  status: string
  created_at: string
  users: User
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'sessions' | 'payments' | 'settings'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch users
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      // Fetch active sessions
      const { data: sessionsData } = await supabase
        .from('user_sessions')
        .select(`
          *,
          users(full_name, phone_number, email),
          data_plans(name, price_ksh)
        `)
        .eq('is_active', true)
        .order('start_time', { ascending: false })

      // Fetch recent payments
      const { data: paymentsData } = await supabase
        .from('payments')
        .select(`
          *,
          users(full_name, phone_number, email)
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      setUsers(usersData || [])
      setSessions(sessionsData || [])
      setPayments(paymentsData || [])
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const disconnectUser = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false, end_time: new Date().toISOString() })
        .eq('id', sessionId)

      if (error) throw error
      
      // Refresh sessions
      fetchData()
      alert('User disconnected successfully')
    } catch (error) {
      console.error('Error disconnecting user:', error)
      alert('Failed to disconnect user')
    }
  }

  const StatCard: React.FC<{
    title: string
    value: string | number
    icon: React.ReactNode
    color: string
  }> = ({ title, value, icon, color }) => (
    <div className={`bg-gradient-to-r ${color} rounded-lg p-4 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="opacity-80">{icon}</div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">WiFi Access Management System</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={users.length}
            icon={<Users className="w-8 h-8" />}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Active Sessions"
            value={sessions.length}
            icon={<Activity className="w-8 h-8" />}
            color="from-green-500 to-green-600"
          />
          <StatCard
            title="Total Revenue"
            value={`KSh ${payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount_ksh, 0)}`}
            icon={<CreditCard className="w-8 h-8" />}
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            title="Completion Rate"
            value={`${payments.length > 0 ? Math.round((payments.filter(p => p.status === 'completed').length / payments.length) * 100) : 0}%`}
            icon={<Settings className="w-8 h-8" />}
            color="from-orange-500 to-orange-600"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'users', label: 'Users', icon: Users },
                { id: 'sessions', label: 'Active Sessions', icon: Activity },
                { id: 'payments', label: 'Payments', icon: CreditCard },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'users' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Registered Users</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Registered
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.phone_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'sessions' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
                <div className="grid gap-4">
                  {sessions.map(session => (
                    <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{session.users.full_name}</h4>
                          <p className="text-sm text-gray-600">{session.users.email}</p>
                          <p className="text-sm text-gray-500">
                            Plan: {session.data_plans.name} (KSh {session.data_plans.price_ksh})
                          </p>
                          <p className="text-sm text-gray-500">
                            Started: {formatDistanceToNow(new Date(session.start_time), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => disconnectUser(session.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.map(payment => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{payment.users.full_name}</div>
                            <div className="text-sm text-gray-500">{payment.users.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            KSh {payment.amount_ksh}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDistanceToNow(new Date(payment.created_at), { addSuffix: true })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
                <div className="grid gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Network Configuration</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Router IP: 192.168.1.1</p>
                      <p>SSID: FiberLink-Guest</p>
                      <p>Status: Active</p>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">M-Pesa Integration</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Business Short Code: 174379</p>
                      <p>Status: Connected</p>
                      <p>Last Sync: {new Date().toLocaleString()}</p>
                    </div>
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