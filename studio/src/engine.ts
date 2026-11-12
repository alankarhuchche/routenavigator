export type Objective = 'fastest' | 'cheapest' | 'certainty'
export type Destination = 'US' | 'GB' | 'DE' | 'SG' | 'WALLET'
export type RouteId = 'bridge' | 'local' | 'bank' | 'instant' | 'highvalue' | 'sepa' | 'wallet'
export type Shock = 'none' | 'outage' | 'cutoff' | 'liquidity'
export interface Intent {
 amount: number
 destination: Destination
 objective: Objective
 digital: boolean
 reference: string
 amountMode?: 'recipient'
 deadlineMinutes?: number
}
export interface Gate { name: string; pass: boolean; evidence: string }
export interface Candidate { id: RouteId; name: string; subtitle: string; family: string; minutes: number; fee: number; fixedFee: number; variableFee: number; spread: number; rate: number; receive: number; sourceDebit?: number; certainty: number; gates: Gate[]; eligible: boolean; score: number | null; dimensions: { speed: number; cost: number; certainty: number } | null; legs: string[]; commitment: string }
export interface Trace { id: string; createdAt: string; policyVersion: string; fixtureVersion: string; intent: Intent; shock: Shock; unavailableRoutes: RouteId[]; weights: { speed: number; cost: number; certainty: number }; candidates: Candidate[]; selected: RouteId | null; inputHash: string; explanation: string }
export type PaymentStatus = 'review' | 'approved' | 'funded' | 'fallback_review' | 'committed' | 'settling' | 'completed' | 'investigation' | 'held'
export interface AuditEvent { sequence: number; at: string; type: string; message: string; correlationId: string; operationKey: string }
export interface Execution { trace: Trace; active: Candidate; status: PaymentStatus; committed: boolean; events: AuditEvent[]; keys: string[]; settledAmount: number; rerouted: boolean; fallbackTrace?: Trace; recoveryDecisions?: Trace[]; resumeStatus?: 'approved' | 'funded' }
export interface Problem { code: string; title: string; detail: string; retryable: boolean }
export class DomainError extends Error { problem: Problem; constructor(code: string, detail: string) { super(detail); this.problem = { code, title: 'Unable to continue', detail, retryable: false } } }
export const DESTINATIONS: Record<Destination, { name: string; city: string; currency: string; flag: string; rate: number; coordinates: [number, number]; beneficiary: string }> = {
 US: { name: 'United States', city: 'New York', currency: 'USD', flag: '🇺🇸', rate: 1.2634, coordinates: [40.71, -74.01], beneficiary: 'Atlas Manufacturing' },
 GB: { name: 'United Kingdom', city: 'Manchester', currency: 'GBP', flag: '🇬🇧', rate: 1, coordinates: [53.48, -2.24], beneficiary: 'Northline Studio' },
 DE: { name: 'Germany', city: 'Berlin', currency: 'EUR', flag: '🇩🇪', rate: 1.1682, coordinates: [52.52, 13.4], beneficiary: 'Forma Design GmbH' },
 SG: { name: 'Singapore', city: 'Singapore', currency: 'SGD', flag: '🇸🇬', rate: 1.7042, coordinates: [1.35, 103.82], beneficiary: 'Meridian Supply' },
 WALLET: { name: 'USDC wallet', city: 'New York', currency: 'USDC', flag: '◈', rate: 1, coordinates: [40.71, -74.01], beneficiary: 'Atlas Treasury Wallet' },
}
export const INITIAL_INTENT: Intent = { amount: 25000, destination: 'US', objective: 'fastest', digital: true, reference: 'INV-2026-1042' }
export const STORIES: { id: string; title: string; subtitle: string; intent: Intent; insight: string }[] = [
 { id: 'supplier', title: 'The urgent supplier', subtitle: 'London → New York · £25,000', intent: INITIAL_INTENT, insight: 'A supplier needs usable dollars today. Speed matters, but the bank account at the other end matters just as much.' },
 { id: 'cost', title: 'Every pound counts', subtitle: 'Lowest cost · £1,000', intent: { amount: 1000, destination: 'US', objective: 'cheapest', digital: true, reference: 'INV-2026-1043' }, insight: 'The same corridor, a different goal. Watch a local payout overtake the faster route when cost takes priority.' },
 { id: 'domestic', title: 'Closer to home', subtitle: 'London → Manchester · £500', intent: { amount: 500, destination: 'GB', objective: 'fastest', digital: false, reference: 'PAY-2026-0081' }, insight: 'Sometimes the best innovation is choosing the simple route. A domestic payment does not need a digital-dollar bridge.' },
 { id: 'wallet', title: 'Wallet to wallet', subtitle: 'USDC → USDC · 10,000', intent: { amount: 10000, destination: 'WALLET', objective: 'fastest', digital: true, reference: 'TRE-2026-0018' }, insight: 'A wallet is a different destination. No conversion, redemption or bank payout leg is required.' },
 { id: 'traditional', title: 'Bank rails, by choice', subtitle: 'Traditional routes · £10,000', intent: { amount: 10000, destination: 'US', objective: 'certainty', digital: false, reference: 'INV-2026-1044' }, insight: 'Customer constraints come first. Digital routes are excluded before scoring; they cannot win by being faster.' },
 { id: 'europe', title: 'Across the Channel', subtitle: 'London → Berlin · £8,500', intent: { amount: 8500, destination: 'DE', objective: 'fastest', digital: false, reference: 'INV-2026-1045' }, insight: 'A funded EUR payout uses European instant payment reachability. The FX step remains part of the end-to-end journey.' },
]
const round = (v: number) => Math.round((v + Number.EPSILON) * 100) / 100
export function money(v: number, currency = 'GBP') { return currency === 'USDC' ? `${new Intl.NumberFormat('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)} USDC` : new Intl.NumberFormat('en-GB', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v) }
export function intentAmountLabel(intent: Intent) {
 const currency = intent.amountMode === 'recipient'
  ? DESTINATIONS[intent.destination].currency
  : intent.destination === 'WALLET' ? 'USDC' : 'GBP'
 return `${money(intent.amount, currency)}${intent.amountMode === 'recipient' ? ' to recipient' : ''}`
}
export function duration(minutes: number) { return minutes < 60 ? `${minutes} min` : minutes < 1440 ? `${round(minutes / 60)} hr` : `${round(minutes / 1440)} business day${minutes > 1440 ? 's' : ''}` }
export function deadlineLabel(minutes: number) { return minutes < 120 ? `${minutes} minutes` : duration(minutes) }
export function hash(value: unknown) { const text = JSON.stringify(value); let h = 2166136261; for (let i=0; i<text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619) }; return (h >>> 0).toString(16).padStart(8, '0') }
export function validateIntent(intent: Intent) {
 if (!Number.isFinite(intent.amount) || intent.amount < 1 || intent.amount > 1000000 || round(intent.amount) !== intent.amount) throw new DomainError('INVALID_AMOUNT', 'Enter an amount from 1.00 to 1,000,000.00, with no more than two decimal places.')
 if (!Object.hasOwn(DESTINATIONS, intent.destination)) throw new DomainError('UNSUPPORTED_DESTINATION', 'Choose one of the supported demonstration destinations.')
 if (!['fastest', 'cheapest', 'certainty'].includes(intent.objective)) throw new DomainError('INVALID_OBJECTIVE', 'Choose speed, cost or certainty.')
 if (typeof intent.digital !== 'boolean') throw new DomainError('INVALID_PREFERENCE', 'Digital-route permission must be true or false.')
 if (typeof intent.reference !== 'string' || intent.reference.length > 60) throw new DomainError('INVALID_REFERENCE', 'Use a payment reference of 60 characters or fewer.')
 if (intent.amountMode !== undefined && intent.amountMode !== 'recipient') throw new DomainError('INVALID_AMOUNT_MODE', 'Choose a supported payment amount mode.')
 if (intent.deadlineMinutes !== undefined && (!Number.isInteger(intent.deadlineMinutes) || intent.deadlineMinutes < 1 || intent.deadlineMinutes > 10080)) {
  throw new DomainError('INVALID_DEADLINE', 'The simulated delivery window must be between one minute and seven days.')
 }
}

