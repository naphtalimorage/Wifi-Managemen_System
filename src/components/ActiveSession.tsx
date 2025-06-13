import React, { useState, useEffect } from 'react'
import { Clock, Wifi, LogOut, RefreshCw, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface ActiveSessionProps {
  onSignOut: () => void
  onBack: () => void
}

export const ActiveSession: React.FC<ActiveSessionProps> = ({ onSignOut, onBack }) => {
  const { user } = useAuth()
  const [timeRemaining, setTimeRemaining] = useState(3600) // 1 hour in seconds
  const [dataUsed, setDataUsed] = useState(245) // MB used

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    return `${minutes}m ${secs}s`
  }

  const getProgressColor = () => {
    const percentage = (timeRemaining / 3600) * 100
    if (percentage > 50) return 'bg-green-500'
    if (percentage > 20) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const progressPercentage = Math.max(0, (timeRemaining / 3600) * 100)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Active Session</h2>
          <p className="text-gray-600">Monitor your internet usage</p>
        </div>
      </div>

      <div className="text-center">
        <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
          <Wifi className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">You're Connected!</h3>
        <p className="text-gray-600">Welcome back, {user?.full_name}</p>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {formatTime(timeRemaining)}
          </div>
          <div className="text-sm text-gray-600">Time Remaining</div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className={`h-3 rounded-full transition-all duration-1000 ${getProgressColor()}`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-white/50 rounded-lg p-3">
            <div className="text-lg font-semibold text-gray-900">{dataUsed} MB</div>
            <div className="text-xs text-gray-600">Data Used</div>
          </div>
          <div className="bg-white/50 rounded-lg p-3">
            <div className="text-lg font-semibold text-gray-900">Unlimited</div>
            <div className="text-xs text-gray-600">Speed</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">Session Status</div>
              <div className="text-sm text-gray-600">Active - Premium Plan</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Online</span>
          </div>
        </div>

        <button
          onClick={() => setDataUsed(prev => prev + Math.floor(Math.random() * 50))}
          className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Stats</span>
        </button>
      </div>

      {timeRemaining <= 300 && ( // 5 minutes warning
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-yellow-800 text-sm">
            <div className="font-medium">Session ending soon!</div>
            <div>Your internet access will expire in {formatTime(timeRemaining)}. Consider purchasing a new plan to continue browsing.</div>
          </div>
        </div>
      )}

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