import { Check } from 'lucide-react'

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3
  onStepClick: (step: number) => void
}

const steps = [
  {
    number: 1,
    label: 'Secure Intent',
    description: 'Authenticate, express outcome, confirm structured intent',
  },
  {
    number: 2,
    label: 'Route Intelligence',
    description: 'Analyse rails, controls, cut-offs and settlement quality',
  },
  {
    number: 3,
    label: 'Approval & Tracking',
    description: 'Approve execution and monitor payment progress',
  },
]

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <nav className="step-indicator" aria-label="Demo journey steps">
      {steps.map((step, index) => {
        const isCompleted = step.number < currentStep
        const isActive = step.number === currentStep
        const isFuture = step.number > currentStep
        return (
          <span key={step.number} className="step-indicator-item">
            <button
              type="button"
              className={`step-btn${isActive ? ' step-active' : ''}${isCompleted ? ' step-completed' : ''}${isFuture ? ' step-future' : ''}`}
              disabled={isFuture}
              onClick={() => !isFuture && onStepClick(step.number)}
              aria-current={isActive ? 'step' : undefined}
            >
              <span className="step-circle" aria-hidden="true">
                {isCompleted ? <Check size={14} strokeWidth={3} /> : step.number}
              </span>
              <span className="step-copy">
                <span className="step-label">{step.label}</span>
                <span className="step-description">{step.description}</span>
              </span>
            </button>
            {index < steps.length - 1 && (
              <span className={`step-connector${isCompleted ? ' step-connector-done' : ''}`} aria-hidden="true" />
            )}
          </span>
        )
      })}
    </nav>
  )
}
