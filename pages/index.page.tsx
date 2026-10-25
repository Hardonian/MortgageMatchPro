import Head from 'next/head'
import { FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Bookmark,
  Calculator,
  Check,
  ChevronRight,
  CircleHelp,
  Compass,
  Home,
  Landmark,
  LockKeyhole,
  Menu,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'
import styles from '../styles/client-experience.module.css'

type Tab = 'plan' | 'compare' | 'saved' | 'profile'

type FormState = {
  annualIncome: string
  monthlyDebt: string
  propertyPrice: string
  downPayment: string
  interestRate: string
  amortizationYears: string
  annualPropertyTax: string
}

type Calculation = {
  currency: 'CAD' | 'USD'
  monthlyPayment: number
  principal: number
  gdsRatio: number
  tdsRatio: number
  qualifyingRate: number
  maxAffordable: number
  isWithinPlanningRange: boolean
  disclaimer: string
}

type SavedPlan = {
  form: FormState
  calculation: Calculation
  savedAt: string
}

const initialForm: FormState = {
  annualIncome: '125000',
  monthlyDebt: '450',
  propertyPrice: '750000',
  downPayment: '150000',
  interestRate: '4.79',
  amortizationYears: '25',
  annualPropertyTax: '5200',
}

const tabDetails: Record<Tab, { label: string; icon: typeof Compass }> = {
  plan: { label: 'Plan', icon: Compass },
  compare: { label: 'Compare', icon: Landmark },
  saved: { label: 'Saved', icon: Bookmark },
  profile: { label: 'Profile', icon: UserRound },
}

const currencyFormatters: Record<'CAD' | 'USD', Intl.NumberFormat> = {
  CAD: new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }),
  USD: new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }),
}

function money(value: number, currency: 'CAD' | 'USD' = 'CAD') {
  return (currencyFormatters[currency] || currencyFormatters.CAD).format(value)
}

const mediumDateFormatter = new Intl.DateTimeFormat('en-CA', { dateStyle: 'medium' })


