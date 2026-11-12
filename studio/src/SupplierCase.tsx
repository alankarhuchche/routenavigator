import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ArrowUpRight, Banknote, Check, Clock3, FileText, LockKeyhole, Radio, RotateCcw, ShieldCheck } from 'lucide-react'
import {
  advance, createExecution, deadlineLabel, disrupt, duration, evaluate, holdFallback,
  money, proposeLaterDelivery, selectedRoute,
  type Execution, type Intent, type RouteId, type Trace,
} from './engine'
import './supplier-case.css'

const supplierIntent: Intent = {
  amount: 30000,
  amountMode: 'recipient',
  deadlineMinutes: 90,
  destination: 'US',
  objective: 'cheapest',
  digital: true,
  reference: 'INV-1042',
}

const laterWindow = 1440
const routeOrder: RouteId[] = ['bridge', 'local', 'bank']
const steps = [
  { id: 'routes', title: 'Choose a route' },
  { id: 'before', title: 'Outage before sending' },
  { id: 'after', title: 'Outage after sending' },
] as const
type Step = typeof steps[number]['id']

interface SupplierCaseProps {
  onRecord: (execution: Execution) => void
  onInspect: (trace: Trace) => void
  onPlanner: () => void
  onLedger: () => void
}

function replayOutage(timing: 'before' | 'after') {
  const trace = evaluate(supplierIntent)
  const approved = advance(createExecution(trace), 'approve-original')
  const funded = advance(approved, 'reserve-original')
  const atOutage = timing === 'after' ? advance(funded, 'commit-original') : funded
  return disrupt(atOutage, `payout-outage-${timing}`)
}

