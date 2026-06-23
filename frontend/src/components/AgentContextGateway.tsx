import { Bot, CheckCircle2, FileClock, LockKeyhole, ShieldCheck, XCircle } from 'lucide-react'

const allowedActions = [
  'Structure payment intent',
  'Request route options',
  'Explain recommendation',
  'Summarise rejected alternatives',
]

const blockedActions = [
  'Execute payment',
  'Create or amend beneficiary',
  'Change limits',
  'Change destination',
  'Approve payment',
  'Cancel payment',
]

const allowedTools = [
  'Route catalogue',
  'Scheme windows',
  'FX/cut-off view',
  'Route health summary',
  'Decision trace',
  'Explanation generator',
]

const blockedTools = [
  'Payment execution',
  'Beneficiary management',
  'Limit management',
  'Account configuration',
  'Credential or security settings',
]

const auditEvents = [
  'Session secured',
  'Agent connected in advice-only mode',
  'Intent structured',
  'Route options requested',
  'Recommendation explained',
  'Awaiting customer approval',
]

export function AgentContextGateway() {
  return (
    <details className="agent-gateway">
      <summary className="agent-gateway-summary">
        <span>
          <Bot size={16} aria-hidden="true" />
          View agent controls
        </span>
        <small>Mocked demo controls · advice-only mode</small>
      </summary>

      <div className="agent-gateway-body">
        <div className="agent-gateway-head">
          <div>
            <p className="eyebrow">Bank-controlled context</p>
            <h3>Agent context gateway</h3>
            <p>
              Your trusted banking agent is connected in advice-only mode. The bank controls what it can read,
              request and explain.
            </p>
          </div>
          <span>
            <ShieldCheck size={15} aria-hidden="true" />
            Execution boundary: customer approval required
          </span>
        </div>

        <div className="agent-gateway-grid">
          <section className="agent-gateway-card">
            <div className="agent-gateway-card-title">
              <Bot size={16} aria-hidden="true" />
              <h4>Agent identity</h4>
            </div>
            <dl className="agent-facts">
              <div><dt>Agent</dt><dd>Trusted banking agent</dd></div>
              <div><dt>Mode</dt><dd>Advice only</dd></div>
              <div><dt>Session</dt><dd>Scoped to this payment journey</dd></div>
              <div><dt>Status</dt><dd>Active</dd></div>
            </dl>
          </section>

          <section className="agent-gateway-card">
            <div className="agent-gateway-card-title">
              <CheckCircle2 size={16} aria-hidden="true" />
              <h4>Consent scope</h4>
            </div>
            <AccessList title="Allowed" items={allowedActions} tone="allow" />
            <AccessList title="Not allowed" items={blockedActions} tone="block" />
          </section>

          <section className="agent-gateway-card">
            <div className="agent-gateway-card-title">
              <LockKeyhole size={16} aria-hidden="true" />
              <h4>Tool access</h4>
            </div>
            <AccessList title="Allowed tools" items={allowedTools} tone="allow" />
            <AccessList title="Blocked tools" items={blockedTools} tone="block" />
          </section>

          <section className="agent-gateway-card">
            <div className="agent-gateway-card-title">
              <FileClock size={16} aria-hidden="true" />
              <h4>Representative audit trail</h4>
            </div>
            <ol className="agent-audit-list">
              {auditEvents.map((event, index) => (
                <li key={event}>
                  <span>{index + 1}</span>
                  {event}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="agent-protocol-row">
          <span>Protocol readiness: MCP-ready context layer</span>
          <span>Bank-controlled tools</span>
          <span>Mocked demo, no real tool calls</span>
        </div>
      </div>
    </details>
  )
}

function AccessList({ title, items, tone }: { title: string; items: string[]; tone: 'allow' | 'block' }) {
  const Icon = tone === 'allow' ? CheckCircle2 : XCircle
  return (
    <div className={`agent-access-list agent-access-${tone}`}>
      <strong>{title}</strong>
      <ul>
        {items.map(item => (
          <li key={item}>
            <Icon size={13} aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
