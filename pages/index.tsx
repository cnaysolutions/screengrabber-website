'use client'

import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Download,
  Play,
  Sparkles,
  CheckCircle,
  MousePointerClick,
  Copy,
  Zap,
  Clock,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from '@/components/AuthModal'
import { UserMenu } from '@/components/UserMenu'

export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login')
  const [resetToken, setResetToken] = useState('')
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const openAuth = (mode: 'login' | 'register' | 'forgot' | 'reset' = 'login') => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  useEffect(() => {
    if (!router.isReady) return
    const token = typeof router.query.reset === 'string' ? router.query.reset : ''
    if (token) {
      setResetToken(token)
      openAuth('reset')
    }
  }, [router.isReady, router.query.reset])

  const handleCheckout = async (email?: string) => {
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email || '' }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Error: ' + (data.error || 'Could not create checkout session'))
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to connect to payment system. Please try again.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>ScreenGrabber - Chrome Extension</title>
        <meta name="description" content="Capture scrolling screenshots automatically. Select a region, scroll, and copy frames with annotations to AI chats." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-white">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 32 32" fill="none">
                  <rect x="4" y="4" width="24" height="24" rx="4" fill="currentColor" fillOpacity="0.3" />
                  <path d="M12 16L16 20L24 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">ScreenGrabber</span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#how-to-use" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">How to Use</a>
              <a href="#features" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">Pricing</a>
              <a href="#download" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">Download</a>
            </nav>

            <UserMenu onLoginClick={() => openAuth('login')} />
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 py-20 pt-32">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-orange-600 text-sm font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Now v2.3.0 - With Pro Support</span>
              </div>
              <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Capture Any Website
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                  Frame by Frame
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                Browse Airbnb, scroll through listings, and ScreenGrabber captures every frame automatically. Manage all screenshots in the sidebar—copy individually or all at once with annotations.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://github.com/cnaysolutions/screengrabber-website/raw/main/public/screengrabber-extension-v2.3.0.zip"
                  download="screengrabber-extension-v2.3.0.zip"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  data-testid="hero-download-btn"
                >
                  <Download className="w-5 h-5" />
                  Download Extension
                </a>
                <a
                  href="#how-to-use"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Play className="w-5 h-5" />
                  Watch Demo
                </a>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-gray-900">v2.3.0</div>
                  <div className="text-sm text-gray-600">Latest Version</div>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">Free</div>
                  <div className="text-sm text-gray-600">Open Source</div>
                </div>
              </div>
            </div>
            <div className="relative animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-4">
                <div className="bg-gray-100 rounded-t-lg px-4 py-2 flex items-center gap-2 mb-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-600">airbnb.com</div>
                </div>
                <div className="relative bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center">
                    <MousePointerClick className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                    <p className="text-orange-700 font-medium">Capture Scrolling Screenshots</p>
                  </div>
                </div>
                <div className="absolute right-2 top-16 bottom-2 w-48 bg-white/95 backdrop-blur rounded-lg shadow-xl p-3 border border-orange-200">
                  <div className="text-xs font-semibold text-gray-900 mb-2">Captured Frames</div>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-orange-50 rounded p-2 border border-orange-200">
                        <div className="text-xs font-medium text-gray-700">Frame {i}</div>
                        <div className="text-xs text-gray-500 mt-1">Ready to copy</div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-3 bg-orange-500 text-white text-xs font-semibold py-2 rounded hover:bg-orange-600 transition-colors">
                    Copy All
                  </button>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6 animate-float">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Works on Any Site</div>
                    <div className="text-xs text-gray-600">Airbnb, Gmail, WhatsApp...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How to Use Section */}
        <section id="how-to-use" className="py-24 px-6 bg-gradient-to-b from-white to-orange-50/30 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-orange-600 text-sm font-semibold mb-4">
                <Play className="w-4 h-4" />
                <span>See It In Action</span>
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-4">How to Use ScreenGrabber</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Watch how easy it is to capture scrolling screenshots on any website
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              {[
                { num: 1, title: 'Select Region', desc: 'Draw a box around the area you want to capture' },
                { num: 2, title: 'Scroll & Capture', desc: 'Scroll through content—frames appear automatically' },
                { num: 3, title: 'Copy & Share', desc: 'Add annotations and copy all frames at once' },
              ].map((step) => (
                <div key={step.num} className="bg-white rounded-xl p-6 shadow-lg text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold text-orange-600">
                    {step.num}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-orange-600 text-sm font-semibold mb-4">
                <Zap className="w-4 h-4" />
                <span>Powerful Features</span>
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-4">Everything You Need</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Built for productivity and seamless workflow integration
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Copy,
                  title: 'Bulk Copy',
                  desc: 'Copy all frames with annotations in one click',
                },
                {
                  icon: MousePointerClick,
                  title: 'Smart Selection',
                  desc: 'Select any region of any website to capture',
                },
                {
                  icon: Clock,
                  title: 'Auto Capture',
                  desc: 'Automatically captures frames as you scroll',
                },
              ].map((feature, i) => (
                <div key={i} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                  <feature.icon className="w-12 h-12 text-orange-500 mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-6 bg-gradient-to-b from-white to-orange-50/30">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-orange-600 text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Pricing</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
              Simple pricing for everyone — upgrade anytime
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <p className="text-gray-600 mb-6">Great for trying out</p>
                <div className="text-5xl font-bold text-gray-900 mb-6">$0</div>
                <ul className="text-left space-y-3 text-gray-600">
                  <li>✅ 5 frames per day</li>
                  <li>✅ Basic annotations</li>
                  <li>✅ Standard support</li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-orange-500 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                <p className="text-gray-600 mb-6">Unlimited power</p>
                <div className="text-5xl font-bold text-gray-900 mb-6">$9/mo</div>
                <ul className="text-left space-y-3 text-gray-600 mb-6">
                  <li>✅ Unlimited frames</li>
                  <li>✅ Advanced annotations</li>
                  <li>✅ Priority support</li>
                </ul>
                <button
                  onClick={() => handleCheckout(user?.email)}
                  disabled={checkoutLoading}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  {checkoutLoading ? 'Processing...' : 'Upgrade to Pro'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Download Section */}
        <section id="download" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold text-gray-900 mb-4">Download Extension</h2>
              <p className="text-xl text-gray-600">
                Install ScreenGrabber in minutes
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <p className="text-gray-700 text-lg">
                  Click the button below to download the latest version of the Chrome extension.
                </p>
                <a
                  href="https://github.com/cnaysolutions/screengrabber-website/raw/main/public/screengrabber-extension-v2.3.0.zip"
                  download="screengrabber-extension-v2.3.0.zip"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Download className="w-5 h-5" />
                  Download Extension v2.3.0
                </a>
              </div>
              <div className="bg-orange-50 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Installation Guide</h3>
                <div className="space-y-4">
                  {[
                    'Download the extension ZIP file above',
                    'Unzip the file to a folder on your computer',
                    'Open Chrome and go to chrome://extensions/',
                    'Enable "Developer mode" (toggle in top-right)',
                    'Click "Load unpacked" button',
                    'Select the unzipped folder and click "Select Folder"',
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {i + 1}
                      </div>
                      <p className="text-gray-700 pt-1">{step}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-white rounded-lg border border-orange-200">
                  <p className="text-sm text-gray-600">
                    <strong className="text-gray-900">Note:</strong> This is an unpacked Chrome extension. Make sure to keep the folder in a permanent location after installation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 bg-gray-900 text-gray-400">
          <div className="max-w-7xl mx-auto text-center">
            <p>© 2024 ScreenGrabber. All rights reserved.</p>
          </div>
        </footer>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
          initialResetToken={resetToken}
        />
      </div>
    </>
  )
}
