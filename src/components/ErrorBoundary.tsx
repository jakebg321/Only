"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service
      console.error('Production error:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-black/40 border-red-500/20 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </div>
              <CardTitle className="text-xl font-bold text-red-400">
                Something went wrong
              </CardTitle>
              <p className="text-gray-400 mt-2">
                The application encountered an unexpected error
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-red-900/20 border border-red-500/30 rounded p-3">
                  <p className="text-red-300 text-sm font-mono">
                    {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <pre className="text-red-400 text-xs mt-2 overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={this.handleRetry}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="flex-1 border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                >
                  Reload Page
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                If this persists, please refresh the page or contact support
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Async error boundary for handling Promise rejections
export function withAsyncErrorBoundary<T extends object>(
  Component: React.ComponentType<T>
): React.ComponentType<T> {
  return function WrappedComponent(props: T) {
    React.useEffect(() => {
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        console.error('Unhandled promise rejection:', event.reason);
        
        // Prevent default browser error handling
        event.preventDefault();
      };

      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      
      return () => {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }, []);

    return (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}