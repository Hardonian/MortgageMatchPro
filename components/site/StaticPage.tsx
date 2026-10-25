import Head from 'next/head'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRight, Home } from 'lucide-react'
import styles from './StaticPage.module.css'

export const SITE_URL = 'https://mortgagematch.pro'
export const SUPPORT_EMAIL = 'support@mortgagematch.pro'

const links = [
  { href: '/guide', label: 'Guide' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/security', label: 'Security' },
  { href: '/contact', label: 'Contact' },
]

const footerLinks = [
  ...links,
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/disclosures', label: 'Disclosures' },
]

type Props = {
  path: string
  title: string
  description: string
  overline: string
  heading: string
  lead?: string
  updated?: string
  jsonLd?: Record<string, unknown>
  hideCta?: boolean
  children: ReactNode
}

export default function StaticPage({ path, title, description, overline, heading, lead, updated, jsonLd, hideCta, children }: Props) {
  const fullTitle = title.includes('MortgageMatch') ? title : `${title} | MortgageMatch Pro`
  const graph: Record<string, unknown>[] = [
    { '@type': 'Organization', '@id': `${SITE_URL}/#org`, name: 'MortgageMatch Pro', url: SITE_URL, logo: `${SITE_URL}/icon.svg`, email: SUPPORT_EMAIL },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: heading, item: `${SITE_URL}${path}` },
      ],
    },
    { '@type': 'WebPage', url: `${SITE_URL}${path}`, name: fullTitle, description, isPartOf: { '@id': `${SITE_URL}/#org` } },
  ]
  if (jsonLd) graph.push(jsonLd)
  return (
    <>
      <Head>
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }) }} />
        <link rel="canonical" href={`${SITE_URL}${path}`} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}${path}`} />
      </Head>
      <div className={styles.shell}>
        <header className={styles.nav}>
          <Link href="/" className={styles.brand} aria-label="MortgageMatch home">
            <span className={styles.brandMark}><Home size={18} strokeWidth={2.7} /></span>
            <span>Mortgage<b>Match</b></span>
          </Link>
          <nav className={styles.navLinks} aria-label="Primary">
            {links.map((l) => (
              <Link key={l.href} href={l.href} aria-current={l.href === path ? 'page' : undefined}>{l.label}</Link>
            ))}
          </nav>
        </header>
        <main id="main-content" className={styles.main}>
          <p className={styles.overline}>{overline}</p>
          <h1 className={styles.title}>{heading}</h1>
          {lead && <p className={styles.lead}>{lead}</p>}
          {updated && <p className={styles.updated}>Last updated {updated}</p>}
          {children}
          {!hideCta && (
            <section className={styles.band} aria-labelledby="cta-title">
              <h2 id="cta-title">See what you can afford in 60 seconds</h2>
              <p>Free, private, and no sign-up required. Get your payment, GDS/TDS ratios, and stress-test result instantly.</p>
              <Link href="/" className={styles.ctaLight}>Try the free calculator <ArrowRight size={18} /></Link>
            </section>
          )}
        </main>
        <footer className={styles.footer}>
          <nav aria-label="Footer">
            {footerLinks.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
          </nav>
          <p>
            © {new Date().getFullYear()} MortgageMatch Pro. Calculations are estimates for planning purposes only and are not a
            mortgage offer, pre-approval, or financial advice.
          </p>
        </footer>
      </div>
    </>
  )
}

export const ui = styles
