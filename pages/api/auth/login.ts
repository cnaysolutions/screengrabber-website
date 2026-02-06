import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyPassword, createToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    // Find user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = createToken(user.id, email)

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_pro: user.is_pro
      }
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Login failed' })
  }
}
