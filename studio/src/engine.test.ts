import { describe, expect, it } from 'vitest'
import { advance, createExecution, disrupt, evaluate, holdFallback, INITIAL_INTENT, parseIntent, proposeLaterDelivery, selectedRoute, STORIES, type Execution, type Intent } from './engine'

const at = '2026-11-10T12:00:00.000Z'
const decision = () => evaluate(INITIAL_INTENT, 'none', at)
function runTo(execution: Execution, statuses: string[]) { return statuses.reduce((ex, key) => advance(ex, key, at), execution) }

describe('fixed invoice and deadline', () => {
 const invoice: Intent = { ...INITIAL_INTENT, amount: 30000, amountMode: 'recipient', objective: 'cheapest', deadlineMinutes: 90 }

 it('quotes the same recipient amount for each route and excludes cheaper routes that miss the deadline', () => {
  const trace = evaluate(invoice, 'none', at)
  expect(selectedRoute(trace)).toMatchObject({ id: 'bridge', receive: 30000, sourceDebit: 23812.81, fee: 67.36 })
  const cheaper = trace.candidates.find(route => route.id === 'local')!
  expect(cheaper).toMatchObject({ receive: 30000, sourceDebit: 23768.32, eligible: false, score: null })
  expect(cheaper.gates).toContainEqual(expect.objectContaining({ name: 'Delivery deadline', pass: false }))
  expect(evaluate({ ...invoice, deadlineMinutes: 37 }, 'none', at).selected).toBeNull()
 })

 it('holds the invoice after an outage, quotes later delivery and reserves the approved debit again', () => {
  const original = evaluate(invoice, 'none', at)
  const funded = runTo(createExecution(original), ['authorise', 'reserve'])
  const held = disrupt(funded, 'partner-outage', at)
  expect(held).toMatchObject({ status: 'held', committed: false, settledAmount: 0, fallbackTrace: { selected: null } })
  const revised = proposeLaterDelivery(held, 1440, 'later-quote', at)
  expect(revised).toMatchObject({ status: 'fallback_review', settledAmount: 0, active: { id: 'bank', receive: 30000, sourceDebit: 23846.56 } })
  expect(revised.trace.intent.deadlineMinutes).toBe(90)
  expect(revised.recoveryDecisions?.map(trace => trace.intent.deadlineMinutes)).toEqual([90, 1440])
  expect(revised.fallbackTrace?.unavailableRoutes).toEqual(['bridge', 'local'])
  expect(proposeLaterDelivery(revised, 1440, 'later-quote', at)).toBe(revised)
  expect(holdFallback(revised, 'decline', at)).toMatchObject({ status: 'held', settledAmount: 0 })
  const approved = advance(revised, 'approve-revised', at)
  expect(approved.status).toBe('approved')
  const completed = runTo(approved, ['reserve-revised', 'commit', 'settle', 'credit'])
  expect(completed).toMatchObject({ status: 'completed', settledAmount: 30000 })
 })

 it('cannot requote a committed invoice after an outage', () => {
  const committed = runTo(createExecution(evaluate(invoice, 'none', at)), ['authorise', 'reserve', 'commit'])
  const investigated = disrupt(committed, 'partner-outage', at)
  expect(investigated).toMatchObject({ status: 'investigation', committed: true, settledAmount: 0, active: { id: 'bridge' } })
  expect(investigated.recoveryDecisions).toBeUndefined()
  expect(() => proposeLaterDelivery(investigated, 1440, 'late-quote', at)).toThrow('held before commitment')
 })
})

