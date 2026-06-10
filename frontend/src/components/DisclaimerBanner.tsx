import { Info } from 'lucide-react'

export function DisclaimerBanner() {
  return (
    <div className="disclaimer" role="note">
      <Info size={14} aria-hidden="true" />
      <span>Simulated demo only — no live payment rails, bank accounts, wallets, FX, sanctions, stablecoin networks or customer data.</span>
    </div>
  )
}
