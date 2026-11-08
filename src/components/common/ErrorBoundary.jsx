import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lỗi giao diện (ErrorBoundary caught):', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetState = () => {
    localStorage.removeItem('vuihoc_users');
    localStorage.removeItem('vuihoc_students');
    localStorage.removeItem('vuihoc_lessons');
    localStorage.removeItem('vuihoc_exams');
    localStorage.removeItem('vuihoc_classes');
    localStorage.removeItem('vuihoc_current_user');
    localStorage.removeItem('vuihoc_role');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border-4 border-amber-300 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto text-3xl">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h2 className="text-xl md:text-2xl font-black text-slate-800 font-display">
              Đang khôi phục trang học tập
            </h2>
            
            <p className="text-xs md:text-sm text-slate-600 font-medium">
              Hệ thống phát hiện một trục trặc nhỏ và đã ngăn màn hình trắng. Bạn có thể bấm nút bên dưới để tải lại ngay.
            </p>

            {this.state.error && (
              <div className="p-3 bg-rose-50 text-rose-800 text-xs font-mono rounded-xl text-left overflow-x-auto max-h-32 border border-rose-200">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black rounded-2xl shadow-md flex items-center justify-center gap-2 transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tải Lại Trang</span>
              </button>

              <button
                onClick={this.handleResetState}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition"
              >
                <span>Khôi Phục Trạng Thái Ban Đầu</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
