import StaticPage, { ui, SUPPORT_EMAIL } from '../components/site/StaticPage'

export default function Contact() {
  return (
    <StaticPage
      hideCta      path="/contact"
      title="Contact"
      description="Get in touch with the MortgageMatch Pro team for support, feedback, or privacy requests."
      overline="Contact"
      heading="We're here to help."
      lead="Questions, feedback, or a privacy request? Send us a note."
    >
      <div className={ui.grid}>
        <section className={ui.card}>
          <h2>General support</h2>
          <p>Help using the planner or reporting an issue.</p>
          <p><a href={`mailto:${SUPPORT_EMAIL}?subject=MortgageMatch%20Pro%20support`}>{SUPPORT_EMAIL}</a></p>
        </section>
        <section className={ui.card}>
          <h2>Privacy requests</h2>
          <p>Access, correction, or deletion of your information.</p>
          <p><a href={`mailto:${SUPPORT_EMAIL}?subject=Privacy%20request`}>{SUPPORT_EMAIL}</a></p>
        </section>
        <section className={ui.card}>
          <h2>Security reports</h2>
          <p>Found a vulnerability? Please report it responsibly.</p>
          <p><a href={`mailto:${SUPPORT_EMAIL}?subject=Security%20report`}>{SUPPORT_EMAIL}</a></p>
        </section>
      </div>
      <p className={ui.notice}>
        Please do not include SIN, bank account numbers, or other sensitive details in emails. We typically respond within two
        business days.
      </p>
    </StaticPage>
  )
}
