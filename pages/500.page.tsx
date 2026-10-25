import Head from 'next/head'
import Link from 'next/link'
import { Home, AlertCircle, RefreshCw } from 'lucide-react'
import styles from '../styles/client-experience.module.css'

export default function Custom500() {
  return (
    <>
      <Head>
        <title>500 — Server Error | MortgageMatch Pro</title>
        <meta name="description" content="An unexpected server error occurred." />
        <meta name="theme-color" content="#061e29" />
      </Head>

      <main id="main-content" className={styles.shell}>
        <header className={styles.header}>
          <Link href="/" className={styles.brand} aria-label="MortgageMatch home">
            <span className={styles.brandMark}><Home size={18} strokeWidth={2.7} /></span>
            <span>Mortgage<span>Match</span></span>
          </Link>
        </header>

        <section className={styles.workspace} style={{ maxWidth: 640, margin: '60px auto', padding: '48px 32px', textAlign: 'center' }}>
          <div className={styles.emptyIcon} style={{ width: 64, height: 64, borderRadius: 20, color: '#b91c1c', background: '#fee2e2' }}>
            <AlertCircle size={32} />
          </div>
          <p className={styles.overline} style={{ marginTop: 16, color: '#b91c1c' }}>Error 500</p>
          <h1 style={{ fontSize: 'clamp(28px, 6vw, 38px)', letterSpacing: '-0.05em', margin: '8px 0 16px', color: 'var(--ink)' }}>
            Something went wrong on our side.
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 16, lineHeight: 1.6, maxWidth: 440, margin: '0 auto 28px' }}>
            Our team has been automatically alerted. Please refresh or try again in a few moments.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => {
                if (typeof window !== 'undefined') window.location.reload()
              }}
              style={{ minWidth: 160 }}
            >
              <RefreshCw size={17} /> Try again
            </button>
            <Link href="/" className={styles.primaryButton} style={{ textDecoration: 'none', minWidth: 160, margin: 0, display: 'inline-flex' }}>
              Return to Planner
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
