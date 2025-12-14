import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { motion } from 'framer-motion';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 shadow-xl shadow-black/30"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="inline-block mb-4"
              >
                <AlertCircle size={64} className="text-red-400 mx-auto" />
              </motion.div>
              
              <h1 className="text-3xl font-bold text-white mb-2">
                Oops! Something went wrong
              </h1>
              
              <p className="text-white/80 text-lg mb-6">
                We encountered an unexpected error. Don't worry, your data is safe.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-red-500/20 rounded-xl border border-red-400/30 text-left">
                  <p className="text-red-200 text-sm font-mono break-all">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-red-300 text-sm cursor-pointer">
                        Stack Trace
                      </summary>
                      <pre className="text-red-200 text-xs mt-2 overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <motion.button
                  onClick={this.handleReset}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold flex items-center gap-2 shadow-lg shadow-purple-500/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw size={20} />
                  <span>Reload Page</span>
                </motion.button>

                <motion.button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-3 rounded-xl bg-white/20 text-white font-semibold flex items-center gap-2 border border-white/30 backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Home size={20} />
                  <span>Go Home</span>
                </motion.button>
              </div>

              <p className="text-white/60 text-sm mt-6">
                If this problem persists, please contact support.
              </p>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

