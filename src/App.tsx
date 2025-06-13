import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import { AuthForm } from './components/AuthForm'
import { HomePage } from './components/HomePage'
import { PlanSelection } from './components/PlanSelection'
import { PaymentForm } from './components/PaymentForm'
import { ActiveSession } from './components/ActiveSession'
import { ProfilePage } from './components/ProfilePage'
import { AdminDashboard } from './components/AdminDashboard'

interface DataPlan {
  id: string
  name: string
  duration_hours: number
  price_ksh: number
  description: string
}

type AppState = 'auth' | 'home' | 'plans' | 'payment' | 'active' | 'profile' | 'admin'

const AppContent: React.FC = () => {
  const { user, loading, signOut } = useAuth()
  const [appState, setAppState] = useState<AppState>('auth')
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null)

  // Check if admin (for demo purposes, check if email contains 'admin')
  const isAdmin = user?.email?.includes('admin') || false

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </Layout>
    )
  }

  // Admin dashboard route
  if (isAdmin && user) {
    return <AdminDashboard />
  }

  // User flow - redirect to home after successful auth
  if (!user || appState === 'auth') {
    return (
      <Layout title="WiFi Access Portal">
        <AuthForm onSuccess={() => setAppState('home')} />
      </Layout>
    )
  }

  if (appState === 'home') {
    return (
      <Layout title="Dashboard">
        <HomePage 
          onNavigate={(page) => setAppState(page)}
          onSignOut={async () => {
            await signOut()
            setAppState('auth')
          }}
        />
      </Layout>
    )
  }

  if (appState === 'plans') {
    return (
      <Layout title="Choose Your Plan">
        <PlanSelection 
          onPlanSelect={(plan) => {
            setSelectedPlan(plan)
            setAppState('payment')
          }}
          onBack={() => setAppState('home')}
        />
      </Layout>
    )
  }

  if (appState === 'payment' && selectedPlan) {
    return (
      <Layout title="Complete Payment">
        <PaymentForm
          plan={selectedPlan}
          onBack={() => setAppState('plans')}
          onPaymentSuccess={() => setAppState('active')}
        />
      </Layout>
    )
  }

  if (appState === 'active') {
    return (
      <Layout title="Connected">
        <ActiveSession 
          onSignOut={async () => {
            await signOut()
            setAppState('auth')
          }}
          onBack={() => setAppState('home')}
        />
      </Layout>
    )
  }

  if (appState === 'profile') {
    return (
      <Layout title="Profile Settings">
        <ProfilePage onBack={() => setAppState('home')} />
      </Layout>
    )
  }

  // Default fallback to home
  return (
    <Layout title="Dashboard">
      <HomePage 
        onNavigate={(page) => setAppState(page)}
        onSignOut={async () => {
          await signOut()
          setAppState('auth')
        }}
      />
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App