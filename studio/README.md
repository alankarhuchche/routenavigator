# Route Navigator Studio

Route Navigator opens with a simulated supplier payment. A UK buyer needs Atlas Manufacturing to receive US$30,000 in its New York bank account within 90 minutes. The case compares routes for the same invoice and replays one outage on either side of settlement commitment.

## Present it in two minutes

1. **Choose a route.** All three quotes target US$30,000. The bridge takes 38 minutes and debits £23,812.81, including a £67.36 fee. Local payout costs £44.49 less and takes four hours, which misses the deadline.
2. **Simulate payout outage.** The bridge and local payout share the offline partner. International bank transfer takes one business day, so the system holds the payment. If the supplier can accept later delivery, select **Quote next business day**. Approve the revised £23,846.56 debit or keep the payment held. The approved bank simulation confirms the original US$30,000 amount.
3. **Replay outage after commitment.** The original bridge instruction has already committed and the USD credit remains unconfirmed. The system opens an investigation and locks rerouting. Open **Inspect decision and events** to see the approval, funds reservation, commitment and investigation.
4. **Open Decision ledger.** The two replays have separate records. Inspect the original decision, the delivery windows considered, any revised approval and the execution events. Export either record or the whole ledger as JSON.

Open **Payment planner** to set a source amount and compare routes by speed, cost or certainty. The planner has six example payments. **Disruption lab** applies an outage, liquidity shortage or cut-off to the planner’s current intent.

## Run and verify locally

Use Node.js 22.12+ and npm. To launch the dev server:

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:5179/`. With the server running and Google Chrome installed:

```sh
npm test
npm run test:e2e
npm run build
```

`dist/` is a static deployment. Serve it over HTTP, as the map geometry is loaded from the same origin.

## How the demo works

- `src/engine.ts` validates payment intent and calculates quotes from synthetic fixtures. The case fixes the recipient amount and rounds the source principal up to a penny before adding fees. A delivery deadline is an eligibility requirement. Only eligible routes receive scores, and the decision record contains the criteria and weights.
- The execution state machine requires approval and reserves the source debit before commitment. An outage before commitment triggers route re-evaluation. If the revised terms are approved, the simulator reserves the revised debit before sending. An outage after commitment opens an investigation. The record preserves each evaluated delivery window, approval and execution event.
- The planner, map, trace drawer and ledger read the same decision record. The simulation is browser-local with up to 30 retained decisions. It demonstrates the behavior of a traceable decision system; it is not an authoritative audit store or an integration with a bank.
- The full application, fixed-rate snapshot, map and typefaces are served locally. No data is sent to payment rails, wallets, sanctions services, market data providers or language models. The browser's JSON download is the evidence handoff.

Cartography: [Natural Earth public-domain data](https://www.naturalearthdata.com/about/terms-of-use/). Typography: Manrope, [SIL Open Font License](public/manrope-OFL.txt).
