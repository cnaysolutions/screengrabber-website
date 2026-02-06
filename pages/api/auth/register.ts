import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import { hashPassword, createToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password, name } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    // Check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        is_pro: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    const token = createToken(newUser.id, email)

    return res.status(200).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        is_pro: newUser.is_pro
      }
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    return res.status(500).json({ error: 'Registration failed' })
  }
}
