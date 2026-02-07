import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers for Chrome extension
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { licenseKey } = req.body

  if (!licenseKey) {
    return res.status(400).json({ error: 'License key is required' })
  }

  try {
    const { data: license, error } = await supabaseAdmin
      .from('licenses')
      .select('*')
      .eq('key', licenseKey)
      .eq('active', true)
      .single()

    console.log('License lookup for:', licenseKey, 'Result:', license, 'Error:', error)

    if (error || !license) {
      return res.status(200).json({ 
        result: { data: { valid: false, message: 'Invalid or expired license key' } }
      })
    }

    return res.status(200).json({ 
      result: { data: { valid: true, message: 'License activated successfully' } }
    })
  } catch (error: any) {
    console.error('License validation error:', error)
    return res.status(200).json({ 
      result: { data: { valid: false, message: 'Validation error occurred' } }
    })
  }
}
