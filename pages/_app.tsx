import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Link from 'next/link'
import { AuthProvider } from '@/contexts/AuthContext'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />

      <footer
        style={{
          marginTop: 64,
          padding: '24px 16px',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center',
          fontSize: 14,
          color: '#6b7280',
        }}
      >
        <p style={{ margin: 0 }}>
          © {new Date().getFullYear()} Scrollframe ·{' '}
          <Link href="/privacy" style={{ textDecoration: 'underline' }}>
            Privacy Policy
          </Link>
        </p>
      </footer>
    </AuthProvider>
  )
}
