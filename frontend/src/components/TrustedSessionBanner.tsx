import { Bot, Fingerprint, LockKeyhole, ShieldCheck } from 'lucide-react'
import { AgentContextGateway } from './AgentContextGateway'

const sessionSignals = [
  {
    icon: Fingerprint,
    label: 'Passkey verified',
    detail: 'Device-bound authentication confirmed',
  },
  {
    icon: Bot,
    label: 'Trusted banking agent active',
    detail: 'Advice-only mode',
  },
  {
    icon: ShieldCheck,
    label: 'Consent scoped',
    detail: 'Route advice only',
  },
  {
    icon: LockKeyhole,
    label: 'Execution locked',
    detail: 'Final approval required',
  },
]

export function TrustedSessionBanner() {
  return (
    <section className="trusted-session" aria-label="Secure payment session">
      <div className="trusted-session-copy">
        <p className="eyebrow">Secure payment session</p>
        <h2>Trusted banking agent active</h2>
        <p>
          Your trusted banking agent can help structure the payment intent. It cannot execute money movement without
          your final approval.
        </p>
      </div>
      <div className="trusted-session-grid">
        {sessionSignals.map((signal) => {
          const Icon = signal.icon
          return (
            <div className="trusted-session-card" key={signal.label}>
              <Icon size={18} aria-hidden="true" />
              <div>
                <strong>{signal.label}</strong>
                <span>{signal.detail}</span>
              </div>
            </div>
          )
        })}
      </div>
      <AgentContextGateway />
    </section>
  )
}
