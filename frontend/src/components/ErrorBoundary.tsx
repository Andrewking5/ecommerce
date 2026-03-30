import { Component, type ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import i18n from 'i18next';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    }
    Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-ayers-cream flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-8">
              <AlertTriangle size={36} className="text-amber-500" />
            </div>

            <h1 className="text-3xl font-serif italic font-bold text-ayers-ink mb-3">
              {i18n.t('errorBoundary.title', 'Something went wrong')}
            </h1>
            <p className="text-sm text-ayers-ink/50 mb-8 leading-relaxed">
              {i18n.t('errorBoundary.description', 'An unexpected error occurred. Please try refreshing the page.')}
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="text-left text-xs bg-red-50 border border-red-200 rounded-xl p-4 mb-8 overflow-auto max-h-40 text-red-700">
                {this.state.error.message}
                {'\n'}
                {this.state.error.stack?.split('\n').slice(1, 4).join('\n')}
              </pre>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 bg-ayers-ink text-white px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-ayers-gold transition-all"
              >
                <RefreshCw size={14} />
                {i18n.t('errorBoundary.tryAgain', 'Try Again')}
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 border border-ayers-ink/10 text-ayers-ink/60 px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:border-ayers-gold hover:text-ayers-gold transition-all"
              >
                <Home size={14} />
                {i18n.t('errorBoundary.home', 'Home')}
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
