import StaticPage, { ui } from '../components/site/StaticPage'

export default function Terms() {
  return (
    <StaticPage
      hideCta`n      path="/terms"
      title="Terms of Service"
      description="The terms that govern your use of MortgageMatch Pro."
      overline="Legal"
      heading="Terms of Service"
      lead="By using MortgageMatch Pro you agree to these terms."
      updated="October 25, 2026"
    >
      <section className={ui.card}>
        <h2>The service</h2>
        <p>MortgageMatch Pro provides educational mortgage planning tools. It is not a lender, broker, or financial adviser, and it does not offer credit or pre-approval.</p>
      </section>
      <section className={ui.card}>
        <h2>No advice; estimates only</h2>
        <p>Results depend on the information you provide and on assumptions that may differ from a lender's. They are estimates and may be inaccurate. Confirm all figures with a licensed professional before making decisions.</p>
      </section>
      <section className={ui.card}>
        <h2>Acceptable use</h2>
        <ul>
          <li>Do not misuse, disrupt, scrape, or attempt to gain unauthorized access to the service.</li>
          <li>Do not submit unlawful content or information about others without permission.</li>
        </ul>
      </section>
      <section className={ui.card}>
        <h2>Intellectual property</h2>
        <p>The service, its design, and its content are owned by MortgageMatch Pro and its licensors. You may use the service for personal, non-commercial planning.</p>
      </section>
      <section className={ui.card}>
        <h2>Disclaimer & liability</h2>
        <p>The service is provided "as is" without warranties of any kind. To the fullest extent permitted by law, MortgageMatch Pro is not liable for losses arising from your use of or reliance on the service.</p>
      </section>
      <section className={ui.card}>
        <h2>Changes & contact</h2>
        <p>We may update these terms; continued use means you accept the changes. Questions? See our <a href="/contact">Contact page</a>.</p>
      </section>
    </StaticPage>
  )
}
