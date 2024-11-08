import React, { Component, ErrorInfo, ReactNode } from 'react';
import ButtonStyling from '../ButtonStyling';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[200px] flex flex-col items-center justify-center p-4 bg-[#262A36] rounded-lg">
          <h2 className="text-xl font-bold text-[#EFEFED] mb-4">Something went wrong</h2>
          <p className="text-[#9C9FA4] mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <ButtonStyling
            text="Try Again"
            onClick={() => window.location.reload()}
            variant="primary"
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;