# Architecture Context

## Detected Stack

- Frontend: React 19 + Vite + TypeScript
- Map: Leaflet / React-Leaflet
- Backend: Java 21 + Quarkus
- UI model: DecisionTrace-driven route, evidence and journey rendering
- Deployment target: GCP Cloud Run

## Current Key Files

- `frontend/src/App.tsx`
- `frontend/src/App.css`
- `frontend/src/components/PaymentIntentIntake.tsx`
- `frontend/src/components/TrustedSessionBanner.tsx`
- `frontend/src/components/AgentContextGateway.tsx`
- `frontend/src/components/IntentConfirmationCard.tsx`
- `frontend/src/components/RouteIntelligencePanel.tsx`
- `frontend/src/components/RecommendationHeroCard.tsx`
- `frontend/src/components/LeafletRouteMap.tsx`
- `frontend/src/components/FinalApprovalCard.tsx`
- `frontend/src/components/PaymentTracker.tsx`
- `frontend/src/components/ControlRoom.tsx`
- `backend/src/main/resources/data`

## Phase 1 Scope Note

Phase 1 has intentionally avoided backend changes so far. Most delivery has been frontend-first UI, copy, evidence and journey framing work over existing trace/scenario data.

Backend, route decision logic, deployment files and API contracts must remain unchanged unless a future phase explicitly scopes them.

