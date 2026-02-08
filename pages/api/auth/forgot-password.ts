import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'
import { Resend } from 'resend'

function getBaseUrl(req: NextApiRequest) {
  // Prefer explicit public site URL
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (envUrl) return envUrl.replace(/\/$/, '')

  // Vercel provides a hostname without protocol
  const vercelUrl = process.env.VERCEL_URL?.trim()
  if (vercelUrl) return `https://${vercelUrl}`

  // Fallback to request origin/host
  const origin = (req.headers.origin as string | undefined)?.trim()
  if (origin) return origin.replace(/\/$/, '')

  const host = (req.headers.host as string | undefined)?.trim()
  if (host) return `https://${host}`

  return 'http://localhost:3000'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body as { email?: string }

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  try {
    // Always respond with same message (no user enumeration)
    const genericOk = {
      message: 'If an account with this email exists, a password reset link has been sent.',
    }

    // Check if user exists
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single()

    if (!user) {
      return res.status(200).json(genericOk)
    }

    const baseUrl = getBaseUrl(req)

    // Generate reset token (1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    // Optionally invalidate previous unused tokens for that email
    await supabaseAdmin
      .from('password_resets')
      .update({ used: true })
      .eq('email', email)
      .eq('used', false)

    // Store reset token
    const { error: insertError } = await supabaseAdmin.from('password_resets').insert({
      email,
      token: resetToken,
      expires_at: expiresAt,
      used: false,
    })

    if (insertError) {
      console.error('Failed to insert password reset token:', insertError)
      return res.status(200).json(genericOk)
    }

    const resetUrl = `${baseUrl}/?reset=${resetToken}`

    // ---- SEND EMAIL WITH RESEND ----
    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      console.error('RESEND_API_KEY is missing in environment variables')
      // Still return generic message (don’t leak internal config)
      // In non-prod we also return reset_url so you can test quickly
      return res.status(200).json({
        ...genericOk,
        ...(process.env.NODE_ENV !== 'production' ? { reset_url: resetUrl } : {}),
      })
    }

    const resend = new Resend(resendKey)

    const fromEmail = process.env.EMAIL_FROM?.trim() || 'contacts@scrollframe.tech'
    const fromName = process.env.EMAIL_FROM_NAME?.trim() || 'Scrollframe'
    const from = `${fromName} <${fromEmail}>`

    const subject = 'Reset your Scrollframe password'
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin: 0 0 12px;">Reset your password</h2>
        <p style="margin: 0 0 12px;">
          We received a request to reset your password. Click the button below to set a new one.
        </p>
        <p style="margin: 18px 0;">
          <a href="${resetUrl}"
             style="display:inline-block;padding:12px 16px;background:#f97316;color:#fff;text-decoration:none;border-radius:8px;">
            Reset Password
          </a>
        </p>
        <p style="margin: 0 0 12px; color: #666;">
          This link expires in 1 hour. If you didn’t request this, you can ignore this email.
        </p>
        <p style="margin: 0; color: #999; font-size: 12px;">
          Or copy/paste this URL into your browser:<br/>
          <span style="word-break: break-all;">${resetUrl}</span>
        </p>
      </div>
    `

    const sendResult = await resend.emails.send({
      from,
      to: email,
      subject,
      html,
    })

    // If Resend errors, log it but still return generic ok
    if ((sendResult as any)?.error) {
      console.error('Resend send error:', (sendResult as any).error)
    }

    // In dev only, return the reset_url to help you test fast
    return res.status(200).json({
      ...genericOk,
      ...(process.env.NODE_ENV !== 'production' ? { reset_url: resetUrl } : {}),
    })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    return res.status(500).json({ error: 'Failed to process request' })
  }
}
