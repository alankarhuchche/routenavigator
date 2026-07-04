import { Check } from 'lucide-react'

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6
  maxUnlockedStep: 1 | 2 | 3 | 4 | 5 | 6
  onStepClick: (step: number) => void
}

const steps = [
  { number: 1, label: 'Secure Session' },
  { number: 2, label: 'Money Movement Intent' },
  { number: 3, label: 'Customer Insight Context' },
  { number: 4, label: 'Route Intelligence' },
  { number: 5, label: 'Journey & Controls' },
  { number: 6, label: 'Approval & Tracking' },
]

export function StepIndicator({ currentStep, maxUnlockedStep, onStepClick }: StepIndicatorProps) {
  const current = steps[currentStep - 1]

  return (
    <nav className="step-indicator" aria-label="Demo journey steps">
      <div className="step-progress-summary">
        <span className="step-progress-count">Step {currentStep} of {steps.length}</span>
        <strong className="step-progress-current">{current.label}</strong>
        <span
          className="step-progress-track"
          role="progressbar"
          aria-label="Journey progress"
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={currentStep}
        >
          <span style={{ width: `${(currentStep / steps.length) * 100}%` }} />
        </span>
      </div>
      <ol className="step-progress-list">
        {steps.map((step) => {
          const isCompleted = step.number < currentStep
          const isActive = step.number === currentStep
          const isLocked = step.number > maxUnlockedStep
          return (
            <li key={step.number}>
              <button
                type="button"
                className={`step-btn${isActive ? ' step-active' : ''}${isCompleted ? ' step-completed' : ''}${isLocked ? ' step-future' : ' step-unlocked'}`}
                disabled={isLocked}
                onClick={() => !isLocked && onStepClick(step.number)}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`${step.label}${isLocked ? ' locked until prior stage is complete' : ''}`}
                title={isLocked ? 'Locked until the prior stage is complete' : `Go to ${step.label}`}
              >
                <span className="step-circle" aria-hidden="true">
                  {isCompleted ? <Check size={12} strokeWidth={3} /> : step.number}
                </span>
                <span className="step-label">{step.label}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
