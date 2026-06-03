import { ShieldAlert } from 'lucide-react'

export function DisclaimerBanner() {
  return (
    <div className="disclaimer" role="note">
      <ShieldAlert size={18} aria-hidden="true" />
      <span>Simulated demo only. No live payment rails, bank accounts, wallets, FX, sanctions, stablecoin networks or customer data.</span>
    </div>
  )
}
