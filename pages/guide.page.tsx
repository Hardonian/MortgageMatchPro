import Link from 'next/link'
import StaticPage, { ui } from '../components/site/StaticPage'

export default function Guide() {
  return (
    <StaticPage
      path="/guide"
      title="Mortgage Affordability Guide for Canadians: How Much House Can You Afford?"
      description="A plain-English guide to mortgage affordability in Canada: GDS and TDS ratios, the stress test, down payment rules, and a 5-step way to set a realistic home budget."
      overline="Guide"
      heading="How much house can you afford? A plain-English guide"
      lead="Four ideas explain most of what lenders look at. Learn them in five minutes, then plug in your own numbers."
      updated="October 25, 2026"
      jsonLd={{
        '@type': 'Article',
        headline: 'How much house can you afford? A plain-English guide to mortgage affordability in Canada',
        dateModified: '2026-10-25',
        author: { '@id': 'https://mortgagematch.pro/#org' },
        publisher: { '@id': 'https://mortgagematch.pro/#org' },
      }}
    >
      <section className={ui.card}>
        <h2>1. Income and debts set your ceiling</h2>
        <p>
          Lenders start with your gross (pre-tax) household income and your monthly debt obligations such as car payments,
          student loans and credit card minimums. The more debt you carry, the less room there is for a mortgage payment.
        </p>
      </section>
      <section className={ui.card}>
        <h2>2. GDS and TDS: the two ratios that matter</h2>
        <p><strong>GDS (Gross Debt Service)</strong> is mortgage principal and interest, property tax and heating, divided by gross income. Lenders commonly look for roughly 39% or less.</p>
        <p><strong>TDS (Total Debt Service)</strong> is housing costs plus all other debts, divided by gross income. Lenders commonly look for roughly 44% or less.</p>
        <p>Exact limits vary by lender and insurer, so treat these as typical guidelines.</p>
      </section>
      <section className={ui.card}>
        <h2>3. The stress test adds a buffer</h2>
        <p>
          You are usually qualified at a higher rate than your contract rate, so you can still afford payments if rates rise.
          A lower stress-test result is not a failure; it simply tells you to adjust price, down payment or debts.
        </p>
      </section>
      <section className={ui.card}>
        <h2>4. Down payment changes your options</h2>
        <p>
          A larger down payment lowers your loan, your payment and often your costs. In Canada, down payments under 20% generally
          require mortgage default insurance. Confirm current minimums with your lender.
        </p>
      </section>
      <section className={ui.card}>
        <h2>Set a realistic budget in 5 steps</h2>
        <ol className={ui.steps}>
          <li>Add up your gross household income.</li>
          <li>List every monthly debt payment.</li>
          <li>Decide how much you can put down, and keep a cushion for closing costs.</li>
          <li>Enter an interest rate close to what lenders are offering today.</li>
          <li>Review your payment and ratios, then adjust price until you are comfortable.</li>
        </ol>
        <Link href="/" className={ui.cta}>Run my numbers free</Link>
      </section>
      <p className={ui.related}>
        Questions? See the <Link href="/faq">FAQ</Link>. Estimates only; read our <Link href="/disclosures">disclosures</Link>.
      </p>
    </StaticPage>
  )
}
