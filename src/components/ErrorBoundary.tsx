import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
          <div className="bg-red-900 border border-red-600 rounded-lg p-6 max-w-2xl">
            <h1 className="text-2xl font-bold text-red-200 mb-4">
              🚨 Application Error
            </h1>
            <p className="text-red-100 mb-4">
              Something went wrong while loading the application.
            </p>
            <div className="bg-gray-800 p-4 rounded border border-gray-600 mb-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Error Details:</h3>
              <pre className="text-xs text-red-300 overflow-auto">
                {this.state.error?.message}
              </pre>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Reload Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
