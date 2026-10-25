import Link from 'next/link'
import StaticPage, { ui } from '../components/site/StaticPage'

const faqs: [string, string][] = [
  ['How much mortgage can I afford in Canada?', 'It depends on your income, monthly debts, down payment and the interest rate. Lenders typically look at two ratios: GDS (housing costs as a share of gross income, commonly capped around 39%) and TDS (all debts, commonly capped around 44%), tested at a higher qualifying rate. MortgageMatch Pro calculates these for you in about a minute.'],
  ['What are GDS and TDS ratios?', 'Gross Debt Service (GDS) is your mortgage payment, property tax and heating costs divided by gross income. Total Debt Service (TDS) adds all other debts such as car loans, credit cards and lines of credit. Lower ratios mean a stronger application.'],
  ['What is the mortgage stress test?', 'The stress test checks that you could still afford your payment if rates rose. Lenders qualify you at a higher rate than the one you will actually pay. We show the qualifying rate used so you can see your safety buffer.'],
  ['How much down payment do I need?', 'In Canada the minimum is generally 5% on the first $500,000 and 10% on the portion above that, up to $1.5 million; 20% is required above that. Putting down less than 20% usually requires mortgage default insurance. Confirm current rules with your lender.'],
  ['How accurate is the MortgageMatch Pro calculator?', 'Results are planning estimates based on the figures you enter and standard qualifying rules. Your lender may apply different rates, criteria and fees, so use our numbers as a starting point, not a commitment.'],
  ['Is MortgageMatch Pro a mortgage offer or pre-approval?', 'No. We do not lend money and do not provide offers, approvals or financial advice. A lender or licensed mortgage professional can confirm what you qualify for.'],
  ['Is the calculator free and private?', 'Yes, the planner is free and needs no sign-up. Saved plans are stored in your own browser. See our Privacy Policy for details.'],
  ['How do I get help or report an issue?', 'Visit our Contact page and we will respond as soon as we can, typically within two business days.'],
]

export default function Faq() {
  return (
    <StaticPage
      path="/faq"
      title="Mortgage Affordability FAQ: GDS, TDS, Stress Test & Down Payment | MortgageMatch Pro"
      description="Answers to common Canadian mortgage questions: how much you can afford, GDS and TDS ratios, the stress test, down payment rules, and how our free calculator works."
      overline="Help center"
      heading="Mortgage affordability FAQ"
      lead="Straight answers about how much mortgage you can afford, GDS/TDS ratios, the stress test and how MortgageMatch Pro works."
      jsonLd={{
        '@type': 'FAQPage',
        mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      }}
    >
      <section className={`${ui.card} ${ui.faq}`}>
        {faqs.map(([q, a], i) => (
          <details key={q} open={i === 0}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
      <p className={ui.related}>
        Want the full walkthrough? Read the <Link href="/guide">mortgage affordability guide</Link> or{' '}
        <Link href="/contact">contact us</Link>.
      </p>
    </StaticPage>
  )
}
