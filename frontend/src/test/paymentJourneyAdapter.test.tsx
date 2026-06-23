import { describe, expect, it } from 'vitest'
import {
  buildJourneyNodes,
  buildPaymentJourney,
  buildRoutePaths,
  getJourneyNodeDetails,
  selectAlternativeRoute,
} from '../paymentJourneyAdapter'
import { demoScenarios } from '../data/demoData'

const swiftTrace = demoScenarios.find((scenario) => scenario.id === 'SCN-007')!.trace
const digitalTrace = demoScenarios.find((scenario) => scenario.id === 'SCN-002')!.trace

describe('paymentJourneyAdapter', () => {
  it('creates an international/SWIFT journey with banking and settlement nodes', () => {
    const nodes = buildJourneyNodes(swiftTrace)
    const nodeNames = nodes.map((node) => node.name)

    expect(nodeNames).toEqual([
      'Customer',
      'Sending bank',
      'FX',
      'SWIFT / rail',
      'Intermediary',
      'Local clearing',
      'Beneficiary bank',
      'Beneficiary credit',
    ])
    expect(nodes.find((node) => node.id === 'local-clearing')?.status).toBe('Point of no return')
    expect(nodes.find((node) => node.id === 'beneficiary-credit')?.status).toBe('Finality boundary')
  })

  it('creates a digital asset journey with bridge, wallet screening and transfer nodes', () => {
    const nodes = buildJourneyNodes(digitalTrace)
    const nodeNames = nodes.map((node) => node.name)

    expect(nodeNames).toContain('Digital bridge')
    expect(nodeNames).toContain('Wallet screening')
    expect(nodeNames).toContain('Stablecoin transfer')
    expect(nodes.find((node) => node.id === 'digital-transfer')?.expertNote).toContain(
      'No money has moved before approval',
    )
  })

  it('identifies recommended route paths distinctly from alternatives', () => {
    const routePaths = buildRoutePaths(digitalTrace)
    const alternative = selectAlternativeRoute(digitalTrace)

    expect(routePaths.find((route) => route.status === 'SELECTED')?.label).toBe('Fast digital-dollar route')
    expect(alternative?.status).toBe('EXCLUDED')
    expect(alternative?.label).toBe('Digital-dollar wallet transfer')
  })

  it('returns a complete payment journey model with timeline, finality and PONR data', () => {
    const journey = buildPaymentJourney(swiftTrace)

    expect(journey.centre).toEqual(expect.arrayContaining([expect.any(Number), expect.any(Number)]))
    expect(journey.timelineLabels).toEqual([
      'Created',
      'Validated',
      'FX/cut-off checked',
      'Released',
      'Finality boundary',
      'Beneficiary credited',
    ])
    expect(getJourneyNodeDetails(journey.nodes, 'local-clearing')?.customerMeaning).toContain(
      'recall may be limited',
    )
  })

  it('keeps adapter copy representative and avoids live telemetry or guaranteed settlement claims', () => {
    const allText = buildPaymentJourney(digitalTrace).nodes
      .flatMap((node) => [node.name, node.status, node.customerMeaning, node.expertNote])
      .join(' ')
      .toLowerCase()

    expect(allText).toContain('not live network telemetry')
    expect(allText).toContain('finality boundary depends on the selected route type')
    expect(allText).not.toContain('guaranteed settlement')
    expect(allText).not.toContain('atomic settlement guaranteed')
    expect(allText).not.toContain('live correspondent telemetry')
  })
})
