import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { session_id } = req.query

  if (!session_id || typeof session_id !== 'string') {
    return res.status(400).json({ error: 'Session ID required' })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id)

    if (session.payment_status === 'paid') {
      // Generate license key
      const licenseKey = `SCROLLFRAME-PRO-${crypto.randomBytes(8).toString('hex').toUpperCase()}`

      // Store in database
      await supabaseAdmin.from('licenses').insert({
        key: licenseKey,
        active: true,
        stripe_payment_id: session.payment_intent as string,
        purchase_price: session.amount_total,
        currency: session.currency?.toUpperCase() || 'EUR',
      })

      return res.status(200).json({
        success: true,
        licenseKey,
        email: session.customer_email,
      })
    }

    return res.status(400).json({ error: 'Payment not completed' })
  } catch (error: any) {
    console.error('Verify session error:', error)
    return res.status(500).json({ error: error.message || 'Failed to verify session' })
  }
}
