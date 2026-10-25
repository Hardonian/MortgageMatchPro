import StaticPage, { ui, SUPPORT_EMAIL } from '../components/site/StaticPage'

export default function Privacy() {
  return (
    <StaticPage
      hideCta      path="/privacy"
      title="Privacy Policy"
      description="How MortgageMatch Pro handles information in the public mortgage-planning tool."
      overline="Legal"
      heading="Privacy Policy"
      lead="We keep data collection minimal and explain it plainly."
      updated="October 25, 2026"
    >
      <section className={ui.card}>
        <h2>Information we handle</h2>
        <ul>
          <li><strong>Planner inputs</strong> such as income, debts, property price, and down payment, sent to the calculator to produce your estimate. The public planner does not create an account or persist those inputs as a saved server record.</li>
          <li><strong>Saved plans</strong>, stored locally in your browser (local storage) on your device.</li>
          <li><strong>Technical data</strong> that our hosting and security providers may process to deliver and protect the service, such as request, browser, and device information.</li>
        </ul>
      </section>
      <section className={ui.card}>
        <h2>How we use it</h2>
        <p>To provide and improve the planner, secure the service, respond to your requests, and meet legal obligations. We do not sell your personal information.</p>
      </section>
      <section className={ui.card}>
        <h2>Sharing</h2>
        <p>We share information only with service providers that operate or secure the public planner, when required by law, or with your consent. Broker matching, account sync, payment, and bank-connection features are not available in the public planner.</p>
      </section>
      <section className={ui.card}>
        <h2>Retention & your choices</h2>
        <p>You can remove a saved plan at any time by clearing browser data for this site. You may request access, correction, or deletion of information we hold by contacting <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Do not include financial account numbers, SINs, or credentials in email.</p>
      </section>
      <section className={ui.card}>
        <h2>Changes</h2>
        <p>We may update this policy and will revise the date above when we do. Questions? Visit our <a href="/contact">Contact page</a>.</p>
      </section>
    </StaticPage>
  )
}
