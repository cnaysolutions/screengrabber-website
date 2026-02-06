'use client'

import React, { useState } from 'react'
import Head from 'next/head'
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
  const { user } = useAuth()

  const openAuth = (mode: 'login' | 'register' | 'forgot' | 'reset' = 'login') => {
    setAuthMode(mode)
    setShowAuthModal(true)
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
                  href="#download"
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
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 bg-white relative">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-transparent"></div>
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center mb-16 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-semibold mb-4">
                <CheckCircle className="w-4 h-4" />
                <span>Latest Version v2.3.0</span>
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-4">What&apos;s Been Fixed</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We listened to your feedback and fixed the major issues
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                  <MousePointerClick className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Frames Always Visible</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Fixed the bug where captured frames weren&apos;t showing in the sidebar. Now every frame appears instantly as you scroll—no more empty sidebar!
                </p>
                <div className="mt-6 flex items-center gap-2 text-green-600 font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  <span>Fixed in v2.2.0</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                  <Copy className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Clear All Works</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  The &quot;Clear All&quot; button now properly removes all frames when starting a new capture session. Fresh start every time!
                </p>
                <div className="mt-6 flex items-center gap-2 text-green-600 font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  <span>Fixed in v2.2.0</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-6 bg-white relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-orange-600 text-sm font-semibold mb-4">
                <Zap className="w-4 h-4" />
                <span>Limited Time Offer</span>
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-4">Upgrade to Pro</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Get unlimited frames and support the development of ScreenGrabber
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900">€0</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {['10 frames per session', 'Basic annotations', 'Copy individual frames'].map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#download"
                  className="block w-full text-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-colors"
                >
                  Download Free
                </a>
              </div>

              {/* Pro Plan */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 shadow-2xl border-2 border-orange-400 relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-white text-orange-600 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Until March 31
                </div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Pro - Lifetime</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white">€19.99</span>
                    <span className="text-xl text-orange-100 line-through">€39.99</span>
                  </div>
                  <p className="text-orange-100 text-sm mt-2">Early Bird Special - Save €20.00!</p>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    { text: 'Unlimited frames', bold: true },
                    { text: 'Advanced annotations', bold: false },
                    { text: 'Copy all frames at once', bold: false },
                    { text: 'Lifetime updates', bold: false },
                    { text: 'Priority support', bold: false },
                  ].map((feature) => (
                    <li key={feature.text} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                      <span className={`text-white ${feature.bold ? 'font-semibold' : ''}`}>{feature.text}</span>
                    </li>
                  ))}
                </ul>
                {user ? (
                  <div className="text-center">
                    <p className="text-white mb-2">Signed in as:</p>
                    <p className="text-orange-100 font-semibold mb-4" data-testid="pricing-user-email">{user.email}</p>
                    <button
                      className="w-full bg-white hover:bg-gray-100 text-orange-600 font-bold py-4 text-lg rounded-xl shadow-lg transition-all"
                      data-testid="upgrade-pro-btn"
                    >
                      Upgrade to Pro
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => openAuth('login')}
                    className="w-full bg-white hover:bg-gray-100 text-orange-600 font-bold py-4 text-lg rounded-xl shadow-lg transition-all"
                    data-testid="pricing-sign-in-btn"
                  >
                    Sign In to Upgrade
                  </button>
                )}
                <p className="text-center text-orange-100 text-sm mt-4">Price increases to €39.99 on April 1, 2026</p>
              </div>
            </div>
          </div>
        </section>

        {/* Download Section */}
        <section id="download" className="py-24 px-6 bg-gradient-to-b from-white to-orange-50/50">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
                <p className="text-xl text-gray-600">
                  Download ScreenGrabber v2.3.0 and start capturing scrolling screenshots
                </p>
              </div>
              <div className="flex justify-center mb-8">
                <a
                  href="/screengrabber-extension-v2.3.0.zip"
                  download="screengrabber-extension-v2.3.0.zip"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  data-testid="download-extension-btn"
                >
                  <Download className="w-6 h-6" />
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
        />
      </div>
    </>
  )
}
