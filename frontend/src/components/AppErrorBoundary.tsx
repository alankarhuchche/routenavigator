import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface AppErrorBoundaryProps {
  children: ReactNode
}

interface AppErrorBoundaryState {
  hasError: boolean
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Payment Route Intelligence render failed', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-shell app-error-shell">
          <section className="app-error-card" role="alert">
            <AlertTriangle size={22} aria-hidden="true" />
            <div>
              <p className="eyebrow">Payment Route Intelligence</p>
              <h1>Secure Session could not render</h1>
              <p>
                The demo hit a local browser render error. No payment action has started, no money has moved,
                and final approval remains passkey-protected.
              </p>
              <button type="button" className="primary-btn" onClick={() => window.location.reload()}>
                Reload secure session
              </button>
            </div>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}
