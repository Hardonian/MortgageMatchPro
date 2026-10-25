import Link from 'next/link'
import { Calculator, ShieldCheck, Scale, ArrowRight } from 'lucide-react'
import StaticPage, { ui } from '../components/site/StaticPage'

export default function About() {
  return (
    <StaticPage
      path="/about"
      title="About MortgageMatch Pro | Free Canadian Mortgage Affordability Planner"
      description="MortgageMatch Pro is a free, private mortgage affordability planner for Canadian homebuyers. See your payment, GDS/TDS ratios and stress-test result before you talk to a lender."
      overline="About us"
      heading="Know what you can afford before you talk to a lender."
      lead="MortgageMatch Pro turns your income, debts and down payment into a plain-language view of your mortgage affordability, with every assumption shown."
    >
      <ul className={ui.trust}>
        <li>Free to use</li>
        <li>No sign-up needed</li>
        <li>Assumptions always shown</li>
        <li>We never sell your data</li>
      </ul>
      <section className={ui.card} style={{ marginTop: 24 }}>
        <h2>Why we built it</h2>
        <p>
          Buying a home is likely the biggest financial decision you will make, yet most online calculators hide how they reach
          their answer. We built MortgageMatch Pro so first-time buyers, upgraders and renewers can understand the numbers first:
          monthly payment, gross debt service (GDS), total debt service (TDS) and the stress-test qualifying rate lenders apply.
        </p>
        <p>You get a realistic budget in about a minute, so you can walk into a conversation with a lender or broker prepared.</p>
      </section>
      <div className={ui.grid}>
        <section className={ui.card}>
          <span className={ui.icon}><Calculator size={20} /></span>
          <h2>Transparent math</h2>
          <p>See payments, GDS and TDS ratios and the qualifying rate used. Nothing is a black box.</p>
        </section>
        <section className={ui.card}>
          <span className={ui.icon}><ShieldCheck size={20} /></span>
          <h2>Privacy first</h2>
          <p>Saved plans stay in your browser. Read our <Link href="/privacy">privacy policy</Link> and <Link href="/security">security practices</Link>.</p>
        </section>
        <section className={ui.card}>
          <span className={ui.icon}><Scale size={20} /></span>
          <h2>Honest limits</h2>
          <p>Results are estimates, not offers. A licensed professional confirms what you qualify for. See our <Link href="/disclosures">disclosures</Link>.</p>
        </section>
      </div>
      <section className={ui.card}>
        <h2>Who it&apos;s for</h2>
        <ul>
          <li><strong>First-time buyers</strong> setting a realistic budget and down payment target.</li>
          <li><strong>Move-up buyers</strong> comparing payments at different prices and rates.</li>
          <li><strong>Renewers</strong> checking how rate changes affect their payment.</li>
        </ul>
        <p className={ui.related}>New to the terms? Start with our <Link href="/guide">mortgage affordability guide</Link> or the <Link href="/faq">FAQ</Link>.</p>
      </section>
      <Link href="/" className={ui.cta}>Calculate my affordability <ArrowRight size={18} /></Link>
    </StaticPage>
  )
}
