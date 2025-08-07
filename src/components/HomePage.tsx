import React, { useState, useEffect } from 'react'
import { Wifi, Clock, CreditCard, User, LogOut, ArrowRight, Shield, Zap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface HomePageProps {
  onNavigate: (page: 'plans' | 'active' | 'profile') => void
  onSignOut: () => void
}

interface UserSession {
  id: string
  plan_id: string
  start_time: string
  end_time: string
  is_active: boolean
  data_plans: {
    name: string
    price_ksh: number
    duration_hours: number
  }
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSignOut }) => {
  const { user } = useAuth()
  const [activeSession, setActiveSession] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkActiveSession()
  }, [user])

  const checkActiveSession = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data } = await supabase
        .from('user_sessions')
        .select(`
          *,
          data_plans(name, price_ksh, duration_hours)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle()

      setActiveSession(data)
    } catch (error) {
      console.error('Error fetching active session:', error)
      // No active session found
      setActiveSession(null)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeRemaining = (endTime: string) => {
    const now = new Date()
    const end = new Date(endTime)
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expired'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`
    }
    return `${minutes}m remaining`
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center">
        <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
          <Wifi className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.full_name?.split(' ')[0]}!
        </h2>
        <p className="text-gray-600">Manage your internet access and plans</p>
      </div>

      {/* Active Session Status */}
      {activeSession ? (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-green-800">Active Session</span>
            </div>
            <button
              onClick={() => onNavigate('active')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              View Details
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Plan:</span>
              <span className="font-medium text-gray-900">{activeSession.data_plans.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Time Left:</span>
              <span className="font-medium text-gray-900">{formatTimeRemaining(activeSession.end_time)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Status:</span>
              <span className="text-green-600 font-medium">Connected</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-3">
              <Wifi className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-orange-800 mb-2">No Active Session</h3>
            <p className="text-orange-700 text-sm mb-4">
              You don't have an active internet plan. Purchase a plan to get connected.
            </p>
            <button
              onClick={() => onNavigate('plans')}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all"
            >
              Browse Plans
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Quick Actions</h3>
        
        <div className="grid gap-3">
          <button
            onClick={() => onNavigate('plans')}
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Browse Plans</div>
                <div className="text-sm text-gray-600">View available data plans</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </button>

          {activeSession && (
            <button
              onClick={() => onNavigate('active')}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Session Details</div>
                  <div className="text-sm text-gray-600">View usage and time remaining</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </button>
          )}

          <button
            onClick={() => onNavigate('profile')}
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Profile Settings</div>
                <div className="text-sm text-gray-600">Manage your account</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Features Highlight */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Why Choose FiberLink?</h3>
        <div className="grid gap-3">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-700">Secure and reliable connection</span>
          </div>
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-700">High-speed fiber internet</span>
          </div>
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-700">Easy M-Pesa payments</span>
          </div>
        </div>
      </div>

      {/* Sign Out Button */}
      <button
        onClick={onSignOut}
        className="w-full flex items-center justify-center gap-2 p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out</span>
      </button>
    </div>
  )
}