function quote(intent: Intent, rate: number, fixedFee: number, basisPoints: number) {
 if (intent.amountMode === 'recipient') {
  const principal = Math.ceil(intent.amount / rate * 100 - 1e-9) / 100
  const variableFee = round(principal * basisPoints / 10000)
  const fee = round(fixedFee + variableFee)
  return { variableFee, fee, sourceDebit: round(principal + fee), receive: intent.amount }
 }

 const variableFee = round(intent.amount * basisPoints / 10000)
 const fee = round(fixedFee + variableFee)
 return { variableFee, fee, sourceDebit: intent.amount, receive: round(Math.max(0, intent.amount - fee) * rate) }
}
export function evaluate(intent: Intent, shock: Shock = 'none', now = new Date().toISOString(), unavailableRoutes: RouteId[] = []): Trace {
 validateIntent(intent)
 if (!['none','outage','cutoff','liquidity'].includes(shock)) throw new DomainError('INVALID_SHOCK', 'Choose a supported simulation condition.')
 const d = DESTINATIONS[intent.destination], wallet = intent.destination === 'WALLET', domestic = intent.destination === 'GB', cross = !domestic && !wallet
 const gate = (name: string, pass: boolean, yes: string, no: string): Gate => ({ name, pass, evidence: pass ? yes : no })
 const catalogue: { id: RouteId; name: string; subtitle: string; family: string; minutes: number; fixed: number; bps: number; certainty: number; eligible: boolean; endpoint: string; extra: (sourceDebit: number) => Gate[]; legs: string[]; commitment: string }[] = [
 { id:'bridge', name:'Digital-dollar bridge', subtitle:'Convert · bridge · pay out', family:'STABLECOIN_BRIDGE_FIAT_PAYOUT', minutes:38, fixed:8, bps:25, certainty:89, eligible:intent.destination==='US', endpoint:'Requires GBP funding and a US bank destination.', extra:sourceDebit=>[gate('Digital-route permission', intent.digital, 'Customer permits digital routes.', 'Customer has excluded digital routes.'), gate('Payout partner health',shock!=='outage','Simulated USD payout partner available.','USD payout partner unavailable; bank payout cannot complete.'), gate('Bridge liquidity',shock!=='liquidity' && sourceDebit<=100000,'Reserved liquidity covers the full transfer.','Insufficient bridge liquidity for the full amount.'), gate('Wallet screening', true,'Simulated screening and network checks passed.','')], legs:['GBP funding','GBP → USDC conversion','USDC bridge transfer','USDC redemption','USD bank credit'], commitment:'USDC bridge transfer committed' },
 { id:'local', name:'Local payout', subtitle:'Local network · direct bank credit', family:'LOCAL_PAYOUT_PARTNER', minutes:intent.destination==='SG'?360:240, fixed:1.5, bps:9, certainty:94, eligible:cross && intent.destination!=='DE', endpoint:'Requires a supported cross-border bank destination.', extra:sourceDebit=>[gate('Payout partner health',shock!=='outage','Simulated local payout partner available.','Shared payout partner unavailable.'), gate('Partner payment limit', sourceDebit<=50000,'Within the £50,000 partner payment limit.','Above the £50,000 partner payment limit.')], legs:['GBP funding',`GBP → ${d.currency} conversion`,'Local payout instruction',`${d.currency} bank credit`], commitment:'Local payout instruction accepted' },
 { id:'bank', name:'International bank transfer', subtitle:'Correspondent banking · tracked', family:'CORRESPONDENT_BANKING', minutes:shock==='cutoff'?2880:1440, fixed:18, bps:35, certainty:99, eligible:cross, endpoint:'Requires a cross-border bank-account destination.', extra:sourceDebit=>[gate('Correspondent reachability',true,'Simulated correspondent bank supports this corridor.',''), gate('Payment limit',sourceDebit<=1000000,'Within the £1,000,000 bank transfer limit.','Amount exceeds bank transfer limit.')], legs:['GBP funding','FX conversion','Correspondent settlement',`${d.currency} bank credit`], commitment:'Correspondent instruction accepted' },
 { id:'instant', name:'Instant UK bank transfer', subtitle:'Domestic · direct bank credit', family:'UK_DOMESTIC_INSTANT', minutes:2, fixed:0.2, bps:0, certainty:98, eligible:domestic, endpoint:'Requires GBP funding and a UK bank destination.', extra:sourceDebit=>[gate('Instant payment limit',sourceDebit<=250000,'Within the £250,000 simulated instant payment limit.','Above the £250,000 simulated instant payment limit.')], legs:['GBP funding','Instant payment instruction','GBP bank credit'], commitment:'Instant instruction accepted' },
 { id:'highvalue', name:'High-value UK bank transfer', subtitle:'Domestic · high-value settlement', family:'UK_HIGH_VALUE_DOMESTIC', minutes:60, fixed:24, bps:0, certainty:99, eligible:domestic, endpoint:'Requires GBP funding and a UK bank destination.', extra:()=>[gate('Settlement cut-off',shock!=='cutoff','Within the simulated settlement window.','Settlement cut-off has passed.')], legs:['GBP funding','High-value instruction','GBP bank credit'], commitment:'High-value settlement instruction accepted' },
 { id:'sepa', name:'European instant payout', subtitle:'FX-funded · EUR bank credit', family:'EUROPEAN_INSTANT_CREDIT_TRANSFER', minutes:12, fixed:1.5, bps:12, certainty:97, eligible:intent.destination==='DE', endpoint:'Requires a supported EUR bank destination.', extra:()=>[gate('EUR reachability',true,'Simulated beneficiary supports instant EUR credit.',''),gate('Funding liquidity',shock!=='liquidity','EUR payout funding is available.','Insufficient EUR payout funding.')], legs:['GBP funding','GBP → EUR conversion','Instant EUR payout','EUR bank credit'], commitment:'EUR instant instruction accepted' },
 { id:'wallet', name:'Digital-dollar wallet transfer', subtitle:'USDC · wallet to wallet', family:'WALLET_TO_WALLET_STABLECOIN', minutes:3, fixed:0.5, bps:0, certainty:92, eligible:wallet, endpoint:'Requires a USDC source and a wallet destination; a bank account cannot receive this route.', extra:()=>[gate('Digital-route permission',intent.digital,'Customer permits digital routes.','Customer has excluded digital routes.'),gate('Wallet and network screening',true,'Simulated source, destination and network screening passed.','')], legs:['USDC funding','Network transfer','Beneficiary wallet confirmation'], commitment:'USDC network transfer submitted' },
 ]
 const weights = intent.objective==='fastest' ? {speed:0.65,cost:0.15,certainty:0.2} : intent.objective==='cheapest' ? {speed:0.06,cost:0.89,certainty:0.05} : {speed:0.01,cost:0.01,certainty:0.98}
 const candidates: Candidate[] = catalogue.map(c => {
  const pricing = quote(intent, d.rate, c.fixed, c.bps)
  const gates = [
   gate('Destination eligibility', c.eligible, 'Source asset and beneficiary endpoint match.', c.endpoint),
   gate('Compliance & fraud controls', true, 'Simulated sanctions, fraud and eligibility fixtures pass.', ''),
   ...c.extra(pricing.sourceDebit),
  ]
  if (unavailableRoutes.length) {
   gates.push(gate('Execution route health', !unavailableRoutes.includes(c.id),
    'Route remains available after the execution exception.', 'The active route or its shared payout provider is unavailable.'))
  }
  gates.push(gate('Amount after fees', pricing.receive > 0,
   'Estimated fees leave a positive beneficiary amount.', 'Estimated fees equal or exceed the source amount.'))
  if (intent.deadlineMinutes !== undefined) {
   const window = deadlineLabel(intent.deadlineMinutes)
   gates.push(gate('Delivery deadline', c.minutes <= intent.deadlineMinutes,
    `Estimated ${duration(c.minutes)} to usable funds fits the ${window} delivery window.`,
    `Estimated ${duration(c.minutes)} to usable funds exceeds the ${window} delivery window.`))
  }

  const eligible = gates.every(g => g.pass)
  const dimensions = eligible ? {
   speed: round(100 * Math.exp(-c.minutes / 400)),
   cost: round(Math.max(0, 100 - (pricing.fee / pricing.sourceDebit * 10000) / 1.2)),
   certainty: c.certainty,
  } : null
  const score = dimensions
   ? round(dimensions.speed * weights.speed + dimensions.cost * weights.cost + dimensions.certainty * weights.certainty)
   : null
  return {
   id: c.id, name: c.name, subtitle: c.subtitle, family: c.family, minutes: c.minutes,
   ...pricing, fixedFee: c.fixed, spread: c.bps, rate: d.rate, certainty: c.certainty,
   gates, eligible, score, dimensions, legs: c.legs, commitment: c.commitment,
  }
 }).sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || a.id.localeCompare(b.id))

 const winner = candidates.find(c => c.eligible)
 const policyVersion = '3.1'
 const inputHash = hash({ intent, shock, unavailableRoutes, policy: policyVersion, fixtures: '2026-11-demo' })
 const sourceCurrency = wallet ? 'USDC' : 'GBP'
 let explanation = 'No route meets all conditions. Hold the payment for review.'
 if (winner && intent.amountMode === 'recipient') {
  explanation = `${winner.name} is expected to deliver ${money(winner.receive, d.currency)} in ${duration(winner.minutes)} for a total debit of ${money(winner.sourceDebit!, sourceCurrency)}. The quote includes ${money(winner.fee, sourceCurrency)} in fees.`
 } else if (winner) {
  const priority = intent.objective === 'fastest' ? 'speed' : intent.objective === 'cheapest' ? 'cost' : 'settlement certainty'
  explanation = `${winner.name} offers ${duration(winner.minutes)} to beneficiary usable ${wallet ? 'USDC' : 'funds'} for ${money(winner.fee, sourceCurrency)}. It has the strongest ${priority} fit among routes that pass every blocking control.`
 }
 if (winner?.id === 'bridge') explanation += ' Completion requires confirmed USD credit to the beneficiary bank account.'
 if (winner?.id === 'bank') explanation += ' SWIFT carries messages, and gpi can provide tracking where supported.'
 return {
  id: `RN-${hash({ inputHash, now }).toUpperCase()}`, createdAt: now, policyVersion,
  fixtureVersion: '2026-11-demo', intent: { ...intent }, shock, unavailableRoutes: [...unavailableRoutes],
  weights, candidates, selected: winner?.id ?? null, inputHash, explanation,
 }
}
export function selectedRoute(trace: Trace) { return trace.candidates.find(c=>c.id===trace.selected)??null }
export function createExecution(trace: Trace): Execution { const active=selectedRoute(trace); if(!active)throw new DomainError('NO_EXECUTABLE_ROUTE','No route has passed all controls. Resolve the blocking condition first.'); return { trace,active,status:'review',committed:false,events:[],keys:[],settledAmount:0,rerouted:false } }
function append(ex: Execution, status: PaymentStatus, type: string, message: string, key: string, now: string, extra: Partial<Execution> = {}): Execution { return {...ex,...extra,status,keys:[...ex.keys,key],events:[...ex.events,{sequence:ex.events.length+1,at:now,type,message,correlationId:ex.trace.id,operationKey:key}]} }
export function advance(ex: Execution, key: string, now = new Date().toISOString()): Execution {
 if(!key)throw new DomainError('IDEMPOTENCY_KEY_REQUIRED','An operation key is required.')
 if(ex.keys.includes(key))return ex
 switch(ex.status) {
 case 'review':return append(ex,'approved','AUTHORISED','Customer approved the simulated payment and displayed quote.',key,now)
 case 'fallback_review':return append(ex,ex.resumeStatus??'approved','FALLBACK_APPROVED','Customer approved the revised quote. The fallback route may now proceed.',key,now,{rerouted:true})
 case 'approved': {
  const sourceCurrency = ex.trace.intent.destination === 'WALLET' ? 'USDC' : 'GBP'
  const debit = ex.active.sourceDebit ?? ex.trace.intent.amount
  return append(ex, 'funded', 'FUNDS_RESERVED', `${money(debit, sourceCurrency)} reserved for ${ex.active.name}.`, key, now)
 }
 case 'funded':return append(ex,'committed','POINT_OF_NO_RETURN',`${ex.active.commitment}. Rerouting is now locked.`,key,now,{committed:true})
 case 'committed':return append(ex,'settling','SETTLEMENT_IN_PROGRESS',ex.active.id==='bridge'?'Bridge transfer confirmed. Redemption and USD bank payout are still pending.':'Instruction confirmed. Beneficiary usable value is still pending.',key,now)
 case 'settling':return append(ex,'completed','BENEFICIARY_VALUE_CONFIRMED',`${money(ex.active.receive,DESTINATIONS[ex.trace.intent.destination].currency)} confirmed at the beneficiary endpoint.`,key,now,{settledAmount:ex.active.receive})
 default:return ex
 }
}
export function disrupt(ex: Execution, key: string, now = new Date().toISOString()): Execution {
 if (!key) throw new DomainError('IDEMPOTENCY_KEY_REQUIRED', 'An operation key is required.')
 if (ex.keys.includes(key) || ['completed', 'investigation', 'held', 'review', 'fallback_review'].includes(ex.status)) return ex
 const sharesPayoutPartner = ex.active.id === 'bridge' || ex.active.id === 'local'
 const incident = sharesPayoutPartner ? 'The shared payout partner went offline' : `${ex.active.name} became unavailable`
 if (ex.committed) {
  return append(ex, 'investigation', 'INVESTIGATION_OPENED',
   `${incident} after commitment. Reconcile the original instruction to prevent a duplicate payment.`, key, now)
 }

 const newFailures: RouteId[] = sharesPayoutPartner ? ['bridge', 'local'] : [ex.active.id]
 const affected = [...new Set([...(ex.fallbackTrace?.unavailableRoutes ?? []), ...newFailures])].sort()
 const activeIntent = ex.rerouted ? ex.fallbackTrace?.intent ?? ex.trace.intent : ex.trace.intent
 const changed = evaluate(activeIntent, ex.trace.shock, now, affected)
 const replacement = selectedRoute(changed)
 const recovery = { fallbackTrace: changed, recoveryDecisions: [...(ex.recoveryDecisions ?? []), changed] }
 if (!replacement) {
  const reason = activeIntent.deadlineMinutes === undefined
   ? 'No executable alternative is available.'
   : `No available route can meet the ${deadlineLabel(activeIntent.deadlineMinutes)} delivery window.`
  return append(ex, 'held', 'PAYMENT_HELD', `${incident} before commitment. ${reason} The payment is held.`, key, now, recovery)
 }

 const sourceCurrency = activeIntent.destination === 'WALLET' ? 'USDC' : 'GBP'
 const sameDebit = replacement.sourceDebit === ex.active.sourceDebit || activeIntent.amountMode !== 'recipient'
 return append(ex, 'fallback_review', 'FALLBACK_PROPOSED',
  `${ex.active.name} degraded before commitment. ${replacement.name} passed the controls with ${money(replacement.fee, sourceCurrency)} in fees. Approval of the revised quote is required.`,
  key, now, { ...recovery, active: replacement, resumeStatus: ex.status === 'funded' && sameDebit ? 'funded' : 'approved' })
}

