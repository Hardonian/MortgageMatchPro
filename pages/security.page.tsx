import StaticPage, { ui } from '../components/site/StaticPage'

export default function Security() {
  return (
    <StaticPage
      path="/security"
      title="Security"
      description="How MortgageMatch Pro protects your data and how to report a security issue."
      overline="Trust & safety"
      heading="Security at MortgageMatch Pro"
      lead="We design the planner to collect as little as possible and protect what we do handle."
    >
      <section className={ui.card}>
        <h2>Our approach</h2>
        <ul>
          <li>All traffic is served over HTTPS.</li>
          <li>Strict security headers, including a Content Security Policy, are applied to every page.</li>
          <li>Planner figures are processed to produce your estimate; saved plans stay in your browser.</li>
          <li>Non-essential API endpoints are disabled in production.</li>
          <li>Secrets and credentials are never committed to source control.</li>
        </ul>
      </section>
      <section className={ui.card}>
        <h2>Your part</h2>
        <p>Use a strong, unique password, keep your browser up to date, and avoid using shared devices for saved plans.</p>
      </section>
      <section className={ui.card}>
        <h2>Report a vulnerability</h2>
        <p>
          If you believe you have found a security issue, please contact us via our <a href="/contact">Contact page</a> with
          details so we can investigate. Please give us reasonable time to respond before public disclosure.
        </p>
      </section>
    </StaticPage>
  )
}
