import '../styles/production-globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { AuthProvider } from '@/lib/auth'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#061e29" />
        <meta name="format-detection" content="telephone=no" />
      </Head>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Component {...pageProps} />
    </AuthProvider>
  )
}
