import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const token = authHeader.split(' ')[1]
  const payload = verifyToken(token)

  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, is_pro, created_at')
      .eq('id', payload.userId)
      .single()

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.status(200).json(user)
  } catch (error: any) {
    console.error('Get user error:', error)
    return res.status(500).json({ error: 'Failed to get user' })
  }
}