function RouteComparison({ trace, label }: { trace: Trace; label: string }) {
  const routes = routeOrder.map(id => trace.candidates.find(route => route.id === id)!)
  return (
    <section className="case-route-comparison" aria-label={label}>
      <div className="case-table-head">
        <h3>{label}</h3>
        <span>Quotes use a {money(trace.intent.amount, 'USD')} recipient amount</span>
      </div>
      <table className="case-route-table">
        <thead>
          <tr><th scope="col">Route</th><th scope="col">Time to usable USD</th><th scope="col">Total GBP debit</th><th scope="col">Decision</th></tr>
        </thead>
        <tbody>
          {routes.map(route => {
            const selected = route.id === trace.selected
            const partnerDown = route.gates.some(gate => gate.name === 'Execution route health' && !gate.pass)
            const missesDeadline = route.gates.some(gate => gate.name === 'Delivery deadline' && !gate.pass)
            const decision = selected ? 'Selected' : partnerDown ? 'Partner offline' : missesDeadline ? 'Misses deadline' : 'Available'
            return (
              <tr key={route.id} className={selected ? 'case-route-selected' : ''}>
                <th scope="row">{route.name}</th>
                <td>{duration(route.minutes)}</td>
                <td>{money(route.sourceDebit!)}<small>{money(route.fee)} fee included</small></td>
                <td><span className={`case-route-status ${selected ? 'selected' : ''}`}>{selected && <Check size={13} />}{decision}</span></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}

export default function SupplierCase({ onRecord, onInspect, onPlanner, onLedger }: SupplierCaseProps) {
  const [baseline] = useState(() => evaluate(supplierIntent))
  const [step, setStep] = useState<Step>('routes')
  const [before, setBefore] = useState<Execution>()
  const [after, setAfter] = useState<Execution>()
  const resultHeading = useRef<HTMLHeadingElement>(null)
  const route = selectedRoute(baseline)!
  const localPayout = baseline.candidates.find(candidate => candidate.id === 'local')!

  useEffect(() => {
    if (step !== 'routes') resultHeading.current?.focus({ preventScroll: true })
  }, [step])

  function openStep(next: Step) {
    if (next === 'before' && !before) {
      const execution = replayOutage('before')
      setBefore(execution)
      onRecord(execution)
    }
    if (next === 'after' && !after) {
      const execution = replayOutage('after')
      setAfter(execution)
      onRecord(execution)
    }
    setStep(next)
  }

  function updateBefore(execution: Execution) {
    setBefore(execution)
    onRecord(execution)
  }

  function finishRevisedPayment(execution: Execution) {
    let result = advance(execution, 'reserve-revised')
    result = advance(result, 'commit-revised')
    result = advance(result, 'confirm-revised-instruction')
    updateBefore(advance(result, 'confirm-revised-bank-credit'))
  }

  const revisedQuotePending = before?.status === 'fallback_review'
  const revisedQuoteDeclined = before?.events.at(-1)?.type === 'REVISED_QUOTE_DECLINED'
  const revisedQuoteApproved = before?.status === 'approved' && before.rerouted
  const paid = before?.status === 'completed'
  const invoiceAmount = money(supplierIntent.amount, 'USD')

  return (
    <section className="supplier-case" aria-label="Supplier payment case">
      <header className="case-intro">
        <div className="case-intro-copy">
          <p className="case-overline">Interactive payment simulation</p>
          <h1>Can this supplier be paid in 90 minutes?</h1>
          <p className="case-lead">A UK buyer needs {invoiceAmount} in Atlas Manufacturing’s New York bank account to release a shipment.</p>
        </div>
        <aside className="case-invoice" aria-label="Invoice requirements">
          <div className="case-invoice-title"><FileText size={17} /> Invoice {supplierIntent.reference}</div>
          <div className="case-invoice-amount">{invoiceAmount}</div>
          <div className="case-invoice-recipient">Atlas Manufacturing <span>New York, US</span></div>
          <div className="case-invoice-deadline"><Clock3 size={16} /><span>Usable in the supplier’s bank account within <strong>90 minutes</strong></span></div>
        </aside>
      </header>

      <nav className="case-steps" aria-label="Supplier payment walkthrough">
        {steps.map(({ id, title }, index) => (
          <button key={id} type="button" aria-current={step === id ? 'step' : undefined} onClick={() => openStep(id)}>
            <span>{index + 1}</span>{title}
          </button>
        ))}
      </nav>

      {step === 'routes' && (
        <article className="case-panel" aria-labelledby="case-result-title">
          <div className="case-result case-result-success">
            <div className="case-result-copy">
              <p className="case-result-label"><Check size={16} /> Meets the 90-minute deadline</p>
              <h2 id="case-result-title">Use the digital-dollar bridge</h2>
              <p>Local payout would save {money(route.sourceDebit! - localPayout.sourceDebit!)} and take {duration(localPayout.minutes)}. The bridge is the only route expected to credit the supplier’s bank account in time.</p>
            </div>
            <div className="case-result-metrics">
              <div><strong>{duration(route.minutes)}</strong><span>to usable USD</span></div>
              <div><strong>{money(route.sourceDebit!)}</strong><span>total debit · {money(route.fee)} fee included</span></div>
            </div>
          </div>
          <div className="case-actions">
            <button className="button primary" onClick={() => openStep('before')}>Simulate payout outage <ArrowRight size={17} /></button>
            <button className="case-text-action" onClick={() => onInspect(baseline)}>Inspect route decision <ArrowUpRight size={15} /></button>
          </div>
          <RouteComparison trace={baseline} label="Why this route wins" />
          <details className="case-detail">
            <summary>How does the bridge deliver dollars to a bank account?</summary>
            <ol>{route.legs.map(leg => <li key={leg}>{leg}</li>)}</ol>
            <p>The estimate includes the conversion back to dollars and the final USD bank credit.</p>
          </details>
        </article>
      )}

      {step === 'before' && before && (
        <article className="case-panel" aria-labelledby="case-result-title">
          <div className={`case-result ${paid ? 'case-result-success' : 'case-result-warning'}`}>
            <div className="case-result-copy">
              <p className="case-result-label"><Radio size={16} /> Payout partner offline · before commitment</p>
              <h2 id="case-result-title" ref={resultHeading} tabIndex={-1}>
                {paid ? 'The supplier received US$30,000' : revisedQuoteApproved ? 'The revised quote is approved' : revisedQuotePending ? 'Review a quote for next business day' : 'Hold the payment'}
              </h2>
              <p>{paid
                ? 'The bank confirmed usable dollars under the revised delivery window.'
                : revisedQuoteApproved
                  ? 'The simulator can reserve the revised debit and send the international bank transfer under the approved delivery window.'
                  : revisedQuotePending
                    ? 'The bank route becomes eligible with a next-business-day deadline. The buyer must approve the later delivery and the new debit before it can proceed.'
                    : revisedQuoteDeclined
                      ? 'The revised quote was declined. The payment remains held before commitment.'
                      : 'The bridge and local payout use the same unavailable partner. The bank route is operational and would take one business day, which misses the original deadline.'}</p>
            </div>
            <div className="case-result-metrics">
              {revisedQuotePending || revisedQuoteApproved || paid ? (
                <><div><strong>{duration(before.active.minutes)}</strong><span>revised delivery</span></div><div><strong>{money(before.active.sourceDebit!)}</strong><span>new debit · {money(before.active.fee)} fee included</span></div></>
              ) : (
                <><div><strong>0 of 3</strong><span>routes meet all requirements</span></div><div><strong>{invoiceAmount}</strong><span>still due to the supplier</span></div></>
              )}
            </div>
          </div>
          <div className="case-actions case-before-actions">
            {before.status === 'held' && !revisedQuoteDeclined && <button className="button primary" onClick={() => updateBefore(proposeLaterDelivery(before, laterWindow, 'quote-next-business-day'))}>Quote next business day <ArrowRight size={17} /></button>}
            {revisedQuotePending && <>
              <button className="button primary" onClick={() => updateBefore(advance(before, 'approve-revised'))}>Approve revised quote <Check size={17} /></button>
              <button className="button secondary" onClick={() => updateBefore(holdFallback(before, 'decline-revised'))}>Keep payment held</button>
            </>}
            {revisedQuoteApproved && <button className="button primary" onClick={() => finishRevisedPayment(before)}>Simulate bank payment <ArrowRight size={17} /></button>}
            <button className={paid || revisedQuoteDeclined ? 'button primary' : 'button secondary'} onClick={() => openStep('after')}>Replay outage after commitment <ArrowRight size={17} /></button>
            <button className="case-text-action" onClick={() => onInspect(before.trace)}>Inspect decision record <ArrowUpRight size={15} /></button>
          </div>
          <RouteComparison
            trace={(revisedQuoteDeclined ? before.recoveryDecisions?.[0] : before.fallbackTrace) ?? before.trace}
            label={revisedQuotePending || revisedQuoteApproved || paid ? `Routes with ${deadlineLabel(laterWindow)} to deliver` : 'Routes after the outage'}
          />
          {revisedQuotePending && <p className="case-quote-note">The original debit was {money(route.sourceDebit!)}. The revised quote adds {money(before.active.sourceDebit! - route.sourceDebit!)} and preserves the {invoiceAmount} invoice amount.</p>}
        </article>
      )}

      {step === 'after' && after && (
        <article className="case-panel" aria-labelledby="case-result-title">
          <div className="case-result case-result-warning">
            <div className="case-result-copy">
              <p className="case-result-label"><Radio size={16} /> Payout partner offline · after commitment</p>
              <h2 id="case-result-title" ref={resultHeading} tabIndex={-1}>Investigate the original transfer</h2>
              <p>The USDC transfer had been sent for settlement when the payout partner went offline. The original payment could still reach Atlas. Reconcile that instruction before taking further action.</p>
            </div>
            <div className="case-result-metrics case-lock-state">
              <LockKeyhole size={23} />
              <div><strong>Rerouting locked</strong><span>USD bank credit unconfirmed</span></div>
            </div>
          </div>
          <div className="case-actions">
            <button className="button primary" onClick={() => onInspect(after.trace)}>Inspect decision and events <ArrowUpRight size={17} /></button>
            <button className="case-text-action" onClick={() => openStep('before')}>Review the before-commitment outcome <ArrowRight size={15} /></button>
          </div>
          <ol className="case-timeline" aria-label="Status of the original transfer">
            <li><Banknote size={19} /><span><strong>GBP reserved</strong><small>Source debit approved</small></span></li>
            <li><LockKeyhole size={19} /><span><strong>USDC transfer committed</strong><small>Original instruction in flight</small></span></li>
            <li className="pending"><Clock3 size={19} /><span><strong>USD bank credit pending</strong><small>Investigation opened</small></span></li>
          </ol>
          {before && <div className="case-replay-summary">
            <div><ShieldCheck size={18} /><span><strong>Before commitment</strong><small>Hold the payment. Approve a revised quote if the supplier accepts a later delivery.</small></span></div>
            <div><LockKeyhole size={18} /><span><strong>After commitment</strong><small>Investigate the existing instruction. A second transfer could pay the invoice twice.</small></span></div>
          </div>}
        </article>
      )}

      <footer className="case-footer">
        <span>Simulated providers, fixed FX and indicative delivery times.</span>
        <div>
          <button className="case-text-action" onClick={onPlanner}>Open payment planner <ArrowUpRight size={14} /></button>
          <button className="case-text-action" onClick={onLedger}>Open decision ledger <ArrowUpRight size={14} /></button>
          {step !== 'routes' && <button className="case-text-action" onClick={() => { setBefore(undefined); setAfter(undefined); setStep('routes') }}><RotateCcw size={14} /> Restart case</button>}
        </div>
      </footer>
    </section>
  )
}
