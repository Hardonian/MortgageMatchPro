import StaticPage, { ui } from '../components/site/StaticPage'

export default function Disclosures() {
  return (
    <StaticPage
      hideCta      path="/disclosures"
      title="Disclosures"
      description="Important disclosures about MortgageMatch Pro estimates, rates, and assumptions."
      overline="Legal"
      heading="Important disclosures"
      lead="Please read these before relying on any estimate."
      updated="October 25, 2026"
    >
      <section className={ui.card}>
        <h2>Estimates only</h2>
        <p>All payments, ratios, and affordability figures are illustrative estimates. They are not a mortgage offer, commitment to lend, or pre-approval.</p>
      </section>
      <section className={ui.card}>
        <h2>Rates & assumptions</h2>
        <p>Interest rates shown are the values you enter or sample values and may not reflect current market rates. Stress-test qualifying rates, property tax, heating, mortgage insurance, and other costs follow general planning assumptions and may differ from your lender's.</p>
        <p>For Canadian planning, the calculator models the qualifying rate as the greater of the contract rate plus 2% or 5.25%, and uses semi-annual compounding for fixed-rate payment estimates. These rules can change and lender practices differ.</p>
      </section>
      <section className={ui.card}>
        <h2>Sources and review</h2>
        <p>We use the <a href="https://www.osfi-bsif.gc.ca/en/supervision/financial-institutions/banks/minimum-qualifying-rate-uninsured-mortgages">OSFI minimum qualifying rate</a> and <a href="https://www.canada.ca/en/financial-consumer-agency/services/mortgages/down-payment.html">FCAC down-payment guidance</a> as planning references. MortgageMatch Pro will update this page when its assumptions change.</p>
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
