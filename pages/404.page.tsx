import Head from 'next/head'
import Link from 'next/link'
import { Home, Compass, ArrowLeft } from 'lucide-react'
import styles from '../styles/client-experience.module.css'

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 — Page Not Found | MortgageMatch Pro</title>
        <meta name="description" content="The page you are looking for does not exist." />
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
          <div className={styles.emptyIcon} style={{ width: 64, height: 64, borderRadius: 20 }}>
            <Compass size={32} />
          </div>
          <p className={styles.overline} style={{ marginTop: 16 }}>Error 404</p>
          <h1 style={{ fontSize: 'clamp(28px, 6vw, 38px)', letterSpacing: '-0.05em', margin: '8px 0 16px', color: 'var(--ink)' }}>
            We couldn’t find that page.
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 16, lineHeight: 1.6, maxWidth: 440, margin: '0 auto 28px' }}>
            The link you followed may be broken or the page may have been moved. Let’s get you back to your mortgage plan.
          </p>
          <Link href="/" className={styles.primaryButton} style={{ textDecoration: 'none', maxWidth: 280, margin: '0 auto', display: 'inline-flex' }}>
            <ArrowLeft size={18} /> Return to Planner
          </Link>
        </section>
      </main>
    </>
  )
}
