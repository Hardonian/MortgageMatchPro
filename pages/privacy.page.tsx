import StaticPage, { ui, SUPPORT_EMAIL } from '../components/site/StaticPage'

export default function Privacy() {
  return (
    <StaticPage
      hideCta      path="/privacy"
      title="Privacy Policy"
      description="How MortgageMatch Pro collects, uses, and protects your information."
      overline="Legal"
      heading="Privacy Policy"
      lead="We keep data collection minimal and explain it plainly."
      updated="October 25, 2026"
    >
      <section className={ui.card}>
        <h2>Information we handle</h2>
        <ul>
          <li><strong>Planner inputs</strong> such as income, debts, property price, and down payment, used to calculate your estimate.</li>
          <li><strong>Saved plans</strong>, stored locally in your browser (local storage) on your device.</li>
          <li><strong>Account details</strong> such as your email address, if you sign in.</li>
          <li><strong>Technical data</strong> such as device, browser, and basic usage logs needed to operate and secure the service.</li>
        </ul>
      </section>
      <section className={ui.card}>
        <h2>How we use it</h2>
        <p>To provide and improve the planner, secure the service, respond to your requests, and meet legal obligations. We do not sell your personal information.</p>
      </section>
      <section className={ui.card}>
        <h2>Sharing</h2>
        <p>We share information only with service providers who help us run the service (such as hosting and authentication), when required by law, or with your consent.</p>
      </section>
      <section className={ui.card}>
        <h2>Retention & your choices</h2>
        <p>You can clear saved plans at any time by clearing your browser data. You may request access, correction, or deletion of information we hold by contacting <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
      </section>
      <section className={ui.card}>
        <h2>Changes</h2>
        <p>We may update this policy and will revise the date above when we do. Questions? Visit our <a href="/contact">Contact page</a>.</p>
      </section>
    </StaticPage>
  )
}
