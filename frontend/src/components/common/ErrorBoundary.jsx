// Fungsi: Komponen umum yang dipakai lintas halaman aplikasi.
// frontend/src/components/common/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      // Tampilkan pesan error yang lebih informatif
      const errorMessage = this.state.error?.message || 'Terjadi kesalahan';
      
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 text-center border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Terjadi Kesalahan</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Maaf, aplikasi mengalami masalah teknis. Silakan coba lagi nanti.
            </p>
            {errorMessage && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 break-all">
                {errorMessage}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleBack}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Kembali
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Muat Ulang Halaman
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;