export interface CustomerInsight {
  id: string
  label: string
  value: string
  summary: string
  signal: 'purpose' | 'pattern' | 'beneficiary' | 'preference' | 'history' | 'risk' | 'consent'
  source: string
  use: 'Context signal' | 'Bounded ranking signal' | 'Consent boundary'
}

export interface CustomerInsightProfile {
  purposeDetected: string
  purposeConfidence: 'Low' | 'Medium' | 'High'
  usualMovementPattern: string
  typicalAmountRange: string
  beneficiaryRelationship: string
  trackingPreference: 'Low' | 'Medium' | 'High'
  speedPreference: 'Low' | 'Medium' | 'High'
  feeSensitivity: 'Low' | 'Medium' | 'High'
  previousRouteExperience: string
  riskNormality: string
  digitalRoutesAllowed: string
  consentForPersonalisedRouting: boolean
  lastReviewed: string
  insightSource: string
  insights: CustomerInsight[]
}

export function customerFitReasons(profile: CustomerInsightProfile): string[] {
  return [
    `This looks like ${profile.purposeDetected.toLowerCase()}, where speed and certainty matter.`,
    `The amount is within the usual movement range of ${profile.typicalAmountRange}.`,
    `The beneficiary is a ${profile.beneficiaryRelationship.toLowerCase()}.`,
    `The customer usually prefers tracked, reliable movements with ${profile.trackingPreference.toLowerCase()} tracking need.`,
    `The explanation notes prior experience: ${profile.previousRouteExperience.toLowerCase()}.`,
  ]
}

export const demoCustomerInsightProfile: CustomerInsightProfile = {
  purposeDetected: 'Family support',
  purposeConfidence: 'High',
  usualMovementPattern: 'Regular UK to India support movement',
  typicalAmountRange: 'GBP 1,000-7,000',
  beneficiaryRelationship: 'Previously paid beneficiary',
  trackingPreference: 'High',
  speedPreference: 'High',
  feeSensitivity: 'Medium',
  previousRouteExperience: 'One previous delay on a similar route family',
  riskNormality: 'Amount and beneficiary are within normal pattern',
  digitalRoutesAllowed: 'Customer has allowed digital route options',
  consentForPersonalisedRouting: true,
  lastReviewed: 'Demo static profile, reviewed for this prototype',
  insightSource: 'Demo customer profile',
  insights: [
    {
      id: 'purpose',
      label: 'Purpose detected',
      value: 'Family support',
      summary: 'The request resembles regular support movement rather than one-off treasury activity.',
      signal: 'purpose',
      source: 'Demo customer profile',
      use: 'Bounded ranking signal',
    },
    {
      id: 'pattern',
      label: 'Usual movement pattern',
      value: 'Regular UK to India support movement',
      summary: 'The destination corridor and movement style match a known demo pattern.',
      signal: 'pattern',
      source: 'Demo customer profile',
      use: 'Bounded ranking signal',
    },
    {
      id: 'beneficiary',
      label: 'Beneficiary relationship',
      value: 'Previously paid beneficiary',
      summary: 'The beneficiary is represented as known in the mocked customer context.',
      signal: 'beneficiary',
      source: 'Demo customer profile',
      use: 'Bounded ranking signal',
    },
    {
      id: 'preference',
      label: 'Customer preference',
      value: 'High speed and tracking preference',
      summary: 'The customer usually values certainty and visibility over lowest possible fee.',
      signal: 'preference',
      source: 'Demo customer profile',
      use: 'Bounded ranking signal',
    },
    {
      id: 'history',
      label: 'Previous route experience',
      value: 'One previous delay on a similar route family',
      summary: 'A route-family-specific delay can apply a small bounded fit penalty after controls pass.',
      signal: 'history',
      source: 'Demo customer profile',
      use: 'Context signal',
    },
    {
      id: 'risk',
      label: 'Risk normality',
      value: 'Within normal pattern',
      summary: 'Amount and beneficiary are represented as normal for this demo customer.',
      signal: 'risk',
      source: 'Demo customer profile',
      use: 'Bounded ranking signal',
    },
    {
      id: 'consent',
      label: 'Consent',
      value: 'Personalised routing context allowed',
      summary: 'Customer insight is visible and can be switched off for this analysis.',
      signal: 'consent',
      source: 'Demo customer profile',
      use: 'Consent boundary',
    },
  ],
}
