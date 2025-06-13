import React, { useState } from 'react'
import { CreditCard, Smartphone, ArrowLeft, CheckCircle } from 'lucide-react'

interface DataPlan {
  id: string
  name: string
  duration_hours: number
  price_ksh: number
  description: string
}

interface PaymentFormProps {
  plan: DataPlan
  onBack: () => void
  onPaymentSuccess: () => void
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ plan, onBack, onPaymentSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'input' | 'processing' | 'success'>('input')

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate phone number
    const cleanPhone = phoneNumber.replace(/\s/g, '')
    const phoneRegex = /^254[0-9]{9}$/
    
    if (!phoneRegex.test(cleanPhone)) {
      alert('Please enter a valid M-Pesa number (254XXXXXXXXX)')
      return
    }

    setLoading(true)
    setPaymentStep('processing')

    try {
      // Simulate M-Pesa STK Push
      // In production, this would call your backend API
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      setPaymentStep('success')
      setTimeout(() => {
        onPaymentSuccess()
      }, 2000)
    } catch (error) {
      console.error('Payment error:', error)
      setPaymentStep('input')
      alert('Payment failed. Please try again.')
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

  if (paymentStep === 'processing') {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
          <Smartphone className="w-8 h-8 text-white" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
          <p className="text-gray-600 mb-4">
            Please check your phone for the M-Pesa prompt
          </p>
          <div className="text-sm text-gray-500">
            Enter your M-Pesa PIN to complete the payment
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-800">
            <div className="font-medium">Payment Details:</div>
            <div>Amount: KSh {plan.price_ksh}</div>
            <div>Plan: {plan.name}</div>
            <div>Duration: {formatDuration(plan.duration_hours)}</div>
          </div>
        </div>
      </div>
    )
  }

  if (paymentStep === 'success') {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600">
            Your internet access has been activated
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-800">
            <div className="font-medium mb-2">Access Details:</div>
            <div>Plan: {plan.name}</div>
            <div>Duration: {formatDuration(plan.duration_hours)}</div>
            <div>Valid until: {new Date(Date.now() + plan.duration_hours * 60 * 60 * 1000).toLocaleString()}</div>
          </div>
        </div>
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
          <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
          <p className="text-gray-600">Pay with M-Pesa to activate your plan</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{plan.name}</h3>
            <p className="text-sm text-gray-600">{formatDuration(plan.duration_hours)}</p>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            KSh {plan.price_ksh}
          </div>
        </div>
      </div>

      <form onSubmit={handlePayment} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            M-Pesa Phone Number
          </label>
          <div className="relative">
            <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="254XXXXXXXXX"
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Enter your M-Pesa registered phone number
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <CreditCard className="w-5 h-5" />
            <div className="text-sm">
              <div className="font-medium">Payment Process:</div>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>You'll receive an M-Pesa prompt on your phone</li>
                <li>Enter your M-Pesa PIN to confirm payment</li>
                <li>Internet access will be activated immediately</li>
              </ol>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : `Pay KSh ${plan.price_ksh}`}
        </button>
      </form>

      <div className="text-center text-xs text-gray-500">
        <p>Secure payment powered by M-Pesa</p>
        <p>Your payment information is encrypted and secure</p>
      </div>
    </div>
  )
}