export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>('plan')
  const [form, setForm] = useState<FormState>(initialForm)
  const [calculation, setCalculation] = useState<Calculation | null>(null)
  const [savedPlan, setSavedPlan] = useState<SavedPlan | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [message, setMessage] = useState('')

  const paymentDifference = useMemo(() => {
    if (!calculation) return 0
    const rate = Number(form.interestRate)
    const principal = calculation.principal
    const months = Number(form.amortizationYears) * 12
    const monthlyRate = Math.max(rate - 0.35, 0.1) / 100 / 12
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1)
    return Math.round(calculation.monthlyPayment - payment)
  }, [calculation, form.amortizationYears, form.interestRate])

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('mortgagematch:last-plan')
      if (stored) setSavedPlan(JSON.parse(stored) as SavedPlan)
    } catch {
      try {
        window.localStorage.removeItem('mortgagematch:last-plan')
      } catch {
        // Storage can be unavailable in privacy-restricted browser contexts.
      }
    }
  }, [])

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsCalculating(true)
    setMessage('')

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, country: 'CA' }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'We could not calculate that plan')
      setCalculation(data)
      setMessage('Your plan is ready. Explore the payment and compare view below.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'We could not calculate that plan')
    } finally {
      setIsCalculating(false)
    }
  }

  function savePlan() {
    if (!calculation) {
      setMessage('Calculate your plan first, then save it here on this device.')
      return
    }

    try {
      const plan = { form, calculation, savedAt: new Date().toISOString() }
      window.localStorage.setItem('mortgagematch:last-plan', JSON.stringify(plan))
      setSavedPlan(plan)
      setMessage('Plan saved privately on this device.')
    } catch {
      setMessage("We couldn't save this plan in this browser. You can still use the result.")
    }
  }

  function restoreSavedPlan() {
    if (!savedPlan) return
    setForm(savedPlan.form)
    setCalculation(savedPlan.calculation)
    setActiveTab('plan')
    setMessage('Saved plan restored.')
  }

  return (
    <>
      <Head>
        <title>MortgageMatch — make your next move with clarity</title>
        <meta name="description" content="Free Canadian mortgage affordability calculator. See your monthly payment, GDS/TDS ratios and stress-test result in 60 seconds. Private, no sign-up." /><link rel="canonical" href="https://mortgagematch.pro/" /><meta property="og:title" content="Free Mortgage Affordability Calculator | MortgageMatch Pro" /><meta property="og:description" content="See what you can afford in 60 seconds. Private and free." /><meta property="og:type" content="website" /><meta property="og:image" content="https://mortgagematch.pro/og-image.jpg" /><meta name="twitter:card" content="summary_large_image" /><meta property="og:url" content="https://mortgagematch.pro/" />
        <meta name="theme-color" content="#061e29" />
      </Head>

      <main id="main-content" className={styles.shell}>
        <div className={styles.orbOne} aria-hidden="true" />
        <div className={styles.orbTwo} aria-hidden="true" />

        <header className={styles.header}>
          <a className={styles.brand} href="#top" aria-label="MortgageMatch home">
            <span className={styles.brandMark}><Home size={18} strokeWidth={2.7} /></span>
            <span>Mortgage<span>Match</span></span>
          </a>
          <div className={styles.headerActions}>
            <button className={styles.iconButton} type="button" aria-label="Open saved plans" onClick={() => setActiveTab('saved')}><Menu size={20} /></button>
            <button className={styles.avatar} type="button" aria-label="Open profile" onClick={() => setActiveTab('profile')}><UserRound size={18} /></button>
          </div>
        </header>

        <section className={styles.hero} id="top">
          <div className={styles.eyebrow}><Sparkles size={14} /> Planning, without the pressure</div>
          <h1>Feel good about<br /><em>your next move.</em></h1>
          <p>Turn the numbers into a mortgage plan you can actually use. Clear assumptions. No mystery math.</p>
          <div className={styles.trustRow}>
            <span><ShieldCheck size={16} /> Private by default</span>
            <span><Check size={16} /> Built for Canadian planning</span>
          </div>
        </section>

        <section className={styles.workspace} aria-label="Mortgage planning workspace">
          <div className={styles.workspaceHeader}>
            <div>
              <p className={styles.overline}>Your starting point</p>
              <h2>Build a plan</h2>
            </div>
            <span className={styles.step}>01 <span>/ 03</span></span>
          </div>

          {activeTab === 'plan' && (
            <div className={styles.planGrid}>
              <form className={styles.planForm} onSubmit={calculate}>
                <div className={styles.formLead}>
                  <Calculator size={20} />
                  <div><strong>Start with what’s real</strong><span>Use gross income and monthly debt payments.</span></div>
                </div>
                <div className={styles.fieldGrid}>
                  <Field label="Household income" prefix="$" value={form.annualIncome} onChange={(value) => updateField('annualIncome', value)} detail="per year" />
                  <Field label="Monthly debt" prefix="$" value={form.monthlyDebt} onChange={(value) => updateField('monthlyDebt', value)} detail="per month" />
                  <Field label="Home price" prefix="$" value={form.propertyPrice} onChange={(value) => updateField('propertyPrice', value)} />
                  <Field label="Down payment" prefix="$" value={form.downPayment} onChange={(value) => updateField('downPayment', value)} />
                  <Field label="Interest rate" suffix="%" value={form.interestRate} onChange={(value) => updateField('interestRate', value)} />
                  <Field label="Amortization" suffix="years" value={form.amortizationYears} onChange={(value) => updateField('amortizationYears', value)} />
                  <Field label="Annual property tax" prefix="$" value={form.annualPropertyTax} onChange={(value) => updateField('annualPropertyTax', value)} />
                </div>
                <button className={styles.primaryButton} type="submit" disabled={isCalculating}>
                  {isCalculating ? 'Calculating your plan…' : 'See my buying power'} <ArrowRight size={18} />
                </button>
                <p className={styles.microcopy}><LockKeyhole size={13} /> We don’t save these numbers unless you choose to.</p>
              </form>

              <aside className={styles.resultsCard} aria-live="polite">
                {calculation ? (
                  <>
                    <span className={styles.resultStatus}><Check size={14} /> {calculation.isWithinPlanningRange ? 'Within a planning range' : 'Worth a closer look'}</span>
                    <p className={styles.resultLabel}>Estimated monthly payment</p>
                    <p className={styles.resultValue}>{money(calculation.monthlyPayment, calculation.currency)}<small>/mo</small></p>
                    <div className={styles.resultRule} />
                    <div className={styles.resultStats}>
                      <div><span>Est. buying power</span><strong>{money(calculation.maxAffordable, calculation.currency)}</strong></div>
                      <div><span>Stress-test rate</span><strong>{calculation.qualifyingRate}%</strong></div>
                    </div>
                    <button type="button" className={styles.secondaryButton} onClick={() => setActiveTab('compare')}>
                      Compare paths <ChevronRight size={17} />
                    </button>
                  </>
                ) : (
                  <div className={styles.emptyResult}>
                    <span className={styles.emptyIcon}><Compass size={28} /></span>
                    <h3>Your clarity starts here.</h3>
                    <p>Add a few numbers and we’ll turn them into a calm, transparent plan.</p>
                  </div>
                )}
              </aside>
            </div>
          )}

          {activeTab === 'compare' && <CompareView calculation={calculation} rate={Number(form.interestRate)} paymentDifference={paymentDifference} onBack={() => setActiveTab('plan')} />}
          {activeTab === 'saved' && <SavedView calculation={calculation} savedPlan={savedPlan} onSave={savePlan} onPlan={() => setActiveTab('plan')} onRestore={restoreSavedPlan} />}
          {activeTab === 'profile' && <ProfileView />}

          {message && <p className={styles.message} role="status">{message}</p>}
        </section>

        <section className={styles.reassurance}>
          <CircleHelp size={19} />
          <div><strong>Good planning beats fast guessing.</strong><p>MortgageMatch shows the assumptions behind every result so you know what to ask next.</p></div>
        </section>

        <footer style={{ maxWidth: 1120, margin: '20px auto 0', display: 'flex', flexWrap: 'wrap', gap: '6px 16px', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>
          {[['About', '/about'], ['FAQ', '/faq'], ['Security', '/security'], ['Contact', '/contact'], ['Privacy', '/privacy'], ['Terms', '/terms'], ['Disclosures', '/disclosures']].map(([label, href]) => (
            <a key={href} href={href} style={{ color: '#61737a', textDecoration: 'none' }}>{label}</a>
          ))}
        </footer>


        <nav className={styles.bottomNav} aria-label="Primary navigation">
          {(Object.keys(tabDetails) as Tab[]).map((tab) => {
            const item = tabDetails[tab]
            const Icon = item.icon
            return <button key={tab} type="button" className={activeTab === tab ? styles.navActive : styles.navItem} onClick={() => setActiveTab(tab)} aria-current={activeTab === tab ? 'page' : undefined}><Icon size={19} /><span>{item.label}</span></button>
          })}
        </nav>
      </main>
    </>
  )
}

function Field({
  label,
  value,
  prefix,
  suffix,
  detail,
  onChange,
}: {
  label: string
  value: string
  prefix?: string
  suffix?: string
  detail?: string
  onChange: (value: string) => void
}) {
  const id = `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  const detailId = detail ? `${id}-detail` : undefined

  return (
    <label htmlFor={id} className={styles.field}>
      <span>{label}</span>
      <div className={styles.inputWrap}>
        {prefix && <b aria-hidden="true">{prefix}</b>}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={label}
          aria-describedby={detailId}
        />
        {suffix && <i aria-hidden="true">{suffix}</i>}
      </div>
      {detail && <small id={detailId}>{detail}</small>}
    </label>
  )
}

function CompareView({
  calculation,
  rate,
  paymentDifference,
  onBack,
}: {
  calculation: Calculation | null
  rate: number
  paymentDifference: number
  onBack: () => void
}) {
  if (!calculation) {
    return (
      <EmptyState
        icon={<Landmark size={28} />}
        title="Calculate before you compare."
        detail="Build your plan first and we’ll map a few thoughtful paths from the same inputs."
        action="Build my plan"
        onAction={onBack}
      />
    )
  }
  const options = [
    { name: 'More predictable', detail: 'A fixed-rate planning scenario', rate, tone: 'solid', tag: 'Steady' },
    {
      name: 'More flexible',
      detail: 'A lower-rate planning scenario',
      rate: Math.max(rate - 0.35, 0.1),
      tone: 'soft',
      tag: `Save ~${money(paymentDifference)}/mo`,
    },
  ]
  return (
    <div className={styles.compareView}>
      <div className={styles.viewIntro}>
        <p className={styles.overline}>See the trade-offs</p>
        <h2>Two ways forward</h2>
        <p>These are planning scenarios, not lender offers. Real rates depend on your application and the day you apply.</p>
      </div>
      <div className={styles.optionStack}>
        {options.map((option) => (
          <article key={option.name} className={`${styles.optionCard} ${option.tone === 'solid' ? styles.optionSolid : ''}`}>
            <div className={styles.optionTop}>
              <span>{option.tag}</span>
            </div>
            <h3>{option.name}</h3>
            <p>{option.detail}</p>
            <strong>{option.rate.toFixed(2)}<small>%</small></strong>
            <div className={styles.optionFoot}>
              <span>Estimated payment</span>
              <b>{money(option.name === 'More predictable' ? calculation.monthlyPayment : calculation.monthlyPayment - paymentDifference)}/mo</b>
            </div>
          </article>
        ))}
      </div>
      <div className={styles.insight}>
        <Sparkles size={18} />
        <p><strong>A helpful next question:</strong> How much payment change would feel comfortable if rates moved?</p>
      </div>
    </div>
  )
}

function SavedView({
  calculation,
  savedPlan,
  onSave,
  onPlan,
  onRestore,
}: {
  calculation: Calculation | null
  savedPlan: SavedPlan | null
  onSave: () => void
  onPlan: () => void
  onRestore: () => void
}) {
  return (
    <div className={styles.savedView}>
      <p className={styles.overline}>Your space</p>
      <h2>Keep the plans worth revisiting.</h2>
      <p>Plans stay on this device unless you choose to share them.</p>
      {calculation ? (
        <article className={styles.savedCard}>
          <span>Just calculated</span>
          <h3>{money(calculation.monthlyPayment, calculation.currency)} / month</h3>
          <p>Buying power up to {money(calculation.maxAffordable, calculation.currency)}</p>
          <button type="button" className={styles.primaryButton} onClick={onSave}>
            Save this plan <Bookmark size={18} />
          </button>
        </article>
      ) : savedPlan ? (
        <article className={styles.savedCard}>
          <span>Saved on this device</span>
          <h3>{money(savedPlan.calculation.monthlyPayment, savedPlan.calculation.currency)} / month</h3>
          <p>Saved {mediumDateFormatter.format(new Date(savedPlan.savedAt))}</p>
          <button type="button" className={styles.primaryButton} onClick={onRestore}>
            Open saved plan <ArrowRight size={18} />
          </button>
        </article>
      ) : (
        <EmptyState
          icon={<Bookmark size={28} />}
          title="Nothing saved yet."
          detail="Your first plan can live here when you’re ready."
          action="Build a plan"
          onAction={onPlan}
        />
      )}
    </div>
  )
}

function ProfileView() {
  return (
    <div className={styles.profileView}>
      <p className={styles.overline}>Personal, not pushy</p>
      <h2>Your mortgage space.</h2>
      <article className={styles.profileCard}>
        <span className={styles.profileIcon}><UserRound size={25} /></span>
        <div>
          <h3>Keep planning private</h3>
          <p>Saved plans stay on this device. Account-based saving and broker connections are not available yet.</p>
        </div>
      </article>
      <div className={styles.profileList}>
        <span><ShieldCheck size={18} /> Your numbers aren’t shared with lenders by default.</span>
        <span><LockKeyhole size={18} /> You control when a plan becomes an application.</span>
      </div>
    </div>
  )
}

function EmptyState({
  icon,
  title,
  detail,
  action,
  onAction,
}: {
  icon: ReactNode
  title: string
  detail: string
  action: string
  onAction: () => void
}) {
  return (
    <div className={styles.emptyState}>
      <span className={styles.emptyIcon}>{icon}</span>
      <h3>{title}</h3>
      <p>{detail}</p>
      <button type="button" className={styles.secondaryButton} onClick={onAction}>
        {action} <ArrowRight size={17} />
      </button>
    </div>
  )
}
