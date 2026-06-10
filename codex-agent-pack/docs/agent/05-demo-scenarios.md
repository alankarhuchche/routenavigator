# 05 — Demo Scenarios

## SCN-001 — UK instant payment
Customer request: Send £500 to a UK beneficiary as quickly as possible.
Expected winner: Instant UK bank transfer.
Internal family: UK_DOMESTIC_INSTANT.
Why: Domestic, GBP-to-GBP, low value, beneficiary reachable, no FX or cross-border complexity.

## SCN-002 — USD to US fastest
Customer request: Send USD 10,000 to a US bank account from GBP. Fastest route. Cost secondary. Tracking required. Digital routes allowed.
Expected winner: Fast digital-dollar route.
Internal family: STABLECOIN_BRIDGE_FIAT_PAYOUT.
Why: Lowest estimated time to beneficiary usable value after gates pass. GBP/USD FX, USDC liquidity, redemption partner, payout partner, wallet screening and route health all pass.
Important: Not selected because customer chose stablecoin. Customer chose fastest and allowed digital routes.

## SCN-003 — USDC wallet-to-wallet
Customer request: Send 10,000 USDC from my wallet to beneficiary wallet. Fastest route.
Expected winner: Digital-dollar wallet transfer.
Internal family: WALLET_TO_WALLET_STABLECOIN.
Why: Source asset and target endpoint match. No FX, redemption, bank payout or correspondent leg required. Wallet/network/screening gates pass.

## SCN-004 — USD cheapest
Customer request: Send USD 1,000 to a US bank account from GBP. Cheapest route. Speed not critical.
Expected winner: Local payout route.
Internal family: LOCAL_PAYOUT_PARTNER.
Why: Lowest total expected cost after FX and partner fee among executable routes.

## SCN-005 — Traditional bank transfer only
Customer request: Send USD 10,000 to a US bank account from GBP. Use traditional bank transfer only. Tracking preferred.
Expected winner: International bank transfer.
Internal family: CORRESPONDENT_BANKING.
Why: Customer constraint excludes digital/tokenised routes. Correspondent banking passes gates and provides the strongest fit for traditional bank-account transfer with tracking capability where supported.
Terminology: SWIFT is messaging; gpi is tracking capability.

## SCN-006 — Fallback before point-of-no-return
Customer request: Same as SCN-002.
Initial winner: Fast digital-dollar route.
Simulated event: US payout partner unavailable before token transfer commitment.
Fallback winner: International bank transfer.
Why: PONR not reached, fallback route passes gates. Append fallback event; do not overwrite original decision.

## Optional scenarios
- UK high-value urgent payment -> High-value UK bank transfer.
- EUR to Germany -> European instant bank transfer.
- Same-platform transfer -> Same-platform transfer.
- Bank token route -> future-state tokenised deposit route.
- Tokenised securities/collateral -> separate future settlement-orchestration zone, not core payment routing.
