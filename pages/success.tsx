'use client'

import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { CheckCircle, Copy, ArrowLeft } from 'lucide-react'

export default function Success() {
  const router = useRouter()
  const { session_id } = router.query
  const [licenseKey, setLicenseKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (session_id) {
      verifyPayment()
    }
  }, [session_id])

  const verifyPayment = async () => {
    try {
      const res = await fetch(`/api/stripe/verify-session?session_id=${session_id}`)
      const data = await res.json()

      if (data.success) {
        setLicenseKey(data.licenseKey)
      } else {
        setError(data.error || 'Failed to verify payment')
      }
    } catch (err) {
      setError('Failed to verify payment')
    } finally {
      setLoading(false)
    }
  }

  const copyLicenseKey = () => {
    if (licenseKey) {
      navigator.clipboard.writeText(licenseKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <>
      <Head>
        <title>Payment Successful - ScrollFrame Pro</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-white flex items-center justify-center px-6">
        <div className="max-w-lg w-full">
          {loading ? (
            <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
              <div className="animate-spin w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment...</h2>
              <p className="text-gray-600">Please wait while we confirm your purchase.</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">❌</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Something Went Wrong</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </a>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful! 🎉</h2>
              <p className="text-gray-600 mb-8">
                Thank you for purchasing ScrollFrame Pro! Here&apos;s your license key:
              </p>

              <div className="bg-gray-100 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">Your License Key:</p>
                <div className="flex items-center justify-center gap-3">
                  <code className="text-lg font-mono font-bold text-orange-600 bg-white px-4 py-2 rounded-lg">
                    {licenseKey}
                  </code>
                  <button
                    onClick={copyLicenseKey}
                    className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
                {copied && (
                  <p className="text-green-600 text-sm mt-2">✓ Copied to clipboard!</p>
                )}
              </div>

              <div className="bg-orange-50 rounded-xl p-6 text-left mb-8">
                <h3 className="font-bold text-gray-900 mb-3">How to Activate:</h3>
                <ol className="space-y-2 text-sm text-gray-700">
                  <li>1. Open the ScrollFrame extension in Chrome</li>
                  <li>2. Click on &quot;Activate Pro&quot; or go to Settings</li>
                  <li>3. Paste your license key</li>
                  <li>4. Enjoy unlimited frames! 🚀</li>
                </ol>
              </div>

              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </a>

              <p className="text-gray-500 text-sm mt-6">
                A copy of your license key has also been sent to your email.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