export function proposeLaterDelivery(ex: Execution, deadlineMinutes: number, key: string, now = new Date().toISOString()): Execution {
 if (!key) throw new DomainError('IDEMPOTENCY_KEY_REQUIRED', 'An operation key is required.')
 if (ex.keys.includes(key)) return ex
 const previousDeadline = ex.fallbackTrace?.intent.deadlineMinutes ?? ex.trace.intent.deadlineMinutes
 if (ex.committed || ex.status !== 'held' || ex.events.at(-1)?.type !== 'PAYMENT_HELD' || previousDeadline === undefined) {
  throw new DomainError('DELIVERY_CHANGE_UNAVAILABLE', 'A delivery change can only be quoted for a payment held before commitment.')
 }
 if (deadlineMinutes <= previousDeadline) {
  throw new DomainError('DEADLINE_NOT_EXTENDED', 'Choose a delivery window longer than the one already evaluated.')
 }

 const revisedIntent = { ...ex.trace.intent, deadlineMinutes }
 const revised = evaluate(revisedIntent, ex.trace.shock, now, ex.fallbackTrace?.unavailableRoutes)
 const replacement = selectedRoute(revised)
 const recovery = { fallbackTrace: revised, recoveryDecisions: [...(ex.recoveryDecisions ?? []), revised] }
 if (!replacement) {
  return append(ex, 'held', 'PAYMENT_HELD', 'The later delivery window still has no available route.', key, now, recovery)
 }

 return append(ex, 'fallback_review', 'DELIVERY_CHANGE_PROPOSED',
  `A ${deadlineLabel(deadlineMinutes)} delivery window makes ${replacement.name} eligible. The revised quote requires approval before the new debit is reserved.`,
  key, now, { ...recovery, active: replacement, resumeStatus: 'approved' })
}
export function holdFallback(ex:Execution,key:string,now=new Date().toISOString()):Execution {
 if(!key)throw new DomainError('IDEMPOTENCY_KEY_REQUIRED','An operation key is required.')
 return ex.status==='fallback_review'&&!ex.keys.includes(key)?append(ex,'held','REVISED_QUOTE_DECLINED','Customer declined the revised quote. Payment held without issuing a second instruction.',key,now):ex
}
export function parseIntent(text: string, base: Intent): { intent: Intent; recognised: boolean } {
 const lower=text.toLowerCase(), amount=text.match(/(?:£|gbp\s*|usdc\s*)([\d,]+(?:\.\d{1,2})?)/i)??text.match(/([\d,]+(?:\.\d{1,2})?)\s*(?:gbp|usdc)/i)
 const destination=/wallet|usdc.*usdc/.test(lower)?'WALLET':/germany|berlin|\beur\b|europe/.test(lower)?'DE':/singapore|\bsgd\b/.test(lower)?'SG':/manchester|domestic|\buk\b|united kingdom/.test(lower)&& !/\bus\b|america|new york|usd/.test(lower)?'GB':/\bus\b|america|new york|usd/.test(lower)?'US':base.destination
 const objective=/cheap|cost|saving/.test(lower)?'cheapest':/certain|traditional|bank only/.test(lower)?'certainty':/fast|urgent|today/.test(lower)?'fastest':base.objective
 const digital=/no digital|traditional|bank only/.test(lower)?false:base.digital
 return { intent:{...base,amount:amount?Number(amount[1].replaceAll(',','')):base.amount,destination,objective,digital},recognised:!!amount || destination!==base.destination || objective!==base.objective || digital!==base.digital }
}
