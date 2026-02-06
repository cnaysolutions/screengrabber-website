// ============================================
// FILE: client/src/components/PricingSection.tsx
// This is the updated pricing section with auth integration
// Copy this to your Manus project and update your Home.tsx
// ============================================

import React from 'react';
import { CheckCircle, Zap, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';

// Manus OAuth Login URL
const MANUS_LOGIN_URL = '/api/auth/login';

export const PricingSection: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { data: priceData } = trpc.payment.getCurrentPrice.useQuery();
  const createCheckout = trpc.payment.createCheckout.useMutation();
  const { data: licenses } = trpc.license.myLicenses.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const hasActiveLicense = licenses?.some(l => l.status === 'active');
  const priceDisplay = priceData ? `€${(priceData.priceCents / 100).toFixed(2)}` : '€19.99';
  const originalPrice = priceData?.isEarlyBird ? '€39.99' : null;

  const handleUpgrade = async () => {
    try {
      const result = await createCheckout.mutateAsync();
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  return (
    <section id="pricing" className="py-24 px-6 bg-white relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
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
            {priceData?.isEarlyBird && (
              <div className="absolute top-4 right-4 bg-white text-orange-600 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Early Bird
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Pro - Lifetime</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">{priceDisplay}</span>
                {originalPrice && (
                  <span className="text-xl text-orange-100 line-through">{originalPrice}</span>
                )}
              </div>
              {priceData?.isEarlyBird && (
                <p className="text-orange-100 text-sm mt-2">Early Bird Special - Save €20.00!</p>
              )}
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
                  <span className={`text-white ${feature.bold ? 'font-semibold' : ''}`}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            {hasActiveLicense ? (
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur rounded-xl p-4 mb-4">
                  <p className="text-white font-semibold">✨ You have Pro!</p>
                  <p className="text-orange-100 text-sm">Enjoy unlimited frames</p>
                </div>
              </div>
            ) : isAuthenticated && user ? (
              <div className="text-center">
                <p className="text-white mb-2">Signed in as:</p>
                <p className="text-orange-100 font-semibold mb-4" data-testid="pricing-user-email">
                  {user.email || user.name}
                </p>
                <button
                  onClick={handleUpgrade}
                  disabled={createCheckout.isPending}
                  className="w-full bg-white hover:bg-gray-100 text-orange-600 font-bold py-4 text-lg rounded-xl shadow-lg transition-all disabled:opacity-50"
                  data-testid="upgrade-pro-btn"
                >
                  {createCheckout.isPending ? 'Loading...' : 'Upgrade to Pro'}
                </button>
              </div>
            ) : (
              <a
                href={MANUS_LOGIN_URL}
                className="block w-full text-center bg-white hover:bg-gray-100 text-orange-600 font-bold py-4 text-lg rounded-xl shadow-lg transition-all"
                data-testid="pricing-sign-in-btn"
              >
                Sign In to Upgrade
              </a>
            )}
            
            {priceData?.isEarlyBird && (
              <p className="text-center text-orange-100 text-sm mt-4">
                Price increases to €39.99 after early bird period
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
