import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  try {
    // Check if user exists
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single()

    // Don't reveal if email exists or not
    if (!user) {
      return res.status(200).json({ 
        message: 'If an account with this email exists, a password reset link has been sent.' 
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 3600000).toISOString() // 1 hour

    // Store reset token
    await supabaseAdmin
      .from('password_resets')
      .insert({
        email,
        token: resetToken,
        expires_at: expiresAt,
        used: false
      })

    // In production, send email here
    // For now, return token for testing
    console.log(`Password reset token for ${email}: ${resetToken}`)

    return res.status(200).json({ 
      message: 'If an account with this email exists, a password reset link has been sent.',
      // Remove in production:
      debug_token: resetToken
    })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    return res.status(500).json({ error: 'Failed to process request' })
  }
}
