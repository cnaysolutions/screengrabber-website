import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import { hashPassword } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { token, new_password } = req.body

  if (!token || !new_password) {
    return res.status(400).json({ error: 'Token and new password are required' })
  }

  try {
    // Find valid reset token
    const { data: resetRecord, error: resetError } = await supabaseAdmin
      .from('password_resets')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single()

    if (resetError || !resetRecord) {
      return res.status(400).json({ error: 'Invalid or expired reset token' })
    }

    // Check if token expired
    if (new Date(resetRecord.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Reset token has expired' })
    }

    // Hash new password and update user
    const hashedPassword = await hashPassword(new_password)
    
    await supabaseAdmin
      .from('users')
      .update({ password: hashedPassword })
      .eq('email', resetRecord.email)

    // Mark token as used
    await supabaseAdmin
      .from('password_resets')
      .update({ used: true })
      .eq('token', token)

    return res.status(200).json({ message: 'Password reset successfully' })
  } catch (error: any) {
    console.error('Reset password error:', error)
    return res.status(500).json({ error: 'Failed to reset password' })
  }
}
