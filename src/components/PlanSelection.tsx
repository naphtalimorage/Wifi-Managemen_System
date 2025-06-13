import React, { useState, useEffect } from 'react'
import { Clock, Zap, Star, ArrowRight, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface DataPlan {
  id: string
  name: string
  duration_hours: number
  price_ksh: number
  description: string
  is_active: boolean
}

interface PlanSelectionProps {
  onPlanSelect: (plan: DataPlan) => void
  onBack: () => void
}

export const PlanSelection: React.FC<PlanSelectionProps> = ({ onPlanSelect, onBack }) => {
  const [plans, setPlans] = useState<DataPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('data_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_ksh', { ascending: true })

      if (error) throw error
      setPlans(data || [])
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (hours: number) => {
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`
    } else if (hours === 24) {
      return '1 day'
    } else {
      const days = Math.floor(hours / 24)
      return `${days} day${days !== 1 ? 's' : ''}`
    }
  }

  const getPlanIcon = (hours: number) => {
    if (hours <= 2) return <Zap className="w-6 h-6" />
    if (hours <= 24) return <Clock className="w-6 h-6" />
    return <Star className="w-6 h-6" />
  }

  const getPlanColor = (hours: number) => {
    if (hours <= 2) return 'from-orange-500 to-red-500'
    if (hours <= 24) return 'from-blue-500 to-purple-500'
    return 'from-green-500 to-blue-500'
  }

  const handleSelectPlan = (plan: DataPlan) => {
    setSelectedPlan(plan.id)
    onPlanSelect(plan)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
            <p className="text-gray-600">Loading available plans...</p>
          </div>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-20"></div>
        ))}
      </div>
    )
  }

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
          <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
          <p className="text-gray-600">Select the perfect data plan for your needs</p>
        </div>
      </div>

      <div className="space-y-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => handleSelectPlan(plan)}
            className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 ${
              selectedPlan === plan.id
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${getPlanColor(plan.duration_hours)} text-white`}>
                  {getPlanIcon(plan.duration_hours)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-600">{formatDuration(plan.duration_hours)}</p>
                  {plan.description && (
                    <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  KSh {plan.price_ksh}
                </div>
                {selectedPlan === plan.id && (
                  <div className="flex items-center gap-1 text-blue-600 text-sm font-medium mt-1">
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
            
            {plan.duration_hours >= 168 && ( // 7 days or more
              <div className="absolute -top-2 -right-2">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Popular
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">No plans available</div>
          <div className="text-sm text-gray-400">Please try again later</div>
        </div>
      )}
    </div>
  )
}