describe('payment decisions', () => {
 it.each([
  ['supplier','bridge'],['cost','local'],['domestic','instant'],['wallet','wallet'],['traditional','bank'],['europe','sepa'],
 ])('chooses the correct route for the %s story', (id, expected) => {
  const trace = evaluate(STORIES.find(s=>s.id===id)!.intent, 'none', at)
  expect(trace.selected).toBe(expected)
  expect(trace.candidates.every(c=>c.gates.every(g=>g.pass) === (c.score!==null))).toBe(true)
 })
 it('changes the decision when the priority changes, without changing the payment', () => {
  const fast=decision(), cheap=evaluate({...INITIAL_INTENT, objective:'cheapest'},'none',at)
  expect(fast.selected).toBe('bridge'); expect(cheap.selected).toBe('local')
  expect(selectedRoute(cheap)!.receive).toBeGreaterThan(selectedRoute(fast)!.receive)
  expect(selectedRoute(cheap)!.minutes).toBeGreaterThan(selectedRoute(fast)!.minutes)
 })
 it('reconciles the illustrative quote down to the penny', () => {
  const quote=selectedRoute(decision())!
  expect(quote.fee).toBe(70.50)
  expect(quote.receive).toBe(31495.93)
  expect(quote.minutes).toBe(38)
 })
 it('uses the same policy fingerprint and scores when evaluated again', () => {
  const a=decision(), b=evaluate({...INITIAL_INTENT},'none','2026-11-11T12:00:00.000Z')
  expect(a.id).not.toBe(b.id); expect(a.inputHash).toBe(b.inputHash); expect(a.candidates).toEqual(b.candidates)
 })
 it('excludes both partner-dependent routes during the outage', () => {
  const trace=evaluate(INITIAL_INTENT,'outage',at)
  expect(trace.selected).toBe('bank')
  for(const id of ['bridge','local'])expect(trace.candidates.find(c=>c.id===id)).toMatchObject({eligible:false,score:null,gates:expect.arrayContaining([expect.objectContaining({name:'Payout partner health',pass:false})])})
 })
 it('holds a high-value domestic payment when instant limit and settlement cut-off block every route', () => {
  const trace=evaluate({...INITIAL_INTENT,amount:500000,destination:'GB'},'cutoff',at)
  expect(trace.selected).toBeNull(); expect(()=>createExecution(trace)).toThrow('No route has passed all controls')
 })
 it('does not score a route when fees consume the payment', () => {
  const trace=evaluate({...INITIAL_INTENT,amount:1},'none',at)
  expect(trace.candidates.every(c=>c.score===null)).toBe(true);expect(trace.selected).toBeNull()
 })
 it('rejects invalid money amounts and prepares an editable draft from a phrase', () => {
  for(const amount of [0,-1,NaN,Infinity,1000001,42.123])expect(()=>evaluate({...INITIAL_INTENT,amount})).toThrow('Enter an amount')
  expect(parseIntent('Send £5,000.50 to Germany, cheapest route, no digital.',INITIAL_INTENT)).toMatchObject({recognised:true,intent:{amount:5000.5,destination:'DE',objective:'cheapest',digital:false}})
 })
})

describe('execution boundaries', () => {
 it('does not deliver any value at token confirmation; only confirms full beneficiary credit once', () => {
  const initial=createExecution(decision())
  const funded=runTo(initial,['approve','reserve'])
  expect(funded).toMatchObject({status:'funded',committed:false,settledAmount:0})
  const settling=runTo(funded,['commit','confirm-bridge'])
  expect(settling).toMatchObject({status:'settling',committed:true,settledAmount:0})
  const completed=advance(settling,'beneficiary-credit',at)
  expect(completed).toMatchObject({status:'completed',settledAmount:completed.active.receive})
  expect(advance(completed,'beneficiary-credit',at)).toBe(completed)
  expect(advance(completed,'second-attempt',at)).toBe(completed)
  expect(completed.events.map(e=>e.sequence)).toEqual([1,2,3,4,5])
  expect(completed.events.every(e=>e.correlationId===initial.trace.id)).toBe(true)
  expect(initial.events).toEqual([])
 })
 it('proposes fallback before commitment, preserves the original, and requires approval of revised terms', () => {
  const trace=decision(),funded=runTo(createExecution(trace),['approve','reserve']),proposal=disrupt(funded,'payout-offline',at)
  expect(proposal).toMatchObject({status:'fallback_review',active:{id:'bank'},committed:false,settledAmount:0,rerouted:false,fallbackTrace:{selected:'bank'}})
  expect(proposal.trace).toBe(trace);expect(trace.selected).toBe('bridge')
  expect(disrupt(proposal,'payout-offline',at)).toBe(proposal)
  const approved=advance(proposal,'approve-revised',at)
  expect(approved).toMatchObject({status:'funded',rerouted:true,active:{id:'bank'}})
  expect(advance(approved,'approve-revised',at)).toBe(approved)
  expect(approved.events.at(-1)?.type).toBe('FALLBACK_APPROVED')
  const held=holdFallback(proposal,'decline-revised',at)
  expect(held).toMatchObject({status:'held',settledAmount:0,committed:false})
  expect(advance(held,'advance-held',at)).toBe(held)
 })
 it('opens an investigation after commitment without changing route or issuing a second instruction', () => {
  const ex=runTo(createExecution(decision()),['approve','reserve','commit'])
  const investigated=disrupt(ex,'exception',at)
  expect(investigated).toMatchObject({status:'investigation',committed:true,active:{id:'bridge'},settledAmount:0,rerouted:false})
  expect(investigated.events.at(-1)?.type).toBe('INVESTIGATION_OPENED')
  expect(disrupt(investigated,'exception',at)).toBe(investigated)
  expect(advance(investigated,'retry-payment',at)).toBe(investigated)
 })
 it('holds when no alternative route can reach the wallet and preserves prior cut-off conditions on re-evaluation', () => {
  const wallet=STORIES.find(s=>s.id==='wallet')!
  const funded=runTo(createExecution(evaluate(wallet.intent)),['approve','reserve'])
  expect(disrupt(funded,'network-offline',at)).toMatchObject({status:'held',settledAmount:0,fallbackTrace:{selected:null}})
  const cutoff=createExecution(evaluate(INITIAL_INTENT,'cutoff',at))
  const changed=disrupt(advance(cutoff,'approve',at),'offline',at)
  expect(changed).toMatchObject({status:'fallback_review',active:{id:'bank',minutes:2880},fallbackTrace:{shock:'cutoff'}})
 })
})
