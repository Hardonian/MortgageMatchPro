import StaticPage, { ui } from '../components/site/StaticPage'

export default function Disclosures() {
  return (
    <StaticPage
      hideCta`n      path="/disclosures"
      title="Disclosures"
      description="Important disclosures about MortgageMatch Pro estimates, rates, and assumptions."
      overline="Legal"
      heading="Important disclosures"
      lead="Please read these before relying on any estimate."
    >
      <section className={ui.card}>
        <h2>Estimates only</h2>
        <p>All payments, ratios, and affordability figures are illustrative estimates. They are not a mortgage offer, commitment to lend, or pre-approval.</p>
      </section>
      <section className={ui.card}>
        <h2>Rates & assumptions</h2>
        <p>Interest rates shown are the values you enter or sample values and may not reflect current market rates. Stress-test qualifying rates, property tax, heating, and other costs follow general assumptions and may differ from your lender's.</p>
      </section>
      <section className={ui.card}>
        <h2>Not financial advice</h2>
        <p>MortgageMatch Pro is an educational tool. Consult a licensed mortgage professional, lawyer, or financial adviser about your situation.</p>
      </section>
      <section className={ui.card}>
        <h2>No lender relationship</h2>
        <p>MortgageMatch Pro is not a lender and does not endorse any lender or product shown.</p>
      </section>
    </StaticPage>
  )
}
